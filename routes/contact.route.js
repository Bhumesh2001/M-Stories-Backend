const express = require("express");
const router = express.Router();

const {
    createContact,
    getAllContacts,
    getContactById,
} = require("../controllers/contact.controller");

const { createContactValidation } = require("../validators/contact.validation");
const validateRequest = require("../middlewares/validateMiddleware");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');

// ✅ Create contact (Public)
router.post("/", createContactValidation, validateRequest, createContact);

// 🔐 Admin-only: Get all contacts
router.get("/", authenticate, authorizeRoles("admin"), cacheMiddleware, getAllContacts);

// 🔐 Admin-only: Get single contact by ID
router.get("/:id", authenticate, authorizeRoles("admin"), cacheMiddleware, getContactById);

module.exports = router;
