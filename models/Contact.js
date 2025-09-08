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
        subject: String,
        message: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
