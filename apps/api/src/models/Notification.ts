import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: mongoose.Types.ObjectId;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: Schema.Types.ObjectId },
    readAt: { type: Date, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
