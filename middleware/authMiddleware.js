const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

  const authHeader =
    req.headers.authorization;

  // NO TOKEN

  if (!authHeader) {

    return res.status(401).json({
      msg: "No token provided",
    });

  }

  try {

    // REMOVE "Bearer "

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      msg: "Invalid token",
    });

  }
};

module.exports = protect;