const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            index: true, // for faster queries by name
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // index for email search and uniqueness
        },
        password: String,
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            index: true, // filter users by role
        },
        avatar: {
            url: String,
            publicId: String
        },
        status: {
            type: String,
            enum: ['active', 'inactive']
        }
    },
    { timestamps: true }
);

// Hash password before savings
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.matchPassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
