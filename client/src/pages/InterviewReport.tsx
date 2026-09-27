import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  Shield,
  ChevronLeft,
  Download,
  Calendar,
  Clock,
  Briefcase,
  BarChart3,
  Zap,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import type { InterviewReport as ReportType } from '../types/dashboard';
import ScoreChart from '../components/dashboard/ScoreChart';
import PerformanceCard from '../components/dashboard/PerformanceCard';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'hard':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'technical':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'hr':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'mixed':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreProgressColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 60) return '#fbbf24';
  return '#f87171';
}

const InterviewReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const [report, setReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await dashboardService.getInterviewReport(id);
        setReport(data);
      } catch (err: any) {
        console.error('Failed to load report:', err);
        setError(err.message || 'Failed to load interview report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        {/* Navbar skeleton */}
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Interview<span className="text-indigo-400">AI</span>
                </span>
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-8 animate-pulse">
            <div className="w-40 h-5 bg-slate-800 rounded" />
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
              <div className="space-y-4">
                <div className="w-64 h-8 bg-slate-800 rounded" />
                <div className="flex gap-3">
                  <div className="w-20 h-6 bg-slate-800 rounded" />
                  <div className="w-20 h-6 bg-slate-800 rounded" />
                </div>
                <div className="w-48 h-5 bg-slate-800 rounded" />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="w-24 h-4 bg-slate-800 rounded" />
                      <div className="w-10 h-4 bg-slate-800 rounded" />
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="w-full h-5 bg-slate-800 rounded" />
                  <div className="w-3/4 h-4 bg-slate-800 rounded" />
                  <div className="w-1/2 h-4 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Report Not Found</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            {error || 'The interview report you are looking for could not be found.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const subScoreConfig = [
    { label: 'Technical', value: report.subScores.technical, color: '#6366f1' },
    { label: 'Communication', value: report.subScores.communication, color: '#8b5cf6' },
    { label: 'Grammar', value: report.subScores.grammar, color: '#06b6d4' },
    { label: 'Confidence', value: report.subScores.confidence, color: '#f59e0b' },
    { label: 'Problem Solving', value: report.subScores.problemSolving, color: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar — hidden in print */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Interview<span className="text-indigo-400">AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 py-2 px-3.5 border border-slate-700 hover:border-red-500/30 rounded-xl text-sm font-medium text-slate-300 hover:text-red-400 bg-slate-800/30 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10" ref={reportRef}>
        <div className="space-y-8">
          {/* Back link + actions (hidden in print) */}
          <div className="flex items-center justify-between print:hidden">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 font-medium transition-colors duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* REPORT HEADER */}
          {/* ══════════════════════════════════════════════ */}
          <div
            className="relative overflow-hidden rounded-3xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 p-8 sm:p-10 shadow-[0_0_80px_rgba(99,102,241,0.06)]"
            style={{ animation: 'fadeSlideUp 0.5s ease-out forwards' }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Interview Report
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {report.jobRole}
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-medium ${getTypeColor(report.interviewType)}`}
                  >
                    <Zap className="w-3 h-3" />
                    {report.interviewType}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-medium ${getDifficultyColor(report.difficulty)}`}
                  >
                    {report.difficulty}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {formatDate(report.date)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {report.durationMinutes} Minutes
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    {report.candidateName}
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="flex-shrink-0">
                <ScoreChart
                  score={report.overallScore}
                  size={140}
                  strokeWidth={10}
                  label="Overall Score"
                  color={getScoreColor(report.overallScore)}
                  progressColor={getScoreProgressColor(report.overallScore)}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* SUB-SCORES BREAKDOWN */}
          {/* ══════════════════════════════════════════════ */}
          <div
            className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl"
            style={{ animation: 'fadeSlideUp 0.5s ease-out 0.1s forwards', opacity: 0 }}
          >
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Performance Breakdown
            </h2>
            <div className="space-y-5">
              {subScoreConfig.map((item, index) => (
                <PerformanceCard
                  key={item.label}
                  label={item.label}
                  score={item.value}
                  color={item.color}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* QUESTIONS & ANSWERS */}
          {/* ══════════════════════════════════════════════ */}
          <div className="space-y-5">
            <h2
              className="text-lg font-bold text-white flex items-center gap-2"
              style={{ animation: 'fadeSlideUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
            >
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Questions & Responses
            </h2>

            {report.questions.map((q, index) => (
              <div
                key={q.id}
                className="group bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-700/80"
                style={{
                  animation: `fadeSlideUp 0.5s ease-out ${0.25 + index * 0.08}s forwards`,
                  opacity: 0,
                }}
              >
                {/* Question Header */}
                <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-800/50 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                      Q{q.order}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {q.text}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-700/50 text-slate-400 border border-slate-700/30">
                        {q.category}
                      </span>
                    </div>
                  </div>

                  {/* Question Score */}
                  {q.answer && q.answer.score !== null && (
                    <div className="flex-shrink-0 text-right">
                      <div
                        className={`text-2xl font-bold tracking-tight ${getScoreColor(q.answer.score * 10)}`}
                      >
                        {q.answer.score}/10
                      </div>
                    </div>
                  )}
                </div>

                {/* Answer Content */}
                <div className="px-6 py-5 space-y-5">
                  {q.answer ? (
                    <>
                      {/* User Answer */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <UserIcon className="w-3.5 h-3.5" />
                          Your Answer
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 text-sm text-slate-300 leading-relaxed">
                          {q.answer.answerText || (
                            <span className="text-slate-500 italic">No answer provided</span>
                          )}
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {q.answer.justification && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            AI Feedback
                          </div>
                          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-sm text-slate-300 leading-relaxed">
                            {q.answer.justification}
                          </div>
                        </div>
                      )}

                      {/* Improvement Tips */}
                      {q.answer.improvementTips && q.answer.improvementTips.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                            <Lightbulb className="w-3.5 h-3.5" />
                            Improvement Tips
                          </div>
                          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <ul className="space-y-2">
                              {q.answer.improvementTips.map((tip, tipIndex) => (
                                <li
                                  key={tipIndex}
                                  className="flex items-start gap-2 text-sm text-slate-300"
                                >
                                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-2" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800/30 text-sm text-slate-500 italic text-center">
                      This question was not answered.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* BOTTOM ACTIONS (hidden in print) */}
          {/* ══════════════════════════════════════════════ */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8 print:hidden"
            style={{ animation: 'fadeSlideUp 0.5s ease-out 0.5s forwards', opacity: 0 }}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 font-medium transition-colors duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/history"
                className="inline-flex items-center gap-2 py-2.5 px-5 border border-slate-700 hover:border-indigo-500/30 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/30 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer"
              >
                View All History
              </Link>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CSS Animations + Print Styles */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media print {
          body {
            background: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            padding: 0 20px !important;
          }
          * {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewReport;
