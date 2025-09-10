const db = require("../../config/db");

const fetchAllGrades = async (filters = {}) => {
  try {
    let query = `
      SELECT sg.grade_id, sg.enrollment_id, sg.subject_id, sg.grading_period, sg.grade,
             st.student_id, st.lrn, st.first_name, st.middle_name, st.last_name,
             s.subject_code, s.subject_name,
             sec.section_id, sec.section_name,
             gl.grade_name, gl.grade_order, sy.start_year, sy.end_year
      FROM student_grades sg
      JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
      JOIN students st ON e.student_id = st.student_id
      JOIN subjects s ON sg.subject_id = s.subject_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
      JOIN school_years sy ON e.school_year_id = sy.school_year_id
      WHERE 1=1
    `;

    const params = [];

    if (filters.school_year_id) {
      query += " AND e.school_year_id = ?";
      params.push(filters.school_year_id);
    }

    if (filters.grading_period) {
      query += " AND sg.grading_period = ?";
      params.push(filters.grading_period);
    }

    query += `
      ORDER BY sy.start_year DESC, gl.grade_order ASC, sec.section_name ASC,
               st.last_name ASC, st.first_name ASC, s.subject_name ASC, sg.grading_period ASC
    `;

    const [rows] = await db.execute(query, params);

    return rows.map((row) => ({
      grade_id: row.grade_id,
      enrollment_id: row.enrollment_id,
      student: {
        student_id: row.student_id,
        lrn: row.lrn,
        name: `${row.first_name} ${
          row.middle_name ? row.middle_name + " " : ""
        }${row.last_name}`,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
      },
      subject: {
        subject_id: row.subject_id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
      },
      section: {
        section_id: row.section_id,
        section_name: row.section_name,
      },
      grade_level: row.grade_name,
      school_year: `${row.start_year}-${row.end_year}`,
      grading_period: row.grading_period,
      grade: row.grade,
    }));
  } catch (err) {
    console.error("Error in fetchAllGrades:", err);
    throw new Error(`Error fetching grades: ${err.message}`);
  }
};

const fetchGradesByStudent = async (filters) => {
  try {
    let query = `
      SELECT sg.grade_id, sg.enrollment_id, sg.subject_id, sg.grading_period, sg.grade,
             st.student_id, st.lrn, st.first_name, st.middle_name, st.last_name,
             s.subject_code, s.subject_name,
             sec.section_id, sec.section_name,
             gl.grade_name, sy.start_year, sy.end_year
      FROM student_grades sg
      JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
      JOIN students st ON e.student_id = st.student_id
      JOIN subjects s ON sg.subject_id = s.subject_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
      JOIN school_years sy ON e.school_year_id = sy.school_year_id
      WHERE st.student_id = ?
    `;

    const params = [filters.student_id];

    if (filters.school_year_id) {
      query += " AND e.school_year_id = ?";
      params.push(filters.school_year_id);
    }

    if (filters.grading_period) {
      query += " AND sg.grading_period = ?";
      params.push(filters.grading_period);
    }

    query += " ORDER BY sy.start_year DESC, s.subject_name, sg.grading_period";

    const [rows] = await db.execute(query, params);

    return rows.map((row) => ({
      grade_id: row.grade_id,
      enrollment_id: row.enrollment_id,
      student: {
        student_id: row.student_id,
        lrn: row.lrn,
        name: `${row.first_name} ${
          row.middle_name ? row.middle_name + " " : ""
        }${row.last_name}`,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
      },
      subject: {
        subject_id: row.subject_id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
      },
      section: {
        section_id: row.section_id,
        section_name: row.section_name,
      },
      grade_level: row.grade_name,
      school_year: `${row.start_year}-${row.end_year}`,
      grading_period: row.grading_period,
      grade: row.grade,
    }));
  } catch (err) {
    console.error("Error in fetchGradesByStudent:", err);
    throw new Error(`Error fetching student grades: ${err.message}`);
  }
};

