const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            index: true,
        },
        reporter: {
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
        sourceUrl: String, // optional: where the news was sourced from
    },
    { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
