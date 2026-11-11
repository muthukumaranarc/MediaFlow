package com.mediaflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "playback_logs")
public class PlaybackLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    @JsonIgnore
    private MediaFile mediaFile;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "rendition_label", length = 50)
    private String renditionLabel;

    @Column(name = "stall_count")
    private Integer stallCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public PlaybackLog() {}

    public Long getLogId() {
        return logId;
    }

    public void setLogId(Long logId) {
        this.logId = logId;
    }

    public MediaFile getMediaFile() {
        return mediaFile;
    }

    public void setMediaFile(MediaFile mediaFile) {
        this.mediaFile = mediaFile;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getRenditionLabel() {
        return renditionLabel;
    }

    public void setRenditionLabel(String renditionLabel) {
        this.renditionLabel = renditionLabel;
    }

    public Integer getStallCount() {
        return stallCount;
    }

    public void setStallCount(Integer stallCount) {
        this.stallCount = stallCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
