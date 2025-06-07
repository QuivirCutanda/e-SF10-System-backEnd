const path = require('path');
const fs = require('fs');
const db = require('../../config/db'); // Add this line to import the database connection
const { updateSchoolRecord } = require('../../models/schoolRecord.model');

exports.updateSF10 = async (req, res) => {
  const { recordId } = req.params;
  const file = req.file;
  const { start_year, end_year, grade_level, section } = req.body;

  try {
    // Basic validation
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        recordId,
        details: 'Please include an SF10 file in your request',
      });
    }

    // Year validation
    const startYearNum = parseInt(start_year);
    const endYearNum = parseInt(end_year);
    const currentYear = new Date().getFullYear();

    if (isNaN(startYearNum)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid start year',
        recordId,
        details: 'Start year must be a valid number',
      });
    }

    if (isNaN(endYearNum)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid end year',
        recordId,
        details: 'End year must be a valid number',
      });
    }

    if (start_year.length !== 4 || end_year.length !== 4) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid year format',
        recordId,
        details: 'Years must be 4-digit numbers',
      });
    }

    if (startYearNum < 2000 || startYearNum > currentYear + 5) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid start year range',
        recordId,
        details: `Start year must be between 2000 and ${currentYear + 5}`,
      });
    }

    if (endYearNum < 2000 || endYearNum > currentYear + 5) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid end year range',
        recordId,
        details: `End year must be between 2000 and ${currentYear + 5}`,
      });
    }

    if (startYearNum === endYearNum) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid year span',
        recordId,
        details: 'Start year and end year cannot be the same',
      });
    }

    if (startYearNum > endYearNum) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid year sequence',
        recordId,
        details: 'Start year cannot be greater than end year',
      });
    }

    if (endYearNum - startYearNum > 1) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid year span',
        recordId,
        details: 'School year span cannot be more than 1 year',
      });
    }

    // Grade level validation
    const gradeLevelNum = parseInt(grade_level);
    if (isNaN(gradeLevelNum) || gradeLevelNum < 1 || gradeLevelNum > 12) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid grade level',
        recordId,
        details: 'Grade level must be between 1 and 12',
      });
    }

    // File processing
    const baseDir = path.join(__dirname, '../../../data/documents/sf10');
    const finalDir = path.join(baseDir, `${start_year}-${end_year}`, section);
    fs.mkdirSync(finalDir, { recursive: true });

    const fileExt = path.extname(file.originalname);
    const newFilename = `sf10-${recordId}-${Date.now()}${fileExt}`;
    const absoluteFilePath = path.join(finalDir, newFilename);

    // Delete old file if it exists
    const [existingRecord] = await db.execute(
      `SELECT sf10_document_path FROM school_records WHERE record_id = ? AND is_deleted = FALSE`,
      [recordId]
    );
    if (existingRecord.length > 0 && existingRecord[0].sf10_document_path && fs.existsSync(existingRecord[0].sf10_document_path)) {
      fs.unlinkSync(existingRecord[0].sf10_document_path);
    }

    fs.renameSync(file.path, absoluteFilePath);

    // Database record update
    const userId = req.user.user_id;
    const result = await updateSchoolRecord(
      recordId,
      {
        start_year: startYearNum,
        end_year: endYearNum,
        grade_level: gradeLevelNum,
        section,
        sf10_document_path: absoluteFilePath,
      },
      userId
    );

    // Success response
    return res.status(200).json({
      success: true,
      message: 'SF10 file updated successfully',
      recordId,
      document: {
        filename: newFilename,
        path: absoluteFilePath,
        schoolYear: `${start_year}-${end_year}`,
        gradeLevel: gradeLevelNum,
        section,
      },
      metadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error('Update SF10 Error:', error);

    // Clean up file if error occurs
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      error: 'Server error during file update',
      recordId,
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString(),
    });
  }
};