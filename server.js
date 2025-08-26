const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errorMiddleware");
const sanitizeMiddleware = require("./middlewares/sanitizeMiddleware");

dotenv.config();
const app = express();
app.use(cookieParser());
app.set("trust proxy", 1);

// ------------------------------------
// 🛡️ 1. Connect to MongoDB
// ------------------------------------
connectDB();

// ------------------------------------
// 🛡️ 2. Security Middlewares
// ------------------------------------

// Set security HTTP headers
app.use(helmet());

// Rate limiter to prevent brute force
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later.",
});
app.use('/api/auth/login', limiter);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Enable CORS (set CLIENT_URL in .env for security in prod)
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize body data manually using mongo-sanitize (protect against NoSQL injection)
app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body);
    }
    next();
});

// Custom XSS and input sanitizer middleware
app.use(sanitizeMiddleware);

// ------------------------------------
// ✅ 3. Routes
// ------------------------------------
app.use("/api/blogs", require("./routes/blog.route"));
app.use("/api/categories", require("./routes/category.route"));
app.use("/api/contacts", require("./routes/contact.route"));
app.use("/api/news", require('./routes/news.route'));
app.use('/api/story', require('./routes/story.route'));
app.use("/api/auth", require("./routes/auth.route"));
app.use('/api/dashboard', require('./routes/dashboard.route'));

// Welcome Route
app.get("/", (req, res) => {
    res.send("<h1>🚀 Welcome to the Blog API Server!</h1>");
});

// ------------------------------------
// ❌ 4. Handle 404
// ------------------------------------
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ------------------------------------
// ⚠️ 5. Global Error Handler
// ------------------------------------
app.use(errorHandler);

// ------------------------------------
// 🚀 6. Start Server
// ------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running securely on http://localhost:${PORT}`);
});
