package com.mediaflow.dto;

public class PlaybackFeedbackRequest {
    private String sessionId;
    private String renditionLabel;
    private Integer stallCount;

    public PlaybackFeedbackRequest() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getRenditionLabel() { return renditionLabel; }
    public void setRenditionLabel(String renditionLabel) { this.renditionLabel = renditionLabel; }
    public Integer getStallCount() { return stallCount; }
    public void setStallCount(Integer stallCount) { this.stallCount = stallCount; }
}
