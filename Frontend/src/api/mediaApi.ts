import api from './client';
import { MediaFile, ProcessingJob, QualityReport } from '../types';

export const mediaApi = {
  uploadMedia: (
    formData: FormData,
    onProgress?: (percent: number) => void
  ) => {
    return api.post<MediaFile>('/api/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  listMedia: () => api.get<MediaFile[]>('/api/media'),

  getMedia: (id: number) => api.get<MediaFile>(`/api/media/${id}`),

  searchMedia: (query: string) => api.get<MediaFile[]>(`/api/media/search?query=${encodeURIComponent(query)}`),

  deleteMedia: (id: number) => api.delete(`/api/media/${id}`),

  getJobStatus: (jobId: number) => api.get<ProcessingJob>(`/api/jobs/${jobId}/status`),

  getLatestJob: (mediaId: number) => api.get<ProcessingJob>(`/api/jobs/media/${mediaId}`),

  getQualityReports: (mediaId: number) => api.get<QualityReport[]>(`/api/reports/media/${mediaId}`),

  sendPlaybackFeedback: (mediaId: number, sessionId: string, renditionLabel: string, stallCount: number) =>
    api.post(`/api/reports/feedback/${mediaId}`, { sessionId, renditionLabel, stallCount }),
};
