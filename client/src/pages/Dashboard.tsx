import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import type { DashboardStats as StatsType, RecentInterview } from '../types/dashboard';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<StatsType>({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    totalPracticeMinutes: 0,
  });
  const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, recentData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentInterviews(5),
        ]);
        setStats(statsData);
        setRecentInterviews(recentData);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="space-y-8">
          {/* Welcome Header */}
          <DashboardHeader userName={user?.name || 'User'} />

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Stats */}
          <DashboardStats stats={stats} loading={loading} />

          {/* Recent Interviews */}
          <RecentActivity interviews={recentInterviews} loading={loading} />
        </div>
      </main>

      {/* CSS Animations */}
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
      `}</style>
    </div>
  );
};

export default Dashboard;
