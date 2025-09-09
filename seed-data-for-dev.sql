-- ================================
-- DUMMY DATA INSERTION SCRIPT
-- ================================
-- Note: User table is excluded as requested for login purposes

-- Insert Students
INSERT INTO students (lrn, first_name, middle_name, last_name, extension_name, date_of_birth, gender, street, city, province, zip_code, guardian_name, contact_number) VALUES
('123456789012', 'Juan', 'Santos', 'Cruz', NULL, '2010-03-15', 'Male', '123 Rizal Street', 'Manila', 'Metro Manila', '1000', 'Maria Cruz', '09171234567'),
('123456789013', 'Maria', 'Garcia', 'Reyes', NULL, '2009-07-22', 'Female', '456 Bonifacio Ave', 'Quezon City', 'Metro Manila', '1100', 'Jose Reyes', '09181234567'),
('123456789014', 'Pedro', 'Mendoza', 'Santos', 'Jr.', '2011-01-10', 'Male', '789 Luna Street', 'Makati', 'Metro Manila', '1200', 'Ana Santos', '09191234567'),
('123456789015', 'Ana', 'Rodriguez', 'Bautista', NULL, '2010-11-05', 'Female', '321 Del Pilar St', 'Pasig', 'Metro Manila', '1600', 'Carlos Bautista', '09201234567'),
('123456789016', 'Jose', 'Dela Cruz', 'Martinez', NULL, '2009-04-18', 'Male', '654 Mabini Ave', 'Taguig', 'Metro Manila', '1630', 'Rosa Martinez', '09211234567'),
('123456789017', 'Carmen', 'Flores', 'Garcia', NULL, '2011-09-12', 'Female', '987 Lapu-Lapu St', 'Mandaluyong', 'Metro Manila', '1550', 'Roberto Garcia', '09221234567'),
('123456789018', 'Miguel', 'Torres', 'Villanueva', NULL, '2010-06-30', 'Male', '147 Aguinaldo Rd', 'San Juan', 'Metro Manila', '1500', 'Elena Villanueva', '09231234567'),
('123456789019', 'Luz', 'Morales', 'Fernandez', NULL, '2009-12-03', 'Female', '258 Katipunan Ave', 'Quezon City', 'Metro Manila', '1108', 'Antonio Fernandez', '09241234567'),
('123456789020', 'Roberto', 'Castillo', 'Lopez', NULL, '2011-02-28', 'Male', '369 EDSA', 'Pasay', 'Metro Manila', '1300', 'Linda Lopez', '09251234567'),
('123456789021', 'Sofia', 'Ramos', 'Gonzalez', NULL, '2010-08-14', 'Female', '741 Taft Avenue', 'Manila', 'Metro Manila', '1004', 'Fernando Gonzalez', '09261234567');

-- Insert School Defaults
INSERT INTO school_defaults (school_name, school_address, region, division, district, school_head, school_logo, contact_number, email, website, updated_by) VALUES
('San Pedro Elementary School', '123 Education Avenue, Barangay San Pedro, Manila City', 'National Capital Region (NCR)', 'Manila Division', 'District I', 'Dr. Elena M. Santos', '/uploads/school_logo.png', '02-1234-5678', 'sanpedro.es@deped.gov.ph', 'www.sanpedro-es.edu.ph', 1);

