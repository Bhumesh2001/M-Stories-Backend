const xss = require("xss");

const sanitize = (value) => {
    if (typeof value === "string") return xss(value);
    if (typeof value === "object" && value !== null) {
        for (const key in value) {
            value[key] = sanitize(value[key]);
        }
    }
    return value;
};

const sanitizeMiddleware = (req, res, next) => {
    // Clone and sanitize body
    if (req.body) {
        req.body = sanitize({ ...req.body });
    }

    // Clone and sanitize query (avoid direct mutation)
    if (req.query) {
        req.query = sanitize({ ...req.query });
    }

    // Clone and sanitize params
    if (req.params) {
        req.params = sanitize({ ...req.params });
    }

    next();
};

module.exports = sanitizeMiddleware;
