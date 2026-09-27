// components/interview/QuestionCard.tsx

import React from 'react';
import type { Question } from '../../types/interview';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;   // 1-based display number
  totalQuestions: number;
}

const CATEGORY_LABELS: Record<Question['category'], string> = {
  introduction: 'Introduction',
  technical: 'Technical',
  behavioral: 'Behavioral',
  situational: 'Situational',
  closing: 'Closing',
};

const CATEGORY_STYLES: Record<Question['category'], string> = {
  introduction: 'bg-blue-50 text-blue-700 border-blue-200',
  technical: 'bg-violet-50 text-violet-700 border-violet-200',
  behavioral: 'bg-amber-50 text-amber-700 border-amber-200',
  situational: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closing: 'bg-slate-100 text-slate-700 border-slate-200',
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
}) => {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
      {/* Top row: question number + category badge */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-medium text-slate-400">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_STYLES[question.category]}`}
        >
          {CATEGORY_LABELS[question.category]}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
        {question.text}
      </h2>

      {/* Footer: time limit hint */}
      <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Suggested time: {Math.floor(question.timeLimitSeconds / 60)} min{' '}
          {question.timeLimitSeconds % 60 !== 0 ? `${question.timeLimitSeconds % 60}s` : ''}
        </span>
      </div>
    </div>
  );
};

export default QuestionCard;
