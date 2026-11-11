package com.mediaflow.dto;

import com.mediaflow.entity.QualityReport;
import java.time.LocalDateTime;

public class QualityReportResponse {
    private Long reportId;
    private Long mediaId;
    private Long renditionId;
    private String renditionLabel;
    private String resolution;
    private Integer bitrate;
    private Long originalSizeBytes;
    private Long compressedSizeBytes;
    private Double compressionRatio;
    private Double psnr;
    private Double ssim;
    private String settingsSummary;
    private LocalDateTime createdAt;
    private String transparencyDisclaimer;

    public QualityReportResponse() {
        this.transparencyDisclaimer = "Reported quality values (PSNR and SSIM) describe this tested encode configuration only and do not predict results for other content.";
    }

    public static QualityReportResponse fromEntity(QualityReport r) {
        QualityReportResponse res = new QualityReportResponse();
        res.setReportId(r.getReportId());
        res.setMediaId(r.getMediaFile() != null ? r.getMediaFile().getMediaId() : null);
        if (r.getRendition() != null) {
            res.setRenditionId(r.getRendition().getRenditionId());
            res.setRenditionLabel(r.getRendition().getLabel());
            res.setResolution(r.getRendition().getResolution());
            res.setBitrate(r.getRendition().getBitrate());
        }
        res.setOriginalSizeBytes(r.getOriginalSizeBytes());
        res.setCompressedSizeBytes(r.getCompressedSizeBytes());
        res.setCompressionRatio(r.getCompressionRatio());
        res.setPsnr(r.getPsnr());
        res.setSsim(r.getSsim());
        res.setSettingsSummary(r.getSettingsSummary());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }
    public Long getMediaId() { return mediaId; }
    public void setMediaId(Long mediaId) { this.mediaId = mediaId; }
    public Long getRenditionId() { return renditionId; }
    public void setRenditionId(Long renditionId) { this.renditionId = renditionId; }
    public String getRenditionLabel() { return renditionLabel; }
    public void setRenditionLabel(String renditionLabel) { this.renditionLabel = renditionLabel; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public Integer getBitrate() { return bitrate; }
    public void setBitrate(Integer bitrate) { this.bitrate = bitrate; }
    public Long getOriginalSizeBytes() { return originalSizeBytes; }
    public void setOriginalSizeBytes(Long originalSizeBytes) { this.originalSizeBytes = originalSizeBytes; }
    public Long getCompressedSizeBytes() { return compressedSizeBytes; }
    public void setCompressedSizeBytes(Long compressedSizeBytes) { this.compressedSizeBytes = compressedSizeBytes; }
    public Double getCompressionRatio() { return compressionRatio; }
    public void setCompressionRatio(Double compressionRatio) { this.compressionRatio = compressionRatio; }
    public Double getPsnr() { return psnr; }
    public void setPsnr(Double psnr) { this.psnr = psnr; }
    public Double getSsim() { return ssim; }
    public void setSsim(Double ssim) { this.ssim = ssim; }
    public String getSettingsSummary() { return settingsSummary; }
    public void setSettingsSummary(String settingsSummary) { this.settingsSummary = settingsSummary; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getTransparencyDisclaimer() { return transparencyDisclaimer; }
    public void setTransparencyDisclaimer(String transparencyDisclaimer) { this.transparencyDisclaimer = transparencyDisclaimer; }
}
