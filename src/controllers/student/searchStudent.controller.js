const Student = require('../../models/student/searchStudent.model');

const searchStudents = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        const results = await Student.searchStudents(query);
        return res.status(200).json(results);
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    searchStudents,
};
