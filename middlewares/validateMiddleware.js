const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/response");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errorResponse(res, "Validation error", 422, errors.array());
    }
    next();
};

module.exports = validateRequest;
