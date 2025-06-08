-- Create Database with Consistent Character Set and Collation
CREATE DATABASE IF NOT EXISTS e_sf10_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;
USE e_sf10_db;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password CHAR(60) NOT NULL, -- For bcrypt hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Students Table
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    lrn VARCHAR(12) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    extension_name VARCHAR(50),
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    guardian_name VARCHAR(255),
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_students_lrn (lrn)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- School Defaults Table
CREATE TABLE school_defaults (
    school_id INT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    school_address TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    school_head VARCHAR(255) NOT NULL,
    school_logo VARCHAR(255),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- School Records Table with Soft Delete
CREATE TABLE school_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    start_year YEAR NOT NULL,
    end_year YEAR NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    section VARCHAR(50) NOT NULL,
    sf10_document_path VARCHAR(255),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_school_records_grade_level (grade_level),
    INDEX idx_school_records_student (student_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Transfer Requests Table
CREATE TABLE transfer_requests (
    transfer_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    requesting_school VARCHAR(255) NOT NULL,
    request_status ENUM('Pending', 'Approved', 'Rejected','Deleted') DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INT,
    processed_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_transfer_requests_status (request_status)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Activity Logs Table
CREATE TABLE activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action TEXT NOT NULL,
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Backups Table
CREATE TABLE backups (
    backup_id INT PRIMARY KEY AUTO_INCREMENT,
    backup_filename VARCHAR(255) NOT NULL,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Roles Table
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    INDEX idx_roles_name (role_name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Permissions Table
CREATE TABLE permissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    INDEX idx_permissions_name (permission_name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Role Permissions Table (Many-to-Many Relationship)
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- User Roles Table (Many-to-Many Relationship)
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- User Permissions Table (User-Specific Overrides)
CREATE TABLE user_permissions (
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    is_granted BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Initialize Roles
INSERT INTO roles (role_name) VALUES 
('admin'),
('registrar'),
('teacher'),
('student'),
('school_head'),
('parent_guardian'),
('it_support')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- Initialize Permissions
INSERT INTO permissions (permission_name) VALUES 
('register_student'),
('search_student'),
('view_student_info'),
('edit_student_info'),
('delete_student'),
('view_ecards'),
('upload_documents'),
('download_documents'),
('delete_documents'),
('lock_records'),
('unlock_records'),
('approve_transfers'),
('request_transfers'),
('manage_users'),
('manage_roles'),
('manage_permissions'),
('manage_backups'),
('manage_school_settings'),
('view_logs'),
('export_data'),
('import_data'),
('view_reports')
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- Clear Existing Role Permissions (to ensure clean state)
DELETE FROM role_permissions;

-- Assign Permissions to Admin Role (All Permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'admin'),
    permission_id
FROM permissions;

-- Assign Permissions to Registrar Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'registrar'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'register_student', 'search_student', 'view_student_info', 'edit_student_info',
    'delete_student', 'view_ecards', 'upload_documents', 'download_documents',
    'delete_documents', 'lock_records', 'unlock_records', 'approve_transfers',
    'request_transfers', 'manage_users', 'manage_backups', 'view_logs',
    'export_data', 'import_data', 'view_reports'
);

-- Assign Permissions to Teacher Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'teacher'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'search_student', 'view_student_info', 'view_ecards',
    'upload_documents', 'download_documents', 'lock_records','register_student','delete_documents'
);

-- Assign Permissions to Student Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'student'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'view_student_info', 'view_ecards', 'request_transfers','edit_student_info'
);

-- Assign Permissions to School Head Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'school_head'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'search_student', 'view_student_info', 'view_ecards',
    'download_documents', 'approve_transfers', 'view_logs', 'view_reports','manage_school_settings','delete_documents','upload_documents','lock_records','register_student'
);

-- Assign Permissions to Parent/Guardian Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'parent_guardian'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'view_student_info', 'view_ecards'
);

-- Assign Permissions to IT Support Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'it_support'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'manage_users', 'manage_roles', 'manage_permissions',
    'manage_backups', 'view_logs'
);

-- Validation Queries
-- Verify Roles
SELECT role_id, role_name FROM roles ORDER BY role_name;

-- Verify Permissions
SELECT permission_id, permission_name FROM permissions ORDER BY permission_name;

-- Verify Role Permissions for Student
SELECT r.role_name, p.permission_name
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name = 'student'
ORDER BY p.permission_name;

-- Verify Role Permissions for Teacher
SELECT r.role_name, p.permission_name
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name = 'teacher'
ORDER BY p.permission_name;

-- Verify Role Permissions for Admin
SELECT r.role_name, p.permission_name
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name = 'admin'
ORDER BY p.permission_name;



INSERT INTO `users` (`user_id`, `first_name`, `middle_name`, `last_name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Quivir', 'Anora', 'Cutanda', 'admin@gmail.com', '$2b$10$KIoy.uCwCLY2xtZqi6NV9.aLD5KibZ2YeyRHsCr8a9j7FltbO.PfW', '2025-06-07 00:21:29', '2025-06-07 00:21:29');

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1);


INSERT INTO `school_defaults` (`school_id`, `school_name`, `school_address`, `region`, `division`, `district`, `school_head`, `school_logo`, `contact_number`, `email`, `website`, `updated_by`, `created_at`, `updated_at`) VALUES
(1234567890, 'School Name Here', 'School Address', 'School Region', 'School Division', 'School District', 'School Head Name', '/school_logos/1749257101975-688779572.png', '09989888990', 'school@example.com', 'www.example.com', 1, '2025-06-07 00:45:01', '2025-06-07 00:45:01');
