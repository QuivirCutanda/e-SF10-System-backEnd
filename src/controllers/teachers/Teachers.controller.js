const { 
  fetchAllTeachers, 
  fetchTeacherById, 
  createNewTeacher, 
  updateTeacherById, 
  toggleTeacherStatusById 
} = require('../../models/teachers/teacher-model');

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await fetchAllTeachers();
    return res.status(200).json({
      success: true,
      data: teachers,
      count: teachers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Teachers Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teachers',
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
      error: 'Teacher ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const teacher = await fetchTeacherById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: teacher,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Teacher By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teacher',
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
    teacher_address, 
    date_of_birth, 
    email, 
    contact_number 
  } = req.body;
  const userId = req.user?.user_id;

  // Required field validations
  if (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'First name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Last name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!teacher_address || typeof teacher_address !== 'string' || teacher_address.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher address is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!date_of_birth) {
    return res.status(400).json({
      success: false,
      error: 'Date of birth is required',
      timestamp: new Date().toISOString()
    });
  }

  // Email validation if provided
  if (email && (typeof email !== 'string' || !email.includes('@'))) {
    return res.status(400).json({
      success: false,
      error: 'Email must be a valid email address',
      timestamp: new Date().toISOString()
    });
  }

  // Date validation
  const birthDate = new Date(date_of_birth);
  if (isNaN(birthDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Date of birth must be a valid date',
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
    const teacher = await createNewTeacher({
      first_name: first_name.trim(),
      middle_name: middle_name ? middle_name.trim() : null,
      last_name: last_name.trim(),
      extension_name: extension_name ? extension_name.trim() : null,
      teacher_address: teacher_address.trim(),
      date_of_birth: birthDate,
      email: email ? email.trim() : null,
      contact_number: contact_number ? contact_number.trim() : null
    }, userId);

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
    teacher_address, 
    date_of_birth, 
    email, 
    contact_number,
    is_active 
  } = req.body;
  const userId = req.user?.user_id;
  const teacherId = parseInt(id);

  if (!teacherId || teacherId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  // Required field validations
  if (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'First name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Last name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!teacher_address || typeof teacher_address !== 'string' || teacher_address.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher address is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!date_of_birth) {
    return res.status(400).json({
      success: false,
      error: 'Date of birth is required',
      timestamp: new Date().toISOString()
    });
  }

  // Email validation if provided
  if (email && (typeof email !== 'string' || !email.includes('@'))) {
    return res.status(400).json({
      success: false,
      error: 'Email must be a valid email address',
      timestamp: new Date().toISOString()
    });
  }

  // Date validation
  const birthDate = new Date(date_of_birth);
  if (isNaN(birthDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Date of birth must be a valid date',
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
    const updatedTeacher = await updateTeacherById(teacherId, {
      first_name: first_name.trim(),
      middle_name: middle_name ? middle_name.trim() : null,
      last_name: last_name.trim(),
      extension_name: extension_name ? extension_name.trim() : null,
      teacher_address: teacher_address.trim(),
      date_of_birth: birthDate,
      email: email ? email.trim() : null,
      contact_number: contact_number ? contact_number.trim() : null,
      is_active: is_active !== undefined ? Boolean(is_active) : true
    }, userId);

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
        error: 'Email address is already registered to another teacher',
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
    const result = await toggleTeacherStatusById(teacherId, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
        timestamp: new Date().toISOString()
      });
    }

    const statusMessage = result.is_active ? 'activated' : 'deactivated';
    
    return res.status(200).json({
      success: true,
      message: `Teacher ${statusMessage} successfully`,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Toggle Teacher Status Error:', error);
    if (error.message.includes('Teacher not found')) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while updating teacher status',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};