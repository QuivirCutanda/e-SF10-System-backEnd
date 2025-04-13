const Student = require('../../models/student/viewStudent.model');
const ECard = require('../../models/student/eCard.model');

const getStudentFullDetails = async (req, res) => {
    const { lrn } = req.params;

    try {
        const student = await Student.getStudentByLRN(lrn);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const eCards = await ECard.getEcardsByStudentLRN(lrn);

        return res.status(200).json({ student, eCards });

    } catch (err) {
        console.error('Error retrieving student details:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getStudentFullDetails,
};
