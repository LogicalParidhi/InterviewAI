import React, { useEffect, useState } from 'react';
import { ClipboardList, TrendingUp, Trophy, Clock } from 'lucide-react';
import type { DashboardStats as StatsType } from '../../types/dashboard';

interface DashboardStatsProps {
  stats: StatsType;
  loading?: boolean;
}

// Animated counter hook
function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setValue(start);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

function formatPracticeTime(minutes: number): string {
  if (minutes < 1) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  glowColor: string;
  index: number;
}> = ({ icon, label, value, color, glowColor, index }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl shadow-xl transition-all duration-500 hover:border-slate-700 hover:-translate-y-1 hover:shadow-2xl ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        style={{ boxShadow: `0 0 40px ${glowColor}` }}
      />
      <div className="relative z-10">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-slate-800 mb-4" />
    <div className="w-20 h-3 bg-slate-800 rounded mb-3" />
    <div className="w-16 h-8 bg-slate-800 rounded" />
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  const animatedTotal = useAnimatedNumber(stats.totalInterviews);
  const animatedAvg = useAnimatedNumber(stats.averageScore);
  const animatedBest = useAnimatedNumber(stats.bestScore);
  const animatedTime = useAnimatedNumber(stats.totalPracticeMinutes);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const cards = [
    {
      icon: <ClipboardList className="w-6 h-6 text-indigo-400" />,
      label: 'Total Interviews',
      value: String(animatedTotal),
      color: 'bg-indigo-500/10 border border-indigo-500/20',
      glowColor: 'rgba(99,102,241,0.06)',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      label: 'Average Score',
      value: `${animatedAvg}%`,
      color: 'bg-emerald-500/10 border border-emerald-500/20',
      glowColor: 'rgba(16,185,129,0.06)',
    },
    {
      icon: <Trophy className="w-6 h-6 text-amber-400" />,
      label: 'Best Score',
      value: `${animatedBest}%`,
      color: 'bg-amber-500/10 border border-amber-500/20',
      glowColor: 'rgba(245,158,11,0.06)',
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-400" />,
      label: 'Total Practice Time',
      value: formatPracticeTime(animatedTime),
      color: 'bg-purple-500/10 border border-purple-500/20',
      glowColor: 'rgba(168,85,247,0.06)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, index) => (
        <StatCard key={card.label} {...card} index={index} />
      ))}
    </div>
  );
};

export default DashboardStats;
