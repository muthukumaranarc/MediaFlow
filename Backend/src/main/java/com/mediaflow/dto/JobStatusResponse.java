package com.mediaflow.dto;

import com.mediaflow.entity.ProcessingJob;
import java.time.LocalDateTime;

public class JobStatusResponse {
    private Long jobId;
    private Long mediaId;
    private String state;
    private Integer progressPercent;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    public JobStatusResponse() {}

    public static JobStatusResponse fromEntity(ProcessingJob job) {
        JobStatusResponse dto = new JobStatusResponse();
        dto.setJobId(job.getJobId());
        dto.setMediaId(job.getMediaFile() != null ? job.getMediaFile().getMediaId() : null);
        dto.setState(job.getState() != null ? job.getState().name() : null);
        dto.setProgressPercent(job.getProgressPercent());
        dto.setErrorMessage(job.getErrorMessage());
        dto.setStartedAt(job.getStartedAt());
        dto.setFinishedAt(job.getFinishedAt());
        return dto;
    }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
    public Long getMediaId() { return mediaId; }
    public void setMediaId(Long mediaId) { this.mediaId = mediaId; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Integer getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
}
