const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            index: true,
        },
        author: {
            type: String,
            index: true,
        },
        content: String,
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            index: true,
        },
        images: [{
            url: { type: String },
            publicId: { type: String },
        }],
        latest: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
