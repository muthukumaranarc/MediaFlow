package com.mediaflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "media_files")
public class MediaFile {

    public enum MediaType {
        VIDEO, AUDIO, IMAGE
    }

    public enum MediaStatus {
        QUEUED, PROCESSING, READY, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")
    private Long mediaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 50)
    private MediaType mediaType;

    @Column(name = "original_path", nullable = false, length = 500)
    private String originalPath;

    @Column(name = "thumbnail_path", length = 500)
    private String thumbnailPath;

    private Double duration;

    private Integer width;

    private Integer height;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MediaStatus status = MediaStatus.QUEUED;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "mediaFile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rendition> renditions = new ArrayList<>();

    @OneToMany(mappedBy = "mediaFile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Caption> captions = new ArrayList<>();

    @OneToMany(mappedBy = "mediaFile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QualityReport> qualityReports = new ArrayList<>();

    @OneToMany(mappedBy = "mediaFile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProcessingJob> processingJobs = new ArrayList<>();

    @OneToMany(mappedBy = "mediaFile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlaybackLog> playbackLogs = new ArrayList<>();

    public MediaFile() {}

    public Long getMediaId() {
        return mediaId;
    }

    public void setMediaId(Long mediaId) {
        this.mediaId = mediaId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public MediaType getMediaType() {
        return mediaType;
    }

    public void setMediaType(MediaType mediaType) {
        this.mediaType = mediaType;
    }

    public String getOriginalPath() {
        return originalPath;
    }

    public void setOriginalPath(String originalPath) {
        this.originalPath = originalPath;
    }

    public String getThumbnailPath() {
        return thumbnailPath;
    }

    public void setThumbnailPath(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public MediaStatus getStatus() {
        return status;
    }

    public void setStatus(MediaStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Rendition> getRenditions() {
        return renditions;
    }

    public void setRenditions(List<Rendition> renditions) {
        this.renditions = renditions;
    }

    public List<Caption> getCaptions() {
        return captions;
    }

    public void setCaptions(List<Caption> captions) {
        this.captions = captions;
    }

    public List<QualityReport> getQualityReports() {
        return qualityReports;
    }

    public void setQualityReports(List<QualityReport> qualityReports) {
        this.qualityReports = qualityReports;
    }

    public List<ProcessingJob> getProcessingJobs() {
        return processingJobs;
    }

    public void setProcessingJobs(List<ProcessingJob> processingJobs) {
        this.processingJobs = processingJobs;
    }

    public List<PlaybackLog> getPlaybackLogs() {
        return playbackLogs;
    }

    public void setPlaybackLogs(List<PlaybackLog> playbackLogs) {
        this.playbackLogs = playbackLogs;
    }
}
