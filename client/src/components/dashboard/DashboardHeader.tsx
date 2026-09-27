import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 p-8 sm:p-10 shadow-[0_0_80px_rgba(99,102,241,0.06)]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome, {userName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-slate-400 max-w-lg text-sm sm:text-base leading-relaxed">
            Track your interview performance, review your history, and keep improving your skills.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              to="/resume-upload"
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer"
            >
              Start Practice
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 py-2.5 px-5 border border-slate-700 hover:border-indigo-500/30 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/30 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer"
            >
              View All History
            </Link>
          </div>
        </div>

        <div className="flex-shrink-0 hidden md:block">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center">
            <span className="text-6xl">🎯</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
