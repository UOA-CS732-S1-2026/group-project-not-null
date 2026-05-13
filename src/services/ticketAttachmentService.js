const mongoose = require('mongoose');
const { Readable } = require('stream');

const ATTACHMENT_BUCKET_NAME = 'ticketAttachments';

let attachmentBucket = null;

function getAttachmentBucket() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection is not ready for attachments.');
  }

  if (!attachmentBucket || attachmentBucket.s.db !== db) {
    attachmentBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: ATTACHMENT_BUCKET_NAME
    });
  }

  return attachmentBucket;
}

function normalizeObjectId(value) {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid attachment reference.');
  }

  return new mongoose.Types.ObjectId(value);
}

function uploadTicketAttachment({ buffer, fileName, mimeType, metadata = {} }) {
  return new Promise((resolve, reject) => {
    const bucket = getAttachmentBucket();
    const uploadStream = bucket.openUploadStream(fileName, {
      contentType: mimeType,
      metadata
    });

    Readable.from(buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          fileName,
          mimeType,
          sizeBytes: buffer.length
        });
      });
  });
}

async function deleteTicketAttachment(fileId) {
  if (!fileId) {
    return;
  }

  const bucket = getAttachmentBucket();
  const objectId = normalizeObjectId(fileId);

  try {
    await bucket.delete(objectId);
  } catch (error) {
    if (error?.message?.includes('FileNotFound')) {
      return;
    }

    throw error;
  }
}

async function findTicketAttachmentFile(fileId) {
  const bucket = getAttachmentBucket();
  const objectId = normalizeObjectId(fileId);
  return bucket.find({ _id: objectId }).next();
}

function openTicketAttachmentDownloadStream(fileId) {
  const bucket = getAttachmentBucket();
  const objectId = normalizeObjectId(fileId);
  return bucket.openDownloadStream(objectId);
}

function serializeTicketAttachment(attachment, ticketId) {
  if (!attachment?.gridFsFileId) {
    return null;
  }

  return {
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    gridFsFileId: String(attachment.gridFsFileId),
    uploadedAt: attachment.uploadedAt,
    downloadPath: `/api/tickets/${ticketId}/attachment`
  };
}

function serializeTicketWithAttachment(ticket) {
  if (!ticket) {
    return ticket;
  }

  const plainTicket = typeof ticket.toObject === 'function'
    ? ticket.toObject()
    : { ...ticket };

  plainTicket.attachment = serializeTicketAttachment(plainTicket.attachment, plainTicket._id);

  return plainTicket;
}

module.exports = {
  uploadTicketAttachment,
  deleteTicketAttachment,
  findTicketAttachmentFile,
  openTicketAttachmentDownloadStream,
  serializeTicketAttachment,
  serializeTicketWithAttachment
};
