import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FileMetadata } from '../models/FileMetadata';
import crypto from 'crypto';

export class FileController {
  async uploadFile(req: AuthRequest, res: Response) {
    const { originalName, contentType, size, resourceType, resourceId } = req.body;

    if (!originalName || !contentType || !size) {
      return res.status(400).json({ success: false, message: 'Missing required file parameters.' });
    }

    // Validate size limit (10MB)
    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size exceeds maximum limit of 10MB.' });
    }

    const storageKey = `workspaces/${req.workspaceId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

    const metadata = await FileMetadata.create({
      workspaceId: req.workspaceId,
      uploadedBy: req.user!._id,
      resourceType: resourceType || 'task',
      resourceId: resourceId || undefined,
      storageKey,
      originalName,
      contentType,
      size,
    });

    return res.status(201).json({
      success: true,
      data: {
        fileId: metadata._id.toString(),
        storageKey,
        originalName,
        contentType,
        size,
        uploadUrl: `/api/v1/files/${metadata._id.toString()}/upload-stream`, // Placeholder stream URL
      },
    });
  }

  async getFileDownload(req: AuthRequest, res: Response) {
    const { fileId } = req.params;

    const file = await FileMetadata.findOne({ _id: fileId, workspaceId: req.workspaceId });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File metadata not found or access denied.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        file: file.toJSON(),
        downloadUrl: `https://storage.flowpilot.ai/${file.storageKey}`, // Signed URL placeholder
      },
    });
  }
}

export const fileController = new FileController();
