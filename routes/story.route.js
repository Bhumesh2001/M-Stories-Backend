const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const storyController = require("../controllers/story.controller");

const { storyValidation } = require("../validators/story.validation");
const validateRequest = require("../middlewares/validateMiddleware");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");

// ✅ Create Story
router.post(
    "/",
    /*authenticate,
    authorizeRoles('admin'),*/
    upload.array("images", 5),
    storyValidation,
    validateRequest,
    storyController.createStory
);

// ✅ Get All Stories
router.get("/", storyController.getAllStories);

// ✅ Get Story by ID
router.get("/:id", storyController.getStoryById);

// ✅ Update Story
router.put(
    "/:id",
    /*authenticate,
    authorizeRoles('admin'),*/
    upload.array("images", 5),
    storyController.updateStory
);

// ✅ Delete Story
router.delete("/:id", /*authenticate, authorizeRoles('admin'),*/ storyController.deleteStory);

module.exports = router;
