const jwt = require("jsonwebtoken");

// Generate JWT
exports.generateToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

// store token
exports.storeToken = (res, token) => {
    res.cookie("sid", token, {
        httpOnly: true, // Prevent JS access (XSS protection)
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    });
};
