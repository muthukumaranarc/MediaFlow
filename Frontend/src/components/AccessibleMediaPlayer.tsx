import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Subtitles, Activity, RotateCcw, AlertCircle 
} from 'lucide-react';
import { formatDuration } from '../utils/formatters';
import { mediaApi } from '../api/mediaApi';

interface AccessibleMediaPlayerProps {
  mediaId: number;
  title: string;
  hasCaptions?: boolean;
}

interface HlsQualityLevel {
  id: number;
  height: number;
  bitrate: number;
  name: string;
}

export const AccessibleMediaPlayer: React.FC<AccessibleMediaPlayerProps> = ({
  mediaId,
  title,
  hasCaptions = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // ABR & Quality state
  const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [currentQualityLabel, setCurrentQualityLabel] = useState<string>('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Captions state
  const [captionsActive, setCaptionsActive] = useState(hasCaptions);

  // Stats & Accessibility
  const [showStats, setShowStats] = useState(false);
  const [currentBitrate, setCurrentBitrate] = useState<number>(0);
  const [bufferLen, setBufferLen] = useState<number>(0);
  const [stallCount, setStallCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sessionId = useRef<string>(Math.random().toString(36).substring(2, 10));

  const streamSrc = `/api/stream/${mediaId}/master.m3u8`;
  const captionsSrc = `/api/stream/${mediaId}/captions.vtt`;

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setErrorMsg(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.loadSource(streamSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: HlsQualityLevel[] = data.levels.map((lvl, idx) => ({
          id: idx,
          height: lvl.height,
          bitrate: lvl.bitrate,
          name: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)} kbps`,
        }));
        setQualityLevels(levels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setCurrentBitrate(lvl.bitrate);
          if (hls.autoLevelEnabled) {
            setCurrentQualityLabel(`Auto (${lvl.height}p)`);
          } else {
            setCurrentQualityLabel(`${lvl.height}p`);
          }
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg('Network error while streaming media segments. Attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMsg('Media error during decode. Recovering playback...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('Playback error encountered. Video may still be processing.');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = streamSrc;
    } else {
      setErrorMsg('Adaptive HLS playback is not supported by your current browser.');
    }
  }, [streamSrc]);

  // Video time update and buffer length
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);

    // Calculate buffered length
    if (video.buffered.length > 0) {
      for (let i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= video.currentTime && video.currentTime <= video.buffered.end(i)) {
          setBufferLen(Math.round((video.buffered.end(i) - video.currentTime) * 10) / 10);
          break;
        }
      }
    }
  };

  const handleWaiting = () => {
    setStallCount(prev => {
      const next = prev + 1;
      mediaApi.sendPlaybackFeedback(mediaId, sessionId.current, currentQualityLabel, next).catch(() => {});
      return next;
    });
  };

  // Playback actions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Manual & Auto Quality Selector (Test T07)
  const selectQuality = (levelIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setCurrentLevel(levelIndex);
    if (levelIndex === -1) {
      setCurrentQualityLabel('Auto');
    } else {
      const selected = qualityLevels.find(q => q.id === levelIndex);
      setCurrentQualityLabel(selected ? selected.name : 'Custom');
    }
    setShowQualityMenu(false);
  };

  // WebVTT Subtitle Track toggling (Test T08)
  const toggleCaptions = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !captionsActive;
    setCaptionsActive(next);

    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = next ? 'showing' : 'disabled';
    }
  };

  // Keyboard Navigation according to WCAG 2.2 (Test T09)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'arrowleft':
      case 'j':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case 'arrowright':
      case 'l':
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
        break;
      case 'arrowup':
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        setVolume(video.volume);
        setIsMuted(false);
        break;
      case 'arrowdown':
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        setVolume(video.volume);
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'c':
        e.preventDefault();
        toggleCaptions();
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 group select-none"
      aria-label={`Adaptive Video Player: ${title}`}
      role="region"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={handleWaiting}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        crossOrigin="anonymous"
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      >
        {hasCaptions && (
          <track
            src={captionsSrc}
            kind="subtitles"
            srcLang="en"
            label="English Subtitles"
            default={captionsActive}
          />
        )}
      </video>

      {/* Error Banner */}
      {errorMsg && (
        <div className="absolute top-4 left-4 right-4 bg-rose-900/90 border border-rose-500/50 text-white p-3 rounded-lg flex items-center space-x-2 text-sm z-30 shadow-lg backdrop-blur">
          <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Technical Stream Stats Overlay */}
      {showStats && (
        <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl text-xs font-mono text-emerald-400 z-30 shadow-xl backdrop-blur space-y-1">
          <div className="text-white font-bold border-b border-slate-800 pb-1 flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>HLS Stream Telemetry</span>
          </div>
          <div>Quality Mode: <span className="text-white">{currentQualityLabel}</span></div>
          <div>Bitrate: <span className="text-white">{currentBitrate ? `${Math.round(currentBitrate / 1000)} kbps` : 'Estimating...'}</span></div>
          <div>Buffer Length: <span className="text-white">{bufferLen}s</span></div>
          <div>Buffer Stalls: <span className="text-white">{stallCount}</span></div>
          <div>Resolution: <span className="text-white">{videoRef.current?.videoWidth}x{videoRef.current?.videoHeight}</span></div>
        </div>
      )}

      {/* Center Play Overlay Icon */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer pointer-events-auto transition group-hover:bg-black/30"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-xl hover:scale-110 hover:bg-emerald-400 transition">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />
          </div>
        </div>
      )}

      {/* Accessible Player Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-200 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Slider */}
        <div className="flex items-center space-x-3 mb-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:h-2 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400"
            aria-label="Video Seek Timeline"
          />
        </div>

        <div className="flex items-center justify-between text-white text-sm">
          {/* Left: Play/Pause, Seek, Volume, Time */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:bg-white/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label={isPlaying ? 'Pause video (Space or K)' : 'Play video (Space or K)'}
              title={isPlaying ? 'Pause (Space or K)' : 'Play (Space or K)'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 5);
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg transition hidden sm:block focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Rewind 5 seconds (J or Left Arrow)"
              title="Rewind 5s (Left Arrow)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:bg-white/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hidden sm:block"
                aria-label="Volume Slider"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-mono text-slate-300 ml-1">
              <span>{formatDuration(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right: Telemetry, Captions, Quality Selector, Fullscreen */}
          <div className="flex items-center space-x-2 relative">
            {/* Stream Telemetry Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-1.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                showStats ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'hover:bg-white/20 text-slate-300'
              }`}
              title="Toggle Stream Statistics"
              aria-label="Toggle Stream Statistics Overlay"
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Subtitles (WebVTT) Toggle */}
            {hasCaptions && (
              <button
                onClick={toggleCaptions}
                className={`p-1.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  captionsActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'hover:bg-white/20 text-slate-300'
                }`}
                title={captionsActive ? 'Turn off captions (C)' : 'Turn on captions (C)'}
                aria-label={captionsActive ? 'Disable Closed Captions (C)' : 'Enable Closed Captions (C)'}
              >
                <Subtitles className="w-4 h-4" />
              </button>
            )}

            {/* Quality Selector (Table 3.4.3 / Test T07) */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center space-x-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="Quality Selection Menu"
                title="Select Quality"
              >
                <Settings className="w-3.5 h-3.5 mr-1" />
                <span>{currentQualityLabel}</span>
              </button>

              {showQualityMenu && (
                <div 
                  className="absolute bottom-10 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 w-40 z-50 text-xs"
                  role="menu"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Quality Ladder
                  </div>

                  {/* Auto Option */}
                  <button
                    onClick={() => selectQuality(-1)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition ${
                      currentLevel === -1 ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Auto (ABR)</span>
                    {currentLevel === -1 && <span className="text-[10px]">Active</span>}
                  </button>

                  {/* Available Renditions */}
                  {qualityLevels.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => selectQuality(lvl.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition ${
                        currentLevel === lvl.id ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-medium">{lvl.name}</span>
                      <span className={`text-[10px] ${currentLevel === lvl.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {Math.round(lvl.bitrate / 1000)}k
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
