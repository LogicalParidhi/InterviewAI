import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Zap } from 'lucide-react';
import type { RecentInterview } from '../../types/dashboard';

interface HistoryCardProps {
  interview: RecentInterview;
  index?: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-emerald-600';
  if (score >= 60) return 'from-amber-500 to-amber-600';
  return 'from-red-500 to-red-600';
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

const HistoryCard: React.FC<HistoryCardProps> = ({ interview, index = 0 }) => {
  return (
    <div
      className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-5 sm:p-6 transition-all duration-400 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeSlideUp 0.5s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Score indicator bar */}
      <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full overflow-hidden bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(interview.score)} transition-all duration-1000`}
          style={{ width: `${interview.score}%`, transitionDelay: `${index * 100 + 300}ms` }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Job Role */}
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors duration-200">
            {interview.jobRole}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-medium ${getTypeColor(interview.interviewType)}`}
            >
              <Zap className="w-3 h-3" />
              {interview.interviewType}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-medium ${getDifficultyColor(interview.difficulty)}`}
            >
              {interview.difficulty}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(interview.date)}
          </div>
        </div>

        {/* Score + Action */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Score</p>
            <p className={`text-2xl font-bold tracking-tight ${getScoreColor(interview.score)}`}>
              {interview.score}%
            </p>
          </div>
          <Link
            to={`/report/${interview._id}`}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all duration-200 cursor-pointer group/btn"
          >
            View Report
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
