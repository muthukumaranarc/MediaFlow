package com.mediaflow.controller;

import com.mediaflow.dto.PlaybackFeedbackRequest;
import com.mediaflow.dto.QualityReportResponse;
import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.PlaybackLog;
import com.mediaflow.entity.QualityReport;
import com.mediaflow.entity.User;
import com.mediaflow.repository.MediaFileRepository;
import com.mediaflow.repository.PlaybackLogRepository;
import com.mediaflow.repository.QualityReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class QualityReportController {

    private final QualityReportRepository qualityReportRepository;
    private final MediaFileRepository mediaFileRepository;
    private final PlaybackLogRepository playbackLogRepository;

    public QualityReportController(QualityReportRepository qualityReportRepository,
                                   MediaFileRepository mediaFileRepository,
                                   PlaybackLogRepository playbackLogRepository) {
        this.qualityReportRepository = qualityReportRepository;
        this.mediaFileRepository = mediaFileRepository;
        this.playbackLogRepository = playbackLogRepository;
    }

    @GetMapping("/media/{mediaId}")
    public ResponseEntity<?> getReportsForMedia(@PathVariable("mediaId") Long mediaId,
                                                @AuthenticationPrincipal User user) {
        MediaFile media = mediaFileRepository.findById(mediaId).orElse(null);
        if (media == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Media file not found."));
        }
        if (user != null && !media.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied."));
        }

        List<QualityReport> list = qualityReportRepository.findByMediaFile(media);
        List<QualityReportResponse> dtos = list.stream().map(QualityReportResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/feedback/{mediaId}")
    public ResponseEntity<?> recordPlaybackFeedback(@PathVariable("mediaId") Long mediaId,
                                                    @RequestBody PlaybackFeedbackRequest req) {
        MediaFile media = mediaFileRepository.findById(mediaId).orElse(null);
        if (media == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        PlaybackLog log = new PlaybackLog();
        log.setMediaFile(media);
        log.setSessionId(req.getSessionId());
        log.setRenditionLabel(req.getRenditionLabel());
        log.setStallCount(req.getStallCount() != null ? req.getStallCount() : 0);
        playbackLogRepository.save(log);

        return ResponseEntity.ok(Map.of("status", "recorded"));
    }
}
