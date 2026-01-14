/**
 * File Upload Security Validation for Next.js API Routes
 * Protects against malicious file uploads
 */

// ==================== CONSTANTS ====================
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total for batch uploads

// File signatures (magic bytes)
const FILE_SIGNATURES: Record<string, { bytes: number[], offset: number }> = {
  png: { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 },
  jpeg: { bytes: [0xFF, 0xD8, 0xFF], offset: 0 },
  webp: { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate a single File object from FormData
 */
export async function validateImageFile(file: File): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Check if it's a File object
  if (!(file instanceof File)) {
    return { valid: false, error: 'Invalid file object' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return { 
      valid: false, 
      error: `File too large: ${sizeMB}MB exceeds limit of ${maxMB}MB` 
    };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type: ${file.type}. Only ${ALLOWED_IMAGE_TYPES.join(', ')} are allowed` 
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return { 
      valid: false, 
      error: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed` 
    };
  }

  // Validate magic bytes
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    const isValid = await validateMagicBytes(bytes, file.type);
    if (!isValid) {
      return { 
        valid: false, 
        error: 'File contents do not match declared type. File may be corrupted or malicious.' 
      };
    }
  } catch (err) {
    return { 
      valid: false, 
      error: `Failed to validate file contents: ${err instanceof Error ? err.message : 'Unknown error'}` 
    };
  }

  return { valid: true };
}

/**
 * Validate magic bytes of file content
 */
async function validateMagicBytes(bytes: Uint8Array, mimeType: string): Promise<boolean> {
  // Check PNG
  if (mimeType === 'image/png') {
    return matchesSignature(bytes, FILE_SIGNATURES.png);
  }

  // Check JPEG
  if (mimeType === 'image/jpeg') {
    return matchesSignature(bytes, FILE_SIGNATURES.jpeg);
  }

  // Check WebP (RIFF header, then WEBP at offset 8)
  if (mimeType === 'image/webp') {
    if (!matchesSignature(bytes, FILE_SIGNATURES.webp)) {
      return false;
    }
    // Check WEBP signature at offset 8
    const webpSig = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
    for (let i = 0; i < webpSig.length; i++) {
      if (bytes[8 + i] !== webpSig[i]) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Helper: Check if bytes match signature
 */
function matchesSignature(bytes: Uint8Array, signature: { bytes: number[], offset: number }): boolean {
  const { bytes: sigBytes, offset } = signature;
  
  if (bytes.length < offset + sigBytes.length) {
    return false;
  }

  for (let i = 0; i < sigBytes.length; i++) {
    if (bytes[offset + i] !== sigBytes[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Validate multiple files (for batch uploads)
 */
export async function validateImageFiles(files: File[]): Promise<{
  valid: boolean;
  errors: string[];
  totalSize: number;
}> {
  const errors: string[] = [];
  let totalSize = 0;

  if (!Array.isArray(files) || files.length === 0) {
    return { valid: false, errors: ['No files provided'], totalSize: 0 };
  }

  // Check total size
  for (const file of files) {
    totalSize += file.size;
  }

  if (totalSize > MAX_TOTAL_SIZE) {
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0);
    return { 
      valid: false, 
      errors: [`Total upload size ${totalMB}MB exceeds limit of ${maxMB}MB`],
      totalSize 
    };
  }

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const result = await validateImageFile(files[i]);
    if (!result.valid) {
      errors.push(`File ${i + 1} (${files[i].name}): ${result.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    totalSize
  };
}

/**
 * Sanitize and validate ID fields
 */
export function sanitizeId(id: string | null | undefined, fieldName: string = 'ID'): {
  valid: boolean;
  sanitizedId?: string;
  error?: string;
} {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = id.trim();

  // Check for path traversal
  const dangerousPatterns = ['..', '/', '\\', '\0', '%00'];
  for (const pattern of dangerousPatterns) {
    if (trimmed.includes(pattern)) {
      return { 
        valid: false, 
        error: `${fieldName} contains invalid characters` 
      };
    }
  }

  // Only allow alphanumeric, dash, underscore
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: `${fieldName} contains invalid characters` 
    };
  }

  // Limit length
  if (trimmed.length > 100) {
    return { 
      valid: false, 
      error: `${fieldName} is too long (max 100 characters)` 
    };
  }

  return { valid: true, sanitizedId: trimmed };
}

/**
 * Sanitize string inputs
 */
export function sanitizeString(input: string | null | undefined, fieldName: string, maxLength: number = 200): {
  valid: boolean;
  sanitizedValue?: string;
  error?: string;
} {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = input.trim();

  // Check for null bytes
  if (trimmed.includes('\0')) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  // Check length
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} is too long (max ${maxLength} characters)` };
  }

  return { valid: true, sanitizedValue: trimmed };
}
