-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 21, 2025 at 05:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e_sf10_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` text NOT NULL,
  `log_timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `action`, `log_timestamp`) VALUES
(1, 1, 'Created grade level: grade1 (G1) with ID 1', '2025-09-16 07:28:31'),
(2, 1, 'Created grade level: Grade2 (G2) with ID 2', '2025-09-16 07:28:42'),
(3, 1, 'Created grade level: grade3 (G3) with ID 3', '2025-09-16 07:28:54'),
(4, 1, 'Created section: Section A for grade grade1 in school year 2020-2021', '2025-09-16 07:29:47'),
(5, 1, 'Created section: Section B for grade grade1 in school year 2020-2021', '2025-09-16 07:30:01'),
(6, 1, 'Created section: Section C for grade Grade2 in school year 2020-2021', '2025-09-16 07:30:18'),
(7, 1, 'Created subject: Math (MATH-101) for grade levels: none', '2025-09-16 07:30:58'),
(8, 1, 'Created subject: Science (SCIENCE) for grade levels: none', '2025-09-16 07:31:09'),
(9, 1, 'Created subject: English (ENG) for grade levels: none', '2025-09-16 07:31:19'),
(10, 1, 'Created curriculum: k-12 (2020-2021) for school year ID 1', '2025-09-16 07:33:11'),
(11, 1, 'Bulk created 2 subject-grade level assignments: Assigned subject \"English (ENG)\" to grade level \"grade1 (G1)\" as Required; Assigned subject \"Math (MATH-101)\" to grade level \"grade1 (G1)\" as Required', '2025-09-16 07:33:12'),
(12, 1, 'Bulk created 2 subject-grade level assignments: Assigned subject \"Math (MATH-101)\" to grade level \"Grade2 (G2)\" as Required; Assigned subject \"Science (SCIENCE)\" to grade level \"Grade2 (G2)\" as Required', '2025-09-16 07:33:12'),
(13, 1, 'Bulk created 3 subject-grade level assignments: Assigned subject \"Math (MATH-101)\" to grade level \"grade3 (G3)\" as Required; Assigned subject \"English (ENG)\" to grade level \"grade3 (G3)\" as Required; Assigned subject \"Science (SCIENCE)\" to grade level \"grade3 (G3)\" as Required', '2025-09-16 07:33:12'),
(14, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 07:33:18'),
(15, 1, 'Accessed dashboard', '2025-09-16 07:40:30'),
(16, 1, 'Accessed dashboard', '2025-09-16 07:40:30'),
(17, 1, 'Created curriculum: k-12 (2021-2022) for school year ID 2', '2025-09-16 07:41:37'),
(18, 1, 'Bulk created 1 subject-grade level assignments: Assigned subject \"Science (SCIENCE)\" to grade level \"grade1 (G1)\" as Required', '2025-09-16 07:41:37'),
(19, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-16 07:42:32'),
(20, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 07:46:16'),
(21, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-16 07:46:25'),
(22, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 07:50:08'),
(23, 1, 'Added subject Math (MATH-101) to curriculum: k-12 (2021-2022)', '2025-09-16 07:57:08'),
(24, 1, 'Added subject English (ENG) to curriculum: k-12 (2021-2022)', '2025-09-16 07:57:08'),
(25, 1, 'Added subject Science (SCIENCE) to curriculum: k-12 (2021-2022)', '2025-09-16 07:57:08'),
(26, 1, 'Created curriculum: Curriculum 2022-2023 for school year ID 3', '2025-09-16 08:01:20'),
(27, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-16 08:08:32'),
(28, 1, 'Activated curriculum: Curriculum 2022-2023. All others automatically deactivated.', '2025-09-16 08:08:50'),
(29, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-16 08:27:08'),
(30, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 08:27:21'),
(31, 1, 'Activated curriculum: Curriculum 2022-2023. All others automatically deactivated.', '2025-09-16 08:27:31'),
(32, 1, 'Created subject: Test (TEST) for grade levels: none', '2025-09-16 08:29:01'),
(33, 1, 'Added subject Test (TEST) to curriculum: Curriculum 2022-2023', '2025-09-16 08:29:19'),
(34, 1, 'Added subject Math (MATH-101) to curriculum: Curriculum 2022-2023', '2025-09-16 08:30:01'),
(35, 1, 'Added subject Science (SCIENCE) to curriculum: Curriculum 2022-2023', '2025-09-16 08:30:01'),
(36, 1, 'Added subject English (ENG) to curriculum: Curriculum 2022-2023', '2025-09-16 08:30:01'),
(37, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 08:33:02'),
(38, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-16 08:37:38'),
(39, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 08:37:41'),
(40, 1, 'Accessed dashboard', '2025-09-16 08:48:30'),
(41, 1, 'Accessed dashboard', '2025-09-16 08:48:30'),
(42, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-16 08:48:38'),
(43, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 08:52:16'),
(44, 1, 'Accessed dashboard', '2025-09-16 10:10:10'),
(45, 1, 'Accessed dashboard', '2025-09-16 10:10:10'),
(46, 1, 'Removed subject Science (SCIENCE) from curriculum: k-12 (2021-2022)', '2025-09-16 10:11:40'),
(47, 1, 'Bulk created 1 subject-grade level assignments: Assigned subject \"English (ENG)\" to grade level \"Grade2 (G2)\" as Elective', '2025-09-16 10:12:24'),
(48, 1, 'Toggled grade input enabled for teacher ID 1', '2025-09-16 10:14:03'),
(49, 1, 'Toggled grade input disabled for teacher ID 1', '2025-09-16 10:14:11'),
(50, 1, 'Activated curriculum: Curriculum 2022-2023. All others automatically deactivated.', '2025-09-16 10:15:59'),
(51, 1, 'Bulk created 1 subject-grade level assignments: Assigned subject \"Test (TEST)\" to grade level \"grade1 (G1)\" as Elective', '2025-09-16 10:17:57'),
(52, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-16 10:18:22'),
(53, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-16 10:18:38'),
(54, 1, 'Activated curriculum: Curriculum 2022-2023. All others automatically deactivated.', '2025-09-16 10:18:56'),
(55, 1, 'Accessed dashboard', '2025-09-17 02:54:51'),
(56, 1, 'Accessed dashboard', '2025-09-17 02:54:51'),
(57, 1, 'Created teacher: Jemil A Doblas (user_id=2, teacher_id=2)', '2025-09-17 03:03:41'),
(58, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach English in section Section A for school year 2020-2021', '2025-09-17 03:10:41'),
(59, 1, 'Deactivated teacher: Quivir Anora Cutanda', '2025-09-17 03:20:53'),
(60, 1, 'Activated teacher: Quivir Anora Cutanda', '2025-09-17 03:21:02'),
(61, 1, 'Deactivated teacher: Quivir Anora Cutanda', '2025-09-17 03:22:57'),
(62, 1, 'Activated teacher: Quivir Anora Cutanda', '2025-09-17 03:23:02'),
(63, 1, 'Accessed dashboard', '2025-09-17 03:55:02'),
(64, 1, 'Accessed dashboard', '2025-09-17 03:55:02'),
(65, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach Math in section Section A for school year 2020-2021', '2025-09-17 03:57:18'),
(66, 1, 'Accessed dashboard', '2025-09-17 04:34:20'),
(67, 1, 'Accessed dashboard', '2025-09-17 04:34:21'),
(68, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-17 04:35:00'),
(69, 1, 'Created section: Section A for grade Grade2 in school year 2020-2021', '2025-09-17 04:35:16'),
(70, 1, 'Accessed dashboard', '2025-09-17 10:17:21'),
(71, 1, 'Accessed dashboard', '2025-09-17 10:17:21'),
(72, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach English in section Section C for school year 2020-2021', '2025-09-17 10:19:03'),
(73, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach Math in section Section C for school year 2020-2021', '2025-09-17 10:19:03'),
(74, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach Science in section Section C for school year 2020-2021', '2025-09-17 10:19:03'),
(75, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach English in section Section A for school year 2020-2021', '2025-09-17 10:19:27'),
(76, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach Math in section Section A for school year 2020-2021', '2025-09-17 10:19:27'),
(77, 1, 'Created teacher assignment: Jemil A Doblas assigned to teach Science in section Section A for school year 2020-2021', '2025-09-17 10:19:27'),
(78, 1, 'Accessed dashboard', '2025-09-18 14:08:24'),
(79, 1, 'Accessed dashboard', '2025-09-18 14:08:24'),
(80, 1, 'Created student with ID 1', '2025-09-18 14:09:52'),
(81, 1, 'Created enrollment for student Quivir Cutanda in grade grade1, section Section A, SY 2020-2021', '2025-09-18 14:10:10'),
(82, 1, 'Toggled grade input enabled for teacher ID 1', '2025-09-18 14:31:03'),
(83, 2, 'Created grade for student Quivir Cutanda in subject Math, period 1st: 89', '2025-09-18 14:40:24'),
(84, 2, 'Created grade for student Quivir Cutanda in subject Math, period 2nd: 89', '2025-09-18 14:40:41'),
(85, 2, 'Created grade for student Quivir Cutanda in subject Math, period 3rd: 89', '2025-09-18 14:41:47'),
(86, 2, 'Created grade for student Quivir Cutanda in subject Math, period 4th: 89', '2025-09-18 14:41:53'),
(87, 2, 'Created grade for student Quivir Cutanda in subject English, period 1st: 89', '2025-09-18 14:42:29'),
(88, 2, 'Created grade for student Quivir Cutanda in subject English, period 2nd: 90.5', '2025-09-18 14:42:42'),
(89, 2, 'Created grade for student Quivir Cutanda in subject English, period 3rd: 90.5', '2025-09-18 14:42:48'),
(90, 2, 'Created grade for student Quivir Cutanda in subject English, period 4th: 75', '2025-09-18 14:43:02'),
(91, 1, 'Accessed dashboard', '2025-09-18 14:47:14'),
(92, 1, 'Accessed dashboard', '2025-09-18 14:47:14'),
(93, 1, 'Modified permission \'manage_grade_input\' to true for user_id 2', '2025-09-18 14:48:09'),
(94, 1, 'Modified permission \'manage_grade_levels\' to true for user_id 2', '2025-09-18 14:48:09'),
(95, 1, 'Modified permission \'manage_sections\' to true for user_id 2', '2025-09-18 14:48:09'),
(96, 1, 'Modified permission \'manage_subjects\' to true for user_id 2', '2025-09-18 14:48:09'),
(97, 1, 'Accessed dashboard', '2025-09-20 00:36:30'),
(98, 1, 'Accessed dashboard', '2025-09-20 00:36:30'),
(99, 1, 'Removed subject Science (SCIENCE) from curriculum: k-12 (2020-2021)', '2025-09-20 00:37:52'),
(100, 1, 'Activated curriculum: k-12 (2021-2022). All others automatically deactivated.', '2025-09-20 00:37:58'),
(101, 1, 'Activated curriculum: Curriculum 2022-2023. All others automatically deactivated.', '2025-09-20 00:38:01'),
(102, 1, 'Accessed dashboard', '2025-09-20 01:15:02'),
(103, 1, 'Accessed dashboard', '2025-09-20 01:15:02'),
(104, 1, 'Accessed dashboard', '2025-09-20 01:17:12'),
(105, 1, 'Accessed dashboard', '2025-09-20 01:17:12'),
(106, 1, 'Accessed dashboard', '2025-09-20 01:17:37'),
(107, 1, 'Accessed dashboard', '2025-09-20 01:17:38'),
(108, 1, 'Accessed dashboard', '2025-09-21 04:16:42'),
(109, 1, 'Accessed dashboard', '2025-09-21 04:16:42'),
(110, 1, 'Created student with ID 2', '2025-09-21 04:19:44'),
(111, 1, 'Activated curriculum: k-12 (2020-2021). All others automatically deactivated.', '2025-09-21 04:20:18'),
(112, 1, 'Created enrollment for student Test Sample in grade grade1, section Section A, SY 2020-2021', '2025-09-21 04:20:40'),
(113, 1, 'Accessed dashboard', '2025-09-21 04:21:08'),
(114, 1, 'Accessed dashboard', '2025-09-21 04:21:08'),
(115, 1, 'Updated enrollment ID 2 for student Test Sample in grade Grade2, section Section A, SY 2020-2021', '2025-09-21 04:21:53'),
(116, 2, 'view_student', '2025-09-21 04:22:47'),
(117, 2, 'view_student', '2025-09-21 04:22:47'),
(118, 2, 'view_student', '2025-09-21 04:22:47');

-- --------------------------------------------------------

--
-- Table structure for table `backups`
--

CREATE TABLE `backups` (
  `backup_id` int(11) NOT NULL,
  `backup_filename` varchar(255) NOT NULL,
  `backup_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_schedule`
--

CREATE TABLE `class_schedule` (
  `schedule_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `curriculum`
--

CREATE TABLE `curriculum` (
  `curriculum_id` int(11) NOT NULL,
  `curriculum_name` varchar(255) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `curriculum`
--

INSERT INTO `curriculum` (`curriculum_id`, `curriculum_name`, `school_year_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'k-12 (2020-2021)', 1, 1, '2025-09-16 07:33:11', '2025-09-21 04:20:18'),
(2, 'k-12 (2021-2022)', 2, 0, '2025-09-16 07:41:37', '2025-09-21 04:20:18'),
(3, 'Curriculum 2022-2023', 3, 0, '2025-09-16 08:01:20', '2025-09-21 04:20:18');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_subjects`
--

CREATE TABLE `curriculum_subjects` (
  `curriculum_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `curriculum_subjects`
--

INSERT INTO `curriculum_subjects` (`curriculum_id`, `subject_id`) VALUES
(1, 1),
(1, 3),
(2, 1),
(2, 3),
(3, 1),
(3, 2),
(3, 3),
(3, 4);

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `enrollment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `grade_level_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `curriculum_id` int(11) DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `status` enum('Enrolled','Pending','Withdrawn','Completed') DEFAULT 'Enrolled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`enrollment_id`, `student_id`, `grade_level_id`, `school_year_id`, `section_id`, `curriculum_id`, `enrollment_date`, `status`) VALUES
(1, 1, 1, 1, 1, 1, '2025-09-18', 'Enrolled'),
(2, 2, 2, 1, 4, 1, '2025-09-21', 'Enrolled');

-- --------------------------------------------------------

--
-- Table structure for table `grade_input_control`
--

CREATE TABLE `grade_input_control` (
  `teacher_id` int(11) NOT NULL,
  `input_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grade_input_control`
--

INSERT INTO `grade_input_control` (`teacher_id`, `input_enabled`, `updated_at`) VALUES
(1, 1, '2025-09-18 14:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `grade_levels`
--

CREATE TABLE `grade_levels` (
  `grade_level_id` int(11) NOT NULL,
  `grade_code` varchar(10) NOT NULL,
  `grade_name` varchar(50) NOT NULL,
  `grade_order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grade_levels`
--

INSERT INTO `grade_levels` (`grade_level_id`, `grade_code`, `grade_name`, `grade_order`, `created_at`) VALUES
(1, 'G1', 'grade1', 1, '2025-09-16 07:28:31'),
(2, 'G2', 'Grade2', 2, '2025-09-16 07:28:42'),
(3, 'G3', 'grade3', 3, '2025-09-16 07:28:54');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int(11) NOT NULL,
  `permission_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_name`) VALUES
(12, 'approve_transfers'),
(9, 'delete_documents'),
(5, 'delete_student'),
(8, 'download_documents'),
(4, 'edit_student_info'),
(20, 'export_data'),
(21, 'import_data'),
(10, 'lock_records'),
(17, 'manage_backups'),
(41, 'manage_class_schedules'),
(43, 'manage_curriculum'),
(39, 'manage_enrollments'),
(34, 'manage_grades'),
(35, 'manage_grade_input'),
(37, 'manage_grade_levels'),
(16, 'manage_permissions'),
(15, 'manage_roles'),
(18, 'manage_school_settings'),
(32, 'manage_school_years'),
(30, 'manage_sections'),
(28, 'manage_subjects'),
(24, 'manage_teachers'),
(26, 'manage_teacher_assignments'),
(14, 'manage_users'),
(1, 'register_student'),
(13, 'request_transfers'),
(2, 'search_student'),
(11, 'unlock_records'),
(7, 'upload_documents'),
(40, 'view_class_schedules'),
(42, 'view_curriculum'),
(6, 'view_ecards'),
(38, 'view_enrollments'),
(33, 'view_grades'),
(36, 'view_grade_levels'),
(19, 'view_logs'),
(22, 'view_reports'),
(31, 'view_school_years'),
(29, 'view_sections'),
(3, 'view_student_info'),
(27, 'view_subjects'),
(23, 'view_teachers'),
(25, 'view_teacher_assignments');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(6, 'it_support'),
(5, 'parent_guardian'),
(2, 'registrar'),
(4, 'school_head'),
(3, 'teacher');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 33),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 39),
(1, 40),
(1, 41),
(1, 42),
(1, 43),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11),
(2, 12),
(2, 13),
(2, 14),
(2, 17),
(2, 19),
(2, 20),
(2, 21),
(2, 22),
(2, 23),
(2, 27),
(2, 29),
(2, 30),
(2, 31),
(2, 34),
(2, 35),
(2, 36),
(2, 37),
(2, 38),
(2, 39),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(3, 6),
(3, 7),
(3, 8),
(3, 9),
(3, 10),
(3, 23),
(3, 25),
(3, 27),
(3, 29),
(3, 31),
(3, 33),
(3, 34),
(3, 36),
(3, 38),
(3, 39),
(3, 40),
(3, 42),
(3, 43),
(4, 1),
(4, 2),
(4, 3),
(4, 6),
(4, 7),
(4, 8),
(4, 9),
(4, 10),
(4, 12),
(4, 18),
(4, 19),
(4, 20),
(4, 22),
(4, 23),
(4, 25),
(4, 27),
(4, 29),
(4, 31),
(4, 33),
(4, 35),
(4, 36),
(4, 38),
(4, 40),
(4, 42),
(5, 3),
(5, 6),
(5, 33),
(6, 14),
(6, 15),
(6, 16),
(6, 17),
(6, 18),
(6, 19);

-- --------------------------------------------------------

--
-- Table structure for table `school_defaults`
--

CREATE TABLE `school_defaults` (
  `school_id` int(11) NOT NULL,
  `school_name` varchar(255) NOT NULL,
  `school_address` text NOT NULL,
  `region` varchar(100) NOT NULL,
  `division` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `school_head` varchar(255) NOT NULL,
  `school_logo` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_defaults`
--

INSERT INTO `school_defaults` (`school_id`, `school_name`, `school_address`, `region`, `division`, `district`, `school_head`, `school_logo`, `contact_number`, `email`, `website`, `updated_by`, `created_at`, `updated_at`) VALUES
(1234567890, 'School Name Here', 'School Address', 'School Region', 'School Division', 'School District', 'School Head Name', '/school_logos/school-logo.png', '09989888990', 'school@example.com', 'www.example.com', 1, '2025-06-06 16:45:01', '2025-06-06 16:45:01');

-- --------------------------------------------------------

--
-- Table structure for table `school_records`
--

CREATE TABLE `school_records` (
  `record_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `start_year` year(4) NOT NULL,
  `end_year` year(4) NOT NULL,
  `grade_level` varchar(20) NOT NULL,
  `section` varchar(50) DEFAULT NULL,
  `sf10_document_path` varchar(255) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_years`
--

CREATE TABLE `school_years` (
  `school_year_id` int(11) NOT NULL,
  `start_year` year(4) NOT NULL,
  `end_year` year(4) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_years`
--

INSERT INTO `school_years` (`school_year_id`, `start_year`, `end_year`, `is_active`, `created_at`) VALUES
(1, '2020', '2021', 1, '2025-09-16 07:28:00'),
(2, '2021', '2022', 0, '2025-09-16 07:28:11'),
(3, '2022', '2023', 0, '2025-09-16 08:00:43');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `grade_level_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `section_name`, `grade_level_id`, `school_year_id`) VALUES
(1, 'Section A', 1, 1),
(4, 'Section A', 2, 1),
(2, 'Section B', 1, 1),
(3, 'Section C', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `lrn` char(12) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `extension_name` varchar(50) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `zip_code` varchar(10) NOT NULL,
  `guardian_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `lrn`, `first_name`, `middle_name`, `last_name`, `extension_name`, `date_of_birth`, `gender`, `street`, `city`, `province`, `zip_code`, `guardian_name`, `contact_number`, `created_at`, `updated_at`) VALUES
(1, '123456787678', 'Quivir', 'A', 'Cutanda', '', '2025-09-18', 'Male', 'Testing', 'Test', 'Test', '5343', 'Test', '09990988987', '2025-09-18 14:09:52', '2025-09-18 14:09:52'),
(2, '123454534243', 'Test', 'T', 'Sample', '', '2025-09-21', 'Female', 'test', 'Test', 'Test', '8675', 'Test', '09898889984', '2025-09-21 04:19:44', '2025-09-21 04:19:44');

-- --------------------------------------------------------

--
-- Table structure for table `student_grades`
--

CREATE TABLE `student_grades` (
  `grade_id` int(11) NOT NULL,
  `enrollment_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `grading_period` enum('1st','2nd','3rd','4th') NOT NULL,
  `grade` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_grades`
--

INSERT INTO `student_grades` (`grade_id`, `enrollment_id`, `subject_id`, `grading_period`, `grade`) VALUES
(1, 1, 1, '1st', 89.00),
(2, 1, 1, '2nd', 89.00),
(3, 1, 1, '3rd', 89.00),
(4, 1, 1, '4th', 89.00),
(5, 1, 3, '1st', 89.00),
(6, 1, 3, '2nd', 90.50),
(7, 1, 3, '3rd', 90.50),
(8, 1, 3, '4th', 75.00);

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_code`, `subject_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'MATH-101', 'Math', NULL, '2025-09-16 07:30:58', '2025-09-16 07:30:58'),
(2, 'SCIENCE', 'Science', NULL, '2025-09-16 07:31:09', '2025-09-16 07:31:09'),
(3, 'ENG', 'English', NULL, '2025-09-16 07:31:19', '2025-09-16 07:31:19'),
(4, 'TEST', 'Test', NULL, '2025-09-16 08:29:01', '2025-09-16 08:29:01');

-- --------------------------------------------------------

--
-- Table structure for table `subject_grade_levels`
--

CREATE TABLE `subject_grade_levels` (
  `subject_id` int(11) NOT NULL,
  `grade_level_id` int(11) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `units` decimal(3,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_grade_levels`
--

INSERT INTO `subject_grade_levels` (`subject_id`, `grade_level_id`, `is_required`, `units`) VALUES
(1, 1, 1, 0.0),
(1, 2, 1, 0.0),
(1, 3, 1, 0.0),
(2, 1, 1, 0.0),
(2, 2, 1, 0.0),
(2, 3, 1, 0.0),
(3, 1, 1, 0.0),
(3, 2, 0, 0.0),
(3, 3, 1, 0.0),
(4, 1, 0, 0.0);

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `teacher_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `teacher_address` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`teacher_id`, `user_id`, `teacher_address`, `date_of_birth`, `contact_number`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Default Teacher Address, City, Province', '1990-01-01', '09123456789', 1, '2025-09-16 07:25:29', '2025-09-17 03:23:02'),
(2, 2, 'secret', '2025-09-17', '09098899878', 1, '2025-09-17 03:03:41', '2025-09-17 03:03:41');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_assignments`
--

CREATE TABLE `teacher_assignments` (
  `assignment_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_assignments`
--

INSERT INTO `teacher_assignments` (`assignment_id`, `teacher_id`, `subject_id`, `section_id`, `school_year_id`) VALUES
(2, 2, 1, 1, 1),
(4, 2, 1, 3, 1),
(7, 2, 1, 4, 1),
(5, 2, 2, 3, 1),
(8, 2, 2, 4, 1),
(1, 2, 3, 1, 1),
(3, 2, 3, 3, 1),
(6, 2, 3, 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `transfer_requests`
--

CREATE TABLE `transfer_requests` (
  `transfer_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `requesting_school` varchar(255) NOT NULL,
  `request_status` enum('Pending','Approved','Rejected','Deleted') DEFAULT 'Pending',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `extension_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `middle_name`, `last_name`, `extension_name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Quivir', 'Anora', 'Cutanda', NULL, 'admin@gmail.com', '$2b$10$KIoy.uCwCLY2xtZqi6NV9.aLD5KibZ2YeyRHsCr8a9j7FltbO.PfW', '2025-06-06 16:21:29', '2025-06-06 16:21:29'),
(2, 'Jemil', 'A', 'Doblas', NULL, 'jemil@gmail.com', '$2b$10$BmDYE4vzAkFD5IXsEuC.2uj/68S9iQ/5amnMbQv2sny.0MpaRbIBS', '2025-09-17 03:03:41', '2025-09-17 03:03:41');

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `is_granted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_permissions`
--

INSERT INTO `user_permissions` (`user_id`, `permission_id`, `is_granted`) VALUES
(2, 28, 1),
(2, 30, 1),
(2, 35, 1),
(2, 37, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(1, 3),
(2, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_activity_logs_user` (`user_id`);

--
-- Indexes for table `backups`
--
ALTER TABLE `backups`
  ADD PRIMARY KEY (`backup_id`),
  ADD KEY `idx_backups_created_by` (`created_by`);

--
-- Indexes for table `class_schedule`
--
ALTER TABLE `class_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `school_year_id` (`school_year_id`),
  ADD KEY `idx_class_schedule_section` (`section_id`),
  ADD KEY `idx_class_schedule_teacher` (`teacher_id`);

--
-- Indexes for table `curriculum`
--
ALTER TABLE `curriculum`
  ADD PRIMARY KEY (`curriculum_id`),
  ADD KEY `idx_curriculum_school_year` (`school_year_id`);

--
-- Indexes for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  ADD PRIMARY KEY (`curriculum_id`,`subject_id`),
  ADD KEY `idx_curriculum_subjects_curriculum` (`curriculum_id`),
  ADD KEY `idx_curriculum_subjects_subject` (`subject_id`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD KEY `curriculum_id` (`curriculum_id`),
  ADD KEY `idx_enrollment_student` (`student_id`),
  ADD KEY `idx_enrollment_grade` (`grade_level_id`),
  ADD KEY `idx_enrollment_section` (`section_id`),
  ADD KEY `idx_enrollment_sy` (`school_year_id`);

--
-- Indexes for table `grade_input_control`
--
ALTER TABLE `grade_input_control`
  ADD PRIMARY KEY (`teacher_id`);

--
-- Indexes for table `grade_levels`
--
ALTER TABLE `grade_levels`
  ADD PRIMARY KEY (`grade_level_id`),
  ADD UNIQUE KEY `grade_code` (`grade_code`),
  ADD UNIQUE KEY `grade_order` (`grade_order`),
  ADD KEY `idx_grade_levels_code` (`grade_code`),
  ADD KEY `idx_grade_levels_order` (`grade_order`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `permission_name` (`permission_name`),
  ADD KEY `idx_permissions_name` (`permission_name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`),
  ADD KEY `idx_roles_name` (`role_name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `idx_role_permissions_role` (`role_id`),
  ADD KEY `idx_role_permissions_permission` (`permission_id`);

--
-- Indexes for table `school_defaults`
--
ALTER TABLE `school_defaults`
  ADD PRIMARY KEY (`school_id`),
  ADD KEY `idx_school_defaults_updated_by` (`updated_by`);

--
-- Indexes for table `school_records`
--
ALTER TABLE `school_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `idx_school_records_grade_level` (`grade_level`),
  ADD KEY `idx_school_records_student` (`student_id`),
  ADD KEY `idx_school_records_uploaded_by` (`uploaded_by`);

--
-- Indexes for table `school_years`
--
ALTER TABLE `school_years`
  ADD PRIMARY KEY (`school_year_id`),
  ADD UNIQUE KEY `start_year` (`start_year`,`end_year`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `section_name` (`section_name`,`grade_level_id`,`school_year_id`),
  ADD KEY `idx_sections_grade_level` (`grade_level_id`),
  ADD KEY `idx_sections_school_year` (`school_year_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `lrn` (`lrn`),
  ADD KEY `idx_students_lrn` (`lrn`);

--
-- Indexes for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD PRIMARY KEY (`grade_id`),
  ADD KEY `idx_student_grades_enrollment` (`enrollment_id`),
  ADD KEY `idx_student_grades_subject` (`subject_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`);

--
-- Indexes for table `subject_grade_levels`
--
ALTER TABLE `subject_grade_levels`
  ADD PRIMARY KEY (`subject_id`,`grade_level_id`),
  ADD KEY `idx_subject_grade_levels_subject` (`subject_id`),
  ADD KEY `idx_subject_grade_levels_grade` (`grade_level_id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`teacher_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `teacher_id` (`teacher_id`,`subject_id`,`section_id`,`school_year_id`),
  ADD KEY `school_year_id` (`school_year_id`),
  ADD KEY `idx_teacher_assignments_teacher` (`teacher_id`),
  ADD KEY `idx_teacher_assignments_subject` (`subject_id`),
  ADD KEY `idx_teacher_assignments_section` (`section_id`);

--
-- Indexes for table `transfer_requests`
--
ALTER TABLE `transfer_requests`
  ADD PRIMARY KEY (`transfer_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_transfer_requests_status` (`request_status`),
  ADD KEY `idx_transfer_requests_student` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`user_id`,`permission_id`),
  ADD KEY `idx_user_permissions_user` (`user_id`),
  ADD KEY `idx_user_permissions_permission` (`permission_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `idx_user_roles_user` (`user_id`),
  ADD KEY `idx_user_roles_role` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `backups`
--
ALTER TABLE `backups`
  MODIFY `backup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_schedule`
--
ALTER TABLE `class_schedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `curriculum`
--
ALTER TABLE `curriculum`
  MODIFY `curriculum_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `enrollment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `grade_levels`
--
ALTER TABLE `grade_levels`
  MODIFY `grade_level_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `school_defaults`
--
ALTER TABLE `school_defaults`
  MODIFY `school_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1234567891;

--
-- AUTO_INCREMENT for table `school_records`
--
ALTER TABLE `school_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_years`
--
ALTER TABLE `school_years`
  MODIFY `school_year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_grades`
--
ALTER TABLE `student_grades`
  MODIFY `grade_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `teacher_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `transfer_requests`
--
ALTER TABLE `transfer_requests`
  MODIFY `transfer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `backups`
--
ALTER TABLE `backups`
  ADD CONSTRAINT `backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `class_schedule`
--
ALTER TABLE `class_schedule`
  ADD CONSTRAINT `class_schedule_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_schedule_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_schedule_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_schedule_ibfk_4` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum`
--
ALTER TABLE `curriculum`
  ADD CONSTRAINT `curriculum_ibfk_1` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`) ON DELETE CASCADE;

--
-- Constraints for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  ADD CONSTRAINT `curriculum_subjects_ibfk_1` FOREIGN KEY (`curriculum_id`) REFERENCES `curriculum` (`curriculum_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `curriculum_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `enrollment_ibfk_3` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_ibfk_4` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_ibfk_5` FOREIGN KEY (`curriculum_id`) REFERENCES `curriculum` (`curriculum_id`) ON DELETE SET NULL;

--
-- Constraints for table `grade_input_control`
--
ALTER TABLE `grade_input_control`
  ADD CONSTRAINT `grade_input_control_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

--
-- Constraints for table `school_defaults`
--
ALTER TABLE `school_defaults`
  ADD CONSTRAINT `school_defaults_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `school_records`
--
ALTER TABLE `school_records`
  ADD CONSTRAINT `school_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `school_records_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `sections_ibfk_2` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD CONSTRAINT `student_grades_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment` (`enrollment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `subject_grade_levels`
--
ALTER TABLE `subject_grade_levels`
  ADD CONSTRAINT `subject_grade_levels_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subject_grade_levels_ibfk_2` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`) ON DELETE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_4` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`) ON DELETE CASCADE;

--
-- Constraints for table `transfer_requests`
--
ALTER TABLE `transfer_requests`
  ADD CONSTRAINT `transfer_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transfer_requests_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
