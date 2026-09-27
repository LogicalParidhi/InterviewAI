import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInterview } from '../services/interviewService';
import '../styles/tokens.css';
import styles from './InterviewSetup.module.css';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Backend Developer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewType, setInterviewType] = useState('Technical');
  const [duration, setDuration] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInterview = async () => {
    setLoading(true);
    setError(null);
    try {
      const interview = await createInterview({
        candidateName: 'Candidate', // Fallback name, server will populate from auth token
        jobRole: role,
        difficulty,
        interviewType,
        duration
      });
      navigate(`/interview/${interview.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create interview session. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="setup-title">
        <p className={styles.eyebrow}>InterviewAI</p>
        <h1 id="setup-title" className={styles.title}>Choose Your Interview</h1>
        <p className={styles.subtitle}>Set your preferences before starting your mock interview.</p>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option>Backend Developer</option>
              <option>Frontend Developer</option>
              <option>Full Stack Developer</option>
              <option>Data Analyst</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </label>

          <fieldset className={styles.typeGroup}>
            <legend>Interview Type</legend>
            {['Technical', 'HR', 'Mixed'].map((type) => (
              <label className={styles.radioLabel} key={type}>
                <input
                  type="radio"
                  name="interview-type"
                  value={type}
                  checked={interviewType === type}
                  onChange={(event) => setInterviewType(event.target.value)}
                />
                {type}
              </label>
            ))}
          </fieldset>

          <label className={styles.field}>
            <span>Interview Duration</span>
            <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
            </select>
          </label>

          <div className={styles.duration}>
            <span>Estimated Duration</span>
            <strong>{duration} Minutes</strong>
          </div>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }} role="alert">
            {error}
          </p>
        )}

        <button 
          type="button" 
          disabled={loading}
          className={styles.startButton} 
          onClick={startInterview}
        >
          {loading ? 'Creating custom session...' : 'Start Interview'}
        </button>
      </section>
    </main>
  );
};

export default InterviewSetup;
