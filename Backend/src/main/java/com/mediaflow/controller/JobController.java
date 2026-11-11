package com.mediaflow.controller;

import com.mediaflow.dto.JobStatusResponse;
import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.ProcessingJob;
import com.mediaflow.entity.User;
import com.mediaflow.repository.MediaFileRepository;
import com.mediaflow.repository.ProcessingJobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final ProcessingJobRepository jobRepository;
    private final MediaFileRepository mediaFileRepository;

    public JobController(ProcessingJobRepository jobRepository, MediaFileRepository mediaFileRepository) {
        this.jobRepository = jobRepository;
        this.mediaFileRepository = mediaFileRepository;
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getJobStatus(@PathVariable("id") Long id, @AuthenticationPrincipal User user) {
        ProcessingJob job = jobRepository.findById(id).orElse(null);
        if (job == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found."));
        }
        if (user != null && job.getMediaFile() != null && !job.getMediaFile().getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied."));
        }
        return ResponseEntity.ok(JobStatusResponse.fromEntity(job));
    }

    @GetMapping("/media/{mediaId}")
    public ResponseEntity<?> getLatestJobForMedia(@PathVariable("mediaId") Long mediaId, @AuthenticationPrincipal User user) {
        MediaFile media = mediaFileRepository.findById(mediaId).orElse(null);
        if (media == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Media not found."));
        }
        if (user != null && !media.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied."));
        }
        ProcessingJob job = jobRepository.findTopByMediaFileOrderByJobIdDesc(media).orElse(null);
        if (job == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No jobs found for media."));
        }
        return ResponseEntity.ok(JobStatusResponse.fromEntity(job));
    }
}
