import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, KeyRound, ShieldCheck, Mail, Lock, AlertCircle, Info, Sparkles } from 'lucide-react';

const passwordValid = (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(value);

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const request = async () => {
    setBusy(true);
    setNotice('');
    setIsError(false);
    try {
      const response = await authService.requestPasswordReset(identifier);
      setSent(true);
      setNotice(response.message);
    } catch (error: any) {
      setIsError(true);
      setNotice(error.response?.data?.message || 'Could not send a code.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordValid(password)) {
      setIsError(true);
      setNotice('Password must be 12+ characters and include upper, lower, number, and symbol.');
      return;
    }
    setBusy(true);
    setNotice('');
    setIsError(false);
    try {
      await resetPassword({ identifier, code, password });
      navigate('/dashboard');
    } catch (error: any) {
      setIsError(true);
      setNotice(error.response?.data?.message || 'Could not reset your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Icon Accent */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
          We’ll send a one-time verification code to your email. Codes expire after 10 minutes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-xl py-8 px-4 border border-slate-800/80 shadow-2xl rounded-3xl sm:px-10">
          
          {/* Notifications */}
          {notice && (
            <div className={`mb-6 rounded-xl border p-4 ${isError ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {isError ? (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold">{isError ? 'Error' : 'Notification'}</h3>
                  <p className={`mt-1 text-xs ${isError ? 'text-red-400' : 'text-slate-300'}`}>{notice}</p>
                </div>
              </div>
            </div>
          )}

          {!sent ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (notice) setNotice('');
                    }}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={request}
                  disabled={!identifier || busy}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-600/20"
                >
                  {busy ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Send secure code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={reset} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                  Verification Code
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (notice) setNotice('');
                    }}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 text-sm tracking-widest font-semibold text-center"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (notice) setNotice('');
                    }}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-600/20"
                >
                  {busy ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Dev mode info alert */}
          <div className="mt-6 p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              <strong>Developer Mode:</strong> If SMTP settings are missing in the server environment, the password reset code will be logged directly to the server terminal.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

