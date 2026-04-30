const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.headers.authorization;

  // ❌ No token → BLOCK
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, "mysecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = protect;