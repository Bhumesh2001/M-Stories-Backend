const express = require("express");
const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getBlogsByCategory,
} = require("../controllers/blog.controller");

const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/upload.middleware');
const { blogValidation } = require('../validators/blog.validator');
const validateRequest = require('../middlewares/validateMiddleware');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');

const router = express.Router();

// 🟢 Public Routes
router.get("/", cacheMiddleware, getAllBlogs);
router.get("/:id", cacheMiddleware, getBlogById);
router.get("/category/:id", cacheMiddleware, getBlogsByCategory);

// 🔒 Protected Routes (Admin Only)
router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    upload.array('images', 5),
    blogValidation,
    validateRequest,
    createBlog
);
router.put("/:id", authenticate, authorizeRoles("admin"), upload.array('images', 5), updateBlog);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteBlog);

module.exports = router;