-- Insert School Records
INSERT INTO school_records (student_id, start_year, end_year, grade_level, section, sf10_document_path, uploaded_by, is_deleted) VALUES
(1, 2023, 2024, 'Grade 6', 'Mabini', '/uploads/sf10/student_1_2023-2024.pdf', 1, FALSE),
(2, 2023, 2024, 'Grade 7', 'Rizal', '/uploads/sf10/student_2_2023-2024.pdf', 1, FALSE),
(3, 2023, 2024, 'Grade 5', 'Bonifacio', '/uploads/sf10/student_3_2023-2024.pdf', 1, FALSE),
(4, 2023, 2024, 'Grade 6', 'Mabini', '/uploads/sf10/student_4_2023-2024.pdf', 1, FALSE),
(5, 2023, 2024, 'Grade 7', 'Rizal', '/uploads/sf10/student_5_2023-2024.pdf', 1, FALSE),
(6, 2022, 2023, 'Grade 4', 'Luna', '/uploads/sf10/student_6_2022-2023.pdf', 1, FALSE),
(7, 2023, 2024, 'Grade 6', 'Mabini', '/uploads/sf10/student_7_2023-2024.pdf', 1, FALSE),
(8, 2023, 2024, 'Grade 7', 'Lapu-Lapu', '/uploads/sf10/student_8_2023-2024.pdf', 1, FALSE),
(9, 2022, 2023, 'Grade 4', 'Luna', '/uploads/sf10/student_9_2022-2023.pdf', 1, FALSE),
(10, 2023, 2024, 'Grade 5', 'Bonifacio', '/uploads/sf10/student_10_2023-2024.pdf', 1, FALSE);

-- Insert Transfer Requests
INSERT INTO transfer_requests (student_id, requesting_school, request_status, processed_by, processed_at) VALUES
(1, 'Manila Science High School', 'Pending', NULL, NULL),
(3, 'Quezon City Elementary School', 'Approved', 1, '2024-01-15 10:30:00'),
(5, 'Makati Elementary School', 'Rejected', 1, '2024-02-20 14:45:00'),
(7, 'Taguig Science Elementary', 'Pending', NULL, NULL);

-- Insert Activity Logs
INSERT INTO activity_logs (user_id, action) VALUES
(1, 'Admin logged into the system'),
(1, 'Created new student record for Juan Santos Cruz'),
(1, 'Updated school settings'),
(1, 'Approved transfer request for Pedro Mendoza Santos'),
(1, 'Generated enrollment report for SY 2023-2024'),
(1, 'Created backup file: backup_2024_01_15.sql'),
(1, 'Updated student information for Maria Garcia Reyes'),
(1, 'Rejected transfer request for Jose Dela Cruz Martinez'),
(1, 'Added new curriculum for Grade 6'),
(1, 'Assigned teacher to Grade 5 Mathematics');

-- Insert Backups
INSERT INTO backups (backup_filename, created_by) VALUES
('e_sf10_backup_2024_01_01.sql', 1),
('e_sf10_backup_2024_01_15.sql', 1),
('e_sf10_backup_2024_02_01.sql', 1),
('e_sf10_backup_2024_02_15.sql', 1),
('e_sf10_backup_2024_03_01.sql', 1);

-- Insert Grade Levels
INSERT INTO grade_levels (grade_code, grade_name, grade_order) VALUES
('K1', 'Kinder 1', 1),
('K2', 'Kinder 2', 2),
('G1', 'Grade 1', 3),
('G2', 'Grade 2', 4),
('G3', 'Grade 3', 5),
('G4', 'Grade 4', 6),
('G5', 'Grade 5', 7),
('G6', 'Grade 6', 8),
('G7', 'Grade 7', 9),
('G8', 'Grade 8', 10),
('G9', 'Grade 9', 11),
('G10', 'Grade 10', 12),
('G11', 'Grade 11', 13),
('G12', 'Grade 12', 14);

-- Insert School Years
INSERT INTO school_years (start_year, end_year, is_active) VALUES
(2021, 2022, FALSE),
(2022, 2023, FALSE),
(2023, 2024, TRUE),
(2024, 2025, FALSE);

-- Insert Sections
INSERT INTO sections (section_name, grade_level_id, school_year_id) VALUES
-- Grade 1 Sections for SY 2023-2024
('Mabini', 3, 3),
('Rizal', 3, 3),
('Bonifacio', 3, 3),
-- Grade 2 Sections for SY 2023-2024
('Luna', 4, 3),
('Del Pilar', 4, 3),
-- Grade 3 Sections for SY 2023-2024
('Aguinaldo', 5, 3),
('Jacinto', 5, 3),
-- Grade 4 Sections for SY 2023-2024
('Mabini', 6, 3),
('Rizal', 6, 3),
-- Grade 5 Sections for SY 2023-2024
('Bonifacio', 7, 3),
('Luna', 7, 3),
-- Grade 6 Sections for SY 2023-2024
('Lapu-Lapu', 8, 3),
('Magat', 8, 3),
-- Grade 7 Sections for SY 2023-2024
('Einstein', 9, 3),
('Newton', 9, 3);

