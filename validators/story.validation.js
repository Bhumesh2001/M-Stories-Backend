const { body } = require("express-validator");

exports.storyValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("author").notEmpty().withMessage("Author is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("latest")
        .optional()
        .isBoolean()
        .withMessage("Latest must be true or false"),
];
