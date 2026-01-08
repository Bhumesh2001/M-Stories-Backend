const { body } = require("express-validator");

exports.newsValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("reporter").notEmpty().withMessage("Reporter is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("sourceUrl")
        .optional()
        .isURL()
        .withMessage("Source URL must be a valid URL"),
];
