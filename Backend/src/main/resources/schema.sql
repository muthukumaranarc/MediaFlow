-- MediaFlow Database Schema Definition (Reference conforming to Section 3.4.4)

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_files (
    media_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    original_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    duration DOUBLE,
    width INT,
    height INT,
    size_bytes BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renditions (
    rendition_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_id BIGINT NOT NULL,
    label VARCHAR(50) NOT NULL,
    resolution VARCHAR(50) NOT NULL,
    bitrate INT NOT NULL,
    codec VARCHAR(50) NOT NULL,
    playlist_path VARCHAR(500) NOT NULL,
    size_bytes BIGINT NOT NULL,
    CONSTRAINT fk_rendition_media FOREIGN KEY (media_id) REFERENCES media_files(media_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS processing_jobs (
    job_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_id BIGINT NOT NULL,
    state VARCHAR(50) NOT NULL,
    progress_percent INT DEFAULT 0,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    error_message TEXT,
    CONSTRAINT fk_job_media FOREIGN KEY (media_id) REFERENCES media_files(media_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quality_reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_id BIGINT NOT NULL,
    rendition_id BIGINT,
    compression_ratio DOUBLE,
    original_size_bytes BIGINT,
    compressed_size_bytes BIGINT,
    psnr DOUBLE,
    ssim DOUBLE,
    settings_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_media FOREIGN KEY (media_id) REFERENCES media_files(media_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS captions (
    caption_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_id BIGINT NOT NULL,
    language VARCHAR(50) DEFAULT 'en',
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_caption_media FOREIGN KEY (media_id) REFERENCES media_files(media_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playback_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    media_id BIGINT NOT NULL,
    session_id VARCHAR(100),
    rendition_label VARCHAR(50),
    stall_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_media FOREIGN KEY (media_id) REFERENCES media_files(media_id) ON DELETE CASCADE
);
