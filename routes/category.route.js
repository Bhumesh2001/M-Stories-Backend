const express = require("express");
const router = express.Router();

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require("../controllers/category.controller");

const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateMiddleware");
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');

const {
    createCategoryValidation,
    updateCategoryValidation,
} = require("../validators/category.validation");
const upload = require('../middlewares/upload.middleware');

// ✅ Create category (Admin only)
router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    upload.array('images', 5),
    createCategoryValidation,
    validateRequest,
    createCategory
);

// 🟢 Read all or by ID (Public)
router.get("/", cacheMiddleware, getAllCategories);
router.get("/:id", cacheMiddleware, getCategoryById);

// ✏️ Update category (Admin only)
router.put(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    upload.array('images', 5),
    updateCategoryValidation,
    validateRequest,
    updateCategory
);

// ❌ Delete category (Admin only)
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteCategory);

module.exports = router;
