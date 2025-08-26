const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response");

exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.sid;
    if (!token) return errorResponse(res, "Unauthorized", 401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return errorResponse(res, "Invalid or expired token", 403);
    }
};

// Restrict to roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, "Forbidden: You don't have access", 403);
        }
        next();
    };
};
