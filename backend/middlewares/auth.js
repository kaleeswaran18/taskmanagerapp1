const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token with your secret
    req.user = verified; // Attach user info (including role) to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
const checkRole = (allowedRoles) => (req, res, next) => {
    const userRole = req.user.role; // Role is included in the JWT payload
    console.log(userRole,"userRole")
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
    }
    next();
  };

module.exports = { verifyToken,checkRole };
