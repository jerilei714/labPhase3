const jwt = require('jsonwebtoken');
const { getUserByToken, getUser } = require('../Model/labUsers');
const JWT_SECRET = "fd619fbed37454c3c75b121d7e07e4e310f77f5b502b9dcb6a9f749952cab382";
const authenticated = async (req, res, next) => {
  const token = req.cookies.rememberMe;
  const seshToken = req.cookies.sessionToken;
  if (!token && !seshToken) {
    return next(); 
  }
  try {
    if (seshToken) {
      const decoded = jwt.verify(seshToken, JWT_SECRET);
      user = await getUser(decoded.username); 
    } else if (token) {
      user = await getUserByToken(token);
    }
    if (!user) {
      return next();
    }
    
    req.user = user;
    next();
  } catch (error) {
    next();
  }
};

module.exports = authenticated;
