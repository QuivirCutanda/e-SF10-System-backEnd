const Student = require('../../models/student/viewAllStudents.model');

const viewAllStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { students, total } = await Student.viewAllStudents({ limit: parseInt(limit), offset: parseInt(offset) });

        return res.status(200).json({
            students,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('View all students error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    viewAllStudents,
};