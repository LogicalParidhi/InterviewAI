export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_MIME_TYPE = 'application/pdf';
export const ACCEPTED_EXTENSION = '.pdf';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a resume file against the product's upload rules:
 * PDF only, non-empty, max 5MB, one file at a time (enforced by the caller).
 */
export const validateResumeFile = (file: File): FileValidationResult => {
  const isPdfMime = file.type === ACCEPTED_MIME_TYPE;
  const isPdfExtension = file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION);

  if (!isPdfMime || !isPdfExtension) {
    return {
      valid: false,
      error: 'Only PDF files are accepted. Please choose a .pdf resume.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'This file appears to be empty. Please choose a different PDF.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large. Maximum size is 5 MB (yours is ${formatFileSize(file.size)}).`,
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};