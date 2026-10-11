import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskActivityDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  eventType: string;
  changes?: Record<string, any>;
  createdAt: Date;
}

const TaskActivitySchema = new Schema<ITaskActivityDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TaskActivitySchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TaskActivity = mongoose.model<ITaskActivityDocument>('TaskActivity', TaskActivitySchema);
