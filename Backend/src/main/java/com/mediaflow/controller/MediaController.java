package com.mediaflow.controller;

import com.mediaflow.dto.MediaResponse;
import com.mediaflow.entity.Caption;
import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.ProcessingJob;
import com.mediaflow.entity.User;
import com.mediaflow.repository.CaptionRepository;
import com.mediaflow.repository.MediaFileRepository;
import com.mediaflow.repository.ProcessingJobRepository;
import com.mediaflow.service.MediaValidationService;
import com.mediaflow.service.MetadataExtractionService;
import com.mediaflow.service.StorageService;
import com.mediaflow.service.TranscodingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaFileRepository mediaFileRepository;
    private final ProcessingJobRepository jobRepository;
    private final CaptionRepository captionRepository;
    private final MediaValidationService validationService;
    private final MetadataExtractionService metadataService;
    private final StorageService storageService;
    private final TranscodingService transcodingService;

    public MediaController(MediaFileRepository mediaFileRepository,
                           ProcessingJobRepository jobRepository,
                           CaptionRepository captionRepository,
                           MediaValidationService validationService,
                           MetadataExtractionService metadataService,
                           StorageService storageService,
                           TranscodingService transcodingService) {
        this.mediaFileRepository = mediaFileRepository;
        this.jobRepository = jobRepository;
        this.captionRepository = captionRepository;
        this.validationService = validationService;
        this.metadataService = metadataService;
        this.storageService = storageService;
        this.transcodingService = transcodingService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file,
                                         @RequestParam("title") String title,
                                         @RequestParam(value = "captionFile", required = false) MultipartFile captionFile,
                                         @RequestParam(value = "captionLanguage", defaultValue = "en") String captionLanguage,
                                         @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required."));
        }

        try {
            // 1. Validate file type, size and integrity (magic bytes)
            MediaValidationService.ValidationResult valResult = validationService.validate(file);

            // 2. Create initial MediaFile entity
            MediaFile media = new MediaFile();
            media.setUser(user);
            media.setTitle(title != null && !title.trim().isEmpty() ? title.trim() : file.getOriginalFilename());
            media.setMediaType(valResult.getMediaType());
            media.setSizeBytes(file.getSize());
            media.setStatus(MediaFile.MediaStatus.QUEUED);
            media.setOriginalPath("pending"); // updated after saving to disk
            media = mediaFileRepository.saveAndFlush(media);

            // 3. Store file to protected storage
            Path storedPath = storageService.storeOriginal(file, media.getMediaId());
            media.setOriginalPath(storedPath.toAbsolutePath().toString());

            // 4. Extract metadata via ffprobe
            MetadataExtractionService.MediaMetadata meta = metadataService.extract(storedPath);
            media.setDuration(meta.getDuration());
            media.setWidth(meta.getWidth());
            media.setHeight(meta.getHeight());
            media = mediaFileRepository.saveAndFlush(media);

            // 5. Optional Caption file upload (.vtt)
            if (captionFile != null && !captionFile.isEmpty()) {
                Path capPath = storageService.storeCaption(captionFile, media.getMediaId());
                Caption caption = new Caption();
                caption.setMediaFile(media);
                caption.setLanguage(captionLanguage);
                caption.setFilePath(capPath.toAbsolutePath().toString());
                captionRepository.saveAndFlush(caption);
            }

            // 6. Create ProcessingJob
            ProcessingJob job = new ProcessingJob();
            job.setMediaFile(media);
            job.setState(ProcessingJob.JobState.QUEUED);
            job.setProgressPercent(0);
            job = jobRepository.saveAndFlush(job);

            // 7. Dispatch background asynchronous transcoding
            transcodingService.processMediaAsync(media.getMediaId(), job.getJobId());

            return ResponseEntity.status(HttpStatus.CREATED).body(MediaResponse.fromEntity(media));

        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Internal upload failure: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping
    public ResponseEntity<List<MediaResponse>> listUserMedia(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<MediaFile> list = mediaFileRepository.findByUserOrderByCreatedAtDesc(user);
        List<MediaResponse> dtos = list.stream().map(MediaResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<MediaResponse>> searchUserMedia(@RequestParam("query") String query,
                                                               @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<MediaFile> list = mediaFileRepository.findByUserAndTitleContainingIgnoreCase(user, query);
        List<MediaResponse> dtos = list.stream().map(MediaResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMediaDetails(@PathVariable("id") Long id,
                                             @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MediaFile media = mediaFileRepository.findById(id).orElse(null);
        if (media == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Media file not found."));
        }
        // Section 4.1.5 / Test T11: Privacy and ownership check
        if (!media.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not own this media resource."));
        }
        return ResponseEntity.ok(MediaResponse.fromEntity(media));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedia(@PathVariable("id") Long id,
                                         @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        MediaFile media = mediaFileRepository.findById(id).orElse(null);
        if (media == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Media file not found."));
        }
        if (!media.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You cannot delete another user's media."));
        }

        // Clean up files from disk
        String captionPath = !media.getCaptions().isEmpty() ? media.getCaptions().get(0).getFilePath() : null;
        storageService.deleteMediaFiles(media.getMediaId(), media.getOriginalPath(), media.getThumbnailPath(), captionPath);

        // Delete related child entities before parent to ensure FK integrity
        jobRepository.findByMediaFileOrderByStartedAtDesc(media).forEach(jobRepository::delete);
        mediaFileRepository.delete(media);

        return ResponseEntity.ok(Map.of("message", "Media item and associated renditions successfully deleted."));
    }
}
