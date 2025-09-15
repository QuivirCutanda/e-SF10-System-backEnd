const { 
  fetchAllGrades,
  fetchGradesByStudent,
  fetchGradesBySection,
  fetchGradesByTeacher,
  createOrUpdateGradeRecord,
  deleteGradeById,
  setGradeInputStatusForTeacher,
  getGradeInputStatusByTeacher,
  getTeacherInputStatus,
  fetchStudentsByTeacher 
} = require('../../models/grades-model/grades-model');

exports.getAllGrades = async (req, res) => {
  try {
    const { school_year_id, grading_period } = req.query;

    const filters = {};
    if (school_year_id) filters.school_year_id = parseInt(school_year_id);
    if (grading_period) filters.grading_period = grading_period;

    const grades = await fetchAllGrades(filters);

    return res.status(200).json({
      success: true,
      data: grades,
      count: grades.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Grades Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching grades',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.getGradesByStudent = async (req, res) => {
  const { studentId } = req.params;
  const { school_year_id, grading_period } = req.query;

  const parsedStudentId = parseInt(studentId);
  const parsedSchoolYearId = school_year_id ? parseInt(school_year_id) : null;

  if (!parsedStudentId || parsedStudentId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Student ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (parsedSchoolYearId !== null && parsedSchoolYearId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'School Year ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (grading_period && !['1st', '2nd', '3rd', '4th'].includes(grading_period)) {
    return res.status(400).json({
      success: false,
      error: 'Grading period must be one of: 1st, 2nd, 3rd, 4th',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const filters = { student_id: parsedStudentId };
    if (parsedSchoolYearId) filters.school_year_id = parsedSchoolYearId;
    if (grading_period) filters.grading_period = grading_period;

    const grades = await fetchGradesByStudent(filters);

    return res.status(200).json({
      success: true,
      data: grades,
      count: grades.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Grades By Student Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching student grades',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.getGradesBySection = async (req, res) => {
  const { sectionId } = req.params;
  const { grading_period, subject_id } = req.query;

  const parsedSectionId = parseInt(sectionId);
  const parsedSubjectId = subject_id ? parseInt(subject_id) : null;

  if (!parsedSectionId || parsedSectionId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Section ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (parsedSubjectId !== null && parsedSubjectId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Subject ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (grading_period && !['1st', '2nd', '3rd', '4th'].includes(grading_period)) {
    return res.status(400).json({
      success: false,
      error: 'Grading period must be one of: 1st, 2nd, 3rd, 4th',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const filters = { section_id: parsedSectionId };
    if (grading_period) filters.grading_period = grading_period;
    if (parsedSubjectId) filters.subject_id = parsedSubjectId;

    const grades = await fetchGradesBySection(filters);

    return res.status(200).json({
      success: true,
      data: grades,
      count: grades.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Grades By Section Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching section grades',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.getGradesByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { school_year_id, grading_period, section_id, subject_id } = req.query;
  
  const parsedTeacherId = parseInt(teacherId);
  
  if (!parsedTeacherId || parsedTeacherId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const filters = { teacher_id: parsedTeacherId };
    if (school_year_id) filters.school_year_id = parseInt(school_year_id);
    if (grading_period) filters.grading_period = grading_period;
    if (section_id) filters.section_id = parseInt(section_id);
    if (subject_id) filters.subject_id = parseInt(subject_id);

    const grades = await fetchGradesByTeacher(filters);
    return res.status(200).json({
      success: true,
      data: grades,
      count: grades.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Grades By Teacher Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teacher grades',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.createOrUpdateGrade = async (req, res) => {
  const { enrollment_id, subject_id, grading_period, grade } = req.body;
  const userId = req.user?.user_id;

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  if (!enrollment_id || !Number.isInteger(enrollment_id) || enrollment_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Enrollment ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!subject_id || !Number.isInteger(subject_id) || subject_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Subject ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!grading_period || !['1st', '2nd', '3rd', '4th'].includes(grading_period)) {
    return res.status(400).json({
      success: false,
      error: 'Grading period must be one of: 1st, 2nd, 3rd, 4th',
      timestamp: new Date().toISOString()
    });
  }

  if (grade !== null && grade !== undefined) {
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      return res.status(400).json({
        success: false,
        error: 'Grade must be a number between 0 and 100',
        timestamp: new Date().toISOString()
      });
    }
  }

  try {
    const result = await createOrUpdateGradeRecord(
      {
        enrollment_id,
        subject_id,
        grading_period,
        grade: grade !== null && grade !== undefined ? parseFloat(grade) : null,
      },
      userId
    );

    return res.status(result.isNew ? 201 : 200).json({
      success: true,
      message: result.isNew ? 'Grade created successfully' : 'Grade updated successfully',
      data: result.grade,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create/Update Grade Error:', error);

    return res.status(
      error.message.includes('not found') ? 404 :
      error.message.includes('disabled') ? 403 :
      error.message.includes('not assigned') ? 403 : 500
    ).json({
      success: false,
      error: error.message,
      message:" Teacher not assigned to this subject/section",
      timestamp: new Date().toISOString()
    });
  }
};


exports.deleteGrade = async (req, res) => {
  const { gradeId } = req.params;
  const userId = req.user?.user_id;
  const parsedGradeId = parseInt(gradeId);

  if (!parsedGradeId || parsedGradeId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const deleted = await deleteGradeById(parsedGradeId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Grade deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete Grade Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while deleting grade',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.toggleGradeInput = async (req, res) => {
  const { teacherId } = req.params;
  const userId = req.user?.user_id;

  const parsedTeacherId = parseInt(teacherId);

  if (!parsedTeacherId || parsedTeacherId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const currentStatus = await getTeacherInputStatus(parsedTeacherId);

    const newStatus = !currentStatus;

    await setGradeInputStatusForTeacher(parsedTeacherId, newStatus, userId);

    return res.status(200).json({
      success: true,
      message: `Grade input ${newStatus ? 'enabled' : 'disabled'} for ALL assignments of this teacher`,
      newStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Toggle Grade Input Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while toggling grade input',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

exports.getGradeInputStatus = async (req, res) => {
  const { teacherId } = req.params;
  const tId = parseInt(teacherId);

  if (!tId || tId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const status = await getGradeInputStatusByTeacher(tId);

    return res.status(200).json({
      success: true,
      teacher_id: tId,
      can_input: status.input_enabled,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Grade Input Status Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while checking grade input',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

exports.getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const students = await fetchStudentsByTeacher(teacherId);

    return res.status(200).json({
      success: true,
      data: students,
      count: students.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Students By Teacher Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
