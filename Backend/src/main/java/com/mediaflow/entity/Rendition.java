package com.mediaflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "renditions")
public class Rendition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rendition_id")
    private Long renditionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    @JsonIgnore
    private MediaFile mediaFile;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(nullable = false, length = 50)
    private String resolution;

    @Column(nullable = false)
    private Integer bitrate;

    @Column(nullable = false, length = 50)
    private String codec;

    @Column(name = "playlist_path", nullable = false, length = 500)
    private String playlistPath;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    public Rendition() {}

    public Long getRenditionId() {
        return renditionId;
    }

    public void setRenditionId(Long renditionId) {
        this.renditionId = renditionId;
    }

    public MediaFile getMediaFile() {
        return mediaFile;
    }

    public void setMediaFile(MediaFile mediaFile) {
        this.mediaFile = mediaFile;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public Integer getBitrate() {
        return bitrate;
    }

    public void setBitrate(Integer bitrate) {
        this.bitrate = bitrate;
    }

    public String getCodec() {
        return codec;
    }

    public void setCodec(String codec) {
        this.codec = codec;
    }

    public String getPlaylistPath() {
        return playlistPath;
    }

    public void setPlaylistPath(String playlistPath) {
        this.playlistPath = playlistPath;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
}
