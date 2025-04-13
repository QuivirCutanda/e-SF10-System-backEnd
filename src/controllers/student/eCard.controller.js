const ECard = require('../../models/student/eCard.model');

const viewStudentECards = async (req, res) => {
    try {
        const { studentId } = req.params;
        const eCards = await ECard.getECardsByStudentId(studentId);

        if (eCards.length === 0) {
            return res.status(404).json({ message: 'No e-Cards found for this student.' });
        }

        res.status(200).json(eCards);
    } catch (error) {
        console.error('Error fetching e-Cards:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { viewStudentECards };