const fetchGradesBySection = async (filters) => {
  try {
    let query = `
      SELECT sg.grade_id, sg.enrollment_id, sg.subject_id, sg.grading_period, sg.grade,
             st.student_id, st.lrn, st.first_name, st.middle_name, st.last_name,
             s.subject_code, s.subject_name,
             sec.section_id, sec.section_name,
             gl.grade_name, sy.start_year, sy.end_year
      FROM student_grades sg
      JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
      JOIN students st ON e.student_id = st.student_id
      JOIN subjects s ON sg.subject_id = s.subject_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
      JOIN school_years sy ON e.school_year_id = sy.school_year_id
      WHERE sec.section_id = ?
    `;

    const params = [filters.section_id];

    if (filters.grading_period) {
      query += " AND sg.grading_period = ?";
      params.push(filters.grading_period);
    }

    if (filters.subject_id) {
      query += " AND sg.subject_id = ?";
      params.push(filters.subject_id);
    }

    query +=
      " ORDER BY st.last_name, st.first_name, s.subject_name, sg.grading_period";

    const [rows] = await db.execute(query, params);

    return rows.map((row) => ({
      grade_id: row.grade_id,
      enrollment_id: row.enrollment_id,
      student: {
        student_id: row.student_id,
        lrn: row.lrn,
        name: `${row.first_name} ${
          row.middle_name ? row.middle_name + " " : ""
        }${row.last_name}`,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
      },
      subject: {
        subject_id: row.subject_id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
      },
      section: {
        section_id: row.section_id,
        section_name: row.section_name,
      },
      grade_level: row.grade_name,
      school_year: `${row.start_year}-${row.end_year}`,
      grading_period: row.grading_period,
      grade: row.grade,
    }));
  } catch (err) {
    console.error("Error in fetchGradesBySection:", err);
    throw new Error(`Error fetching section grades: ${err.message}`);
  }
};

const fetchGradesByTeacher = async (filters) => {
  try {
    let query = `
      SELECT sg.grade_id, sg.enrollment_id, sg.subject_id, sg.grading_period, sg.grade,
             st.student_id, st.lrn, st.first_name, st.middle_name, st.last_name,
             s.subject_code, s.subject_name,
             sec.section_id, sec.section_name,
             gl.grade_name, sy.start_year, sy.end_year,
             t.teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM student_grades sg
      JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
      JOIN students st ON e.student_id = st.student_id
      JOIN subjects s ON sg.subject_id = s.subject_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
      JOIN school_years sy ON e.school_year_id = sy.school_year_id
      JOIN teacher_assignments ta ON ta.subject_id = sg.subject_id AND ta.section_id = sec.section_id AND ta.school_year_id = sy.school_year_id
      JOIN teachers t ON ta.teacher_id = t.teacher_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.teacher_id = ?
    `;

    const params = [filters.teacher_id];

    if (filters.school_year_id) {
      query += " AND e.school_year_id = ?";
      params.push(filters.school_year_id);
    }

    if (filters.grading_period) {
      query += " AND sg.grading_period = ?";
      params.push(filters.grading_period);
    }

    if (filters.section_id) {
      query += " AND sec.section_id = ?";
      params.push(filters.section_id);
    }

    if (filters.subject_id) {
      query += " AND sg.subject_id = ?";
      params.push(filters.subject_id);
    }

    query +=
      " ORDER BY sec.section_name, s.subject_name, st.last_name, st.first_name, sg.grading_period";

    const [rows] = await db.execute(query, params);

    return rows.map((row) => ({
      grade_id: row.grade_id,
      enrollment_id: row.enrollment_id,
      student: {
        student_id: row.student_id,
        lrn: row.lrn,
        name: `${row.first_name} ${
          row.middle_name ? row.middle_name + " " : ""
        }${row.last_name}`,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
      },
      subject: {
        subject_id: row.subject_id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
      },
      section: {
        section_id: row.section_id,
        section_name: row.section_name,
      },
      grade_level: row.grade_name,
      school_year: `${row.start_year}-${row.end_year}`,
      grading_period: row.grading_period,
      grade: row.grade,
      teacher: {
        teacher_id: row.teacher_id,
        name: `${row.teacher_first_name} ${row.teacher_last_name}`,
      },
    }));
  } catch (err) {
    console.error("Error in fetchGradesByTeacher:", err);
    throw new Error(`Error fetching teacher grades: ${err.message}`);
  }
};

