import mongoose, { Schema, Document } from 'mongoose';

export interface IFileMetadataDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  storageKey: string;
  originalName: string;
  contentType: string;
  size: number;
  createdAt: Date;
}

const FileMetadataSchema = new Schema<IFileMetadataDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    storageKey: { type: String, required: true },
    originalName: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FileMetadataSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const FileMetadata = mongoose.model<IFileMetadataDocument>('FileMetadata', FileMetadataSchema);
