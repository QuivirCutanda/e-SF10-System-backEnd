const db = require('../../config/db');

const getStudentByLRN = async (lrn) => {
    const studentSql = `
        SELECT student_id, lrn, first_name, middle_name, last_name, date_of_birth, gender, 
               street, city, province, zip_code, guardian_name, contact_number
        FROM students
        WHERE lrn = ?
    `;
    const [studentRows] = await db.query(studentSql, [lrn]);
    const student = studentRows[0];

    if (!student) return null;

    const enrollmentsQuery = `
      SELECT 
        e.enrollment_id,
        gl.grade_level_id,
        gl.grade_name,
        gl.grade_order,
        sec.section_id,
        sec.section_name,
        sy.school_year_id,
        CONCAT(sy.start_year, '-', sy.end_year) AS school_year,
        c.curriculum_id,
        c.curriculum_name,
        sub.subject_id,
        sub.subject_code,
        sub.subject_name,
        t.teacher_id,
        CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name, ' ', COALESCE(u.extension_name, '')) AS teacher_name,
        sg.grading_period,
        sg.grade
      FROM enrollment e
      JOIN grade_levels gl ON e.grade_level_id = gl.grade_level_id
      JOIN sections sec ON e.section_id = sec.section_id
      JOIN school_years sy ON e.school_year_id = sy.school_year_id
      LEFT JOIN curriculum c ON e.curriculum_id = c.curriculum_id
      LEFT JOIN teacher_assignments ta ON ta.section_id = e.section_id AND ta.school_year_id = e.school_year_id
      LEFT JOIN subjects sub ON sub.subject_id = ta.subject_id
      LEFT JOIN teachers t ON t.teacher_id = ta.teacher_id
      LEFT JOIN users u ON u.user_id = t.user_id
      LEFT JOIN student_grades sg ON sg.enrollment_id = e.enrollment_id AND sg.subject_id = sub.subject_id
      WHERE e.student_id = ?
      ORDER BY sy.start_year ASC, gl.grade_order ASC, sec.section_name ASC, sub.subject_name ASC
    `;

    const [rows] = await db.execute(enrollmentsQuery, [student.student_id]);

    const allGradingPeriods = ['1st', '2nd', '3rd', '4th'];
    const enrollmentsMap = new Map();
    const subjectGradesMap = new Map();

    rows.forEach(row => {
        const enrollmentKey = `${row.enrollment_id}`;
        const subjectKey = `${row.enrollment_id}-${row.subject_id}`;

        if (!enrollmentsMap.has(enrollmentKey)) {
            enrollmentsMap.set(enrollmentKey, {
                enrollment_id: row.enrollment_id,
                grade_level: {
                    grade_level_id: row.grade_level_id,
                    grade_name: row.grade_name,
                    grade_order: row.grade_order
                },
                section: {
                    section_id: row.section_id,
                    section_name: row.section_name
                },
                school_year: {
                    school_year_id: row.school_year_id,
                    school_year: row.school_year
                },
                curriculum: row.curriculum_id ? {
                    curriculum_id: row.curriculum_id,
                    curriculum_name: row.curriculum_name
                } : null,
                subjects: [],
                general_average: null
            });
        }

        if (row.subject_id && !subjectGradesMap.has(subjectKey)) {
            const subjectData = {
                subject_id: row.subject_id,
                subject_code: row.subject_code,
                subject_name: row.subject_name,
                teacher: row.teacher_id ? {
                    teacher_id: row.teacher_id,
                    teacher_name: row.teacher_name
                } : null,
                grades: allGradingPeriods.map(period => ({ grading_period: period, grade: null })),
                subject_average: null
            };
            subjectGradesMap.set(subjectKey, subjectData);
        }

        if (row.subject_id && row.grading_period && row.grade !== null) {
            const subjectData = subjectGradesMap.get(subjectKey);
            const gradeIndex = subjectData.grades.findIndex(g => g.grading_period === row.grading_period);
            if (gradeIndex !== -1) {
                subjectData.grades[gradeIndex].grade = parseFloat(row.grade);
            }
        }
    });

    const enrollments = Array.from(enrollmentsMap.values()).map(enrollment => {
        const subjects = Array.from(subjectGradesMap.entries())
            .filter(([key]) => key.startsWith(`${enrollment.enrollment_id}-`))
            .map(([, subject]) => {
                const validGrades = subject.grades.filter(g => g.grade !== null);
                if (validGrades.length) {
                    const sum = validGrades.reduce((total, g) => total + g.grade, 0);
                    subject.subject_average = parseFloat((sum / validGrades.length).toFixed(2));
                }
                return subject;
            });

        const validSubjectAverages = subjects
            .filter(s => s.subject_average !== null)
            .map(s => s.subject_average);

        if (validSubjectAverages.length) {
            const sum = validSubjectAverages.reduce((total, avg) => total + avg, 0);
            enrollment.general_average = parseFloat((sum / validSubjectAverages.length).toFixed(2));
        }

        return { ...enrollment, subjects };
    });

    student.enrollments = enrollments;

    return student;
};


module.exports = { getStudentByLRN };