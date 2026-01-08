const Category = require("../models/Category");
const { successResponse, errorResponse } = require("../utils/response");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const { clearCache } = require('../middlewares/cacheMiddleware');

// ✅ Get All Categories with Pagination
exports.getAllCategories = async (req, res, next) => {
    try {
        // Page and limit (default: page=1, limit=10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Fetch categories
        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Count total documents
        const total = await Category.countDocuments();

        return successResponse(res, {
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            categories,
        }
        );
    } catch (error) {
        next(error);
    }
};

// ✅ Get Category by ID
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return errorResponse(res, "Category not found", 404);
        return successResponse(res, category);
    } catch (error) {
        next(error);
    }
};

// ✅ Create Category (Multiple Images)
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return errorResponse(res, "Name and description are required", 400);
        }

        if (!req.files || req.files.length === 0) {
            return errorResponse(res, "At least one image is required", 400);
        }

        // Upload all images
        const uploadedImages = await Promise.all(
            req.files.map((file) => uploadImage(file.buffer, "Category"))
        );

        const images = uploadedImages.map((img) => ({
            url: img.secure_url,
            publicId: img.public_id,
        }));

        const category = await Category.create({
            name,
            description,
            images,
        });

        clearCache('/api/categories');
        return successResponse(res, category, "Category created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// ✅ Update Category (Replace Images if New Uploaded)
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return errorResponse(res, "Category not found", 404);

        let updatedData = { name: req.body.name, description: req.body.description };

        // If new images uploaded → delete old ones & upload new
        if (req.files && req.files.length > 0) {
            // Delete old images
            await Promise.all(
                category.images.map((img) => deleteImage(img.publicId))
            );

            // Upload new images
            const uploadedImages = await Promise.all(
                req.files.map((file) => uploadImage(file.buffer, "Category"))
            );

            updatedData.images = uploadedImages.map((img) => ({
                url: img.secure_url,
                publicId: img.public_id,
            }));
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        );
        clearCache("/api/categories");
        clearCache(`/api/categories/${req.params.id}`);

        return successResponse(res, updatedCategory, "Category updated successfully");
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Category + Delete All Images
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return errorResponse(res, "Category not found", 404);

        // Delete all associated images from Cloudinary
        await Promise.all(
            category.images.map((img) => deleteImage(img.publicId))
        );

        await Category.findByIdAndDelete(req.params.id);
        clearCache("/api/categories");
        clearCache(`/api/categories/${req.params.id}`);

        return successResponse(res, {}, "Category deleted successfully");
    } catch (error) {
        next(error);
    }
};
