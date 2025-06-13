const { createStudent } = require('../../models/student/student.model');
const XLSX = require('xlsx');
const fs = require('fs').promises;

const addStudent = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.user_id;

    const result = await createStudent(data, userId);

    res.status(201).json({ message: 'Student successfully registered!', studentId: result.insertId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const bulkRegisterStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.user_id;
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: [
      'lrn', 'first_name', 'middle_name', 'last_name', 'extension_name',
      'date_of_birth', 'gender', 'street', 'city', 'province', 'zip_code',
      'guardian_name', 'contact_number'
    ], skipHeader: true });

    if (jsonData.length === 0) {
      await fs.unlink(filePath); // Clean up uploaded file
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const results = [];
    const errors = [];

    for (const [index, student] of jsonData.entries()) {
      try {
        // Validate required fields
        if (!student.lrn || !student.first_name || !student.last_name || !student.date_of_birth || !student.gender) {
          errors.push(`Row ${index + 1}: Missing required fields`);
          continue;
        }

        const studentData = {
          lrn: student.lrn.toString(),
          first_name: student.first_name,
          middle_name: student.middle_name || '',
          last_name: student.last_name,
          extension_name: student.extension_name || '',
          date_of_birth: student.date_of_birth,
          gender: student.gender,
          street: student.street || '',
          city: student.city || '',
          province: student.province || '',
          zip_code: student.zip_code ? student.zip_code.toString() : '',
          guardian_name: student.guardian_name || '',
          contact_number: student.contact_number ? student.contact_number.toString() : ''
        };

        const result = await createStudent(studentData, userId);
        results.push({ row: index + 1, studentId: result.insertId, message: 'Student registered successfully' });
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    await fs.unlink(filePath); // Clean up uploaded file

    res.status(200).json({
      message: 'Bulk registration processed',
      successful: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {}); // Clean up on error
    }
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = { addStudent, bulkRegisterStudents };