const express = require("express");
const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
} = require("../controllers/blog.controller");

const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/upload.middleware');
const { blogValidation } = require('../validators/blog.validator');
const validateRequest = require('../middlewares/validateMiddleware')

const router = express.Router();

// 🟢 Public Routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// 🔒 Protected Routes (Admin Only)
router.post(
    "/",
    /*authenticate, 
    authorizeRoles("admin"),*/
    upload.array('images', 5),
    blogValidation,
    validateRequest,
    createBlog
);
router.put("/:id", /*authenticate, authorizeRoles("admin"),*/ upload.array('images', 5), updateBlog);
router.delete("/:id", /*authenticate, authorizeRoles("admin"),*/ deleteBlog);

module.exports = router;
