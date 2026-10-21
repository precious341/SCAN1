import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_ROOT = path.resolve(__dirname, '../../storage/documents');

// Ensure directory exists
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

/**
 * Validates magic bytes of an uploaded file buffer
 */
export function validateFileSignature(buffer, mimeType) {
  if (!buffer || buffer.length < 4) return false;

  // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
  if (mimeType === 'application/pdf') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // PNG magic bytes: 0x89 0x50 0x4E 0x47
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }

  // JPEG magic bytes: 0xFF 0xD8 0xFF
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  return false;
}

/**
 * Saves a file buffer securely with a randomized UUID filename
 */
export async function saveDocument(buffer, originalName, mimeType) {
  const extension = path.extname(originalName).toLowerCase() || (mimeType === 'application/pdf' ? '.pdf' : '.jpg');
  const storedFilename = `${uuidv4()}${extension}`;
  const targetPath = path.join(STORAGE_ROOT, storedFilename);

  // Prevent directory traversal
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new Error('Invalid file destination detected.');
  }

  await fs.promises.writeFile(targetPath, buffer);
  return {
    storedFilename,
    targetPath,
    fileSize: buffer.length,
  };
}

/**
 * Resolves safe absolute path for a stored filename
 */
export function getSafeFilePath(storedFilename) {
  // Strip any directory traversal characters
  const safeName = path.basename(storedFilename);
  const fullPath = path.join(STORAGE_ROOT, safeName);
  const resolved = path.resolve(fullPath);

  if (!resolved.startsWith(STORAGE_ROOT) || !fs.existsSync(resolved)) {
    return null;
  }
  return resolved;
}

/**
 * Deletes a stored file
 */
export async function deleteDocument(storedFilename) {
  const fullPath = getSafeFilePath(storedFilename);
  if (fullPath && fs.existsSync(fullPath)) {
    await fs.promises.unlink(fullPath);
  }
}
