const Blog = require("../models/Blog");
const { successResponse, errorResponse } = require("../utils/response");
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { clearCache } = require("../middlewares/cacheMiddleware");

exports.getAllBlogs = async (req, res, next) => {
    try {
        // Get page and limit from query params, default: page=1, limit=10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Fetch blogs with pagination
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .populate("category")
            .skip(skip)
            .limit(limit);

        // Count total documents for pagination info
        const total = await Blog.countDocuments();

        return successResponse(res, {
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            blogs,
        }, "Blogs fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.getBlogsByCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get page and limit from query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch blogs with pagination and category filter
        const blogs = await Blog.find({ category: id })
            .sort({ createdAt: -1 })
            .populate("category", "name description") // sirf zaroori fields
            .skip(skip)
            .limit(limit)
            .lean();

        // Count total documents for this category
        const total = await Blog.countDocuments({ category: id });

        return successResponse(res, {
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            blogs,
        },
            "Blogs fetched successfully by category"
        );
    } catch (error) {
        next(error);
    }
};

exports.getBlogById = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("category");
        if (!blog) return errorResponse(res, "Blog not found", 404);
        return successResponse(res, blog, "Blog fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.createBlog = async (req, res, next) => {
    try {
        const { title, author, content, category } = req.body;

        if (!title || !author || !content || !category) {
            return errorResponse(res, "All fields are required", 400);
        }

        if (!req.files || req.files.length === 0) {
            return errorResponse(res, "At least one image is required", 400);
        }

        // Upload all images
        const uploadResults = await Promise.all(
            req.files.map((file) => uploadImage(file.buffer, "Blog"))
        );

        const images = uploadResults.map((res) => ({
            url: res.secure_url,
            publicId: res.public_id,
        }));

        const blog = await Blog.create({
            title,
            author,
            content,
            category,
            images,
        });
        clearCache('/api/blogs');

        return successResponse(res, blog, "Blog created successfully", 201);
    } catch (error) {
        next(error);
    }
};

exports.updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) return errorResponse(res, "Blog not found", 404);

        let updatedData = { ...req.body };

        let finalImages = [];

        // 1️⃣ Keep existing images
        if (req.body.existingImages) {
            const existing = Array.isArray(req.body.existingImages)
                ? req.body.existingImages
                : [req.body.existingImages];

            existing.forEach((url) => {
                finalImages.push({
                    url: url,
                    publicId: url.split("/").pop().split(".")[0], // optional extraction
                });
            });
        }

        // 2️⃣ Handle new uploads (if any)
        if (req.files && req.files.length > 0) {
            const uploadResults = await Promise.all(
                req.files.map((file) => uploadImage(file.buffer, "Blog"))
            );

            uploadResults.forEach((res) => {
                finalImages.push({
                    url: res.secure_url,
                    publicId: res.public_id,
                });
            });
        }

        // 3️⃣ Assign final image array
        updatedData.images = finalImages;

        const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, { new: true });
        clearCache('/api/blogs');
        clearCache(`/api/blogs/${id}`);
        clearCache(`/api/blogs/category/${updatedBlog.category}`);

        return successResponse(res, updatedBlog, "Blog updated successfully");
    } catch (error) {
        next(error);
    }
};

exports.deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) return errorResponse(res, "Blog not found", 404);

        await Promise.all(blog.images.map((img) => deleteImage(img.publicId)));

        await Blog.findByIdAndDelete(id);

        clearCache('/api/blogs');
        clearCache(`/api/blogs/${id}`);
        clearCache(`/api/blogs/category/${blog.category}`);

        return successResponse(res, {}, "Blog deleted successfully");
    } catch (error) {
        next(error);
    }
};
