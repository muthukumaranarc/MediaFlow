package com.mediaflow.service;

import com.mediaflow.entity.MediaFile.MediaType;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@Service
public class MediaValidationService {

    private final Tika tika = new Tika();

    @Value("${spring.servlet.multipart.max-file-size:500MB}")
    private String maxFileSizeConfig;

    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
            "video/mp4",
            "video/x-matroska",
            "video/quicktime",
            "video/webm",
            "video/x-msvideo",
            "video/mpeg",
            "application/mp4"
    );

    private static final List<String> ALLOWED_AUDIO_TYPES = Arrays.asList(
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/aac",
            "audio/ogg",
            "audio/mp4",
            "audio/flac"
    );

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public static class ValidationResult {
        private final MediaType mediaType;
        private final String detectedMime;

        public ValidationResult(MediaType mediaType, String detectedMime) {
            this.mediaType = mediaType;
            this.detectedMime = detectedMime;
        }

        public MediaType getMediaType() { return mediaType; }
        public String getDetectedMime() { return detectedMime; }
    }

    public ValidationResult validate(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload rejected: File is empty or not provided.");
        }

        // 500 MB limit check
        long maxBytes = 500L * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("Upload rejected: File size exceeds the permitted limit (" + (maxBytes / (1024 * 1024)) + " MB).");
        }

        // Tika magic bytes inspection (content signature verification)
        String detectedMime;
        try (InputStream in = file.getInputStream()) {
            detectedMime = tika.detect(in, file.getOriginalFilename());
        }

        if (detectedMime == null) {
            throw new IllegalArgumentException("Upload rejected: Could not determine file signature/MIME type.");
        }

        if (ALLOWED_VIDEO_TYPES.contains(detectedMime.toLowerCase()) || detectedMime.toLowerCase().startsWith("video/")) {
            return new ValidationResult(MediaType.VIDEO, detectedMime);
        } else if (ALLOWED_AUDIO_TYPES.contains(detectedMime.toLowerCase()) || detectedMime.toLowerCase().startsWith("audio/")) {
            return new ValidationResult(MediaType.AUDIO, detectedMime);
        } else if (ALLOWED_IMAGE_TYPES.contains(detectedMime.toLowerCase()) || detectedMime.toLowerCase().startsWith("image/")) {
            return new ValidationResult(MediaType.IMAGE, detectedMime);
        }

        throw new IllegalArgumentException("Upload rejected: Unsupported file format or renamed invalid file (" + detectedMime + "). Only valid video, audio, and image files are supported.");
    }
}
