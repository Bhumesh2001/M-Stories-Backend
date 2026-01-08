const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            index: true, // For text search or sorting
        },
        author: {
            type: String,
            index: true,
        },
        content: String,
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            index: true, // To quickly find all blogs under a category
        },
        images: [{
            url: { type: String },
            publicId: { type: String },
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
