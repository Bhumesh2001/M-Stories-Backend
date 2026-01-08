const { body } = require("express-validator");

exports.blogValidation = [
    body("title").notEmpty().withMessage("Title is required"),
    body("author").notEmpty().withMessage("Author is required"),
    body("content").notEmpty().withMessage("Content is required"),
];
