import React, { useState, useRef } from 'react';
import { mediaApi } from '../api/mediaApi';
import { UploadCloud, FileVideo, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface MediaUploadViewProps {
  onUploadSuccess: (mediaId: number) => void;
  onCancel: () => void;
}

export const MediaUploadView: React.FC<MediaUploadViewProps> = ({ onUploadSuccess, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];

      if (selected.size > 500 * 1024 * 1024) {
        setErrorMsg('Selected file exceeds the maximum permitted size limit of 500 MB.');
        return;
      }

      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const cap = e.target.files[0];
      if (!cap.name.endsWith('.vtt')) {
        setErrorMsg('Caption files must be in WebVTT (.vtt) format.');
        return;
      }
      setCaptionFile(cap);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a media file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      setUploadPercent(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);
      if (captionFile) {
        formData.append('captionFile', captionFile);
        formData.append('captionLanguage', language);
      }

      const res = await mediaApi.uploadMedia(formData, (percent) => {
        setUploadPercent(percent);
      });

      onUploadSuccess(res.data.mediaId);
    } catch (err: any) {
      setIsUploading(false);
      const serverMsg = err.response?.data?.error || err.message || 'Failed to upload media file.';
      setErrorMsg(serverMsg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <UploadCloud className="w-6 h-6 text-emerald-600" />
            <span>Upload Multimedia File</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accepts MP4, MKV, MOV, WebM videos, MP3/WAV audio, or images. Automated ABR transcoding will process in background.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Media Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Computer Vision Lecture 01"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            disabled={isUploading}
          />
        </div>

        {/* Primary File Dropzone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Media File (Video, Audio, Image)
          </label>
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
              file
                ? 'border-emerald-500/80 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="video/*,audio/*,image/*"
              className="hidden"
              disabled={isUploading}
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-slate-900 max-w-sm truncate">{file.name}</span>
                <span className="text-xs text-slate-500 mt-0.5 font-medium">{formatBytes(file.size)}</span>
                <span className="text-xs text-emerald-600 font-semibold mt-2 hover:underline">Click to change file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3 border border-slate-200">
                  <FileVideo className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">Click to browse or drag and drop media</span>
                <span className="text-xs text-slate-500 mt-1">MP4, MKV, MOV, MP3, WAV, WebP up to 500 MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Optional WebVTT Captions */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Optional Captions (WebVTT .vtt)</span>
            </span>
            {captionFile && (
              <button
                type="button"
                onClick={() => setCaptionFile(null)}
                className="text-[11px] text-rose-600 font-medium hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => captionInputRef.current?.click()}
                disabled={isUploading}
                className="w-full text-left px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium truncate shadow-xs transition"
              >
                {captionFile ? captionFile.name : 'Select .vtt caption file...'}
              </button>
              <input
                ref={captionInputRef}
                type="file"
                accept=".vtt,text/vtt"
                onChange={handleCaptionChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isUploading}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="en">English (en)</option>
                <option value="ta">Tamil (ta)</option>
                <option value="es">Spanish (es)</option>
                <option value="fr">French (fr)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center space-x-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Uploading and extracting stream signatures...</span>
              </span>
              <span className="text-emerald-700">{uploadPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-200"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !file}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition shadow-md ${
              isUploading || !file
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Upload...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Transcode</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
