const db = require("../../config/db");

const fetchAllClassSchedules = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT cs.schedule_id, cs.subject_id, cs.teacher_id, cs.section_id, cs.school_year_id, 
              cs.day_of_week, cs.start_time, cs.end_time,
              sub.subject_name, 
              CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
              sec.section_name,
              CONCAT(sy.start_year, '-', sy.end_year) AS school_year
       FROM class_schedule cs
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       JOIN teachers t ON cs.teacher_id = t.teacher_id
       JOIN users u ON t.user_id = u.user_id  -- Changed to join with users table
       JOIN sections sec ON cs.section_id = sec.section_id
       JOIN school_years sy ON cs.school_year_id = sy.school_year_id
       ORDER BY sy.start_year DESC, sec.section_name, cs.day_of_week, cs.start_time`
    );

    return rows.map((row) => ({
      schedule_id: row.schedule_id,
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      teacher_id: row.teacher_id,
      teacher_name: row.teacher_name,
      section_id: row.section_id,
      section_name: row.section_name,
      school_year_id: row.school_year_id,
      school_year: row.school_year,
      day_of_week: row.day_of_week,
      start_time: row.start_time,
      end_time: row.end_time,
    }));
  } catch (err) {
    console.error("Error in fetchAllClassSchedules:", err);
    throw new Error(`Error fetching class schedules: ${err.message}`);
  }
};

const fetchClassScheduleById = async (scheduleId) => {
  try {
    const [rows] = await db.execute(
      `SELECT cs.schedule_id, cs.subject_id, cs.teacher_id, cs.section_id, cs.school_year_id, 
              cs.day_of_week, cs.start_time, cs.end_time,
              sub.subject_name, 
              CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,  -- Changed to u.first_name/u.last_name
              sec.section_name,
              CONCAT(sy.start_year, '-', sy.end_year) AS school_year
       FROM class_schedule cs
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       JOIN teachers t ON cs.teacher_id = t.teacher_id
       JOIN users u ON t.user_id = u.user_id  -- Added join to users table
       JOIN sections sec ON cs.section_id = sec.section_id
       JOIN school_years sy ON cs.school_year_id = sy.school_year_id
       WHERE cs.schedule_id = ?`,
      [scheduleId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      schedule_id: row.schedule_id,
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      teacher_id: row.teacher_id,
      teacher_name: row.teacher_name,
      section_id: row.section_id,
      section_name: row.section_name,
      school_year_id: row.school_year_id,
      school_year: row.school_year,
      day_of_week: row.day_of_week,
      start_time: row.start_time,
      end_time: row.end_time,
    };
  } catch (err) {
    console.error("Error in fetchClassScheduleById:", err);
    throw new Error(`Error fetching class schedule by ID: ${err.message}`);
  }
};

const createNewClassSchedule = async (scheduleData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const {
      subject_id,
      teacher_id,
      section_id,
      school_year_id,
      day_of_week,
      start_time,
      end_time,
    } = scheduleData;

    const [subject] = await connection.execute(
      "SELECT subject_id, subject_name FROM subjects WHERE subject_id = ?",
      [subject_id]
    );
    if (subject.length === 0) {
      throw new Error("Subject not found");
    }

    const [teacher] = await connection.execute(
      `SELECT t.teacher_id, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name 
       FROM teachers t 
       JOIN users u ON t.user_id = u.user_id 
       WHERE t.teacher_id = ?`,
      [teacher_id]
    );
    if (teacher.length === 0) {
      throw new Error("Teacher not found");
    }

    const [section] = await connection.execute(
      "SELECT section_id, section_name FROM sections WHERE section_id = ?",
      [section_id]
    );
    if (section.length === 0) {
      throw new Error("Section not found");
    }

    const [schoolYear] = await connection.execute(
      "SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?",
      [school_year_id]
    );
    if (schoolYear.length === 0) {
      throw new Error("School year not found");
    }

    const [assignment] = await connection.execute(
      "SELECT assignment_id FROM teacher_assignments WHERE teacher_id = ? AND subject_id = ? AND section_id = ? AND school_year_id = ?",
      [teacher_id, subject_id, section_id, school_year_id]
    );
    if (assignment.length === 0) {
      throw new Error(
        "Teacher not assigned to this subject in this section for this school year"
      );
    }

    const [teacherConflicts] = await connection.execute(
      `SELECT schedule_id FROM class_schedule 
       WHERE teacher_id = ? AND day_of_week = ? 
       AND NOT (end_time <= ? OR start_time >= ?)`,
      [teacher_id, day_of_week, start_time, end_time]
    );
    if (teacherConflicts.length > 0) {
      throw new Error("Schedule conflict for teacher");
    }

    const [sectionConflicts] = await connection.execute(
      `SELECT schedule_id FROM class_schedule 
       WHERE section_id = ? AND day_of_week = ? 
       AND NOT (end_time <= ? OR start_time >= ?)`,
      [section_id, day_of_week, start_time, end_time]
    );
    if (sectionConflicts.length > 0) {
      throw new Error("Schedule conflict for section");
    }

    const [result] = await connection.execute(
      "INSERT INTO class_schedule (subject_id, teacher_id, section_id, school_year_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        subject_id,
        teacher_id,
        section_id,
        school_year_id,
        day_of_week,
        start_time,
        end_time,
      ]
    );

    const scheduleId = result.insertId;
    console.log(
      `Class schedule created: schedule_id=${scheduleId}, day_of_week=${day_of_week}`
    );

    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [
        userId,
        `Created class schedule for subject ${subject[0].subject_name} taught by ${teacher[0].teacher_name} in section ${section[0].section_name} on ${day_of_week} from ${start_time} to ${end_time} in school year ${schoolYear[0].start_year}-${schoolYear[0].end_year}`,
      ]
    );

    await connection.commit();
    return await fetchClassScheduleById(scheduleId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in createNewClassSchedule:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const updateClassScheduleById = async (scheduleId, scheduleData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const {
      subject_id,
      teacher_id,
      section_id,
      school_year_id,
      day_of_week,
      start_time,
      end_time,
    } = scheduleData;

    const [existing] = await connection.execute(
      "SELECT * FROM class_schedule WHERE schedule_id = ?",
      [scheduleId]
    );
    if (existing.length === 0) {
      throw new Error("Class schedule not found");
    }

    const [subject] = await connection.execute(
      "SELECT subject_id, subject_name FROM subjects WHERE subject_id = ?",
      [subject_id]
    );
    if (subject.length === 0) {
      throw new Error("Subject not found");
    }

    const [teacher] = await connection.execute(
      `SELECT t.teacher_id, t.is_active, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
       FROM teachers t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.teacher_id = ?`,
      [teacher_id]
    );
    if (teacher.length === 0) {
      throw new Error("Teacher not found");
    }
    if (!teacher[0].is_active) {
      throw new Error("Teacher is not active");
    }

    const [section] = await connection.execute(
      "SELECT section_id, section_name FROM sections WHERE section_id = ?",
      [section_id]
    );
    if (section.length === 0) {
      throw new Error("Section not found");
    }

    const [schoolYear] = await connection.execute(
      "SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?",
      [school_year_id]
    );
    if (schoolYear.length === 0) {
      throw new Error("School year not found");
    }

    const [assignment] = await connection.execute(
      `SELECT assignment_id FROM teacher_assignments 
       WHERE teacher_id = ? AND subject_id = ? AND section_id = ? AND school_year_id = ?`,
      [teacher_id, subject_id, section_id, school_year_id]
    );
    if (assignment.length === 0) {
      throw new Error(
        "Teacher not assigned to this subject in this section for this school year"
      );
    }

    const [teacherConflicts] = await connection.execute(
      `SELECT schedule_id FROM class_schedule 
       WHERE teacher_id = ? AND day_of_week = ? 
       AND NOT (end_time <= ? OR start_time >= ?)
       AND schedule_id != ?`,
      [teacher_id, day_of_week, start_time, end_time, scheduleId]
    );
    if (teacherConflicts.length > 0) {
      throw new Error("Schedule conflict for teacher");
    }

    const [sectionConflicts] = await connection.execute(
      `SELECT schedule_id FROM class_schedule 
       WHERE section_id = ? AND day_of_week = ? 
       AND NOT (end_time <= ? OR start_time >= ?)
       AND schedule_id != ?`,
      [section_id, day_of_week, start_time, end_time, scheduleId]
    );
    if (sectionConflicts.length > 0) {
      throw new Error("Schedule conflict for section");
    }

    await connection.execute(
      `UPDATE class_schedule
       SET subject_id = ?, teacher_id = ?, section_id = ?, school_year_id = ?, 
           day_of_week = ?, start_time = ?, end_time = ?
       WHERE schedule_id = ?`,
      [
        subject_id,
        teacher_id,
        section_id,
        school_year_id,
        day_of_week,
        start_time,
        end_time,
        scheduleId,
      ]
    );

    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [
        userId,
        `Updated class schedule ID ${scheduleId}: subject ${subject[0].subject_name}, teacher ${teacher[0].teacher_name}, section ${section[0].section_name}, ${day_of_week} ${start_time}-${end_time} SY ${schoolYear[0].start_year}-${schoolYear[0].end_year}`,
      ]
    );

    await connection.commit();

    return await fetchClassScheduleById(scheduleId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in updateClassScheduleById:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};




const deleteClassScheduleById = async (scheduleId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingSchedule] = await connection.execute(
      `SELECT cs.schedule_id, cs.day_of_week, cs.start_time, cs.end_time,
              sub.subject_name, 
              CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
              sec.section_name,
              CONCAT(sy.start_year, '-', sy.end_year) AS school_year
       FROM class_schedule cs
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       JOIN teachers t ON cs.teacher_id = t.teacher_id
       JOIN sections sec ON cs.section_id = sec.section_id
       JOIN school_years sy ON cs.school_year_id = sy.school_year_id
       WHERE cs.schedule_id = ?`,
      [scheduleId]
    );
    if (existingSchedule.length === 0) {
      throw new Error("Class schedule not found");
    }

    const [result] = await connection.execute(
      "DELETE FROM class_schedule WHERE schedule_id = ?",
      [scheduleId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Class schedule not found");
    }

    console.log(`Class schedule deleted: schedule_id=${scheduleId}`);

    const logAction = `Deleted class schedule for subject ${existingSchedule[0].subject_name} taught by ${existingSchedule[0].teacher_name} in section ${existingSchedule[0].section_name} on ${existingSchedule[0].day_of_week} from ${existingSchedule[0].start_time} to ${existingSchedule[0].end_time} in school year ${existingSchedule[0].school_year}`;
    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [userId, logAction]
    );

    await connection.commit();
    return true;
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in deleteClassScheduleById:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  fetchAllClassSchedules,
  fetchClassScheduleById,
  createNewClassSchedule,
  updateClassScheduleById,
  deleteClassScheduleById,
};
