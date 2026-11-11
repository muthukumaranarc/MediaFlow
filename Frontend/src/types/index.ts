export interface User {
  userId: number;
  displayName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string | null;
  userId: number;
  displayName: string;
  email: string;
  role: string;
}

export interface Rendition {
  renditionId: number;
  label: string;
  resolution: string;
  bitrate: number;
  codec: string;
  sizeBytes: number;
}

export interface Caption {
  captionId: number;
  language: string;
}

export interface MediaFile {
  mediaId: number;
  title: string;
  mediaType: 'VIDEO' | 'AUDIO' | 'IMAGE';
  duration?: number;
  width?: number;
  height?: number;
  sizeBytes: number;
  status: 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED';
  thumbnailPath?: string;
  createdAt: string;
  renditions?: Rendition[];
  captions?: Caption[];
}

export interface ProcessingJob {
  jobId: number;
  mediaId: number;
  state: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progressPercent: number;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface QualityReport {
  reportId: number;
  mediaId: number;
  renditionId?: number;
  renditionLabel?: string;
  resolution?: string;
  bitrate?: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  psnr?: number;
  ssim?: number;
  settingsSummary?: string;
  createdAt: string;
  transparencyDisclaimer: string;
}
