import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ResumeData } from '../types/resume';
import { getMyResume, getResumeErrorMessage } from '../services/resumeService';
import ResumeUploader from '../components/ResumeUploader';
import '../styles/tokens.css';
import styles from './ResumeUpload.module.css';

const ResumeUpload = () => {
  const [existingResume, setExistingResume] = useState<ResumeData | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkExistingResume = async () => {
      try {
        const resume = await getMyResume();
        if (!cancelled) setExistingResume(resume);
      } catch (error) {
        if (!cancelled) setCheckError(getResumeErrorMessage(error));
      } finally {
        if (!cancelled) setCheckingExisting(false);
      }
    };

    checkExistingResume();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>InterviewAI</p>
        <h1 className={styles.title}>Upload your resume</h1>
        <p className={styles.subtitle}>
          We'll use it to tailor your mock interview questions and feedback. PDF only, up to 5 MB.
        </p>

        {!checkingExisting && existingResume && existingResume.status !== 'failed' && (
          <div className={styles.resumeReady}>
            <div className={styles.existingBanner}>
              <span className={styles.existingDot} aria-hidden="true" />
              <span>
                Resume uploaded successfully: <strong>{existingResume.fileName}</strong>
              </span>
            </div>
            <Link to="/interview-setup" className={styles.startInterviewButton}>
              Start interview
            </Link>
          </div>
        )}

        {checkError && (
          <p className={styles.checkError} role="alert">
            {checkError}
          </p>
        )}

        <div className={styles.card}>
          <ResumeUploader onUploadComplete={setExistingResume} />
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
