const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { storeToken, generateToken } = require('../utils/cookie');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role = 'user' } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return errorResponse(res, "User already exists", 409);

        const user = await User.create({ name, email, password, role });
        const token = generateToken(user);
        storeToken(res, token);

        return successResponse(res, { user, token }, "User registered successfully", 201);
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return errorResponse(res, "Invalid credentials", 401);

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return errorResponse(res, "Invalid credentials", 401);

        const token = generateToken(user);
        storeToken(res, token);

        return successResponse(res, { user, token }, "Login successful");
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    try {
        res.cookie("sid", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            expires: new Date(0),
        });

        return successResponse(res, "Logged out successfully");
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        return successResponse(res, user, "User profile fetched");
    } catch (err) {
        next(err);
    }
};

exports.updateAdminProfile = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const admin = await User.findById(adminId);

        if (!admin) return errorResponse(res, "Admin not found", 404);

        let updatedData = {
            name: req.body.name || admin.name,
            email: req.body.email || admin.email,
        };

        // ✅ If new image uploaded
        if (req.file) {
            // Delete old image from Cloudinary
            if (admin.avatar && admin.avatar.publicId) {
                await deleteImage(admin.avatar.publicId);
            }

            // Upload new image to Cloudinary
            const uploadedImage = await uploadImage(req.file.buffer, "Admin");

            updatedData.avatar = {
                url: uploadedImage.secure_url,
                publicId: uploadedImage.public_id,
            };
        }

        const updatedAdmin = await User.findByIdAndUpdate(
            adminId,
            updatedData,
            { new: true, runValidators: true }
        ).select("-password");

        return successResponse(res, updatedAdmin, "Profile updated successfully");
    } catch (error) {
        next(error);
    }
};

exports.updateAdminPassword = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Check required fields
        if (!currentPassword || !newPassword) {
            return errorResponse(res, "Current and new password are required", 400);
        }

        // Find admin
        const admin = await User.findById(adminId);
        if (!admin) return errorResponse(res, "Admin not found", 404);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return errorResponse(res, "Current password is incorrect", 401);

        admin.password = newPassword
        await admin.save();;

        return successResponse(res, null, "Password updated successfully");
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({ role: "user" }).skip(skip).limit(limit).select("-password");
        const totalUsers = await User.countDocuments({ role: 'user' });

        return successResponse(res, {
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            users
        }, "Users fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return errorResponse(res, "User not found", 404);
        }
        return successResponse(res, user, "User fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }
        return successResponse(res, user, "User updated successfully");
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return errorResponse(res, "User not found", 404);
        }
        return successResponse(res, {}, "User deleted successfully");
    } catch (error) {
        next(error);
    }
};