-- Insert Subjects
INSERT INTO subjects (subject_code, subject_name, description) VALUES
('MATH', 'Mathematics', 'Core mathematics curriculum covering arithmetic, algebra, and problem solving'),
('ENG', 'English', 'Language arts including reading, writing, grammar, and literature'),
('FIL', 'Filipino', 'National language instruction covering reading, writing, and literature'),
('SCI', 'Science', 'General science covering biology, chemistry, physics, and earth science'),
('SS', 'Social Studies', 'History, geography, civics, and cultural studies'),
('MAPEH', 'Music, Arts, Physical Education, Health', 'Integrated arts, music, PE, and health education'),
('TLE', 'Technology and Livelihood Education', 'Practical skills and technology education'),
('ESP', 'Edukasyon sa Pagpapakatao', 'Values education and character development'),
('MTB', 'Mother Tongue-Based', 'Local language instruction for primary grades'),
('COMP', 'Computer Education', 'Basic computer literacy and digital skills');

-- Insert Subject Grade Levels (assign subjects to appropriate grade levels)
INSERT INTO subject_grade_levels (subject_id, grade_level_id, is_required, units) VALUES
-- Grade 1
(1, 3, TRUE, 1.0), (2, 3, TRUE, 1.0), (3, 3, TRUE, 1.0), (4, 3, TRUE, 1.0), (5, 3, TRUE, 1.0), (6, 3, TRUE, 1.0), (8, 3, TRUE, 1.0), (9, 3, TRUE, 1.0),
-- Grade 2
(1, 4, TRUE, 1.0), (2, 4, TRUE, 1.0), (3, 4, TRUE, 1.0), (4, 4, TRUE, 1.0), (5, 4, TRUE, 1.0), (6, 4, TRUE, 1.0), (8, 4, TRUE, 1.0), (9, 4, TRUE, 1.0),
-- Grade 3
(1, 5, TRUE, 1.0), (2, 5, TRUE, 1.0), (3, 5, TRUE, 1.0), (4, 5, TRUE, 1.0), (5, 5, TRUE, 1.0), (6, 5, TRUE, 1.0), (8, 5, TRUE, 1.0), (9, 5, TRUE, 1.0),
-- Grade 4
(1, 6, TRUE, 1.0), (2, 6, TRUE, 1.0), (3, 6, TRUE, 1.0), (4, 6, TRUE, 1.0), (5, 6, TRUE, 1.0), (6, 6, TRUE, 1.0), (7, 6, TRUE, 1.0), (8, 6, TRUE, 1.0),
-- Grade 5
(1, 7, TRUE, 1.0), (2, 7, TRUE, 1.0), (3, 7, TRUE, 1.0), (4, 7, TRUE, 1.0), (5, 7, TRUE, 1.0), (6, 7, TRUE, 1.0), (7, 7, TRUE, 1.0), (8, 7, TRUE, 1.0),
-- Grade 6
(1, 8, TRUE, 1.0), (2, 8, TRUE, 1.0), (3, 8, TRUE, 1.0), (4, 8, TRUE, 1.0), (5, 8, TRUE, 1.0), (6, 8, TRUE, 1.0), (7, 8, TRUE, 1.0), (8, 8, TRUE, 1.0),
-- Grade 7
(1, 9, TRUE, 1.0), (2, 9, TRUE, 1.0), (3, 9, TRUE, 1.0), (4, 9, TRUE, 1.0), (5, 9, TRUE, 1.0), (6, 9, TRUE, 1.0), (7, 9, TRUE, 1.0), (8, 9, TRUE, 1.0), (10, 9, TRUE, 1.0);

-- Insert Curriculum
INSERT INTO curriculum (curriculum_name, school_year_id, is_active) VALUES
('Elementary Curriculum 2023-2024', 3, TRUE),
('Junior High School Curriculum 2023-2024', 3, TRUE),
('Kindergarten Curriculum 2023-2024', 3, TRUE);

