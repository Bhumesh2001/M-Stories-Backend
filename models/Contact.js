const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            index: true,
        },
        email: {
            type: String,
            index: true,
        },
        message: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
