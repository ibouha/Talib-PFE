-- Create reports table for content reporting system
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reporter_id` int(11) NOT NULL,
  `reporter_type` enum('student','owner') NOT NULL,
  `content_type` enum('housing','item','roommate_profile','user') NOT NULL,
  `content_id` int(11) NOT NULL,
  `reason` varchar(100) NOT NULL,
  `description` text,
  `status` enum('pending','investigating','resolved','dismissed') NOT NULL DEFAULT 'pending',
  `admin_notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_content` (`content_type`, `content_id`),
  KEY `idx_reporter` (`reporter_type`, `reporter_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some sample report reasons
INSERT INTO `reports` (`reporter_id`, `reporter_type`, `content_type`, `content_id`, `reason`, `description`, `status`) VALUES
(9, 'student', 'housing', 1, 'Fraudulent listing', 'This property listing seems fake with unrealistic prices and photos that don\'t match the description.', 'pending'),
(6, 'owner', 'item', 2, 'Inappropriate content', 'The item description contains inappropriate language and offensive content.', 'investigating'),
(9, 'student', 'user', 6, 'Fake profile', 'This user profile appears to be fake with stolen photos and inconsistent information.', 'pending');
