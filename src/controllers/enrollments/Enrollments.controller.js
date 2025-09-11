const { 
  fetchAllEnrollments, 
  fetchEnrollmentById, 
  createNewEnrollment, 
  updateEnrollmentById, 
  deleteEnrollmentById 
} = require('../../models/enrollments/enrollment-model');

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await fetchAllEnrollments();
    return res.status(200).json({
      success: true,
      data: enrollments,
      count: enrollments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Enrollments Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching enrollments',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getEnrollmentById = async (req, res) => {
  const { id } = req.params;
  const enrollmentId = parseInt(id, 10);

  if (!enrollmentId || enrollmentId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Enrollment ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const enrollment = await fetchEnrollmentById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Enrollment By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching enrollment',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.createEnrollment = async (req, res) => {
  const { student_id, school_year_id, grade_level_id, section_id, curriculum_id, enrollment_date, status } = req.body;
  const userId = req.user?.user_id;

  const validateId = (id, name) => {
    if (!id || !Number.isInteger(id) || id <= 0) {
      return `${name} is required and must be a positive integer`;
    }
    return null;
  };

  const errors = [
    validateId(student_id, "Student ID"),
    validateId(school_year_id, "School Year ID"),
    validateId(grade_level_id, "Grade Level ID"),
    validateId(section_id, "Section ID"),
  ].filter(Boolean);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      timestamp: new Date().toISOString(),
    });
  }

  if (curriculum_id && (!Number.isInteger(curriculum_id) || curriculum_id <= 0)) {
    return res.status(400).json({
      success: false,
      error: "Curriculum ID must be a positive integer if provided",
      timestamp: new Date().toISOString(),
    });
  }

  if (enrollment_date && !/^\d{4}-\d{2}-\d{2}$/.test(enrollment_date)) {
    return res.status(400).json({
      success: false,
      error: "Enrollment date must be in YYYY-MM-DD format if provided",
      timestamp: new Date().toISOString(),
    });
  }

  if (status && !["Enrolled", "Pending", "Withdrawn", "Completed"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status must be one of: Enrolled, Pending, Withdrawn, Completed",
      timestamp: new Date().toISOString(),
    });
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid user ID from authentication token",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const enrollment = await createNewEnrollment(
      {
        student_id,
        school_year_id,
        grade_level_id,
        section_id,
        curriculum_id: curriculum_id || null,
        enrollment_date: enrollment_date || new Date().toISOString().split("T")[0],
        status: status || "Enrolled",
      },
      userId
    );

    return res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      data: enrollment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Enrollment Error:", error);
    const errorMap = {
      "Student not found": 404,
      "School year not found": 404,
      "Grade level not found": 404,
      "Section not found": 404,
      "Section does not belong to this grade level": 400,
      "Section does not belong to this school year": 400,
      "Curriculum not found": 404,
      "Student already enrolled for this school year": 409,
    };

    return res.status(errorMap[error.message] || 500).json({
      success: false,
      message:error.message,
      error: error.message || "Server error while creating enrollment",
      timestamp: new Date().toISOString(),
    });
  }
};


exports.updateEnrollment = async (req, res) => {
  const { id } = req.params;
  const {
    student_id,
    grade_level_id,
    school_year_id,
    section_id,
    curriculum_id,
    enrollment_date,
    status
  } = req.body;

  const userId = req.user?.user_id;
  const enrollmentId = parseInt(id, 10);

  if (!enrollmentId || isNaN(enrollmentId) || enrollmentId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Enrollment ID must be a positive integer",
      timestamp: new Date().toISOString()
    });
  }

  const validateId = (id, name) => {
    if (!id || !Number.isInteger(id) || id <= 0) {
      return `${name} is required and must be a positive integer`;
    }
    return null;
  };

  const errors = [
    validateId(student_id, "Student ID"),
    validateId(grade_level_id, "Grade Level ID"),
    validateId(school_year_id, "School Year ID"),
    validateId(section_id, "Section ID")
  ].filter(Boolean);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      timestamp: new Date().toISOString()
    });
  }

  if (curriculum_id && (!Number.isInteger(curriculum_id) || curriculum_id <= 0)) {
    return res.status(400).json({
      success: false,
      error: "Curriculum ID must be a positive integer if provided",
      timestamp: new Date().toISOString()
    });
  }

  if (enrollment_date && !/^\d{4}-\d{2}-\d{2}$/.test(enrollment_date)) {
    return res.status(400).json({
      success: false,
      error: "Enrollment date must be in YYYY-MM-DD format if provided",
      timestamp: new Date().toISOString()
    });
  }

  if (status && !["Enrolled", "Pending", "Withdrawn", "Completed"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status must be one of: Enrolled, Pending, Withdrawn, Completed",
      timestamp: new Date().toISOString()
    });
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid user ID from authentication token",
      timestamp: new Date().toISOString()
    });
  }

  try {
    const updatedEnrollment = await updateEnrollmentById(
      enrollmentId,
      {
        student_id,
        grade_level_id,
        school_year_id,
        section_id,
        curriculum_id: curriculum_id || null,
        enrollment_date: enrollment_date || new Date().toISOString().split("T")[0],
        status: status || "Enrolled"
      },
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      data: updatedEnrollment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Update Enrollment Error:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes("already enrolled")) {
      return res.status(409).json({
        success: false,
        error: "Student is already enrolled in another section for this school year",
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: "Server error while updating enrollment",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.deleteEnrollment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id;
  const enrollmentId = parseInt(id, 10);

  if (!enrollmentId || isNaN(enrollmentId) || enrollmentId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Enrollment ID must be a positive integer",
      timestamp: new Date().toISOString()
    });
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid user ID from authentication token",
      timestamp: new Date().toISOString()
    });
  }

  try {
    const deleted = await deleteEnrollmentById(enrollmentId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Enrollment not found",
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Delete Enrollment Error:", error);

    if (error.message.includes("Enrollment not found")) {
      return res.status(404).json({
        success: false,
        error: "Enrollment not found",
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes("Cannot delete enrollment")) {
      return res.status(409).json({
        success: false,
        error: "Cannot delete enrollment as it has associated grades",
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: "Server error while deleting enrollment",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
