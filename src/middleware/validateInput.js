const validateInput = (req, res, next) => {
    const { first_name, last_name, email, password, role } = req.body;
  
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    next();
  };
  
  module.exports = validateInput;
  