import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MediaFile } from '../types';
import { 
  PlaySquare, 
  UploadCloud, 
  Film, 
  BarChart3, 
  LogOut, 
  User as UserIcon, 
  Activity, 
  CheckCircle2, 
  X,
  Radio
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'library' | 'upload' | 'watch' | 'report';
  setCurrentTab: (tab: 'library' | 'upload' | 'watch' | 'report') => void;
  selectedMedia: MediaFile | null;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  selectedMedia,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user, logout, loginDemo } = useAuth();

  const handleNavClick = (tab: 'library' | 'upload' | 'watch' | 'report') => {
    setCurrentTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div 
              onClick={() => handleNavClick('library')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <PlaySquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">Media<span className="text-emerald-600">Flow</span></span>
                  <span className="text-[9px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded">ABR</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Adaptive Media Platform</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6 flex-1">
            {/* Primary Menu */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2">
                Main Menu
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNavClick('library')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    currentTab === 'library'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Film className={`w-4 h-4 ${currentTab === 'library' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Media Library</span>
                </button>

                <button
                  onClick={() => handleNavClick('upload')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    currentTab === 'upload'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className={`w-4 h-4 ${currentTab === 'upload' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Upload Media</span>
                </button>
              </nav>
            </div>

            {/* Current Selected Media Section (Watch & Report) */}
            {selectedMedia && (
              <div>
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Selected Stream
                  </p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-2">
                  <div className="text-xs font-bold text-slate-800 truncate" title={selectedMedia.title}>
                    {selectedMedia.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-1.5">
                    <span className="uppercase font-semibold">{selectedMedia.mediaType}</span>
                    <span>&bull;</span>
                    <span>{selectedMedia.renditions?.length || 0} Renditions</span>
                  </div>
                </div>

                <nav className="space-y-1">
                  <button
                    onClick={() => handleNavClick('watch')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      currentTab === 'watch'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Radio className={`w-4 h-4 ${currentTab === 'watch' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Watch & Player</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('report')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      currentTab === 'report'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className={`w-4 h-4 ${currentTab === 'report' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Quality Report (PSNR/SSIM)</span>
                  </button>
                </nav>
              </div>
            )}

            {/* Live System Diagnostics Widget */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transcoder Engine</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Online</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Adaptive HLS multi-bitrate ladder (240p–1080p) with live objective distortion metrics.
              </p>
              <div className="flex items-center space-x-2 text-[10px] font-medium text-slate-600 pt-1 border-t border-slate-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>WCAG 2.2 AA Compliant</span>
              </div>
            </div>
          </div>

          {/* User Profile / Auth Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginDemo()}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Load Demo Account</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
