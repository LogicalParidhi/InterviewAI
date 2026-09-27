import React from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronRight, FileText } from 'lucide-react';
import type { RecentInterview } from '../../types/dashboard';
import HistoryCard from './HistoryCard';

interface RecentActivityProps {
  interviews: RecentInterview[];
  loading?: boolean;
}

const SkeletonCard: React.FC = () => (
  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-3 flex-1">
        <div className="w-40 h-5 bg-slate-800 rounded" />
        <div className="flex gap-2">
          <div className="w-20 h-5 bg-slate-800 rounded" />
          <div className="w-16 h-5 bg-slate-800 rounded" />
        </div>
        <div className="w-28 h-4 bg-slate-800 rounded" />
      </div>
      <div className="space-y-2 flex flex-col items-end">
        <div className="w-12 h-8 bg-slate-800 rounded" />
        <div className="w-24 h-8 bg-slate-800 rounded-xl" />
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-16 px-6">
    <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-5">
      <FileText className="w-10 h-10 text-slate-600" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">No interviews yet</h3>
    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
      Start your first practice interview to see your performance history and detailed reports here.
    </p>
    <Link
      to="/resume-upload"
      className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer"
    >
      Start Your First Interview
    </Link>
  </div>
);

const RecentActivity: React.FC<RecentActivityProps> = ({ interviews, loading }) => {
  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Recent Interviews</h2>
            <p className="text-slate-500 text-xs mt-0.5">Your latest practice sessions</p>
          </div>
        </div>
        {interviews.length > 0 && (
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 cursor-pointer"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {interviews.map((interview, index) => (
            <HistoryCard key={interview._id} interview={interview} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
