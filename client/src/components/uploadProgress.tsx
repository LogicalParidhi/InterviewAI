import type { UploadStatus } from '../types/resume';
import styles from './uploadProgress.module.css';

interface UploadProgressProps {
  percent: number;
  status: UploadStatus;
}

const UploadProgress = ({ percent, status }: UploadProgressProps) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Resume upload progress"
      >
        <div
          className={styles.fill}
          data-status={status}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={styles.label} aria-hidden="true">
        {status === 'uploading' ? `${clamped}%` : status === 'success' ? 'Complete' : ''}
      </span>
    </div>
  );
};

export default UploadProgress;
