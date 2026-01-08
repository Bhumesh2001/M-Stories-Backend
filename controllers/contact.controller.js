const Contact = require("../models/Contact");
const { successResponse, errorResponse } = require("../utils/response");
const { clearCache } = require('../middlewares/cacheMiddleware');

// Create Contact
exports.createContact = async (req, res, next) => {
    try {
        const contact = await Contact.create(req.body);
        clearCache('/api/contacts');

        return successResponse(res, contact, "Contact submitted successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Get All Contacts
exports.getAllContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        return successResponse(res, contacts, "Contacts fetched successfully");
    } catch (error) {
        next(error);
    }
};

// Get Single Contact
exports.getContactById = async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return errorResponse(res, "Contact not found", 404);
        return successResponse(res, contact, "Contact fetched successfully");
    } catch (error) {
        next(error);
    }
};
