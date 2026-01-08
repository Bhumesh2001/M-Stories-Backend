const { errorResponse } = require("../utils/response");

exports.errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = [];

    // Handle Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map(e => e.message);
    }

    // Handle duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = `Duplicate field: ${Object.keys(err.keyValue).join(", ")}`;
    }

    // Handle JWT-related errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    return errorResponse(res, message, statusCode, errors);
};
