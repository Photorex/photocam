/**
 * Security Utilities for File Upload Validation
 * Protects against:
 * - Malicious file types (SVG with scripts, executables, etc.)
 * - Path traversal attacks
 * - File size bombs
 * - MIME type spoofing
 */

const fs = require('fs');
const path = require('path');

// ==================== FILE TYPE WHITELIST ====================
// ONLY allow these image formats - nothing else
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp'
];

// Magic bytes (file signatures) for each allowed format
const FILE_SIGNATURES = {
  png: { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 },
  jpeg: { bytes: [0xFF, 0xD8, 0xFF], offset: 0 },
  webp: { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, secondCheck: { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 } }
};

// ==================== FILE SIZE LIMITS ====================
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB max
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos

// ==================== SECURITY FUNCTIONS ====================

/**
 * Validate file extension against whitelist
 * @param {string} filename - The filename to check
 * @returns {object} { valid: boolean, sanitizedExt: string, error: string }
 */
function validateFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'Invalid filename' };
  }

  // Get extension and normalize to lowercase
  const ext = path.extname(filename).toLowerCase();
  
  // Check if extension is in whitelist
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { 
      valid: false, 
      error: `File type ${ext} not allowed. Only ${ALLOWED_EXTENSIONS.join(', ')} are accepted.` 
    };
  }

  return { valid: true, sanitizedExt: ext, error: null };
}

/**
 * Validate MIME type against whitelist
 * @param {string} mimeType - The MIME type from the upload
 * @returns {object} { valid: boolean, error: string }
 */
function validateMimeType(mimeType) {
  if (!mimeType || typeof mimeType !== 'string') {
    return { valid: false, error: 'Missing MIME type' };
  }

  const normalizedMime = mimeType.toLowerCase().split(';')[0].trim();
  
  if (!ALLOWED_MIME_TYPES.includes(normalizedMime)) {
    return { 
      valid: false, 
      error: `MIME type ${normalizedMime} not allowed. Only image files are accepted.` 
    };
  }

  return { valid: true, error: null };
}

/**
 * Check file magic bytes to verify actual file type
 * @param {string} filePath - Path to the file to check
 * @returns {Promise<object>} { valid: boolean, detectedType: string, error: string }
 */
async function validateFileMagicBytes(filePath) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filePath, { start: 0, end: 15 });
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      
      // Check PNG
      if (matchesSignature(buffer, FILE_SIGNATURES.png)) {
        return resolve({ valid: true, detectedType: 'png', error: null });
      }
      
      // Check JPEG
      if (matchesSignature(buffer, FILE_SIGNATURES.jpeg)) {
        return resolve({ valid: true, detectedType: 'jpeg', error: null });
      }
      
      // Check WebP (needs two checks)
      if (matchesSignature(buffer, FILE_SIGNATURES.webp)) {
        if (matchesSignature(buffer, FILE_SIGNATURES.webp.secondCheck)) {
          return resolve({ valid: true, detectedType: 'webp', error: null });
        }
      }

      // File doesn't match any allowed signature
      return resolve({ 
        valid: false, 
        detectedType: 'unknown',
        error: 'File contents do not match allowed image formats. File may be corrupted or malicious.' 
      });
    });

    stream.on('error', (err) => {
      resolve({ valid: false, error: `Failed to read file: ${err.message}` });
    });
  });
}

/**
 * Helper: Check if buffer matches a signature
 */
