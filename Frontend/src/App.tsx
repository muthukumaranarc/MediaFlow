import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { MediaLibraryView } from './components/MediaLibraryView';
import { MediaUploadView } from './components/MediaUploadView';
import { AccessibleMediaPlayer } from './components/AccessibleMediaPlayer';
import { CompressionReportView } from './components/CompressionReportView';
import { MediaFile } from './types';
import { formatBytes, formatDuration } from './utils/formatters';
import { 
  BarChart3, 
  Film, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  Menu, 
  UploadCloud, 
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export function App() {
  const { user, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<'library' | 'upload' | 'watch' | 'report'>('library');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 text-sm space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-medium text-slate-600">Initializing MediaFlow system...</p>
      </div>
    );
  }

  const handleSelectMediaToWatch = (media: MediaFile) => {
    setSelectedMedia(media);
    setCurrentTab('watch');
  };

  const handleSelectMediaReport = (media: MediaFile) => {
    setSelectedMedia(media);
    setCurrentTab('report');
  };

  const handleUploadSuccess = (_mediaId: number) => {
    setCurrentTab('library');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'library':
        return 'Media Library';
      case 'upload':
        return 'Upload & Ingest Media';
      case 'watch':
        return 'Stream Player';
      case 'report':
        return 'Quality & Compression Analysis';
      default:
        return 'MediaFlow';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedMedia={selectedMedia}
        isOpenMobile={isMobileOpen}
        setIsOpenMobile={setIsMobileOpen}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Minimalist Header */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 h-16 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-400">MediaFlow</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-800 text-sm">{getPageTitle()}</span>
            </div>
          </div>

          {/* Quick Action & Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>HLS ABR Engine Ready</span>
            </div>

            {user && currentTab !== 'upload' && (
              <button
                onClick={() => setCurrentTab('upload')}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Media</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {!user ? (
            <AuthModal />
          ) : (
            <>
              {/* Library View */}
              {currentTab === 'library' && (
                <MediaLibraryView
                  onSelectMediaToWatch={handleSelectMediaToWatch}
                  onSelectMediaReport={handleSelectMediaReport}
                  onNavigateUpload={() => setCurrentTab('upload')}
                />
              )}

              {/* Upload View */}
              {currentTab === 'upload' && (
                <MediaUploadView
                  onUploadSuccess={handleUploadSuccess}
                  onCancel={() => setCurrentTab('library')}
                />
              )}

              {/* Watch Player View */}
              {currentTab === 'watch' && selectedMedia && (
                <div className="max-w-5xl mx-auto space-y-6">
                  {/* Top Bar with Back and Report Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentTab('library')}
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-emerald-600 transition font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Media Library</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab('report')}
                      className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-emerald-600 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>View Compression Metrics (PSNR/SSIM)</span>
                    </button>
                  </div>

                  {/* Adaptive HLS Player */}
                  <AccessibleMediaPlayer
                    mediaId={selectedMedia.mediaId}
                    title={selectedMedia.title}
                    hasCaptions={Boolean(selectedMedia.captions && selectedMedia.captions.length > 0)}
                  />

                  {/* Stream Details & Renditions Grid */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                      <div>
                        <h1 className="text-xl font-bold text-slate-900">{selectedMedia.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>Original: <strong className="text-slate-700">{formatBytes(selectedMedia.sizeBytes)}</strong></span>
                          <span>&bull;</span>
                          <span>Duration: <strong className="text-slate-700">{formatDuration(selectedMedia.duration)}</strong></span>
                          {(selectedMedia.width ?? 0) > 0 && (
                            <>
                              <span>&bull;</span>
                              <span>Source: <strong className="text-slate-700">{selectedMedia.width}x{selectedMedia.height}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold flex items-center space-x-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>HLS Adaptive Stream Ready</span>
                        </span>
                      </div>
                    </div>

                    {/* Transcoded Multi-Bitrate Ladder */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>Configured Multi-Bitrate Ladder Profiles</span>
                      </h4>

                      {selectedMedia.renditions && selectedMedia.renditions.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {selectedMedia.renditions.map((r) => (
                            <div
                              key={r.renditionId}
                              className="bg-slate-50/80 border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-emerald-300 transition"
                            >
                              <div className="font-bold text-slate-800">{r.label}</div>
                              <div className="text-[11px] text-slate-500">{r.resolution}</div>
                              <div className="text-[10px] text-emerald-600 font-semibold">{r.bitrate} kbps</div>
                              <div className="text-[10px] text-slate-400">{formatBytes(r.sizeBytes)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Transcoded renditions are loaded via HLS manifest.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Report View */}
              {currentTab === 'report' && selectedMedia && (
                <CompressionReportView
                  media={selectedMedia}
                  onBack={() => setCurrentTab('library')}
                />
              )}
            </>
          )}
        </main>

        {/* Minimal Clean Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-slate-600">
              <Film className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-800">MediaFlow</span>
              <span>&bull; Adaptive Multimedia Streaming & Compression System</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              WCAG 2.2 Accessible &bull; Elephant-and-Goldfish Model (EGM)
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
