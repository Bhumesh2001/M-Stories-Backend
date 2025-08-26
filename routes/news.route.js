const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const newsController = require("../controllers/news.controller");

const { newsValidation } = require("../validators/news.validation");
const validateRequest = require("../middlewares/validateMiddleware");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");

// ✅ Create News (Multiple Images)
router.post(
    "/",
    authenticate,
    authorizeRoles('admin'),
    upload.array("images", 5),
    newsValidation,
    validateRequest,
    newsController.createNews
);

// ✅ Get All News
router.get("/", newsController.getAllNews);

// ✅ Get News by ID
router.get("/:id", newsController.getNewsById);

// ✅ Update News (with new images)
router.put(
    "/:id",
    authenticate,
    authorizeRoles('admin'),
    upload.array("images", 5),
    newsController.updateNews
);

// ✅ Delete News
router.delete("/:id", authenticate, authorizeRoles('admin'), newsController.deleteNews);

module.exports = router;