const createOrUpdateGradeRecord = async (gradeData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [teacherRows] = await connection.execute(
      `SELECT teacher_id 
       FROM teachers 
       WHERE user_id = ? AND is_active = TRUE`,
      [userId]
    );

    if (teacherRows.length === 0) {
      throw new Error("User is not assigned as an active teacher");
    }
    const teacherId = teacherRows[0].teacher_id;

    const [enrollment] = await connection.execute(
      `SELECT e.enrollment_id,
          st.student_id, st.first_name, st.last_name,
          sec.section_id, sec.section_name,
          gl.grade_level_id, gl.grade_name,
          sy.school_year_id, 
          sy.start_year, 
          sy.end_year
   FROM enrollment e
   JOIN students st ON e.student_id = st.student_id
   JOIN sections sec ON e.section_id = sec.section_id
   JOIN grade_levels gl ON sec.grade_level_id = gl.grade_level_id
   JOIN school_years sy ON e.school_year_id = sy.school_year_id
   WHERE e.enrollment_id = ?`,
      [gradeData.enrollment_id]
    );

    if (enrollment.length === 0) {
      throw new Error("Enrollment not found");
    }

    const sectionId = enrollment[0].section_id;
    const schoolYearId = enrollment[0].school_year_id;

    const [subject] = await connection.execute(
      `SELECT subject_id, subject_name 
       FROM subjects 
       WHERE subject_id = ?`,
      [gradeData.subject_id]
    );
    if (subject.length === 0) {
      throw new Error("Subject not found");
    }

    const [assignmentRows] = await connection.execute(
      `SELECT assignment_id
       FROM teacher_assignments
       WHERE teacher_id = ? AND subject_id = ? AND section_id = ? AND school_year_id = ?`,
      [teacherId, gradeData.subject_id, sectionId, schoolYearId]
    );
    if (assignmentRows.length === 0) {
      throw new Error("Teacher not assigned to this subject/section");
    }

    const [inputStatusRows] = await connection.execute(
      `SELECT input_enabled
       FROM grade_input_control
       WHERE teacher_id = ? LIMIT 1`,
      [teacherId]
    );
    const canInput =
      inputStatusRows.length > 0 ? !!inputStatusRows[0].input_enabled : true;
    if (!canInput) {
      throw new Error("Grade input is disabled");
    }

    const [existingGrade] = await connection.execute(
      `SELECT grade_id, grade
       FROM student_grades
       WHERE enrollment_id = ? AND subject_id = ? AND grading_period = ?`,
      [gradeData.enrollment_id, gradeData.subject_id, gradeData.grading_period]
    );

    let result;
    let isNew = false;

    if (existingGrade.length > 0) {
      await connection.execute(
        `UPDATE student_grades SET grade = ? WHERE grade_id = ?`,
        [gradeData.grade, existingGrade[0].grade_id]
      );
      result = { ...existingGrade[0], grade: gradeData.grade };
    } else {
      const [insertResult] = await connection.execute(
        `INSERT INTO student_grades (enrollment_id, subject_id, grading_period, grade)
         VALUES (?, ?, ?, ?)`,
        [
          gradeData.enrollment_id,
          gradeData.subject_id,
          gradeData.grading_period,
          gradeData.grade,
        ]
      );
      result = { grade_id: insertResult.insertId, ...gradeData };
      isNew = true;
    }

    await connection.execute(
      `INSERT INTO activity_logs (user_id, action, log_timestamp) 
       VALUES (?, ?, NOW())`,
      [
        userId,
        `${isNew ? "Created" : "Updated"} grade for student ${
          enrollment[0].first_name
        } ${enrollment[0].last_name} in subject ${
          subject[0].subject_name
        }, period ${gradeData.grading_period}`,
      ]
    );

    await connection.commit();

    return {
      isNew,
      grade: {
        grade_id: result.grade_id,
        grade: result.grade,
        grading_period: gradeData.grading_period,
        subject: {
          id: subject[0].subject_id,
          name: subject[0].subject_name,
        },
        student: {
          id: enrollment[0].student_id,
          name: `${enrollment[0].first_name} ${enrollment[0].last_name}`,
        },
        section: {
          id: enrollment[0].section_id,
          name: enrollment[0].section_name,
        },
        grade_level: {
          id: enrollment[0].grade_level_id,
          name: enrollment[0].grade_level_name,
        },
      },
    };
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in createOrUpdateGradeRecord:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const deleteGradeById = async (gradeId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingGrade] = await connection.execute(
      `SELECT sg.grade_id, sg.grade, sg.grading_period,
              st.first_name, st.middle_name, st.last_name, s.subject_name
       FROM student_grades sg
       JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
       JOIN students st ON e.student_id = st.student_id
       JOIN subjects s ON sg.subject_id = s.subject_id
       WHERE sg.grade_id = ?`,
      [gradeId]
    );

    if (existingGrade.length === 0) return false;

    const [result] = await connection.execute(
      "DELETE FROM student_grades WHERE grade_id = ?",
      [gradeId]
    );

    if (result.affectedRows === 0) return false;

    const studentName = `${existingGrade[0].first_name} ${
      existingGrade[0].middle_name ? existingGrade[0].middle_name + " " : ""
    }${existingGrade[0].last_name}`;
    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [
        userId,
        `Deleted grade for student ${studentName} in subject ${existingGrade[0].subject_name} (${existingGrade[0].grading_period} grading period): ${existingGrade[0].grade}`,
      ]
    );

    await connection.commit();
    return true;
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in deleteGradeById:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const getTeacherInputStatus = async (teacherId) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      `SELECT input_enabled
       FROM grade_input_control
       WHERE teacher_id = ?
       LIMIT 1`,
      [teacherId]
    );
    return rows.length > 0 ? !!rows[0].input_enabled : false;
  } catch (err) {
    console.error("Error in getTeacherInputStatus:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const setGradeInputStatusForTeacher = async (teacherId, status, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.execute(
      `INSERT INTO grade_input_control (teacher_id, input_enabled)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE input_enabled = ?`,
      [teacherId, status, status]
    );

    await connection.execute(
      `INSERT INTO activity_logs (user_id, action, log_timestamp)
       VALUES (?, ?, NOW())`,
      [
        userId,
        `Toggled grade input ${
          status ? "enabled" : "disabled"
        } for teacher ID ${teacherId}`,
      ]
    );

    await connection.commit();
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in setGradeInputStatusForTeacher:", err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const getGradeInputStatusByTeacher = async (teacherId) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      `SELECT input_enabled
       FROM grade_input_control
       WHERE teacher_id = ?
       LIMIT 1`,
      [teacherId]
    );

    return {
      input_enabled: rows.length > 0 ? !!rows[0].input_enabled : true,
    };
  } catch (err) {
    console.error("Error in getGradeInputStatusByTeacher:", err);
    throw new Error(`Error getting grade input status: ${err.message}`);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  fetchAllGrades,
  fetchGradesByStudent,
  fetchGradesBySection,
  fetchGradesByTeacher,
  createOrUpdateGradeRecord,
  deleteGradeById,
  getTeacherInputStatus,
  setGradeInputStatusForTeacher,
  getGradeInputStatusByTeacher,
};
