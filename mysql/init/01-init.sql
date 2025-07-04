CREATE DATABASE IF NOT EXISTS medtour;
USE medtour;

CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bio TEXT,
    experience_years INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    languages JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    duration INT DEFAULT 0,
    category VARCHAR(100),
    tags JSON,
    view_count INT DEFAULT 0,
    doctor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE IF NOT EXISTS live_streams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    doctor_id INT,
    status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
    scheduled_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    viewer_count INT DEFAULT 0,
    recording_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE IF NOT EXISTS ai_processing_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    job_type ENUM('medical-text', 'medical-image', 'video-translation', 'ai-diagnosis') NOT NULL,
    status ENUM('queued', 'processing', 'completed', 'failed') DEFAULT 'queued',
    input_data JSON,
    result_data JSON,
    error_message TEXT,
    processing_time INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO doctors (name, specialty, location, bio, experience_years, rating, languages) VALUES
('Dr. Mehmet Özkan', 'Cardiology', 'Istanbul, Turkey', 'Leading cardiologist with expertise in interventional cardiology and heart surgery.', 15, 4.8, '["Turkish", "English", "German"]'),
('Dr. Ayşe Demir', 'Dermatology', 'Ankara, Turkey', 'Specialist in cosmetic dermatology and skin cancer treatment.', 12, 4.9, '["Turkish", "English", "French"]'),
('Dr. Ali Yılmaz', 'Orthopedics', 'Izmir, Turkey', 'Expert in joint replacement and sports medicine.', 18, 4.7, '["Turkish", "English", "Arabic"]'),
('Dr. Fatma Kaya', 'Neurology', 'Istanbul, Turkey', 'Neurologist specializing in epilepsy and movement disorders.', 20, 4.9, '["Turkish", "English", "Russian"]'),
('Dr. Mustafa Çelik', 'Oncology', 'Ankara, Turkey', 'Medical oncologist with focus on precision medicine.', 14, 4.8, '["Turkish", "English", "Spanish"]');

INSERT INTO medical_videos (title, description, video_url, thumbnail_url, duration, category, tags, doctor_id) VALUES
('Heart Health Basics', 'Understanding cardiovascular health and prevention', '/videos/heart-health-basics.mp4', '/images/heart-health-thumb.jpg', 1200, 'Cardiology', '["heart", "prevention", "health"]', 1),
('Skin Care Tips', 'Daily skincare routine for healthy skin', '/videos/skin-care-tips.mp4', '/images/skin-care-thumb.jpg', 900, 'Dermatology', '["skincare", "beauty", "health"]', 2),
('Joint Pain Management', 'Managing arthritis and joint pain effectively', '/videos/joint-pain-management.mp4', '/images/joint-pain-thumb.jpg', 1500, 'Orthopedics', '["joints", "pain", "arthritis"]', 3),
('Understanding Migraines', 'Causes and treatment of migraine headaches', '/videos/understanding-migraines.mp4', '/images/migraine-thumb.jpg', 1100, 'Neurology', '["migraine", "headache", "neurology"]', 4),
('Cancer Prevention', 'Lifestyle changes for cancer prevention', '/videos/cancer-prevention.mp4', '/images/cancer-prevention-thumb.jpg', 1800, 'Oncology', '["cancer", "prevention", "lifestyle"]', 5);
