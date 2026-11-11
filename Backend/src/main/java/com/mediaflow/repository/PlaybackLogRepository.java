package com.mediaflow.repository;

import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.PlaybackLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaybackLogRepository extends JpaRepository<PlaybackLog, Long> {
    List<PlaybackLog> findByMediaFile(MediaFile mediaFile);
}
