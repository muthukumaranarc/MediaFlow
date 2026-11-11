# MediaFlow Frontend Subsystem Contract

## Architectural Role
The **MediaFlow Frontend** is a Single Page Application (SPA) built with React 18, TypeScript, Vite, and Tailwind CSS. It delivers an accessible, WCAG 2.2-compliant user interface for uploading multimedia content, monitoring transcoding telemetry, playing adaptive HLS streams via Hls.js, and analyzing objective compression quality metrics.

## Technical Invariants
1. **WCAG 2.2 Accessible Player**: Every playback control provides visible focus rings, ARIA labels, and keyboard bindings (`Space`/`k` play/pause, Left/Right seek 5s, Up/Down volume, `f` fullscreen, `m` mute, `c` closed captions).
2. **Dynamic ABR & Manual Override**: Integrates Hls.js with seamless fallback to native browser HLS (Safari). Provides one-click switching between Auto Adaptive Bitrate (`currentLevel = -1`) and locked resolution profiles.
3. **Client-Side Safeguards**: Enforces pre-upload file validation (rejects files over 500 MB and non-multimedia MIME types) with clear human-readable feedback before dispatching to the network.
4. **Resilient Session Handling**: Manages authentication tokens via `localStorage` with automated interceptor decoration on all outgoing API calls.

## Component Tree & Responsibilities
- `src/App.tsx`: Central coordinator managing active views (`library`, `upload`, `watch`, `report`).
- `src/components/AccessibleMediaPlayer.tsx`: Hls.js player engine with WebVTT subtitle track rendering, custom UI controls, and live stream telemetry overlay.
- `src/components/MediaUploadView.tsx`: Multipart dropzone with live percentage progress tracking.
- `src/components/MediaLibraryView.tsx`: Personal media gallery with polling for asynchronous background transcoding status.
- `src/components/CompressionReportView.tsx`: Visualizer for space saved, compression ratios, and PSNR/SSIM objective quality scores.
- `src/components/AuthModal.tsx`: Dual authentication supporting standard registration/login and one-click Demonstration Mode.

## Build & Execution
```bash
# Install dependencies
npm install

# Run Vite development server on port 5173
npm run dev

# Build production bundle
npm run build
```
