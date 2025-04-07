const { createStudent } = require('../../models/student/student.model');

const addStudent = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.user_id; 

    const result = await createStudent(data, userId);

    res.status(201).json({ message: 'Student successfully registered!', studentId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

module.exports = { addStudent };
