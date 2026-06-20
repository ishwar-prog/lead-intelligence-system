import { Job } from 'bull';
import { leadAnalysisQueue, LeadAnalysisJobData } from './leadAnalysis.queue';
import { Lead } from '../models/lead.model';
import { GeminiProvider } from '../services/ai/providers/gemini.provider';

const aiProvider = new GeminiProvider();

/**
 * The Job Processor
 *
 * Professor Note:
 * This function is registered with .process() below. Bull calls this function
 * automatically whenever a job is available in the queue. You never call this
 * function directly yourself.
 *
 * Notice this looks similar to the old createAndAnalyzeLead logic from
 * lead.service.ts — but it's now decoupled from the HTTP request entirely.
 * This function can run on a completely different machine than your API server.
 */
async function processLeadAnalysisJob(
  job: Job<LeadAnalysisJobData>
): Promise<void> {
  const { leadId, input } = job.data;

  console.log(`[Worker] Processing job ${job.id} for lead ${leadId}`);

  const lead = await Lead.findById(leadId);

  if (!lead) {
    // The lead was deleted before the job ran - log and exit cleanly
    // Throwing here would trigger Bull's retry, which is pointless
    // if the document no longer exists.
    console.error(`[Worker] Lead ${leadId} not found - skipping job`);
    return;
  }

  try {
    const analysis = await aiProvider.analyzeLead(input);

    lead.aiAnalysis = analysis;
    lead.status = 'analyzed';
    lead.failureReason = undefined;

    console.log(
      `[Worker] Lead ${leadId} analyzed. Score: ${analysis.leadScore.score} (${analysis.leadScore.category})`
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown AI error';
    lead.status = 'failed';
    lead.failureReason = reason;

    console.error(`[Worker] AI analysis failed for lead ${leadId}:`, reason);

    // Save the failed state, then re-throw so Bull marks this job attempt
    // as failed and applies its own retry/backoff logic on top
    await lead.save();
    throw error;
  }

  await lead.save();
}

/**
 * Register the processor with a concurrency limit
 *
 * Professor Note on concurrency:
 * '5' here means this worker will process up to 5 jobs simultaneously.
 * Why limit it at all? Because Gemini's API has rate limits. If you set
 * this to 100, you'd fire 100 simultaneous requests and get rate-limited
 * immediately. Start conservative, increase based on your actual API quota.
 */
leadAnalysisQueue.process(5, processLeadAnalysisJob);

/**
 * Queue-level event listeners
 *
 * These give you visibility into what's happening across ALL jobs,
 * not just inside the processor function above. Critical for debugging
 * in production where you can't just watch console output live.
 */
leadAnalysisQueue.on('completed', (job) => {
  console.log(`[Queue] Job ${job.id} completed successfully`);
});

leadAnalysisQueue.on('failed', (job, error) => {
  console.error(
    `[Queue] Job ${job.id} failed after ${job.attemptsMade} attempts:`,
    error.message
  );
});

leadAnalysisQueue.on('stalled', (job) => {
  // A job is "stalled" if the worker died mid-processing without
  // reporting completion or failure. Bull detects this and can retry it.
  console.warn(`[Queue] Job ${job.id} stalled - will be retried`);
});

console.log('[Worker] Lead analysis worker started and listening for jobs');