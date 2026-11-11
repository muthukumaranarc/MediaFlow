import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PlaySquare, UploadCloud, Film, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentTab: 'library' | 'upload' | 'watch' | 'report';
  setCurrentTab: (tab: 'library' | 'upload') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout, loginDemo } = useAuth();

  return (
    <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-40 backdrop-blur shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('library')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <PlaySquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-slate-900 tracking-tight">Media<span className="text-emerald-600">Flow</span></span>
              <span className="text-[10px] uppercase font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">HLS ABR</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Adaptive Multimedia Streaming & Compression</p>
          </div>
        </div>

        {/* Navigation & User */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <>
              <button
                onClick={() => setCurrentTab('library')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  currentTab === 'library'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="View Media Library"
              >
                <Film className="w-4 h-4" />
                <span>Library</span>
              </button>

              <button
                onClick={() => setCurrentTab('upload')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  currentTab === 'upload'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
                aria-label="Upload New Media"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Media</span>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">{user.displayName}</span>
                {user.email === 'demo@mediaflow.local' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-medium">Demo</span>
                )}
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loginDemo()}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-600/20"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Try Demo Mode</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
