package com.mediaflow.repository;

import com.mediaflow.entity.MediaFile;
import com.mediaflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    List<MediaFile> findByUserOrderByCreatedAtDesc(User user);
    Optional<MediaFile> findByMediaIdAndUser(Long mediaId, User user);
    List<MediaFile> findByUserAndTitleContainingIgnoreCase(User user, String query);
}
