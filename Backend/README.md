# MediaFlow Backend Subsystem Contract

## Architectural Role
The **MediaFlow Backend** is a Spring Boot 3.4.x service responsible for secure media upload validation, asynchronous transcoding execution via FFmpeg/FFprobe, HLS ABR multi-rendition packaging, objective quality evaluation (PSNR/SSIM), and RESTful client services.

## Technical Invariants
1. **Command Injection Prevention**: FFmpeg and FFprobe are invoked exclusively via `ProcessBuilder` with explicit, parameterized argument arrays. User-supplied inputs (titles, filenames) are never concatenated directly into command lines.
2. **Resolution Constraint Invariant**: Transcoding ladders are strictly bounded by source video dimensions ($H_{rendition} \le H_{source}$). The system never upscales beyond the native source resolution.
3. **MIME & Magic-Byte Integrity**: Uploaded payloads are validated against binary signatures using Apache Tika before disk persistence or queuing.
4. **Content Ownership & Isolation**: Data queries enforce strict user tenancy (`user_id = principal.user_id`). Another user's media cannot be viewed or deleted by ID enumeration.
5. **Transparency in Metrics**: Quality reports explicitly declare that PSNR (dB) and SSIM values apply strictly to the specific tested configuration and do not guarantee outcomes for other content.

## API Contracts

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Invariant / Side Effect |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Creates User record with BCrypt password hash. Returns JWT. |
| `POST` | `/api/auth/login` | Sign in with email and password | Returns JWT token (24h validity). |
| `GET` | `/api/auth/demo` | One-click Demonstration Mode | Auto-provisions and authenticates demo user. |
| `GET` | `/api/auth/me` | Fetch authenticated identity | Requires valid `Bearer` token. |

### Media Management (`/api/media`)
| Method | Endpoint | Description | Invariant / Side Effect |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/media/upload` | Multipart file upload | Validates magic bytes, stores to `storage/originals`, extracts metadata via `ffprobe`, spawns `@Async` transcoding worker. |
| `GET` | `/api/media` | List user's media library | Returns only media owned by authenticated user. |
| `GET` | `/api/media/{id}` | Retrieve media details | Enforces ownership check (returns 403 on tenant mismatch). |
| `GET` | `/api/media/search` | Search user's media by title | Case-insensitive substring match. |
| `DELETE`| `/api/media/{id}` | Delete media and renditions | Removes DB records and cleans all files from disk (`storage/hls`, `originals`, `thumbnails`). |

### HLS Adaptive Streaming (`/api/stream`)
| Method | Endpoint | Content-Type | Invariant / Side Effect |
| :--- | :--- | :--- | :--- |
| `GET` | `/{mediaId}/master.m3u8` | `application/vnd.apple.mpegurl` | Master multi-rendition HLS manifest. |
| `GET` | `/{mediaId}/{rendition}/playlist.m3u8` | `application/vnd.apple.mpegurl` | Rendition playlist (e.g. 720p, 480p). |
| `GET` | `/{mediaId}/{rendition}/{segment}.ts` | `video/mp2t` | MPEG-2 Transport Stream slice. |
| `GET` | `/{mediaId}/thumbnail.jpg` | `image/jpeg` | Extracted 1-second video thumbnail. |
| `GET` | `/{mediaId}/captions.vtt` | `text/vtt` | WebVTT subtitle track. |

### Processing & Quality Assessment (`/api/jobs`, `/api/reports`)
| Method | Endpoint | Description | Invariant / Side Effect |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs/{id}/status` | Check job progress percentage | Returns QUEUED, PROCESSING, COMPLETED, or FAILED. |
| `GET` | `/api/reports/media/{mediaId}` | Retrieve compression & quality metrics | Returns original size, rendition sizes, compression ratio, PSNR, SSIM. |
| `POST` | `/api/reports/feedback/{mediaId}` | Record playback telemetry | Logs buffer stalls and active rendition. |

## Build & Execution
```bash
# Compile and run tests
mvn test

# Start the Spring Boot backend service on port 8080
mvn spring-boot:run
```
