package com.mediaflow.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${mediaflow.storage.root:./storage}")
    private String rootStoragePath;

    private Path rootPath;
    private Path originalsPath;
    private Path thumbnailsPath;
    private Path hlsPath;
    private Path captionsPath;

    @PostConstruct
    public void init() {
        try {
            this.rootPath = Paths.get(rootStoragePath).toAbsolutePath().normalize();
            this.originalsPath = this.rootPath.resolve("originals");
            this.thumbnailsPath = this.rootPath.resolve("thumbnails");
            this.hlsPath = this.rootPath.resolve("hls");
            this.captionsPath = this.rootPath.resolve("captions");

            Files.createDirectories(this.originalsPath);
            Files.createDirectories(this.thumbnailsPath);
            Files.createDirectories(this.hlsPath);
            Files.createDirectories(this.captionsPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public Path storeOriginal(MultipartFile file, Long mediaId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "media_" + mediaId + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path target = this.originalsPath.resolve(filename);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return target;
    }

    public Path storeCaption(MultipartFile file, Long mediaId) throws IOException {
        String filename = "caption_" + mediaId + "_" + UUID.randomUUID().toString().substring(0, 8) + ".vtt";
        Path target = this.captionsPath.resolve(filename);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return target;
    }

    public Path getHlsDirectory(Long mediaId) throws IOException {
        Path mediaHls = this.hlsPath.resolve("media_" + mediaId);
        Files.createDirectories(mediaHls);
        return mediaHls;
    }

    public Path getThumbnailTarget(Long mediaId) {
        return this.thumbnailsPath.resolve("thumb_" + mediaId + ".jpg");
    }

    public void deleteMediaFiles(Long mediaId, String originalPath, String thumbnailPath, String captionPath) {
        try {
            if (originalPath != null) {
                Files.deleteIfExists(Paths.get(originalPath));
            }
            if (thumbnailPath != null) {
                Files.deleteIfExists(Paths.get(thumbnailPath));
            }
            if (captionPath != null) {
                Files.deleteIfExists(Paths.get(captionPath));
            }
            Path hlsDir = this.hlsPath.resolve("media_" + mediaId);
            if (Files.exists(hlsDir)) {
                FileSystemUtils.deleteRecursively(hlsDir);
            }
        } catch (Exception e) {
            System.err.println("Failed to clean up files for media " + mediaId + ": " + e.getMessage());
        }
    }

    public Path getRootPath() {
        return rootPath;
    }

    public Path getOriginalsPath() {
        return originalsPath;
    }

    public Path getThumbnailsPath() {
        return thumbnailsPath;
    }

    public Path getHlsPath() {
        return hlsPath;
    }

    public Path getCaptionsPath() {
        return captionsPath;
    }
}
