const path = require("path");
const fs = require("fs");
const { createSchoolRecord } = require("../../models/schoolRecord.model");

exports.uploadSF10 = async (req, res) => {
  const { studentId } = req.params;
  const file = req.file;

  try {
    // Basic validation
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
        studentId,
        details: "Please include an SF10 file in your request"
      });
    }

    const { start_year, end_year, grade_level, section } = req.body;

    // Required fields check
    if (!start_year || !end_year || !grade_level || !section) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        studentId,
        missingFields: [
          ...(!start_year ? ['start_year'] : []),
          ...(!end_year ? ['end_year'] : []),
          ...(!grade_level ? ['grade_level'] : []),
          ...(!section ? ['section'] : [])
        ],
        details: "All fields are required for SF10 upload"
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
        error: "Invalid start year",
        studentId,
        details: "Start year must be a valid number"
      });
    }

    if (isNaN(endYearNum)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid end year",
        studentId,
        details: "End year must be a valid number"
      });
    }

    if (start_year.length !== 4 || end_year.length !== 4) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid year format",
        studentId,
        details: "Years must be 4-digit numbers"
      });
    }

    if (startYearNum < 2000 || startYearNum > currentYear + 5) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid start year range",
        studentId,
        details: `Start year must be between 2000 and ${currentYear + 5}`
      });
    }

    if (endYearNum < 2000 || endYearNum > currentYear + 5) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid end year range",
        studentId,
        details: `End year must be between 2000 and ${currentYear + 5}`
      });
    }

    if (startYearNum === endYearNum) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid year span",
        studentId,
        details: "Start year and end year cannot be the same"
      });
    }

    if (startYearNum > endYearNum) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid year sequence",
        studentId,
        details: "Start year cannot be greater than end year"
      });
    }

    if (endYearNum - startYearNum > 1) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid year span",
        studentId,
        details: "School year span cannot be more than 1 year"
      });
    }

    // Grade level validation
    const gradeLevelNum = parseInt(grade_level);
    if (isNaN(gradeLevelNum) || gradeLevelNum < 1 || gradeLevelNum > 12) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: "Invalid grade level",
        studentId,
        details: "Grade level must be between 1 and 12"
      });
    }

    // File processing
    const baseDir = path.join(__dirname, '../../../data/documents/sf10');
    const finalDir = path.join(baseDir, `${start_year}-${end_year}`, section);
    fs.mkdirSync(finalDir, { recursive: true });

    const fileExt = path.extname(file.originalname);
    const newFilename = `sf10-${studentId}-${Date.now()}${fileExt}`;
    const absoluteFilePath = path.join(finalDir, newFilename);
    
    fs.renameSync(file.path, absoluteFilePath);

    // Database record creation
    const userId = req.user.user_id;
    const result = await createSchoolRecord(
      studentId,
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
    return res.status(201).json({
      success: true,
      message: "SF10 file uploaded successfully",
      studentId,
      document: {
        filename: newFilename,
        path: absoluteFilePath,
        schoolYear: `${start_year}-${end_year}`,
        gradeLevel: gradeLevelNum,
        section
      },
      metadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size
      }
    });

  } catch (error) {
    console.error("Upload Error:", error);
    
    // Clean up file if error occurs
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      error: "Server error during file upload",
      studentId,
      details: process.env.NODE_ENV === 'development' ? error.message : "Please try again later",
      timestamp: new Date().toISOString()
    });
  }
};