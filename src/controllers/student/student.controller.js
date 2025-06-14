const { createStudent } = require('../../models/student/student.model');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const db = require('../../config/db');


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
        const userId = req.user.user_id;
        const jsonData = req.validatedStudents; // Use validated data from middleware
        const skippedRows = req.skippedRows || []; // Get skipped rows from middleware

        const results = [];
        const errors = [];
        const skipped = [...skippedRows]; // Include LRN validation skips

        for (const [index, student] of jsonData.entries()) {
            try {
                // Validate required fields
                if (!student.lrn || !student.first_name || !student.last_name || !student.date_of_birth || !student.gender) {
                    errors.push(`Row ${index + 2}: Missing required fields`);
                    continue;
                }

                // Check for duplicate LRN in database
                const [existingLRN] = await db.execute(
                    'SELECT * FROM students WHERE lrn = ?',
                    [student.lrn.toString()]
                );

                if (existingLRN.length > 0) {
                    skipped.push(`Row ${index + 2}: Student with LRN ${student.lrn} already exists in the database`);
                    continue;
                }

                // Check for duplicate name combination in database
                const [existingName] = await db.execute(
                    'SELECT * FROM students WHERE first_name = ? AND middle_name = ? AND last_name = ?',
                    [
                        student.first_name || '',
                        student.middle_name || '',
                        student.last_name || ''
                    ]
                );

                if (existingName.length > 0) {
                    skipped.push(`Row ${index + 2}: Student with name ${student.first_name} ${student.middle_name || ''} ${student.last_name} already exists in the database`);
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
                results.push({ row: index + 2, studentId: result.insertId, message: 'Student registered successfully' });
            } catch (error) {
                errors.push(`Row ${index + 2}: ${error.message}`);
            }
        }

        res.status(200).json({
            message: 'Bulk registration processed',
            successful: results,
            skipped: skipped.length > 0 ? skipped : undefined,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = { addStudent, bulkRegisterStudents };