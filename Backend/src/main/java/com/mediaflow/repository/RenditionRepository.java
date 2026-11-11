package com.mediaflow.repository;

import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.Rendition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RenditionRepository extends JpaRepository<Rendition, Long> {
    List<Rendition> findByMediaFile(MediaFile mediaFile);
}
