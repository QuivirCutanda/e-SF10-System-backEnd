const {body,param, query, validationResult} = require('express-validator');

const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    next();
}

const validateStudentRegistration = [
    body('lrn')
    .isLength({min: 12, max: 12})
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
    .isLength({min: 4})
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
]

const validateLRN = [
    param('lrn')
    .isLength({min: 12, max:12})
    .withMessage('LRN must be exactly 12 characters')
    .isNumeric()
    .withMessage('LRN must contain only numbers'),
    validateResults,
]

const validateStudentId = [
    param('studentId')
    .isNumeric()
    .withMessage('Student ID must be a number'),
    validateResults,
]

module.exports = {
    validateStudentRegistration,
    validateStudentSearch,
    validateLRN,
    validateStudentId
}