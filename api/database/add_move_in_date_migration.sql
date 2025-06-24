-- Migration to add move_in_date field to roommateprofile table
-- Run this SQL to update the database schema

ALTER TABLE `roommateprofile` 
ADD COLUMN `move_in_date` DATE NULL COMMENT 'Preferred move-in date' 
AFTER `location`;

-- Update existing records with a default move-in date (30 days from now)
UPDATE `roommateprofile` 
SET `move_in_date` = DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
WHERE `move_in_date` IS NULL;
