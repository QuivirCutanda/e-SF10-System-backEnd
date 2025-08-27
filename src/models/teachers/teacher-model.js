const db = require('../../config/db');

const fetchAllTeachers = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT teacher_id, first_name, middle_name, last_name, extension_name, 
              teacher_address, date_of_birth, email, contact_number, is_active,
              created_at, updated_at
       FROM teachers
       ORDER BY last_name, first_name`
    );

    return rows.map(row => ({
      teacher_id: row.teacher_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      extension_name: row.extension_name,
      full_name: `${row.first_name}${row.middle_name ? ' ' + row.middle_name : ''} ${row.last_name}${row.extension_name ? ' ' + row.extension_name : ''}`,
      teacher_address: row.teacher_address,
      date_of_birth: row.date_of_birth,
      email: row.email,
      contact_number: row.contact_number,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } catch (err) {
    console.error('Error in fetchAllTeachers:', err);
    throw new Error(`Error fetching teachers: ${err.message}`);
  }
};

const fetchTeacherById = async (teacherId) => {
  try {
    const [rows] = await db.execute(
      `SELECT teacher_id, first_name, middle_name, last_name, extension_name, 
              teacher_address, date_of_birth, email, contact_number, is_active,
              created_at, updated_at
       FROM teachers
       WHERE teacher_id = ?`,
      [teacherId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      teacher_id: row.teacher_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      extension_name: row.extension_name,
      full_name: `${row.first_name}${row.middle_name ? ' ' + row.middle_name : ''} ${row.last_name}${row.extension_name ? ' ' + row.extension_name : ''}`,
      teacher_address: row.teacher_address,
      date_of_birth: row.date_of_birth,
      email: row.email,
      contact_number: row.contact_number,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  } catch (err) {
    console.error('Error in fetchTeacherById:', err);
    throw new Error(`Error fetching teacher by ID: ${err.message}`);
  }
};

const createNewTeacher = async (teacherData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { 
      first_name, 
      middle_name, 
      last_name, 
      extension_name, 
      teacher_address, 
      date_of_birth, 
      email, 
      contact_number 
    } = teacherData;

    if (email) {
      const [existingTeacher] = await connection.execute(
        'SELECT teacher_id FROM teachers WHERE email = ?',
        [email]
      );
      if (existingTeacher.length > 0) {
        throw new Error('Email already exists');
      }
    }

    const [result] = await connection.execute(
      `INSERT INTO teachers 
       (first_name, middle_name, last_name, extension_name, teacher_address, 
        date_of_birth, email, contact_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, middle_name, last_name, extension_name, teacher_address, 
       date_of_birth, email, contact_number]
    );

    const teacherId = result.insertId;
    const fullName = `${first_name}${middle_name ? ' ' + middle_name : ''} ${last_name}${extension_name ? ' ' + extension_name : ''}`;
    
    console.log(`Teacher created: teacher_id=${teacherId}, name=${fullName}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Created teacher: ${fullName}`]
    );

    await connection.commit();
    return await fetchTeacherById(teacherId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in createNewTeacher:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const updateTeacherById = async (teacherId, teacherData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { 
      first_name, 
      middle_name, 
      last_name, 
      extension_name, 
      teacher_address, 
      date_of_birth, 
      email, 
      contact_number, 
      is_active 
    } = teacherData;

    const [existingTeacher] = await connection.execute(
      'SELECT teacher_id, first_name, middle_name, last_name, extension_name FROM teachers WHERE teacher_id = ?',
      [teacherId]
    );
    if (existingTeacher.length === 0) {
      throw new Error('Teacher not found');
    }

    if (email) {
      const [duplicateEmail] = await connection.execute(
        'SELECT teacher_id FROM teachers WHERE email = ? AND teacher_id != ?',
        [email, teacherId]
      );
      if (duplicateEmail.length > 0) {
        throw new Error('Email already exists');
      }
    }

    const [result] = await connection.execute(
      `UPDATE teachers 
       SET first_name = ?, middle_name = ?, last_name = ?, extension_name = ?, 
           teacher_address = ?, date_of_birth = ?, email = ?, contact_number = ?, 
           is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE teacher_id = ?`,
      [first_name, middle_name, last_name, extension_name, teacher_address, 
       date_of_birth, email, contact_number, is_active, teacherId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Teacher not found');
    }

    const oldFullName = `${existingTeacher[0].first_name}${existingTeacher[0].middle_name ? ' ' + existingTeacher[0].middle_name : ''} ${existingTeacher[0].last_name}${existingTeacher[0].extension_name ? ' ' + existingTeacher[0].extension_name : ''}`;
    const newFullName = `${first_name}${middle_name ? ' ' + middle_name : ''} ${last_name}${extension_name ? ' ' + extension_name : ''}`;
    
    console.log(`Teacher updated: teacher_id=${teacherId}, name=${newFullName}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Updated teacher ID ${teacherId}: from "${oldFullName}" to "${newFullName}"`]
    );

    await connection.commit();
    return await fetchTeacherById(teacherId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in updateTeacherById:', err);
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
      throw new Error('Teacher not found');
    }

    const currentStatus = Boolean(existingTeacher[0].is_active);
    const newStatus = !currentStatus;

    const [result] = await connection.execute(
      'UPDATE teachers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE teacher_id = ?',
      [newStatus, teacherId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Teacher not found');
    }

    const fullName = `${existingTeacher[0].first_name}${existingTeacher[0].middle_name ? ' ' + existingTeacher[0].middle_name : ''} ${existingTeacher[0].last_name}${existingTeacher[0].extension_name ? ' ' + existingTeacher[0].extension_name : ''}`;
    const statusAction = newStatus ? 'activated' : 'deactivated';
    
    console.log(`Teacher ${statusAction}: teacher_id=${teacherId}, name=${fullName}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `${statusAction.charAt(0).toUpperCase() + statusAction.slice(1)} teacher: ${fullName}`]
    );

    await connection.commit();
    return await fetchTeacherById(teacherId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in toggleTeacherStatusById:', err);
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
  toggleTeacherStatusById 
};