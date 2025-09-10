const db = require('../config/db');

const hasPermission = async (userId, permissionName) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.execute(`
      SELECT 1
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.permission_id
      WHERE up.user_id = ? AND p.permission_name = ? AND up.is_granted = TRUE
      UNION
      SELECT 1
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE ur.user_id = ? AND p.permission_name = ?
      LIMIT 1
    `, [userId, permissionName, userId, permissionName]);
    return rows.length > 0;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getUserDashboardInfo = async (userId) => {
  const connection = await db.getConnection();
  try {
    const [userRows] = await connection.execute(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, 
             GROUP_CONCAT(r.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = ?
      GROUP BY u.user_id
    `, [userId]);
    return userRows[0] || {};
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getStudentStats = async (userId) => {
  if (!(await hasPermission(userId, 'view_student_info'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [studentStats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as recent_students,
        (SELECT COUNT(*) FROM transfer_requests WHERE request_status = 'Pending') as pending_transfers
    `);
    return studentStats[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getSchoolInfo = async (userId) => {
  if (!(await hasPermission(userId, 'manage_school_settings') || await hasPermission(userId, 'view_reports'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [schoolRows] = await connection.execute(`
      SELECT school_id, school_name, school_address, region, division, district, school_head
      FROM school_defaults
      LIMIT 1
    `);
    return schoolRows[0] || {};
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getRecentLogs = async (userId) => {
  if (!(await hasPermission(userId, 'view_logs'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [logRows] = await connection.execute(`
      SELECT log_id, action, log_timestamp
      FROM activity_logs
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY log_timestamp DESC
      LIMIT 5
    `, [userId]);
    return logRows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getLatestBackup = async (userId) => {
  if (!(await hasPermission(userId, 'manage_backups'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [backupRows] = await connection.execute(`
      SELECT backup_id, backup_filename, backup_date
      FROM backups
      ORDER BY backup_date DESC
      LIMIT 1
    `);
    return backupRows[0] || {};
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getRecentRecords = async (userId) => {
  if (!(await hasPermission(userId, 'view_ecards') || await hasPermission(userId, 'upload_documents'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [recordRows] = await connection.execute(`
      SELECT sr.record_id, sr.student_id, s.lrn, s.first_name, s.last_name, 
             sr.grade_level, sr.section, sr.uploaded_at
      FROM school_records sr
      JOIN students s ON sr.student_id = s.student_id
      WHERE sr.is_deleted = FALSE
      ORDER BY sr.uploaded_at DESC
      LIMIT 5
    `);
    return recordRows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const logDashboardAccess = async (userId) => {
  const connection = await db.getConnection();
  try {
    await connection.execute(`
      INSERT INTO activity_logs (user_id, action)
      VALUES (?, 'Accessed dashboard')
    `, [userId]);
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};


const getTeacherDashboardStats = async (teacherId) => {
  const connection = await db.getConnection();
  try {
    const [teacherProfile] = await connection.query(`
      SELECT t.teacher_id, u.first_name, u.middle_name, u.last_name, u.email,
             t.teacher_address, t.date_of_birth, t.contact_number, t.is_active
      FROM teachers t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.teacher_id = ?
    `, [teacherId]);

    const [subjects] = await connection.query(`
      SELECT subj.subject_id, subj.subject_name, s.section_id, s.section_name, 
             gl.grade_name, sy.start_year, sy.end_year
      FROM teacher_assignments ta
      JOIN subjects subj ON ta.subject_id = subj.subject_id
      JOIN sections s ON ta.section_id = s.section_id
      JOIN grade_levels gl ON s.grade_level_id = gl.grade_level_id
      JOIN school_years sy ON ta.school_year_id = sy.school_year_id
      WHERE ta.teacher_id = ?
    `, [teacherId]);

    const [sections] = await connection.query(`
      SELECT s.section_id, s.section_name, gl.grade_name, sy.start_year, sy.end_year
      FROM teacher_assignments ta
      JOIN sections s ON ta.section_id = s.section_id
      JOIN grade_levels gl ON s.grade_level_id = gl.grade_level_id
      JOIN school_years sy ON ta.school_year_id = sy.school_year_id
      WHERE ta.teacher_id = ?
      GROUP BY s.section_id
    `, [teacherId]);

    const [students] = await connection.query(`
      SELECT DISTINCT st.student_id, st.first_name, st.last_name, st.gender, s.section_name, gl.grade_name
      FROM teacher_assignments ta
      JOIN sections s ON ta.section_id = s.section_id
      JOIN enrollment e ON e.section_id = s.section_id AND e.school_year_id = ta.school_year_id
      JOIN students st ON e.student_id = st.student_id
      JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
      WHERE ta.teacher_id = ?
    `, [teacherId]);

    const [schedule] = await connection.query(`
      SELECT cs.schedule_id, subj.subject_name, s.section_name, cs.day_of_week, cs.start_time, cs.end_time,
             sy.start_year, sy.end_year
      FROM class_schedule cs
      JOIN subjects subj ON cs.subject_id = subj.subject_id
      JOIN sections s ON cs.section_id = s.section_id
      JOIN school_years sy ON cs.school_year_id = sy.school_year_id
      WHERE cs.teacher_id = ?
    `, [teacherId]);

    const [[stats]] = await connection.query(`
      SELECT 
        COUNT(DISTINCT ta.section_id) AS total_sections,
        COUNT(DISTINCT ta.subject_id) AS total_subjects,
        COUNT(DISTINCT e.student_id) AS total_students
      FROM teacher_assignments ta
      JOIN sections s ON ta.section_id = s.section_id
      JOIN enrollment e ON e.section_id = s.section_id AND e.school_year_id = ta.school_year_id
      WHERE ta.teacher_id = ?
    `, [teacherId]);

    return {
      teacher: teacherProfile[0] || null,
      stats: stats || { total_sections: 0, total_subjects: 0, total_students: 0 },
      subjects,
      sections,
      students,
      schedule
    };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};



module.exports = {
  getUserDashboardInfo,
  getTeacherDashboardStats,
  getStudentStats,
  getSchoolInfo,
  getRecentLogs,
  getLatestBackup,
  getRecentRecords,
  logDashboardAccess
};