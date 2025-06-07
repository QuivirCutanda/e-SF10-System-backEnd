const fs = require('fs');
const { deleteSchoolRecord } = require('../../models/schoolRecord.model');

exports.deleteSF10 = async (req, res) => {
  const { recordId } = req.params;
  const userId = req.user.user_id;

  try {
    // Delete the record and get the file path
    const result = await deleteSchoolRecord(recordId, userId);

    // Delete the file from the filesystem if it exists
    if (result.sf10_document_path && fs.existsSync(result.sf10_document_path)) {
      fs.unlinkSync(result.sf10_document_path);
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'SF10 record deleted successfully',
      recordId,
    });
  } catch (error) {
    console.error('Delete SF10 Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during SF10 deletion',
      recordId,
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};