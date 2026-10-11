import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  prioritySource: 'manual' | 'AI-assisted';
  category: string;
  status: 'Todo' | 'In Progress' | 'Blocked' | 'Done';
  deadline?: Date;
  completedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium', index: true },
    prioritySource: { type: String, enum: ['manual', 'AI-assisted'], default: 'manual' },
    category: { type: String, default: 'General', trim: true, index: true },
    status: { type: String, enum: ['Todo', 'In Progress', 'Blocked', 'Done'], default: 'Todo', index: true },
    deadline: { type: Date, index: true },
    completedAt: { type: Date },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

TaskSchema.index({ workspaceId: 1, status: 1 });
TaskSchema.index({ workspaceId: 1, assignedTo: 1 });
TaskSchema.index({ workspaceId: 1, priority: 1 });
TaskSchema.index({ workspaceId: 1, deadline: 1 });

TaskSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Task = mongoose.model<ITaskDocument>('Task', TaskSchema);
