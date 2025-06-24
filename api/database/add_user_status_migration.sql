-- Migration to add status column to student and owner tables
-- Run this SQL to update the database schema

-- Add status column to student table
ALTER TABLE `student` 
ADD COLUMN `status` ENUM('verified', 'not_verified') NOT NULL DEFAULT 'not_verified' COMMENT 'User verification status' 
AFTER `university`;

-- Add status column to owner table  
ALTER TABLE `owner` 
ADD COLUMN `status` ENUM('verified', 'not_verified') NOT NULL DEFAULT 'not_verified' COMMENT 'User verification status' 
AFTER `phone`;

-- Update existing users to not_verified status (they can be manually verified by admin)
UPDATE `student` SET `status` = 'not_verified' WHERE `status` IS NULL;
UPDATE `owner` SET `status` = 'not_verified' WHERE `status` IS NULL;

-- Add indexes for better performance
ALTER TABLE `student` ADD INDEX `idx_student_status` (`status`);
ALTER TABLE `owner` ADD INDEX `idx_owner_status` (`status`);
