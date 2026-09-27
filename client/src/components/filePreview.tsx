import type { UploadStatus } from '../types/resume';
import { formatFileSize } from '../utils/resumeValidation';
import styles from './filePreview.module.css';

interface FilePreviewProps {
  file: File;
  status: UploadStatus;
  onRemove: () => void;
}

const STATUS_LABEL: Record<UploadStatus, string> = {
  idle: '',
  selected: 'Ready to upload',
  uploading: 'Uploading…',
  success: 'Uploaded',
  error: 'Upload failed',
};

const FilePreview = ({ file, status, onRemove }: FilePreviewProps) => {
  const canRemove = status !== 'uploading';

  return (
    <div className={styles.card} data-status={status}>
      <div className={styles.badge} aria-hidden="true">
        PDF
      </div>

      <div className={styles.info}>
        <p className={styles.name} title={file.name}>
          {file.name}
        </p>
        <p className={styles.meta}>
          <span className={styles.size}>{formatFileSize(file.size)}</span>
          {STATUS_LABEL[status] && (
            <>
              <span className={styles.dot} aria-hidden="true">
                ·
              </span>
              <span className={styles.statusText} data-status={status}>
                {STATUS_LABEL[status]}
              </span>
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        className={styles.removeButton}
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Remove ${file.name}`}
        title={canRemove ? 'Remove file' : 'Uploading — please wait'}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default FilePreview;
