package com.mediaflow.controller;

import com.mediaflow.entity.Caption;
import com.mediaflow.entity.MediaFile;
import com.mediaflow.repository.CaptionRepository;
import com.mediaflow.repository.MediaFileRepository;
import com.mediaflow.service.StorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/stream")
public class StreamingController {

    private final StorageService storageService;
    private final MediaFileRepository mediaFileRepository;
    private final CaptionRepository captionRepository;

    public StreamingController(StorageService storageService,
                               MediaFileRepository mediaFileRepository,
                               CaptionRepository captionRepository) {
        this.storageService = storageService;
        this.mediaFileRepository = mediaFileRepository;
        this.captionRepository = captionRepository;
    }

    @GetMapping("/{mediaId}/master.m3u8")
    public ResponseEntity<Resource> getMasterPlaylist(@PathVariable("mediaId") Long mediaId) throws IOException {
        Path masterFile = storageService.getHlsPath().resolve("media_" + mediaId).resolve("master.m3u8");
        if (!Files.exists(masterFile)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(masterFile.toFile());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .body(resource);
    }

    @GetMapping("/{mediaId}/{rendition}/playlist.m3u8")
    public ResponseEntity<Resource> getRenditionPlaylist(@PathVariable("mediaId") Long mediaId,
                                                         @PathVariable("rendition") String rendition) throws IOException {
        Path playlist = storageService.getHlsPath().resolve("media_" + mediaId).resolve(rendition).resolve("playlist.m3u8");
        if (!Files.exists(playlist)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(playlist.toFile());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.apple.mpegurl"))
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .body(resource);
    }

    @GetMapping("/{mediaId}/{rendition}/{segment}.ts")
    public ResponseEntity<Resource> getSegment(@PathVariable("mediaId") Long mediaId,
                                               @PathVariable("rendition") String rendition,
                                               @PathVariable("segment") String segment) {
        Path segFile = storageService.getHlsPath().resolve("media_" + mediaId).resolve(rendition).resolve(segment + ".ts");
        if (!Files.exists(segFile)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(segFile.toFile());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp2t"))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(resource);
    }

    @GetMapping("/{mediaId}/thumbnail.jpg")
    public ResponseEntity<Resource> getThumbnail(@PathVariable("mediaId") Long mediaId) {
        Path thumbFile = storageService.getThumbnailTarget(mediaId);
        if (!Files.exists(thumbFile)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(thumbFile.toFile());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                .body(resource);
    }

    @GetMapping("/{mediaId}/captions.vtt")
    public ResponseEntity<Resource> getCaptions(@PathVariable("mediaId") Long mediaId) {
        MediaFile media = mediaFileRepository.findById(mediaId).orElse(null);
        if (media == null) {
            return ResponseEntity.notFound().build();
        }
        List<Caption> captions = captionRepository.findByMediaFile(media);
        if (captions.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Path capFile = Path.of(captions.get(0).getFilePath());
        if (!Files.exists(capFile)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(capFile.toFile());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/vtt;charset=UTF-8"))
                .body(resource);
    }
}
