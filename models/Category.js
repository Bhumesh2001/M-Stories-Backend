const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            index: true,
            unique: true, // Optional: ensure category names are unique
        },
        description: String,
        images: [{
            url: { type: String },
            publicId: { type: String },
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
