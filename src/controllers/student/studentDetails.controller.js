const Student = require('../../models/student/viewStudent.model');
const ECard = require('../../models/student/eCard.model');
const { logActivity } = require('../../utils/activityLog');

const getStudentFullDetails = async (req, res) => {
  const { lrn } = req.params;

  try {
    const student = await Student.getStudentByLRN(lrn);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const eCards = await ECard.getEcardsByStudentLRN(lrn);

    await logActivity(req.user.user_id, 'view_student', `Viewed student details for LRN: ${lrn}`);

    return res.status(200).json({ student, eCards });
  } catch (err) {
    console.error('Error retrieving student details:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getStudentFullDetails,
};