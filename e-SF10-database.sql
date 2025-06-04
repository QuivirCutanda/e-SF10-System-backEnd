-- Create Database
CREATE DATABASE IF NOT EXISTS e_sf10_db;
USE e_sf10_db;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password CHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- school_defaults
CREATE TABLE school_defaults (
    school_id INT PRIMARY KEY, 
    school_name VARCHAR(255) NOT NULL,
    school_address TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL, 
    district VARCHAR(100) NOT NULL, 
    school_head VARCHAR(255) NOT NULL,
    school_logo VARCHAR(255) DEFAULT NULL,
    contact_number VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    updated_by INT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- School Records Table with Soft Delete
CREATE TABLE school_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    start_year YEAR NOT NULL,
    end_year YEAR NOT NULL,
    grade_level VARCHAR(20) NOT NULL,   
    section VARCHAR(50) NOT NULL,
    sf10_document_path VARCHAR(255) NULL, 
    uploaded_by INT NULL,  
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE, 
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_school_records_grade_level (grade_level),
    INDEX idx_school_records_student (student_id)
);

-- Transfer Requests Table
CREATE TABLE transfer_requests (
    transfer_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    requesting_school VARCHAR(255) NOT NULL,
    request_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by INT NULL, 
    processed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_transfer_requests_status (request_status)
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,  
    action TEXT NOT NULL,
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Backups Table
CREATE TABLE backups (
    backup_id INT PRIMARY KEY AUTO_INCREMENT,
    backup_filename VARCHAR(255) NOT NULL,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,  
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Roles Table
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Permissions Table
CREATE TABLE permissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) UNIQUE NOT NULL
);

-- Role Permissions Table (Many-to-Many Relationship)
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- User Roles Table (Many-to-Many Relationship)
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Indexing for Performance
CREATE INDEX idx_students_lrn ON students(lrn);
CREATE INDEX idx_users_email ON users(email);

-- Data Insertion
INSERT IGNORE INTO roles (role_name) VALUES 
('admin'), 
('teacher'), 
('student'), 
('registrar');

-- Insert permissions 
INSERT INTO permissions (permission_name) VALUES 
('register_student'),
('search_student'),
('view_student_info'),
('view_ecards'),
('upload_documents'),
('download_documents'),
('manage_users'),
('manage_backups'),
('lock_records');

-- Assign all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'admin'),
    permission_id
FROM permissions;

-- Assign permissions to registrar role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'registrar'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'search_student',
    'view_student_info',
    'view_ecards',
    'download_documents',
    'manage_users',
    'manage_backups',
    'lock_records'
);

-- Assign permissions to teacher role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'teacher'),
    permission_id
FROM permissions 
WHERE permission_name IN (
    'search_student',
    'view_student_info',
    'view_ecards',
    'download_documents',
    'upload_documents',
    'lock_records'
);

-- Assign permissions to student role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT role_id FROM roles WHERE role_name = 'student'),
    permission_id
FROM permissions 
WHERE permission_name IN ('view_student_info', 'view_ecards');