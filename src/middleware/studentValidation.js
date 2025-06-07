const { body, param, query, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateStudentRegistration = [
    body('lrn')
        .isLength({ min: 12, max: 12 })
        .withMessage('LRN must be exactly 12 characters')
        .isNumeric()
        .withMessage('LRN must contain only numbers'),
    body('first_name')
        .notEmpty()
        .withMessage('First name is required')
        .isString()
        .withMessage('First name must be a string'),
    body('last_name')
        .notEmpty()
        .withMessage('Last name is required')
        .isString()
        .withMessage('Last name must be a string'),
    body('middle_name')
        .optional()
        .isString()
        .withMessage('Middle name must be a string'),
    body('date_of_birth')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isDate()
        .withMessage('Invalid date format'),
    body('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    body('street')
        .notEmpty()
        .withMessage('Street is required'),
    body('city')
        .notEmpty()
        .withMessage('City is required'),
    body('province')
        .notEmpty()
        .withMessage('Province is required'),
    body('zip_code')
        .notEmpty()
        .withMessage('Zip code is required')
        .isLength({ min: 4 })
        .withMessage('Zip code must be at least 4 characters'),
    body('contact_number')
        .optional()
        .matches(/^09\d{9}$/)
        .withMessage('Contact number must be a valid Philippines mobile number (e.g., 09XXXXXXXXX)'),
    validateResults,
];

const validateStudentSearch = [
    query('query')
        .notEmpty()
        .withMessage('Search query is required'),
    validateResults,
];

const validateLRN = [
    param('lrn')
        .isLength({ min: 12, max: 12 })
        .withMessage('LRN must be exactly 12 characters')
        .isNumeric()
        .withMessage('LRN must contain only numbers'),
    validateResults,
];

const validateStudentId = [
    param('studentId')
        .isNumeric()
        .withMessage('Student ID must be a number'),
    validateResults,
];

const validateStudentUpdate = [
    body('first_name')
        .notEmpty()
        .withMessage('First name is required')
        .isString()
        .isLength({ max: 100 })
        .withMessage('First name must be a string with maximum length of 100 characters'),
    body('middle_name')
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage('Middle name must be a string with maximum length of 100 characters'),
    body('last_name')
        .notEmpty()
        .withMessage('Last name is required')
        .isString()
        .isLength({ max: 100 })
        .withMessage('Last name must be a string with maximum length of 100 characters'),
    body('extension_name')
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage('Extension name must be a string with maximum length of 50 characters'),
    body('date_of_birth')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isDate()
        .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
    body('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    body('street')
        .notEmpty()
        .withMessage('Street is required')
        .isString()
        .isLength({ max: 255 })
        .withMessage('Street must be a string with maximum length of 255 characters'),
    body('city')
        .notEmpty()
        .withMessage('City is required')
        .isString()
        .isLength({ max: 100 })
        .withMessage('City must be a string with maximum length of 100 characters'),
    body('province')
        .notEmpty()
        .withMessage('Province is required')
        .isString()
        .isLength({ max: 100 })
        .withMessage('Province must be a string with maximum length of 100 characters'),
    body('zip_code')
        .notEmpty()
        .withMessage('Zip code is required')
        .isString()
        .isLength({ max: 10 })
        .withMessage('Zip code must be a string with maximum length of 10 characters'),
    body('guardian_name')
        .optional()
        .isString()
        .isLength({ max: 255 })
        .withMessage('Guardian name must be a string with maximum length of 255 characters'),
    body('contact_number')
        .optional()
        .matches(/^09\d{9}$/)
        .withMessage('Contact number must be a valid Philippines mobile number (e.g., 09XXXXXXXXX)'),
    validateResults,
];

const validateUpdateSF10 = [
    param('recordId')
        .isNumeric()
        .withMessage('Record ID must be a number'),
    body('start_year')
        .notEmpty()
        .withMessage('Start year is required')
        .isNumeric()
        .withMessage('Start year must be a number')
        .isLength({ min: 4, max: 4 })
        .withMessage('Start year must be a 4-digit number'),
    body('end_year')
        .notEmpty()
        .withMessage('End year is required')
        .isNumeric()
        .withMessage('End year must be a number')
        .isLength({ min: 4, max: 4 })
        .withMessage('End year must be a 4-digit number'),
    body('grade_level')
        .notEmpty()
        .withMessage('Grade level is required')
        .isNumeric()
        .withMessage('Grade level must be a number'),
    body('section')
        .notEmpty()
        .withMessage('Section is required')
        .isString()
        .isLength({ max: 50 })
        .withMessage('Section must be a string with maximum length of 50 characters'),
    validateResults,
];

const validateDeleteSF10 = [
    param('recordId')
        .isNumeric()
        .withMessage('Record ID must be a number'),
    validateResults,
];

module.exports = {
    validateStudentUpdate,
    validateStudentRegistration,
    validateStudentSearch,
    validateLRN,
    validateStudentId,
    validateUpdateSF10,
    validateDeleteSF10
};