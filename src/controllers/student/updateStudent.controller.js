const Student = require('../../models/student/updateStudent.model');

const updateStudent = async (req, res) => {
    try {
        const { lrn } = req.params;
        const userId = req.user.user_id; // From authMiddleware
        const updateData = req.body;

        const updatedStudent = await Student.updateStudent(lrn, updateData, userId);

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.status(200).json({
            message: 'Student updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Update student error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    updateStudent,
};