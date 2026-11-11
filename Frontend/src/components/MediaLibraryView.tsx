import React, { useState, useEffect } from 'react';
import { mediaApi } from '../api/mediaApi';
import { MediaFile } from '../types';
import { formatBytes, formatDuration, formatDate } from '../utils/formatters';
import { 
  Play, BarChart3, Trash2, Search, Film, Music, Image as ImageIcon, 
  Loader2, AlertTriangle, Plus 
} from 'lucide-react';

interface MediaLibraryViewProps {
  onSelectMediaToWatch: (media: MediaFile) => void;
  onSelectMediaReport: (media: MediaFile) => void;
  onNavigateUpload: () => void;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  onSelectMediaToWatch,
  onSelectMediaReport,
  onNavigateUpload,
}) => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMedia = async () => {
    try {
      if (searchQuery.trim()) {
        const res = await mediaApi.searchMedia(searchQuery.trim());
        setMediaList(res.data);
      } else {
        const res = await mediaApi.listMedia();
        setMediaList(res.data);
      }
    } catch (e) {
      console.error('Failed to load media items', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    const interval = setInterval(() => {
      setMediaList((current) => {
        const hasProcessing = current.some(m => m.status === 'PROCESSING' || m.status === 'QUEUED');
        if (hasProcessing) {
          fetchMedia();
        }
        return current;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [searchQuery]);

  const handleDelete = async (mediaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this media item and all its transcoded renditions?')) {
      return;
    }

    try {
      setDeletingId(mediaId);
      await mediaApi.deleteMedia(mediaId);
      setMediaList(prev => prev.filter(m => m.mediaId !== mediaId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete media item.');
    } finally {
      setDeletingId(null);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'AUDIO': return <Music className="w-6 h-6 text-amber-500" />;
      case 'IMAGE': return <ImageIcon className="w-6 h-6 text-blue-500" />;
      default: return <Film className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        <button
          onClick={onNavigateUpload}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-slate-600 font-medium">Loading your media library...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No media files found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'No media matches your search query.' : 'Your personal library is empty. Upload a video, audio or image to begin.'}
            </p>
          </div>
          <button
            onClick={onNavigateUpload}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Media</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaList.map((media) => {
            const isReady = media.status === 'READY';
            const isProcessing = media.status === 'PROCESSING' || media.status === 'QUEUED';
            const isFailed = media.status === 'FAILED';

            return (
              <div
                key={media.mediaId}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col group"
              >
                {/* Thumbnail / Header Area */}
                <div 
                  onClick={() => isReady && onSelectMediaToWatch(media)}
                  className={`relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden ${
                    isReady ? 'cursor-pointer' : ''
                  }`}
                >
                  {media.thumbnailPath ? (
                    <img
                      src={media.thumbnailPath}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      {getMediaIcon(media.mediaType)}
                      <span className="text-xs text-slate-400 mt-1 uppercase font-semibold">{media.mediaType}</span>
                    </div>
                  )}

                  {/* Play Button Overlay on Hover */}
                  {isReady && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition">
                        <Play className="w-6 h-6 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Duration Badge */}
                  {media.duration !== undefined && media.duration > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded backdrop-blur">
                      {formatDuration(media.duration)}
                    </div>
                  )}

                  {/* Status Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    {isReady && (
                      <span className="text-[10px] font-semibold bg-emerald-600/90 text-white px-2.5 py-0.5 rounded-full shadow flex items-center space-x-1">
                        <span>Ready</span>
                      </span>
                    )}
                    {isProcessing && (
                      <span className="text-[10px] font-semibold bg-amber-500/95 text-white px-2.5 py-0.5 rounded-full shadow flex items-center space-x-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Transcoding...</span>
                      </span>
                    )}
                    {isFailed && (
                      <span className="text-[10px] font-semibold bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition">
                      {media.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1.5">
                      <span className="font-medium text-slate-600">{formatBytes(media.sizeBytes)}</span>
                      <span>&bull;</span>
                      {media.width && media.height ? (
                        <span>{media.width}x{media.height}</span>
                      ) : (
                        <span>{media.mediaType}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">{formatDate(media.createdAt)}</span>

                    <div className="flex items-center space-x-1">
                      {isReady && (
                        <button
                          onClick={() => onSelectMediaReport(media)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                          title="View Compression & Quality Report"
                          aria-label="View Compression Report"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDelete(media.mediaId, e)}
                        disabled={deletingId === media.mediaId}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                        title="Delete media and renditions"
                        aria-label="Delete media item"
                      >
                        {deletingId === media.mediaId ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
