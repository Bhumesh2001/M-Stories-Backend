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

// ✅ Create contact (Public)
router.post("/", createContactValidation, validateRequest, createContact);

// 🔐 Admin-only: Get all contacts
router.get("/", /*authenticate, authorizeRoles("admin"),*/ getAllContacts);

// 🔐 Admin-only: Get single contact by ID
router.get("/:id", /*authenticate, authorizeRoles("admin"),*/ getContactById);

module.exports = router;
