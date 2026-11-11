package com.mediaflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quality_reports")
public class QualityReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    @JsonIgnore
    private MediaFile mediaFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rendition_id")
    private Rendition rendition;

    @Column(name = "compression_ratio")
    private Double compressionRatio;

    @Column(name = "original_size_bytes")
    private Long originalSizeBytes;

    @Column(name = "compressed_size_bytes")
    private Long compressedSizeBytes;

    private Double psnr;

    private Double ssim;

    @Column(name = "settings_summary", columnDefinition = "TEXT")
    private String settingsSummary;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public QualityReport() {}

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public MediaFile getMediaFile() {
        return mediaFile;
    }

    public void setMediaFile(MediaFile mediaFile) {
        this.mediaFile = mediaFile;
    }

    public Rendition getRendition() {
        return rendition;
    }

    public void setRendition(Rendition rendition) {
        this.rendition = rendition;
    }

    public Double getCompressionRatio() {
        return compressionRatio;
    }

    public void setCompressionRatio(Double compressionRatio) {
        this.compressionRatio = compressionRatio;
    }

    public Long getOriginalSizeBytes() {
        return originalSizeBytes;
    }

    public void setOriginalSizeBytes(Long originalSizeBytes) {
        this.originalSizeBytes = originalSizeBytes;
    }

    public Long getCompressedSizeBytes() {
        return compressedSizeBytes;
    }

    public void setCompressedSizeBytes(Long compressedSizeBytes) {
        this.compressedSizeBytes = compressedSizeBytes;
    }

    public Double getPsnr() {
        return psnr;
    }

    public void setPsnr(Double psnr) {
        this.psnr = psnr;
    }

    public Double getSsim() {
        return ssim;
    }

    public void setSsim(Double ssim) {
        this.ssim = ssim;
    }

    public String getSettingsSummary() {
        return settingsSummary;
    }

    public void setSettingsSummary(String settingsSummary) {
        this.settingsSummary = settingsSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
