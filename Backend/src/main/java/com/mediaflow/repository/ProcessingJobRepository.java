package com.mediaflow.repository;

import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.ProcessingJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessingJobRepository extends JpaRepository<ProcessingJob, Long> {
    List<ProcessingJob> findByMediaFileOrderByStartedAtDesc(MediaFile mediaFile);
    Optional<ProcessingJob> findTopByMediaFileOrderByJobIdDesc(MediaFile mediaFile);
}
