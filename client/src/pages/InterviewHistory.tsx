import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  Shield,
  History,
  Filter,
  ArrowUpDown,
  Search,
  ChevronLeft,
  FileText,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import type { RecentInterview } from '../types/dashboard';
import HistoryCard from '../components/dashboard/HistoryCard';

type SortField = 'date' | 'score';
type SortOrder = 'asc' | 'desc';

const InterviewHistory: React.FC = () => {
  const { user, logout } = useAuth();
  const [interviews, setInterviews] = useState<RecentInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getRecentInterviews(100);
        setInterviews(data);
      } catch (err: any) {
        console.error('Failed to load interview history:', err);
        setError(err.message || 'Failed to load interview history.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // Filtered + sorted interviews
  const filteredInterviews = useMemo(() => {
    let result = [...interviews];

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(
        (i) => i.interviewType.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(
        (i) => i.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.jobRole.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      let compare = 0;
      if (sortField === 'date') {
        compare = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        compare = a.score - b.score;
      }
      return sortOrder === 'desc' ? -compare : compare;
    });

    return result;
  }, [interviews, typeFilter, difficultyFilter, searchQuery, sortField, sortOrder]);

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (difficultyFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearFilters = () => {
    setTypeFilter('all');
    setDifficultyFilter('all');
    setSearchQuery('');
  };

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
        <div className="space-y-6">
          {/* Back + Page Header */}
          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 font-medium transition-colors duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <History className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Interview History
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {loading
                      ? 'Loading...'
                      : `${interviews.length} total interview${interviews.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              {/* Filter toggle + Sort */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer ${
                    showFilters || activeFilterCount > 0
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (sortField === 'date') {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortField('date');
                      setSortOrder('desc');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer ${
                    sortField === 'date'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Date {sortField === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </button>

                <button
                  onClick={() => {
                    if (sortField === 'score') {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortField('score');
                      setSortOrder('desc');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer ${
                    sortField === 'score'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Score {sortField === 'score' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div
              className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-5 space-y-4"
              style={{ animation: 'fadeSlideUp 0.3s ease-out forwards' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Filter Interviews</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Type filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full py-2.5 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="mixed">Mixed</option>
                </select>

                {/* Difficulty filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full py-2.5 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 animate-pulse"
                >
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
              ))}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-5">
                <FileText className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {interviews.length === 0 ? 'No interviews yet' : 'No matching interviews'}
              </h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                {interviews.length === 0
                  ? 'Start your first practice interview to see your history here.'
                  : 'Try adjusting your filters to find what you\'re looking for.'}
              </p>
              {interviews.length === 0 ? (
                <Link
                  to="/resume-upload"
                  className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer"
                >
                  Start Your First Interview
                </Link>
              ) : (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results count */}
              {activeFilterCount > 0 && (
                <p className="text-xs text-slate-500">
                  Showing {filteredInterviews.length} of {interviews.length} interviews
                </p>
              )}
              {filteredInterviews.map((interview, index) => (
                <HistoryCard key={interview._id} interview={interview} index={index} />
              ))}
            </div>
          )}
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

export default InterviewHistory;
