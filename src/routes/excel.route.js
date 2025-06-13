const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');

router.get('/generate-excel', (req, res) => {
  const workbook = XLSX.utils.book_new();
  const headers = [
    'LRN',
    'First Name',
    'Middle Name',
    'Last Name',
    'Extension Name',
    'Date of Birth',
    'Gender',
    'Street',
    'City',
    'Province',
    'Zip Code',
    'Guardian Name',
    'Contact Number'
  ];
  const worksheetData = [headers];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const colWidths = headers.map(header => ({
    wch: Math.max(header.length, 10) 
  }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Data');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  res.setHeader('Content-Disposition', 'attachment; filename=student_data.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  res.send(buffer);
});

module.exports = router;