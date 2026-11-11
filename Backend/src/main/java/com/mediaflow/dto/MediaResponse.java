package com.mediaflow.dto;

import com.mediaflow.entity.MediaFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class MediaResponse {
    private Long mediaId;
    private String title;
    private String mediaType;
    private Double duration;
    private Integer width;
    private Integer height;
    private Long sizeBytes;
    private String status;
    private String thumbnailPath;
    private LocalDateTime createdAt;
    private List<RenditionDto> renditions;
    private List<CaptionDto> captions;

    public static class RenditionDto {
        private Long renditionId;
        private String label;
        private String resolution;
        private Integer bitrate;
        private String codec;
        private Long sizeBytes;

        public RenditionDto() {}

        public RenditionDto(Long renditionId, String label, String resolution, Integer bitrate, String codec, Long sizeBytes) {
            this.renditionId = renditionId;
            this.label = label;
            this.resolution = resolution;
            this.bitrate = bitrate;
            this.codec = codec;
            this.sizeBytes = sizeBytes;
        }

        public Long getRenditionId() { return renditionId; }
        public void setRenditionId(Long renditionId) { this.renditionId = renditionId; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getResolution() { return resolution; }
        public void setResolution(String resolution) { this.resolution = resolution; }
        public Integer getBitrate() { return bitrate; }
        public void setBitrate(Integer bitrate) { this.bitrate = bitrate; }
        public String getCodec() { return codec; }
        public void setCodec(String codec) { this.codec = codec; }
        public Long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }
    }

    public static class CaptionDto {
        private Long captionId;
        private String language;

        public CaptionDto() {}

        public CaptionDto(Long captionId, String language) {
            this.captionId = captionId;
            this.language = language;
        }

        public Long getCaptionId() { return captionId; }
        public void setCaptionId(Long captionId) { this.captionId = captionId; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
    }

    public static MediaResponse fromEntity(MediaFile m) {
        MediaResponse res = new MediaResponse();
        res.setMediaId(m.getMediaId());
        res.setTitle(m.getTitle());
        res.setMediaType(m.getMediaType() != null ? m.getMediaType().name() : null);
        res.setDuration(m.getDuration());
        res.setWidth(m.getWidth());
        res.setHeight(m.getHeight());
        res.setSizeBytes(m.getSizeBytes());
        res.setStatus(m.getStatus() != null ? m.getStatus().name() : null);
        res.setThumbnailPath(m.getThumbnailPath() != null ? "/api/stream/" + m.getMediaId() + "/thumbnail.jpg" : null);
        res.setCreatedAt(m.getCreatedAt());

        if (m.getRenditions() != null) {
            res.setRenditions(m.getRenditions().stream()
                .map(r -> new RenditionDto(r.getRenditionId(), r.getLabel(), r.getResolution(), r.getBitrate(), r.getCodec(), r.getSizeBytes()))
                .collect(Collectors.toList()));
        }

        if (m.getCaptions() != null) {
            res.setCaptions(m.getCaptions().stream()
                .map(c -> new CaptionDto(c.getCaptionId(), c.getLanguage()))
                .collect(Collectors.toList()));
        }

        return res;
    }

    public MediaResponse() {}

    public Long getMediaId() { return mediaId; }
    public void setMediaId(Long mediaId) { this.mediaId = mediaId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }
    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }
    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }
    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getThumbnailPath() { return thumbnailPath; }
    public void setThumbnailPath(String thumbnailPath) { this.thumbnailPath = thumbnailPath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<RenditionDto> getRenditions() { return renditions; }
    public void setRenditions(List<RenditionDto> renditions) { this.renditions = renditions; }
    public List<CaptionDto> getCaptions() { return captions; }
    public void setCaptions(List<CaptionDto> captions) { this.captions = captions; }
}
