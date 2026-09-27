import { useCallback, useRef, useState } from 'react';
import type { DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ResumeData, UploadStatus } from '../types/resume';
import { validateResumeFile } from '../utils/resumeValidation';
import { uploadResume, getResumeErrorMessage } from '../services/resumeService';
import FilePreview from './filePreview';
import UploadProgress from './uploadProgress';
import styles from './ResumeUploader.module.css';

interface ResumeUploaderProps {
  /** Called once the backend confirms a successful upload. */
  onUploadComplete?: (resume: ResumeData) => void;
}

const ResumeUploader = ({ onUploadComplete }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const resetToEmpty = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleFile = useCallback((candidate: File | undefined) => {
    if (!candidate) return;

    const result = validateResumeFile(candidate);
    if (!result.valid) {
      setFile(null);
      setStatus('error');
      setErrorMessage(result.error ?? 'That file could not be used.');
      return;
    }

    setFile(candidate);
    setStatus('selected');
    setProgress(0);
    setErrorMessage(null);
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    // Only one file at a time — take the first, ignore any extras.
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setErrorMessage(null);

    try {
      const resume = await uploadResume(file, setProgress);
      setStatus('success');
      setProgress(100);
      onUploadComplete?.(resume);
    } catch (error) {
      setStatus('error');
      setErrorMessage(getResumeErrorMessage(error));
    }
  };

  const openFileDialog = () => inputRef.current?.click();

  const handleDropzoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
      />

      {!file && (
        <div
          className={styles.dropzone}
          data-dragging={isDragging}
          role="button"
          tabIndex={0}
          onClick={openFileDialog}
          onKeyDown={handleDropzoneKeyDown}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          aria-label="Upload your resume as a PDF, up to 5 megabytes"
        >
          <div className={styles.dropzoneIcon} aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4M12 4L7 9M12 4L17 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className={styles.dropzoneTitle}>Drop your resume here</p>
          <p className={styles.dropzoneSubtitle}>or click to browse — PDF only, up to 5 MB</p>
        </div>
      )}

      {file && (
        <div className={styles.selected}>
          <FilePreview file={file} status={status} onRemove={resetToEmpty} />

          {(status === 'uploading' || status === 'success') && (
            <UploadProgress percent={progress} status={status} />
          )}

          {status === 'error' && errorMessage && (
            <p className={styles.errorText} role="alert">
              {errorMessage}
            </p>
          )}

          {status === 'success' && (
            <>
              <p className={styles.successText} role="status">
                Resume uploaded successfully. InterviewAI is analyzing it now.
              </p>
              <Link to="/interview-setup" className={styles.startInterviewButton}>
                Start interview
              </Link>
            </>
          )}

          <div className={styles.actions}>
            {status === 'selected' && (
              <button type="button" className={styles.primaryButton} onClick={handleUpload}>
                Upload resume
              </button>
            )}

            {status === 'error' && (
              <button type="button" className={styles.primaryButton} onClick={handleUpload}>
                Try again
              </button>
            )}

            {status === 'success' && (
              <button type="button" className={styles.secondaryButton} onClick={resetToEmpty}>
                Replace resume
              </button>
            )}

            {(status === 'selected' || status === 'error') && (
              <button type="button" className={styles.secondaryButton} onClick={resetToEmpty}>
                Choose a different file
              </button>
            )}
          </div>
        </div>
      )}

      {!file && status === 'error' && errorMessage && (
        <p className={styles.errorText} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default ResumeUploader;
