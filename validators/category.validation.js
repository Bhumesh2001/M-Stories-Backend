const { body } = require("express-validator");

exports.createCategoryValidation = [
    body("name").notEmpty().withMessage("Name is required"),
];

exports.updateCategoryValidation = [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
];
