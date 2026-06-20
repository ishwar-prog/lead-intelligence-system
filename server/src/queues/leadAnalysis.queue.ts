import Queue from 'bull';
import { redisConnection } from '../config/redis';
import { LeadAnalysisInput } from '../types/ai.types';

/**
 * The Job Payload — what data travels with each job
 *
 * Professor Note:
 * We don't pass the whole Mongoose document into the job.
 * We pass only the leadId (to know which document to update later)
 * and the raw input (what the AI actually needs to analyze).
 *
 * Why not pass the full document? Because jobs are serialized to JSON
 * and stored in Redis. Keep job payloads small and minimal — only
 * what the worker actually needs to do its job.
 */
export interface LeadAnalysisJobData {
  leadId: string;
  input: LeadAnalysisInput;
}

/**
 * The Queue Definition
 *
 * Professor Note on Bull's built-in retry vs our GeminiProvider retry:
 *
 * GeminiProvider already retries transient API failures (2 attempts, internal).
 * This queue-level retry is a SEPARATE safety net for a different failure mode:
 * what if the WORKER PROCESS ITSELF crashes mid-job? Or the connection to
 * MongoDB drops? GeminiProvider's retry can't help with that — only Bull's
 * job-level retry can, because Bull re-queues the entire job if it fails outright.
 *
 * We deliberately keep this number LOW (2 attempts) because GeminiProvider
 * already retries internally. If we set both to high numbers, a single bad
 * lead could trigger up to (GeminiProvider retries) x (Bull retries) total
 * API calls — wasteful and could hit rate limits unnecessarily.
 *
 * This is called "defense in depth" — multiple safety layers, each tuned
 * to catch a DIFFERENT class of failure, not redundant copies of each other.
 */
export const leadAnalysisQueue = new Queue<LeadAnalysisJobData>(
  'lead-analysis',
  {
    redis: redisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000, // 3s, then 6s before giving up
      },
      removeOnComplete: 100, // Keep last 100 completed jobs for debugging, then clean up
      removeOnFail: 500,     // Keep more failed jobs — you want to investigate failures
    },
  }
);

/**
 * enqueueLeadAnalysis
 *
 * The public function other parts of the app use to add a job.
 * Notice: this function knows NOTHING about Gemini, MongoDB updates,
 * or how the job gets processed. It only knows how to add work to the queue.
 * That logic lives in the worker (next file).
 */
export async function enqueueLeadAnalysis(
  data: LeadAnalysisJobData
): Promise<void> {
  await leadAnalysisQueue.add(data);
  console.log(`[Queue] Job enqueued for lead ${data.leadId}`);
}