import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  transcript: string;
  summary: string;
  keyDecisions: string[];
  actionItems: Array<{
    _id?: mongoose.Types.ObjectId;
    description: string;
    suggestedAssignee?: string;
    suggestedDeadline?: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'pending' | 'converted' | 'dismissed';
    createdTaskId?: mongoose.Types.ObjectId;
  }>;
  risks: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeetingDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    transcript: { type: String, required: true },
    summary: { type: String, required: true },
    keyDecisions: [{ type: String }],
    actionItems: [
      {
        description: { type: String, required: true },
        suggestedAssignee: { type: String },
        suggestedDeadline: { type: String },
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
        status: { type: String, enum: ['pending', 'converted', 'dismissed'], default: 'pending' },
        createdTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
      },
    ],
    risks: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

MeetingSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    if (ret.actionItems) {
      ret.actionItems = ret.actionItems.map((item: any) => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
      }));
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Meeting = mongoose.model<IMeetingDocument>('Meeting', MeetingSchema);