function matchesSignature(buffer, signature) {
  const { bytes, offset } = signature;
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[offset + i] !== bytes[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Check file size
 * @param {string} filePath - Path to file
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {object} { valid: boolean, size: number, error: string }
 */
function validateFileSize(filePath, maxSize = MAX_FILE_SIZE) {
  try {
    const stats = fs.statSync(filePath);
    const sizeInBytes = stats.size;

    if (sizeInBytes > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(2);
      const actualMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      return { 
        valid: false, 
        size: sizeInBytes,
        error: `File too large: ${actualMB}MB exceeds limit of ${maxMB}MB` 
      };
    }

    return { valid: true, size: sizeInBytes, error: null };
  } catch (err) {
    return { valid: false, error: `Failed to check file size: ${err.message}` };
  }
}

/**
 * Sanitize and validate ID to prevent path traversal
 * @param {string} id - The ID to sanitize (userId or id_gen)
 * @param {string} fieldName - Name of the field for error messages
 * @returns {object} { valid: boolean, sanitizedId: string, error: string }
 */
function sanitizeId(id, fieldName = 'ID') {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  // Remove whitespace
  const trimmed = id.trim();

  // Check for path traversal patterns
  const dangerousPatterns = ['..', '/', '\\', '\0', '%00'];
  for (const pattern of dangerousPatterns) {
    if (trimmed.includes(pattern)) {
      return { 
        valid: false, 
        error: `${fieldName} contains invalid characters. Possible path traversal attempt detected.` 
      };
    }
  }

  // Only allow alphanumeric, dash, and underscore (typical MongoDB ObjectId pattern)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: `${fieldName} contains invalid characters. Only letters, numbers, dashes, and underscores allowed.` 
    };
  }

  // Limit length to prevent buffer overflow
  if (trimmed.length > 100) {
    return { valid: false, error: `${fieldName} is too long (max 100 characters)` };
  }

  return { valid: true, sanitizedId: trimmed, error: null };
}

/**
 * Ensure a path stays within a base directory (prevents path traversal)
 * @param {string} basePath - The base directory that should contain the file
 * @param {string} userPath - The user-provided path component
 * @returns {object} { valid: boolean, safePath: string, error: string }
 */
function validatePathSafety(basePath, ...pathComponents) {
  try {
    // Resolve the full path
    const fullPath = path.resolve(basePath, ...pathComponents);
    
    // Resolve the base path
    const resolvedBase = path.resolve(basePath);
    
    // Check if the full path starts with the base path
    if (!fullPath.startsWith(resolvedBase)) {
      return { 
        valid: false, 
        error: 'Path traversal detected: attempted to write outside allowed directory' 
      };
    }

    return { valid: true, safePath: fullPath, error: null };
  } catch (err) {
    return { valid: false, error: `Path validation failed: ${err.message}` };
  }
}

/**
 * Comprehensive file validation - runs all checks
 * @param {string} filePath - Path to uploaded file
 * @param {string} filename - Original filename
 * @param {string} mimeType - Reported MIME type
 * @returns {Promise<object>} { valid: boolean, errors: string[] }
 */
async function validateUploadedFile(filePath, filename, mimeType) {
  const errors = [];

  // 1. Check extension
  const extCheck = validateFileExtension(filename);
  if (!extCheck.valid) {
    errors.push(extCheck.error);
  }

  // 2. Check MIME type
  const mimeCheck = validateMimeType(mimeType);
  if (!mimeCheck.valid) {
    errors.push(mimeCheck.error);
  }

  // 3. Check file size
  const sizeCheck = validateFileSize(filePath);
  if (!sizeCheck.valid) {
    errors.push(sizeCheck.error);
  }

  // 4. Check magic bytes (actual file content)
  const magicCheck = await validateFileMagicBytes(filePath);
  if (!magicCheck.valid) {
    errors.push(magicCheck.error);
  }

  return {
    valid: errors.length === 0,
    errors,
    details: {
      extension: extCheck.sanitizedExt,
      size: sizeCheck.size,
      detectedType: magicCheck.detectedType
    }
  };
}

/**
 * Clean up a file if validation fails
 * @param {string} filePath - Path to file to delete
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up invalid file: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Failed to cleanup file ${filePath}:`, err.message);
  }
}

// ==================== EXPORTS ====================
module.exports = {
  // Validation functions
  validateFileExtension,
  validateMimeType,
  validateFileMagicBytes,
  validateFileSize,
  sanitizeId,
  validatePathSafety,
  validateUploadedFile,
  cleanupFile,
  
  // Constants
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_VIDEO_SIZE
};
