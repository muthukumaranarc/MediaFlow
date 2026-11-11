package com.mediaflow.repository;

import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.QualityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityReportRepository extends JpaRepository<QualityReport, Long> {
    List<QualityReport> findByMediaFile(MediaFile mediaFile);
}
