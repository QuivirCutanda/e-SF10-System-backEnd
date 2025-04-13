const Student = require('../../models/student/viewStudent.model');

const viewStudentInfo = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.getStudentById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { viewStudentInfo };
