package com.mediaflow.repository;

import com.mediaflow.entity.Caption;
import com.mediaflow.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaptionRepository extends JpaRepository<Caption, Long> {
    List<Caption> findByMediaFile(MediaFile mediaFile);
}
