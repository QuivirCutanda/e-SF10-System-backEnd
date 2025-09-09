const db = require("../../config/db");

const fetchAllTeachers = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          t.teacher_id,
          u.user_id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.email,
          t.teacher_address,
          t.date_of_birth,
          t.contact_number,
          t.is_active,
          t.created_at,
          t.updated_at
       FROM teachers t
       INNER JOIN users u ON t.user_id = u.user_id
       ORDER BY u.last_name, u.first_name`
    );

    return rows.map((row) => ({
      teacher_id: row.teacher_id,
      user_id: row.user_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      full_name: `${row.first_name}${
        row.middle_name ? " " + row.middle_name : ""
      } ${row.last_name}`,
      teacher_address: row.teacher_address,
      date_of_birth: row.date_of_birth
        ? row.date_of_birth.toISOString().split("T")[0]
        : null, // normalize YYYY-MM-DD
      email: row.email,
      contact_number: row.contact_number,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (err) {
    console.error("Error in fetchAllTeachers:", err);
    throw new Error(`Error fetching teachers: ${err.message}`);
  }
};

const fetchTeacherById = async (teacherId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          t.teacher_id,
          u.user_id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.email,
          t.teacher_address,
          t.date_of_birth,
          t.contact_number,
          t.is_active,
          t.created_at,
          t.updated_at
       FROM teachers t
       INNER JOIN users u ON t.user_id = u.user_id
       WHERE t.teacher_id = ?`,
      [teacherId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      teacher_id: row.teacher_id,
      user_id: row.user_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      full_name: `${row.first_name}${
        row.middle_name ? " " + row.middle_name : ""
      } ${row.last_name}`,
      teacher_address: row.teacher_address,
      date_of_birth: row.date_of_birth
        ? row.date_of_birth.toISOString().split("T")[0]
        : null,
      email: row.email,
      contact_number: row.contact_number,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (err) {
    console.error("Error in fetchTeacherById:", err);
    throw new Error(`Error fetching teacher by ID: ${err.message}`);
  }
};

const createNewTeacher = async (teacherData, adminUserId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const {
      first_name,
      middle_name,
      last_name,
      extension_name,
      email,
      password,
      teacher_address,
      date_of_birth,
      contact_number,
    } = teacherData;

    const [existingUser] = await connection.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      throw new Error("Email already exists");
    }

    const [userResult] = await connection.execute(
      `INSERT INTO users 
       (first_name, middle_name, last_name, extension_name, email, password, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [first_name, middle_name, last_name, extension_name, email, password]
    );
    const newUserId = userResult.insertId;

    const [teacherResult] = await connection.execute(
      `INSERT INTO teachers 
       (user_id, teacher_address, date_of_birth, contact_number, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [newUserId, teacher_address, date_of_birth, contact_number]
    );
    const newTeacherId = teacherResult.insertId;

    const [teacherRole] = await connection.execute(
      "SELECT role_id FROM roles WHERE role_name = 'teacher' LIMIT 1"
    );
    if (teacherRole.length > 0) {
      await connection.execute(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`,
        [newUserId, teacherRole[0].role_id]
      );
    }

    const fullName = `${first_name}${middle_name ? " " + middle_name : ""} ${last_name}`;
    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [
        adminUserId,
        `Created teacher: ${fullName} (user_id=${newUserId}, teacher_id=${newTeacherId})`
      ]
    );

    await connection.commit();

    return {
      teacher_id: newTeacherId,
      user_id: newUserId,
      first_name,
      middle_name,
      last_name,
      extension_name,
      email,
      teacher_address,
      date_of_birth,
      contact_number,
      role: "teacher"
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};


const updateTeacherById = async (teacherId, teacherData, adminUserId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const {
      first_name,
      middle_name,
      last_name,
      extension_name,
      email,
      teacher_address,
      date_of_birth,
      contact_number,
      is_active,
    } = teacherData;

    const [existingTeacher] = await connection.execute(
      `SELECT 
      t.teacher_id, 
      t.user_id, 
      u.first_name, 
      u.middle_name, 
      u.last_name, 
      u.extension_name
   FROM teachers t
   INNER JOIN users u ON t.user_id = u.user_id
   WHERE t.teacher_id = ?`,
      [teacherId]
    );

    if (existingTeacher.length === 0) {
      throw new Error("Teacher not found");
    }

    const userId = existingTeacher[0].user_id;

    if (email) {
      const [duplicateEmail] = await connection.execute(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
        [email, userId]
      );
      if (duplicateEmail.length > 0) {
        throw new Error("Email already exists");
      }
    }

    await connection.execute(
      `UPDATE users 
       SET first_name = ?, middle_name = ?, last_name = ?,extension_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [first_name, middle_name, last_name, extension_name, email, userId]
    );

    await connection.execute(
      `UPDATE teachers 
       SET teacher_address = ?, date_of_birth = ?, contact_number = ?, 
           is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE teacher_id = ?`,
      [teacher_address, date_of_birth, contact_number, is_active, teacherId]
    );

    const oldFullName = `${existingTeacher[0].first_name}${
      existingTeacher[0].middle_name ? " " + existingTeacher[0].middle_name : ""
    } ${existingTeacher[0].last_name}`;
    const newFullName = `${first_name}${
      middle_name ? " " + middle_name : ""
    } ${last_name}`;

    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [
        adminUserId,
        `Updated teacher ID ${teacherId}: from "${oldFullName}" to "${newFullName}"`,
      ]
    );

    await connection.commit();

    const [updated] = await connection.execute(
      `SELECT 
          t.teacher_id, u.user_id, u.first_name, u.middle_name, u.last_name, u.extension_name, u.email,
          t.teacher_address, t.date_of_birth, t.contact_number, t.is_active,
          t.created_at, t.updated_at
       FROM teachers t
       INNER JOIN users u ON t.user_id = u.user_id
       WHERE t.teacher_id = ?`,
      [teacherId]
    );

    return updated[0] || null;
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in updateTeacherById:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const toggleTeacherStatusById = async (teacherId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingTeacher] = await connection.execute(
      `SELECT teacher_id, first_name, middle_name, last_name, extension_name, is_active
       FROM teachers
       WHERE teacher_id = ?`,
      [teacherId]
    );
    if (existingTeacher.length === 0) {
      throw new Error("Teacher not found");
    }

    const currentStatus = Boolean(existingTeacher[0].is_active);
    const newStatus = !currentStatus;

    const [result] = await connection.execute(
      "UPDATE teachers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE teacher_id = ?",
      [newStatus, teacherId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Teacher not found");
    }

    const fullName = `${existingTeacher[0].first_name}${
      existingTeacher[0].middle_name ? " " + existingTeacher[0].middle_name : ""
    } ${existingTeacher[0].last_name}${
      existingTeacher[0].extension_name
        ? " " + existingTeacher[0].extension_name
        : ""
    }`;
    const statusAction = newStatus ? "activated" : "deactivated";

    console.log(
      `Teacher ${statusAction}: teacher_id=${teacherId}, name=${fullName}`
    );

    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [
        userId,
        `${
          statusAction.charAt(0).toUpperCase() + statusAction.slice(1)
        } teacher: ${fullName}`,
      ]
    );

    await connection.commit();
    return await fetchTeacherById(teacherId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in toggleTeacherStatusById:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  fetchAllTeachers,
  fetchTeacherById,
  createNewTeacher,
  updateTeacherById,
  toggleTeacherStatusById,
};
