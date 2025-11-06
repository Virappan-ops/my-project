const jwt = require('jsonwebtoken');

// Ye function har protected API call se pehle chalega
const authMiddleware = (req, res, next) => {
  try {
    // Header se token nikaalo (e.g., 'Bearer <token>')
    const token = req.header('Authorization').split(' ')[1];

    if (!token) {
      return res.status(401).json('No token, authorization denied.');
    }

    // Token ko verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 'decoded' mein user ki ID hai (jo humne login ke time save ki thi)
    // Hum us ID ko 'req' object mein daal denge
    req.user = decoded; 
    
    next(); // Agle function (route handler) par jao

  } catch (err) {
    res.status(401).json('Token is not valid.');
  }
};

module.exports = authMiddleware;