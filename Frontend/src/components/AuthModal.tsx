import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlaySquare, ShieldAlert, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register, loginDemo } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!displayName.trim()) throw new Error('Please enter your name.');
        await register(displayName, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginDemo();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Demo mode login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <PlaySquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to <span className="text-emerald-600">MediaFlow</span>
          </h2>
          <p className="text-xs text-slate-500">
            Adaptive Multimedia Streaming & Measurable Compression System
          </p>
        </div>

        {/* Quick Demo Mode Action Banner */}
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2.5">
          <div className="text-xs text-emerald-800 font-bold flex items-center justify-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Academic Demonstration Mode</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            Explore ABR streaming, automatic multi-bitrate ladders, and PSNR/SSIM reporting immediately without signing up.
          </p>
          <button
            type="button"
            onClick={handleDemo}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Launch Demonstration Mode</span>}
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Or Sign In with Account</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Student Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : isRegisterMode ? (
              <>
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Create MediaFlow Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg(null);
            }}
            className="text-xs text-slate-500 hover:text-emerald-700 font-medium transition"
          >
            {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
