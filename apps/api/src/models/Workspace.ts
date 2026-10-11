import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceDocument extends Document {
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  settings: {
    timezone: string;
    defaultTaskPriority: 'Low' | 'Medium' | 'High' | 'Critical';
    enableAiSuggestions: boolean;
    dailyReportTime: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    settings: {
      timezone: { type: String, default: 'UTC' },
      defaultTaskPriority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
      enableAiSuggestions: { type: Boolean, default: true },
      dailyReportTime: { type: String, default: '17:00' },
    },
  },
  { timestamps: true }
);

WorkspaceSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Workspace = mongoose.model<IWorkspaceDocument>('Workspace', WorkspaceSchema);
