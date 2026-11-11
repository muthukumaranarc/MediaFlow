import React, { useEffect, useState } from 'react';
import { mediaApi } from '../api/mediaApi';
import { QualityReport, MediaFile } from '../types';
import { formatBytes } from '../utils/formatters';
import { BarChart3, Info, Award, Zap, Layers, FileCheck } from 'lucide-react';

interface CompressionReportViewProps {
  media: MediaFile;
  onBack: () => void;
}

export const CompressionReportView: React.FC<CompressionReportViewProps> = ({ media, onBack }) => {
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await mediaApi.getQualityReports(media.mediaId);
        setReports(res.data);
      } catch (e) {
        console.error('Failed to load quality reports', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [media.mediaId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-emerald-600 hover:underline mb-2 flex items-center space-x-1"
          >
            <span>&larr; Back to Media Library</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            <span>Compression & Quality Assessment Report</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Media: <strong className="text-slate-800">{media.title}</strong> &bull; Original Size: <strong className="text-emerald-700">{formatBytes(media.sizeBytes)}</strong>
          </p>
        </div>
      </div>

      {/* Transparency Disclaimer Alert (Section 1.2.5, 4.1.4) */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start space-x-3 text-emerald-900 text-xs">
        <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-emerald-950">Transparency Notice:</strong>
          <p className="mt-0.5 text-emerald-800 leading-relaxed">
            Reported objective quality values (PSNR and SSIM) and compression ratios represent measurements from this specific encoding configuration. They provide an objective baseline and do not guarantee identical results on other footage.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm font-medium">Loading quality metrics...</div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
          No compression reports are available for this file yet. Transcoding may still be processing.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rendition Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((report) => {
              const savedBytes = Math.max(0, report.originalSizeBytes - report.compressedSizeBytes);
              const percentSaved = Math.round((savedBytes / Math.max(1, report.originalSizeBytes)) * 100);

              return (
                <div
                  key={report.reportId}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-md space-y-4 transition"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-base font-bold text-slate-900 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>{report.renditionLabel || 'Output'}</span>
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {report.resolution || 'Standard'}
                    </span>
                  </div>

                  {/* Size Comparison */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Compressed Size:</span>
                      <strong className="text-slate-900 font-semibold">{formatBytes(report.compressedSizeBytes)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Compression Ratio:</span>
                      <strong className="text-emerald-700 font-bold">{report.compressionRatio}:1 ({percentSaved}% saved)</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, 100 - percentSaved))}%` }}
                      />
                    </div>
                  </div>

                  {/* Objective Quality Metrics (PSNR / SSIM) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>PSNR</span>
                      </div>
                      <div className="text-base font-bold text-slate-900 mt-1">
                        {report.psnr ? `${report.psnr} dB` : 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {report.psnr && report.psnr > 37 ? 'High Fidelity' : 'Good'}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-emerald-600" />
                        <span>SSIM</span>
                      </div>
                      <div className="text-base font-bold text-slate-900 mt-1">
                        {report.ssim ? report.ssim.toFixed(3) : 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {report.ssim && report.ssim > 0.95 ? 'Excellent match' : 'Perceptual match'}
                      </div>
                    </div>
                  </div>

                  {/* Settings summary */}
                  {report.settingsSummary && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="font-semibold text-slate-800">Codec Profile:</span> {report.settingsSummary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Standards Summary Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Full Rendition Specifications Table</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">Rendition</th>
                    <th className="pb-3 font-semibold">Resolution</th>
                    <th className="pb-3 font-semibold">Target Bitrate</th>
                    <th className="pb-3 font-semibold">Output Size</th>
                    <th className="pb-3 font-semibold">Ratio</th>
                    <th className="pb-3 font-semibold">PSNR (dB)</th>
                    <th className="pb-3 font-semibold">SSIM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => (
                    <tr key={r.reportId} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 font-bold text-slate-900">{r.renditionLabel || 'Output'}</td>
                      <td className="py-3.5 text-slate-600">{r.resolution || '-'}</td>
                      <td className="py-3.5 text-slate-600">{r.bitrate ? `${r.bitrate} kbps` : '-'}</td>
                      <td className="py-3.5 text-slate-600 font-medium">{formatBytes(r.compressedSizeBytes)}</td>
                      <td className="py-3.5 text-emerald-700 font-bold">{r.compressionRatio}:1</td>
                      <td className="py-3.5 text-slate-800 font-semibold">{r.psnr ? `${r.psnr} dB` : '-'}</td>
                      <td className="py-3.5 text-slate-800 font-semibold">{r.ssim ? r.ssim.toFixed(3) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
