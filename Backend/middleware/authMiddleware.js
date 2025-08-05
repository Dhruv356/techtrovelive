// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.header("Authorization");

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Access Denied: No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded.role) {
//       return res.status(401).json({ message: "Invalid token: Role missing" });
//     }

//     // ✅ Standardize: attach user to req.user
//     req.user = {
//       id: decoded.id || decoded.userId || null,
//       name: decoded.name || "User",
//       role: decoded.role,
//       email: decoded.email || null,
//     };

//     // Admin validation
//     const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
//     if (req.user.role === "admin" && req.user.email !== ALLOWED_ADMIN_EMAIL) {
//       return res.status(403).json({ message: "Access denied: Invalid admin email" });
//     }

//     next();
//   } catch (error) {
//     console.error("Auth Middleware Error:", error.message);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = authMiddleware;






const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.role) {
      return res.status(401).json({ message: "Invalid token: Role missing" });
    }

    req.userId = decoded.userId || null;
    req.name = decoded.name || "User"; // ✅ Add this
    req.role = decoded.role;
    req.email = decoded.email || null;

    // Admin email validation (only for admin)
    const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (req.role === "admin" && req.email !== ALLOWED_ADMIN_EMAIL) {
      return res.status(403).json({ message: "Access denied: Invalid admin email" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
