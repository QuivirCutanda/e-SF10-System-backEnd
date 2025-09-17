const bcrypt = require('bcryptjs');

const { 
  fetchAllTeachers, 
  fetchTeacherById, 
  createNewTeacher, 
  updateTeacherById, 
  toggleTeacherStatusById,
  fetchActiveTeachers
} = require('../../models/teachers/teacher-model');

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await fetchAllTeachers();
    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Get All Teachers Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching teachers",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getActiveTeachers = async (req, res) => {
  try {
    const teachers = await fetchActiveTeachers();
    return res.status(200).json({
      success: true,
      data: teachers,
      count: teachers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Active Teachers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching active teachers',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getTeacherById = async (req, res) => {
  const { id } = req.params;
  const teacherId = parseInt(id);

  if (!teacherId || teacherId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Teacher ID must be a positive integer",
      timestamp: new Date().toISOString()
    });
  }

  try {
    const teacher = await fetchTeacherById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: "Teacher not found",
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: teacher,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Get Teacher By ID Error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching teacher",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};



exports.createTeacher = async (req, res) => {
  const { 
    first_name, 
    middle_name, 
    last_name, 
    extension_name,
    email, 
    password,
    teacher_address, 
    date_of_birth, 
    contact_number 
  } = req.body;

  const adminUserId = req.user?.user_id; 

  if (!first_name || !last_name) {
    return res.status(400).json({
      success: false,
      error: 'First and last name are required',
      timestamp: new Date().toISOString()
    });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Valid email is required',
      timestamp: new Date().toISOString()
    });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters',
      timestamp: new Date().toISOString()
    });
  }
  if (!teacher_address) {
    return res.status(400).json({
      success: false,
      error: 'Teacher address is required',
      timestamp: new Date().toISOString()
    });
  }
  if (!date_of_birth || isNaN(new Date(date_of_birth).getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Valid date of birth is required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await createNewTeacher({
      first_name: first_name.trim(),
      middle_name: middle_name ? middle_name.trim() : null,
      last_name: last_name.trim(),
      extension_name: extension_name ? extension_name.trim() : null,
      email: email.trim(),
      password: hashedPassword, 
      teacher_address: teacher_address.trim(),
      date_of_birth: new Date(date_of_birth),
      contact_number: contact_number ? contact_number.trim() : null
    }, adminUserId);

    return res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create Teacher Error:', error);

    if (error.message.includes('Email already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Email address is already registered',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server error while creating teacher',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};



exports.updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { 
    first_name, 
    middle_name, 
    last_name,  
    extension_name,  
    email, 
    teacher_address, 
    date_of_birth, 
    contact_number,
    is_active 
  } = req.body;

  const adminUserId = req.user?.user_id;
  const teacherId = parseInt(id);

  if (!teacherId || teacherId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!first_name || !last_name) {
    return res.status(400).json({
      success: false,
      error: 'First and last name are required',
      timestamp: new Date().toISOString()
    });
  }
  if (email && (typeof email !== 'string' || !email.includes('@'))) {
    return res.status(400).json({
      success: false,
      error: 'Valid email is required',
      timestamp: new Date().toISOString()
    });
  }
  if (!teacher_address) {
    return res.status(400).json({
      success: false,
      error: 'Teacher address is required',
      timestamp: new Date().toISOString()
    });
  }
  if (!date_of_birth || isNaN(new Date(date_of_birth).getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Valid date of birth is required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const updatedTeacher = await updateTeacherById(teacherId, {
      first_name: first_name.trim(),
      middle_name: middle_name ? middle_name.trim() : null,
      last_name: last_name.trim(),
      extension_name: extension_name.trim(),
      email: email ? email.trim() : null,
      teacher_address: teacher_address.trim(),
      date_of_birth: new Date(date_of_birth),
      contact_number: contact_number ? contact_number.trim() : null,
      is_active: is_active !== undefined ? Boolean(is_active) : true
    }, adminUserId);

    if (!updatedTeacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: updatedTeacher,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update Teacher Error:', error);
    if (error.message.includes('Teacher not found')) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Email already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Email address is already registered to another user',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while updating teacher',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.toggleTeacherStatus = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id;
  const teacherId = parseInt(id);

  if (!teacherId || teacherId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Teacher ID must be a positive integer",
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
    const result = await toggleTeacherStatusById(teacherId, userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Teacher not found",
        timestamp: new Date().toISOString(),
      });
    }

    const statusMessage = result.is_active ? "activated" : "deactivated";

    return res.status(200).json({
      success: true,
      message: `Teacher ${statusMessage} successfully`,      
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Toggle Teacher Status Error:", error);
    if (error.message.includes("Teacher not found")) {
      return res.status(404).json({
        success: false,
        error: "Teacher not found",
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(500).json({
      success: false,
      error: "Server error while updating teacher status",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
