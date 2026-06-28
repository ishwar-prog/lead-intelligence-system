import mongoose, { Document, Schema } from 'mongoose';
import { LeadAnalysisOutput } from '../types/ai.types';

/**
 * ILead — The shape of a lead document in MongoDB
 *
 * Professor Note — Notice what we store:
 * We store the COMPLETE AI output as a subdocument, not as a string.
 * Storing as a string like JSON.stringify(aiOutput) is tempting but wrong.
 * You cannot query a string. You cannot index a string field.
 * Storing as a subdocument lets you do:
 *   Lead.find({ 'aiAnalysis.leadScore.category': 'hot' })
 * That query is impossible if you stored the whole thing as a string.
 *
 * We also store humanReview fields from the start.
 * This is responsible AI design — every AI output needs a human review path.
 */
export interface ILead extends Document {
  userId : mongoose.Types.ObjectId; // Reference to the user who created the lead
  // Input fields — what the sales rep submitted
  company: string;
  industry: string;
  role: string;
  companySize: string;
  painPoint: string;
  budgetSignal: string;
  timeline: string;
  leadSource: string;

  deletedAt : Date | null;

  // AI output — stored as rich subdocument, not a string
  aiAnalysis: LeadAnalysisOutput | null;

  // Processing status
  status: 'pending' | 'analyzed' | 'failed';
  failureReason?: string; // Store why it failed for debugging

  // Human review — responsible AI in the data model
  humanReviewed: boolean;
  humanReviewedBy?: string;
  humanReviewedAt?: Date;
  humanOverrideScore?: number; // Human can override AI score
  humanNotes?: string;

  // Timestamps (auto-managed by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, trim: true, maxlength: 200 },
    industry: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    companySize: {
      type: String,
      required: true,
      enum: ['1-10', '11-50', '51-200', '201-1000', '1000+'],
    },
    painPoint: { type: String, required: true, maxlength: 1000 },
    budgetSignal: { type: String, default: 'Unknown' },
    timeline: { type: String, default: 'Unknown' },
    leadSource: { type: String, required: true },

    deletedAt: { type: Date, default: null }, // Soft delete timestamp

    // Schema.Types.Mixed allows storing any object structure
    // We use this because the AI output shape is complex and nested
    aiAnalysis: { type: Schema.Types.Mixed, default: null },

    status: {
      type: String,
      enum: ['pending', 'analyzed', 'failed'],
      default: 'pending',
    },
    failureReason: { type: String },

    // Human review fields
    humanReviewed: { type: Boolean, default: false },
    humanReviewedBy: { type: String },
    humanReviewedAt: { type: Date },
    humanOverrideScore: { type: Number, min: 0, max: 100 },
    humanNotes: { type: String },
  },
  {
    timestamps: true, // Auto-manages createdAt and updatedAt

    toJSON: {
      /**
       * Transform output before sending to client
       *
       * We rename _id to id and remove __v (MongoDB internal version field)
       * This gives the client a cleaner API response without MongoDB internals
       */
      transform(_, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Database Indexes
 *
 * Professor Note:
 * Indexes are how MongoDB finds documents fast.
 * Without an index, finding all 'hot' leads requires scanning every document.
 * With an index, it is instant lookup.
 *
 * Rule: Add an index for every field you filter or sort by in queries.
 * Rule: Do not add indexes for fields you never query — they slow down writes.
 */
LeadSchema.index({ userId: 1 , status: 1 }); // Compound index for userId + status
LeadSchema.index({ userId: 1, deletedAt: 1 }); // Compound index for userId + deletedAt
LeadSchema.index({ status: 1 });
LeadSchema.index({ 'aiAnalysis.leadScore.category': 1 });
LeadSchema.index({ humanReviewed: 1 });
LeadSchema.index({ createdAt: -1 }); // -1 = descending (newest first)

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);