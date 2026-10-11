import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReportDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  reportDate: string;
  timezone: string;
  generatedAt: Date;
  metricsSnapshot: {
    totalActiveTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    onTimeCompletionRate: number;
    productivityScore: number;
  };
  narrative: {
    todaysProgress: string;
    pendingWork: string;
    highPriorityFocus: string;
    blockersAndRisks: string[];
    recommendedNextActions: string[];
  };
  status: 'pending' | 'generated' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const DailyReportSchema = new Schema<IDailyReportDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    reportDate: { type: String, required: true, index: true },
    timezone: { type: String, default: 'UTC' },
    generatedAt: { type: Date, default: Date.now },
    metricsSnapshot: {
      totalActiveTasks: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      pendingTasks: { type: Number, default: 0 },
      overdueTasks: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      onTimeCompletionRate: { type: Number, default: 0 },
      productivityScore: { type: Number, default: 0 },
    },
    narrative: {
      todaysProgress: { type: String, default: '' },
      pendingWork: { type: String, default: '' },
      highPriorityFocus: { type: String, default: '' },
      blockersAndRisks: [{ type: String }],
      recommendedNextActions: [{ type: String }],
    },
    status: { type: String, enum: ['pending', 'generated', 'failed'], default: 'generated' },
  },
  { timestamps: true }
);

DailyReportSchema.index({ workspaceId: 1, reportDate: 1 }, { unique: true });

DailyReportSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const DailyReport = mongoose.model<IDailyReportDocument>('DailyReport', DailyReportSchema);
