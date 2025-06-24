-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 24 juin 2025 à 00:59
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `talib`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin`
--

CREATE TABLE `admin` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admin`
--

INSERT INTO `admin` (`username`, `password`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- --------------------------------------------------------

--
-- Structure de la table `etudianthousing`
--

CREATE TABLE `etudianthousing` (
  `id` int(11) NOT NULL,
  `rental_date` date NOT NULL,
  `duration` int(11) NOT NULL,
  `housing_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `favorite`
--

CREATE TABLE `favorite` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `type` enum('RoommateProfile','Housing','Item') NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `housing_id` int(11) DEFAULT NULL,
  `roommateProfile_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `favorite`
--

INSERT INTO `favorite` (`id`, `student_id`, `type`, `item_id`, `housing_id`, `roommateProfile_id`, `created_at`) VALUES
(30, 9, 'Housing', NULL, 15, NULL, '2025-06-24 00:12:49'),
(31, 9, 'Item', 18, NULL, NULL, '2025-06-24 00:12:52'),
(32, 9, 'RoommateProfile', NULL, NULL, 6, '2025-06-24 00:12:55');

-- --------------------------------------------------------

--
-- Structure de la table `housing`
--

CREATE TABLE `housing` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `address` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `type` enum('studio','apartment','shared','dormitory') NOT NULL,
  `bedrooms` int(11) NOT NULL,
  `bathrooms` int(11) NOT NULL,
  `area` decimal(10,2) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `available_from` date NOT NULL,
  `available_to` date NOT NULL,
  `is_furnished` tinyint(1) NOT NULL,
  `amenities` text DEFAULT NULL,
  `status` enum('available','rented','maintenance') DEFAULT 'available',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `owner_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `housing`
--

INSERT INTO `housing` (`id`, `title`, `description`, `address`, `city`, `type`, `bedrooms`, `bathrooms`, `area`, `price`, `available_from`, `available_to`, `is_furnished`, `amenities`, `status`, `created_at`, `updated_at`, `owner_id`) VALUES
(15, 'berchifa apartement ', 'test', 'boukhalef al aairfan 2', 'Tetouan', 'apartment', 1, 1, 90.00, 1700.00, '2025-06-23', '2026-07-11', 1, 'WiFi, TV', 'available', '2025-06-23 22:51:30', '2025-06-23 22:51:30', 6);

-- --------------------------------------------------------

--
-- Structure de la table `housingcontact`
--

CREATE TABLE `housingcontact` (
  `id` int(11) NOT NULL,
  `housing_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `contact_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `housingimage`
--

CREATE TABLE `housingimage` (
  `id` int(11) NOT NULL,
  `path` varchar(255) NOT NULL,
  `housing_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `housingimage`
--

INSERT INTO `housingimage` (`id`, `path`, `housing_id`) VALUES
(21, 'http://localhost/Talib-PFE/api/uploads/housing/housing_1750715489_6859cc61f1ba9.jpg', 15);

-- --------------------------------------------------------

--
-- Structure de la table `item`
--

CREATE TABLE `item` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `condition_status` enum('new','like_new','good','fair','poor') NOT NULL DEFAULT 'good',
  `status` enum('available','sold','reserved') DEFAULT 'available',
  `is_free` tinyint(1) NOT NULL,
  `location` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `student_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `item`
--

INSERT INTO `item` (`id`, `title`, `description`, `price`, `category`, `condition_status`, `status`, `is_free`, `location`, `created_at`, `updated_at`, `student_id`) VALUES
(18, 'chargeur', 'fast charge', 100.00, 'electronics', 'fair', 'available', 0, 'Agadir', '2025-06-23 21:52:07', '2025-06-23 21:52:07', 9);

-- --------------------------------------------------------

--
-- Structure de la table `itemimage`
--

CREATE TABLE `itemimage` (
  `id` int(11) NOT NULL,
  `path` varchar(255) NOT NULL,
  `item_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `itemimage`
--

INSERT INTO `itemimage` (`id`, `path`, `item_id`) VALUES
(6, 'http://localhost/Talib-PFE/api/uploads/item/item_1750708327_6859b0677991d.jpeg', 18);

-- --------------------------------------------------------

--
-- Structure de la table `owner`
--

CREATE TABLE `owner` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `status` enum('verified','not_verified') NOT NULL DEFAULT 'not_verified' COMMENT 'User verification status',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `password` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `owner`
--

INSERT INTO `owner` (`id`, `name`, `email`, `phone`, `status`, `created_at`, `updated_at`, `password`, `image`) VALUES
(6, 'said taghmaoui', 'saidtaghmaoui@gmail.com', '+212600112233', 'verified', '2025-06-23 21:26:11', '2025-06-23 23:15:40', '$2y$10$/s/f7eI8UAUgdfhqzsqL5uYyJZBxm9v9Spbinhs20i3na//5uVZu6', '/Talib-PFE/api/uploads/profiles/profile_6_1750716617.png');

-- --------------------------------------------------------

--
-- Structure de la table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reporter_type` enum('student','owner') NOT NULL,
  `content_type` enum('housing','item','roommate_profile','user') NOT NULL,
  `content_id` int(11) NOT NULL,
  `reason` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','investigating','resolved','dismissed') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reports`
--

INSERT INTO `reports` (`id`, `reporter_id`, `reporter_type`, `content_type`, `content_id`, `reason`, `description`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES
(4, 9, 'student', 'housing', 15, 'Inappropriate content', 'bad content', 'dismissed', NULL, '2025-06-23 23:21:16', '2025-06-23 23:21:57');

-- --------------------------------------------------------

--
-- Structure de la table `roommateprofile`
--

CREATE TABLE `roommateprofile` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Profile name/title',
  `age` int(11) NOT NULL COMMENT 'Student age',
  `gender` enum('male','female','other') NOT NULL COMMENT 'Student gender',
  `university` varchar(100) NOT NULL COMMENT 'University name',
  `program` varchar(100) NOT NULL COMMENT 'Study program',
  `year` int(11) NOT NULL COMMENT 'Study year',
  `bio` text NOT NULL COMMENT 'Profile description/bio',
  `interests` text DEFAULT NULL COMMENT 'JSON array of interests',
  `lifestyle` text DEFAULT NULL COMMENT 'JSON array of lifestyle preferences',
  `preferences` text DEFAULT NULL COMMENT 'JSON object of roommate preferences',
  `budget` decimal(10,2) NOT NULL COMMENT 'Monthly budget in MAD',
  `lookingFor` varchar(100) NOT NULL COMMENT 'What type of housing/roommate they want',
  `location` varchar(100) NOT NULL COMMENT 'Preferred location',
  `move_in_date` date DEFAULT NULL COMMENT 'Preferred move-in date',
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL COMMENT 'Profile picture path',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `roommateprofile`
--

INSERT INTO `roommateprofile` (`id`, `student_id`, `name`, `age`, `gender`, `university`, `program`, `year`, `bio`, `interests`, `lifestyle`, `preferences`, `budget`, `lookingFor`, `location`, `move_in_date`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES
(6, 9, 'Mohamed Amine', 21, 'male', 'Ibn Tofail University', 'computer sience', 2, 'i search for roommate near of 1337', '[\"Travel\",\"Programming\"]', '[\"social\",\"night\"]', '{\"smoking\":true,\"pets\":false,\"gender\":\"male\",\"studyHabits\":\"nothing\"}', 800.00, 'apartment', 'Tetouan', '2025-07-23', NULL, 'profiles/profile_9_1750708545.png', '2025-06-23 21:55:45', '2025-06-23 21:23:42');

-- --------------------------------------------------------

--
-- Structure de la table `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `university` varchar(100) NOT NULL,
  `status` enum('verified','not_verified') NOT NULL DEFAULT 'not_verified' COMMENT 'User verification status',
  `bio` text DEFAULT '',
  `gender` enum('male','female','other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `student`
--

INSERT INTO `student` (`id`, `name`, `email`, `password`, `image`, `phone`, `university`, `status`, `bio`, `gender`, `date_of_birth`, `created_at`, `updated_at`) VALUES
(9, 'amine ibouha', 'ibouhaamin@ofppt-edu.ma', '$2y$10$I4l69OOsKxFtAVJ9vMcCg.M1Gw4mfhW25dMou0fGf5cLp72z7fBUS', '/Talib-PFE/api/uploads/profiles/profile_9_1750705681.jpeg', '+212601020300', 'Ibn Zohr University', 'verified', 'nothing else matters', 'male', NULL, '2025-06-23 21:07:12', '2025-06-23 23:33:13');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`username`);

--
-- Index pour la table `etudianthousing`
--
ALTER TABLE `etudianthousing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `housing_id` (`housing_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Index pour la table `favorite`
--
ALTER TABLE `favorite`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `housing_id` (`housing_id`),
  ADD KEY `roommateProfile_id` (`roommateProfile_id`);

--
-- Index pour la table `housing`
--
ALTER TABLE `housing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `idx_housing_city` (`city`),
  ADD KEY `idx_housing_type` (`type`),
  ADD KEY `idx_housing_status` (`status`),
  ADD KEY `idx_housing_price` (`price`);

--
-- Index pour la table `housingcontact`
--
ALTER TABLE `housingcontact`
  ADD PRIMARY KEY (`id`),
  ADD KEY `housing_id` (`housing_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Index pour la table `housingimage`
--
ALTER TABLE `housingimage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `housing_id` (`housing_id`);

--
-- Index pour la table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `idx_item_category` (`category`),
  ADD KEY `idx_item_location` (`location`),
  ADD KEY `idx_item_status` (`status`);

--
-- Index pour la table `itemimage`
--
ALTER TABLE `itemimage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Index pour la table `owner`
--
ALTER TABLE `owner`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_owner_email` (`email`),
  ADD KEY `idx_owner_status` (`status`);

--
-- Index pour la table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_content` (`content_type`,`content_id`),
  ADD KEY `idx_reporter` (`reporter_type`,`reporter_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Index pour la table `roommateprofile`
--
ALTER TABLE `roommateprofile`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `idx_roommate_location` (`location`),
  ADD KEY `idx_roommate_university` (`university`),
  ADD KEY `idx_roommate_budget` (`budget`);

--
-- Index pour la table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_student_university` (`university`),
  ADD KEY `idx_student_email` (`email`),
  ADD KEY `idx_student_status` (`status`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `etudianthousing`
--
ALTER TABLE `etudianthousing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `favorite`
--
ALTER TABLE `favorite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `housing`
--
ALTER TABLE `housing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `housingcontact`
--
ALTER TABLE `housingcontact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `housingimage`
--
ALTER TABLE `housingimage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `item`
--
ALTER TABLE `item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `itemimage`
--
ALTER TABLE `itemimage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `owner`
--
ALTER TABLE `owner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `roommateprofile`
--
ALTER TABLE `roommateprofile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `etudianthousing`
--
ALTER TABLE `etudianthousing`
  ADD CONSTRAINT `etudianthousing_ibfk_1` FOREIGN KEY (`housing_id`) REFERENCES `housing` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `etudianthousing_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `favorite`
--
ALTER TABLE `favorite`
  ADD CONSTRAINT `favorite_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorite_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorite_ibfk_3` FOREIGN KEY (`housing_id`) REFERENCES `housing` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorite_ibfk_4` FOREIGN KEY (`roommateProfile_id`) REFERENCES `roommateprofile` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `housing`
--
ALTER TABLE `housing`
  ADD CONSTRAINT `housing_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `housingcontact`
--
ALTER TABLE `housingcontact`
  ADD CONSTRAINT `housingcontact_ibfk_1` FOREIGN KEY (`housing_id`) REFERENCES `housing` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `housingcontact_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `housingimage`
--
ALTER TABLE `housingimage`
  ADD CONSTRAINT `housingimage_ibfk_1` FOREIGN KEY (`housing_id`) REFERENCES `housing` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `item`
--
ALTER TABLE `item`
  ADD CONSTRAINT `item_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `itemimage`
--
ALTER TABLE `itemimage`
  ADD CONSTRAINT `itemimage_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `roommateprofile`
--
ALTER TABLE `roommateprofile`
  ADD CONSTRAINT `roommateprofile_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