-- Insert Curriculum Subjects
INSERT INTO curriculum_subjects (curriculum_id, subject_id) VALUES
-- Elementary Curriculum (Subjects 1-8)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- Junior High School Curriculum (Subjects 1-8, 10)
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 10),
-- Kindergarten Curriculum (Basic subjects)
(3, 1), (3, 2), (3, 3), (3, 6), (3, 8), (3, 9);

-- Insert Enrollment
INSERT INTO enrollment (student_id, grade_level_id, school_year_id, section_id, curriculum_id, enrollment_date, status) VALUES
(1, 8, 3, 11, 1, '2023-06-05', 'Enrolled'),  -- Grade 6 Lapu-Lapu
(2, 9, 3, 13, 2, '2023-06-05', 'Enrolled'),  -- Grade 7 Einstein
(3, 7, 3, 9, 1, '2023-06-06', 'Enrolled'),   -- Grade 5 Bonifacio
(4, 8, 3, 11, 1, '2023-06-06', 'Enrolled'),  -- Grade 6 Lapu-Lapu
(5, 9, 3, 13, 2, '2023-06-07', 'Enrolled'),  -- Grade 7 Einstein
(6, 6, 3, 7, 1, '2023-06-07', 'Enrolled'),   -- Grade 4 Mabini
(7, 8, 3, 12, 1, '2023-06-08', 'Enrolled'),  -- Grade 6 Magat
(8, 9, 3, 14, 2, '2023-06-08', 'Enrolled'),  -- Grade 7 Newton
(9, 6, 3, 8, 1, '2023-06-09', 'Enrolled'),   -- Grade 4 Rizal
(10, 7, 3, 10, 1, '2023-06-09', 'Enrolled'); -- Grade 5 Luna

-- Insert Teacher Assignments (using the default teacher created earlier)
INSERT INTO teacher_assignments (teacher_id, subject_id, section_id, school_year_id) VALUES
(1, 1, 11, 3), -- Mathematics for Grade 6 Lapu-Lapu
(1, 1, 12, 3), -- Mathematics for Grade 6 Magat
(1, 2, 11, 3), -- English for Grade 6 Lapu-Lapu
(1, 2, 12, 3), -- English for Grade 6 Magat
(1, 4, 13, 3), -- Science for Grade 7 Einstein
(1, 4, 14, 3); -- Science for Grade 7 Newton

-- Insert Grade Input Control
INSERT INTO grade_input_control (teacher_id, input_enabled) VALUES
(1, TRUE);

-- Insert Class Schedule
INSERT INTO class_schedule (subject_id, teacher_id, section_id, school_year_id, day_of_week, start_time, end_time) VALUES
(1, 1, 11, 3, 'Monday', '08:00:00', '09:00:00'),    -- Math Grade 6 Lapu-Lapu
(2, 1, 11, 3, 'Monday', '09:00:00', '10:00:00'),    -- English Grade 6 Lapu-Lapu
(1, 1, 12, 3, 'Tuesday', '08:00:00', '09:00:00'),   -- Math Grade 6 Magat
(2, 1, 12, 3, 'Tuesday', '09:00:00', '10:00:00'),   -- English Grade 6 Magat
(4, 1, 13, 3, 'Wednesday', '08:00:00', '09:00:00'), -- Science Grade 7 Einstein
(4, 1, 14, 3, 'Thursday', '08:00:00', '09:00:00'),  -- Science Grade 7 Newton
(1, 1, 11, 3, 'Friday', '08:00:00', '09:00:00'),    -- Math Grade 6 Lapu-Lapu
(2, 1, 11, 3, 'Friday', '09:00:00', '10:00:00');    -- English Grade 6 Lapu-Lapu

