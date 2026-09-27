// pages/LiveInterview.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WebcamBox from '../components/interview/WebcamBox';
import InterviewTimer from '../components/interview/InterviewTimer';
import QuestionCard from '../components/interview/QuestionCard';
import ControlButtons from '../components/interview/ControlButtons';
import {
  getInterview,
  startInterview as apiStartInterview,
  submitAnswer as apiSubmitAnswer,
  endInterview as apiEndInterview
} from '../services/interviewService';
import type {
  Question,
  InterviewSession,
  InterviewStatus
} from '../types/interview';

// Speech Recognition setup (compatibility helper)
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const LiveInterview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Loading and Session state
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [status, setStatus] = useState<InterviewStatus>('setup');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [questionStartedAt, setQuestionStartedAt] = useState<string>('');

  // Answer tracking
  const [transcriptText, setTranscriptText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Webcam & Audio check variables
  const [cameraChecked, setCameraChecked] = useState(false);
  const [audioChecked, setAudioChecked] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Web Speech API recognition instances
  const recognitionRef = useRef<any>(null);

  // Fetch session on load
  useEffect(() => {
    if (!id) return;
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getInterview(id);
        setSession(data);
        setStatus(data.status);
        setCurrentQuestionIndex(data.currentQuestionIndex);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve mock interview session.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  // Visual microphone level indicator check logic
  useEffect(() => {
    if (status !== 'setup') {
      stopAudioCheck();
      return;
    }

    const startAudioCheck = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        setAudioChecked(true);

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.warn('Microphone permission not granted:', err);
        setAudioChecked(false);
      }
    };

    startAudioCheck();

    // Verify camera permission status
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setCameraChecked(true);
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setCameraChecked(false);
      });

    return () => {
      stopAudioCheck();
    };
  }, [status]);

  const stopAudioCheck = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    analyserRef.current = null;
  };

  // Initialize Speech Recognition for Live Interview questions
  useEffect(() => {
    if (status !== 'in_progress' || !SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalSpeech = '';
      let interimSpeech = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSpeech += event.results[i][0].transcript;
        } else {
          interimSpeech += event.results[i][0].transcript;
        }
      }

      setTranscriptText((prev) => prev + (finalSpeech ? ' ' + finalSpeech : ''));
      setInterimTranscript(interimSpeech);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Re-enable if status is still in progress and mic is turned on
      if (status === 'in_progress' && isMicOn && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;

    if (isMicOn) {
      try {
        recognition.start();
      } catch (e) {
        // ignore
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [status, currentQuestionIndex]);

  // Handle toggling microphone on/off during speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isMicOn) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isMicOn]);

  const currentQuestion = useMemo<Question | null>(() => {
    if (!session || !session.questions || session.questions.length === 0) return null;
    return session.questions[currentQuestionIndex] || null;
  }, [session, currentQuestionIndex]);

  const totalQuestions = session?.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const progressPercent = useMemo(() => {
    if (totalQuestions === 0) return 0;
    return ((currentQuestionIndex + 1) / totalQuestions) * 100;
  }, [currentQuestionIndex, totalQuestions]);

  const handleStartInterview = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await apiStartInterview(id);
      setSession(data);
      setStatus('in_progress');
      setQuestionStartedAt(new Date().toISOString());
      setTranscriptText('');
      setInterimTranscript('');
    } catch (err: any) {
      setError(err.message || 'Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!id || !currentQuestion || isEvaluating) return;
    setIsEvaluating(true);

    try {
      const fullAnswer = (transcriptText + ' ' + interimTranscript).trim();

      const updatedSession = await apiSubmitAnswer(id, {
        questionId: currentQuestion.id,
        answerText: fullAnswer,
        startedAt: questionStartedAt,
        endedAt: new Date().toISOString()
      });

      setSession(updatedSession);
      setStatus(updatedSession.status);

      if (updatedSession.status === 'in_progress') {
        setCurrentQuestionIndex(updatedSession.currentQuestionIndex);
        setQuestionStartedAt(new Date().toISOString());
        setTranscriptText('');
        setInterimTranscript('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEndInterviewEarly = async () => {
    if (!id || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const updatedSession = await apiEndInterview(id);
      setSession(updatedSession);
      setStatus('ended_early');
    } catch (err: any) {
      setError(err.message || 'Failed to end interview.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAction = (action: any) => {
    switch (action) {
      case 'toggle_camera':
        setIsCameraOn((prev) => !prev);
        break;
      case 'toggle_microphone':
        setIsMicOn((prev) => !prev);
        break;
      case 'skip_question':
        // Skip will submit an empty text answer
        setTranscriptText('');
        setInterimTranscript('');
        handleNextQuestion();
        break;
      case 'next_question':
        handleNextQuestion();
        break;
      case 'end_interview':
        handleEndInterviewEarly();
        break;
      default:
        break;
    }
  };

  // Overall score average utility
  const overallScore = useMemo(() => {
    if (!session || !session.answers || session.answers.length === 0) return 0;
    const scoredAnswers = session.answers.filter((a) => a.score !== undefined && a.score !== null);
    if (scoredAnswers.length === 0) return 0;
    const sum = scoredAnswers.reduce((total, ans) => total + (ans.score || 0), 0);
    return Math.round((sum / scoredAnswers.length) * 10) / 10;
  }, [session]);

  // Loading indicator screen
  if (loading && !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Retrieving mock interview details...</p>
      </div>
    );
  }

  // Error screen
  if (error && !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE 1: WEBCAM & AUDIO CHECK
  // ==========================================
  if (status === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-2">
            <p className="text-indigo-400 text-sm font-semibold tracking-wider uppercase">Stage 1: System Check</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Webcam & Audio Configuration
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Please verify your webcam preview and speak into your microphone to test visual volume levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Webcam Live Feed */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-300">Camera Check</h2>
              <WebcamBox isCameraOn={isCameraOn} isMicOn={isMicOn} candidateName={session?.candidateName} />
              <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <span className="text-sm font-medium text-slate-300">Video Capture Device</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cameraChecked ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                  {cameraChecked ? 'Webcam Ready' : 'Permission Required'}
                </span>
              </div>
            </div>

            {/* Audio Check / Settings */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-300">Microphone Input Level</h2>
                
                {/* Visualizer volume meter */}
                <div className="h-24 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center gap-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Input Volume Indicator</span>
                    <span>{audioChecked ? `${audioLevel}%` : 'Disconnected'}</span>
                  </div>
                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-indigo-500 rounded-full transition-all duration-75"
                      style={{ width: `${audioChecked ? audioLevel : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
                  <span className="text-sm font-medium text-slate-300">Microphone Audio</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${audioChecked ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                    {audioChecked ? 'Connected' : 'Permission Required'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 md:pt-0">
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={loading}
                  className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  {loading ? 'Starting...' : 'Everything Works - Start Interview'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE 2: LIVE INTERVIEW QUESTIONS
  // ==========================================
  if (status === 'in_progress' && currentQuestion) {
    const fullTextAnswer = (transcriptText + ' ' + interimTranscript).trim();

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-10 px-4 flex flex-col items-center gap-6">
        {/* Progress bar */}
        <div className="w-full max-w-3xl space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Interview Progress</span>
            <span className="font-semibold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Top visual interface: Live camera feed */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <WebcamBox isCameraOn={isCameraOn} isMicOn={isMicOn} candidateName={session?.candidateName} />
          </div>

          <div className="flex flex-col justify-between items-center bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="text-center space-y-1">
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wide">Question Duration</span>
            </div>
            
            <InterviewTimer
              key={currentQuestion.id}
              totalSeconds={currentQuestion.timeLimitSeconds}
              isRunning={true}
              resetKey={currentQuestion.id}
              onTimeUp={handleNextQuestion}
            />

            <div className="text-center text-xs text-slate-500 bg-slate-950 p-2.5 rounded-xl border border-slate-900 w-full mt-4">
              <span>Selected Role:</span>
              <div className="text-slate-300 font-semibold mt-0.5">{session?.jobRole}</div>
            </div>
          </div>
        </div>

        {/* Current Question Display */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />

        {/* Real-time Voice Answer & Transcription Box */}
        <div className="w-full max-w-3xl space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isMicOn ? 'bg-indigo-500 animate-ping' : 'bg-red-500'}`} />
              <span className="text-slate-300 font-medium">{isMicOn ? 'Listening to voice...' : 'Microphone muted'}</span>
            </div>
            <span className="text-xs text-slate-500">Edit or type manually anytime below:</span>
          </div>

          <div className="relative">
            <textarea
              value={fullTextAnswer}
              onChange={(e) => {
                setTranscriptText(e.target.value);
                setInterimTranscript('');
              }}
              placeholder="Start speaking, your voice answer will be transcribed here. Or feel free to type your response directly..."
              className="w-full h-32 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 text-slate-200 placeholder-slate-600 rounded-2xl p-4 text-sm focus:outline-none transition-colors resize-none"
            />
            {isMicOn && (
              <div className="absolute right-4 bottom-4 flex items-center gap-1">
                <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce delay-75" />
                <span className="w-1 h-5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce delay-300" />
              </div>
            )}
          </div>
        </div>

        {/* Evaluation loading notification */}
        {isEvaluating && (
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Analyzing answer with Gemini AI...
          </div>
        )}

        {/* Control Toggles & Navigation buttons */}
        <ControlButtons
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
          isLastQuestion={isLastQuestion}
          onAction={handleAction}
        />
      </div>
    );
  }

  // ==========================================
  // STAGE 3: AI ANALYSIS & DETAILED REPORT
  // ==========================================
  if (status === 'completed' || status === 'ended_early') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-10">
          
          {/* Header Summary Dashboard */}
          <div className="bg-gradient-to-r from-indigo-900/20 via-slate-900 to-indigo-900/10 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Interview Finished
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Mock Interview Report
              </h1>
              <p className="text-slate-400 text-sm max-w-md">
                Candidate: <strong className="text-slate-200">{session?.candidateName}</strong><br />
                Role: <strong className="text-slate-200">{session?.jobRole}</strong> ({session?.difficulty} • {session?.interviewType})
              </p>
            </div>

            {/* Overall Score Circle */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - overallScore / 10)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{overallScore}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Grade</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              AI Assessment Breakdown
            </h2>

            {session?.questions?.map((q, idx) => {
              const ans = session.answers?.find((a) => a.questionId === q.id);
              const scoreVal = ans?.score !== undefined ? ans.score : null;
              
              let scoreColor = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
              if (scoreVal !== null) {
                if (scoreVal >= 8) scoreColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                else if (scoreVal >= 5) scoreColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
              }

              return (
                <div key={q.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-800 transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      Question {idx + 1} • {q.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scoreColor}`}>
                        {scoreVal !== null ? `${scoreVal} / 10` : 'Not Answered'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white">{q.text}</h3>

                  {/* Transcribed answer */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Response:</span>
                    <p className="text-slate-300 text-sm italic">
                      {ans?.answerText ? `"${ans.answerText}"` : 'No verbal answer was submitted.'}
                    </p>
                  </div>

                  {/* AI feedback justification */}
                  {scoreVal !== null && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI feedback:</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{ans?.justification}</p>
                      </div>

                      {/* Improvement tips list */}
                      {ans?.improvementTips && ans.improvementTips.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Actionable tips to improve:</span>
                          <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1">
                            {ans.improvementTips.map((tip, tIdx) => (
                              <li key={tIdx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action section footer */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="py-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  return null;
};

export default LiveInterview;