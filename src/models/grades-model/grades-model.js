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

    // Get teacher information
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

    // Check if grade input is enabled for this teacher
    const [inputStatusRows] = await connection.execute(
      `SELECT input_enabled
       FROM grade_input_control
       WHERE teacher_id = ? LIMIT 1`,
      [teacherId]
    );
    
    const canInput = inputStatusRows.length > 0 ? !!inputStatusRows[0].input_enabled : true;
    if (!canInput) {
      throw new Error("Grade input is disabled for this teacher");
    }

    // Get enrollment details with active school year validation
    const [enrollment] = await connection.execute(
      `SELECT e.enrollment_id,
          e.student_id, 
          st.first_name, st.last_name,
          e.section_id, 
          sec.section_name,
          e.grade_level_id, 
          gl.grade_name,
          e.school_year_id, 
          sy.start_year, 
          sy.end_year,
          sy.is_active,
          e.status as enrollment_status
       FROM enrollment e
       JOIN students st ON e.student_id = st.student_id
       JOIN sections sec ON e.section_id = sec.section_id
       JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
       JOIN school_years sy ON e.school_year_id = sy.school_year_id
       WHERE e.enrollment_id = ?`,
      [gradeData.enrollment_id]
    );

    if (enrollment.length === 0) {
      throw new Error("Enrollment not found");
    }

    const enrollmentData = enrollment[0];

    // Validate active school year
    if (!enrollmentData.is_active) {
      throw new Error("Cannot input grades for inactive school year");
    }

    // Validate enrollment status
    if (enrollmentData.enrollment_status !== 'Enrolled') {
      throw new Error(`Student is not currently enrolled (status: ${enrollmentData.enrollment_status})`);
    }

    // Validate subject exists
    const [subject] = await connection.execute(
      `SELECT subject_id, subject_name 
       FROM subjects 
       WHERE subject_id = ?`,
      [gradeData.subject_id]
    );
    
    if (subject.length === 0) {
      throw new Error("Subject not found");
    }

    // Check if teacher is assigned to this subject/section for the active school year
    const [assignmentRows] = await connection.execute(
      `SELECT ta.assignment_id
       FROM teacher_assignments ta
       JOIN school_years sy ON ta.school_year_id = sy.school_year_id
       WHERE ta.teacher_id = ? 
         AND ta.subject_id = ? 
         AND ta.section_id = ? 
         AND sy.is_active = TRUE`,
      [teacherId, gradeData.subject_id, enrollmentData.section_id]
    );
    
    if (assignmentRows.length === 0) {
      throw new Error("Teacher not assigned to this subject/section for the active school year");
    }

    // Check for existing grade
    const [existingGrade] = await connection.execute(
      `SELECT grade_id, grade
       FROM student_grades
       WHERE enrollment_id = ? AND subject_id = ? AND grading_period = ?`,
      [gradeData.enrollment_id, gradeData.subject_id, gradeData.grading_period]
    );

    let result;
    let isNew = false;

    // Update or insert grade
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

    // Log the activity
    await connection.execute(
      `INSERT INTO activity_logs (user_id, action, log_timestamp) 
       VALUES (?, ?, NOW())`,
      [
        userId,
        `${isNew ? "Created" : "Updated"} grade for student ${
          enrollmentData.first_name
        } ${enrollmentData.last_name} in subject ${
          subject[0].subject_name
        }, period ${gradeData.grading_period}: ${gradeData.grade || 'NULL'}`,
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
          id: enrollmentData.student_id,
          name: `${enrollmentData.first_name} ${enrollmentData.last_name}`,
        },
        section: {
          id: enrollmentData.section_id,
          name: enrollmentData.section_name,
        },
        grade_level: {
          id: enrollmentData.grade_level_id,
          name: enrollmentData.grade_name,
        },
        school_year: {
          id: enrollmentData.school_year_id,
          years: `${enrollmentData.start_year}-${enrollmentData.end_year}`,
          is_active: enrollmentData.is_active
        }
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

const fetchStudentsByTeacher = async (teacherId) => {
  try {
    const query = `
      SELECT 
        e.enrollment_id,
        st.student_id,
        st.lrn,
        CONCAT(st.first_name, ' ', COALESCE(st.middle_name, ''), ' ', st.last_name, ' ', COALESCE(st.extension_name, '')) AS student_name,
        sec.section_id,
        sec.section_name,
        gl.grade_level_id,
        gl.grade_name,
        gl.grade_order,
        sy.school_year_id,
        CONCAT(sy.start_year, '-', sy.end_year) AS school_year,
        sub.subject_id,
        sub.subject_code,
        sub.subject_name,
        t.teacher_id,
        CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name, ' ', COALESCE(u.extension_name, '')) AS teacher_name,
        sg.grading_period,
        sg.grade
      FROM teacher_assignments ta
      JOIN sections sec ON ta.section_id = sec.section_id
      JOIN enrollment e ON sec.section_id = e.section_id
      JOIN students st ON e.student_id = st.student_id
      JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
      JOIN school_years sy ON e.school_year_id = sy.school_year_id
      JOIN subjects sub ON ta.subject_id = sub.subject_id
      JOIN teachers t ON ta.teacher_id = t.teacher_id
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN student_grades sg ON e.enrollment_id = sg.enrollment_id AND sub.subject_id = sg.subject_id
      WHERE ta.teacher_id = ?
        AND sy.is_active = TRUE
        AND e.status = 'Enrolled'
      ORDER BY gl.grade_order ASC, sec.section_name ASC, st.last_name ASC, st.first_name ASC, sub.subject_name ASC
    `;

    const [rows] = await db.execute(query, [teacherId]);

    const allGradingPeriods = ['1st', '2nd', '3rd', '4th'];
    const studentsMap = new Map();
    const subjectGradesMap = new Map();

    rows.forEach((row) => {
      const studentKey = `${row.student_id}`;
      const subjectKey = `${row.student_id}-${row.subject_id}`;

      if (!studentsMap.has(studentKey)) {
        studentsMap.set(studentKey, {
          enrollment_id: row.enrollment_id,  
          student_id: row.student_id,
          lrn: row.lrn,
          student_name: row.student_name.trim(),
          section: {
            section_id: row.section_id,
            section_name: row.section_name,
          },
          grade_level: {
            grade_level_id: row.grade_level_id,
            grade_name: row.grade_name,
            grade_order: row.grade_order
          },
          school_year: {
            school_year_id: row.school_year_id,
            school_year: row.school_year,
          },
          subjects: [],
          general_average: null
        });
      }

      if (!subjectGradesMap.has(subjectKey)) {
        const subjectData = {
          subject_id: row.subject_id,
          subject_code: row.subject_code,
          subject_name: row.subject_name,
          teacher: {
            teacher_id: row.teacher_id,
            teacher_name: row.teacher_name
          },
          grades: allGradingPeriods.map(period => ({
            grading_period: period,
            grade: null
          })),
          subject_average: null
        };
        subjectGradesMap.set(subjectKey, subjectData);
      }

      if (row.grading_period && row.grade !== null) {
        const subjectData = subjectGradesMap.get(subjectKey);
        const gradeIndex = subjectData.grades.findIndex(g => g.grading_period === row.grading_period);
        if (gradeIndex !== -1) {
          subjectData.grades[gradeIndex].grade = row.grade;
        }
      }
    });

    const result = Array.from(studentsMap.values()).map(student => {
      const studentSubjects = Array.from(subjectGradesMap.entries())
        .filter(([key]) => key.startsWith(`${student.student_id}-`))
        .map(([, subject]) => {
          const validGrades = subject.grades.filter(g => g.grade !== null);
          if (validGrades.length > 0) {
            const sum = validGrades.reduce((total, g) => total + parseFloat(g.grade), 0);
            subject.subject_average = parseFloat((sum / validGrades.length).toFixed(2));
          }
          return subject;
        });

      const validSubjectAverages = studentSubjects
        .filter(subject => subject.subject_average !== null)
        .map(subject => subject.subject_average);
      
      if (validSubjectAverages.length > 0) {
        const sum = validSubjectAverages.reduce((total, avg) => total + avg, 0);
        student.general_average = parseFloat((sum / validSubjectAverages.length).toFixed(2));
      }

      return {
        ...student,
        subjects: studentSubjects
      };
    });

    return result;
  } catch (err) {
    console.error('Error in fetchStudentsByTeacher:', err);
    throw new Error(`Error fetching students by teacher: ${err.message}`);
  }
};



module.exports = {
  fetchStudentsByTeacher,
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