-- Insert Student Grades
INSERT INTO student_grades (enrollment_id, subject_id, grading_period, grade) VALUES
-- Grades for Juan (enrollment_id = 1, Grade 6)
(1, 1, '1st', 85.50), (1, 2, '1st', 88.00), (1, 3, '1st', 82.75), (1, 4, '1st', 87.25),
(1, 1, '2nd', 87.00), (1, 2, '2nd', 89.50), (1, 3, '2nd', 84.00), (1, 4, '2nd', 88.75),
-- Grades for Maria (enrollment_id = 2, Grade 7)
(2, 1, '1st', 92.00), (2, 2, '1st', 94.50), (2, 4, '1st', 91.25), (2, 10, '1st', 89.75),
(2, 1, '2nd', 93.25), (2, 2, '2nd', 95.00), (2, 4, '2nd', 92.50), (2, 10, '2nd', 90.25),
-- Grades for Pedro (enrollment_id = 3, Grade 5)
(3, 1, '1st', 78.50), (3, 2, '1st', 80.25), (3, 3, '1st', 76.75), (3, 4, '1st', 79.50),
(3, 1, '2nd', 80.00), (3, 2, '2nd', 82.75), (3, 3, '2nd', 78.25), (3, 4, '2nd', 81.00),
-- Grades for Ana (enrollment_id = 4, Grade 6)
(4, 1, '1st', 86.25), (4, 2, '1st', 88.75), (4, 3, '1st', 84.50), (4, 4, '1st', 87.00),
-- Grades for Jose (enrollment_id = 5, Grade 7)
(5, 1, '1st', 83.75), (5, 2, '1st', 85.25), (5, 4, '1st', 82.50), (5, 10, '1st', 84.00),
-- Grades for Carmen (enrollment_id = 6, Grade 4)
(6, 1, '1st', 81.50), (6, 2, '1st', 83.00), (6, 3, '1st', 79.75), (6, 4, '1st', 82.25),
-- Grades for Miguel (enrollment_id = 7, Grade 6)
(7, 1, '1st', 89.00), (7, 2, '1st', 91.50), (7, 3, '1st', 87.25), (7, 4, '1st', 90.00),
-- Grades for Luz (enrollment_id = 8, Grade 7)
(8, 1, '1st', 88.75), (8, 2, '1st', 90.25), (8, 4, '1st', 87.50), (8, 10, '1st', 89.00),
-- Grades for Roberto (enrollment_id = 9, Grade 4)
(9, 1, '1st', 77.25), (9, 2, '1st', 79.50), (9, 3, '1st', 75.75), (9, 4, '1st', 78.00),
-- Grades for Sofia (enrollment_id = 10, Grade 5)
(10, 1, '1st', 85.00), (10, 2, '1st', 87.25), (10, 3, '1st', 83.50), (10, 4, '1st', 86.00);

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Check data counts for each table
SELECT 'Students' as table_name, COUNT(*) as record_count FROM students
UNION ALL
SELECT 'School Defaults', COUNT(*) FROM school_defaults
UNION ALL
SELECT 'School Records', COUNT(*) FROM school_records
UNION ALL
SELECT 'Transfer Requests', COUNT(*) FROM transfer_requests
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM activity_logs
UNION ALL
SELECT 'Backups', COUNT(*) FROM backups
UNION ALL
SELECT 'Grade Levels', COUNT(*) FROM grade_levels
UNION ALL
SELECT 'School Years', COUNT(*) FROM school_years
UNION ALL
SELECT 'Sections', COUNT(*) FROM sections
UNION ALL
SELECT 'Teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'Subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'Subject Grade Levels', COUNT(*) FROM subject_grade_levels
UNION ALL
SELECT 'Curriculum', COUNT(*) FROM curriculum
UNION ALL
SELECT 'Curriculum Subjects', COUNT(*) FROM curriculum_subjects
UNION ALL
SELECT 'Enrollment', COUNT(*) FROM enrollment
UNION ALL
SELECT 'Teacher Assignments', COUNT(*) FROM teacher_assignments
UNION ALL
SELECT 'Grade Input Control', COUNT(*) FROM grade_input_control
UNION ALL
SELECT 'Class Schedule', COUNT(*) FROM class_schedule
UNION ALL
SELECT 'Student Grades', COUNT(*) FROM student_grades
ORDER BY table_name;