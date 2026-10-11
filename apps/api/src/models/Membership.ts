import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'Owner' | 'Admin' | 'Manager' | 'Member';
  department?: string;
  joinedAt: Date;
}

const MembershipSchema = new Schema<IMembershipDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['Owner', 'Admin', 'Manager', 'Member'], default: 'Member' },
    department: { type: String, trim: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Enforce one membership per user per workspace
MembershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

MembershipSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Membership = mongoose.model<IMembershipDocument>('Membership', MembershipSchema);
