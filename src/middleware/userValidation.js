const {body, validationResult,query} = require('express-validator');

 const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }

    next();
 }

 const validateUserUpdate = [
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
    body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
    validateResults
 ]

 const validateUserSearch = [
     query('query')
     .notEmpty()
     .withMessage('Search query is required'),
     validateResults,
 ]

 const validateRoles =  [
    body('roles')
    .isArray()
    .withMessage('Roles must be an array')
    .notEmpty()
    .withMessage('At least one role is required')
    .custom(roles => {
        const validRoles = ['admin', 'teacher', 'student', 'registrar'];
        return roles.every(role => validRoles.includes(role))
    })
    .withMessage('Contains invalid role(s. Valid roles are: admin, teacher, student, registrar'),
    validateResults
 ]

 module.exports = {
    validateUserUpdate,
    validateUserSearch,
    validateRoles
 }