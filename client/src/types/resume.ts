/**
 * Shape returned by the (future) Express backend.
 * Keep this in sync with the server's response contract.
 */
export interface ResumeData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'failed';
}

/**
 * Local UI state machine for the uploader.
 * idle       -> no file chosen yet
 * selected   -> valid file chosen, not yet uploaded
 * uploading  -> request in flight
 * success    -> upload confirmed by the server
 * error      -> validation or network/server failure
 */
export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'success' | 'error';