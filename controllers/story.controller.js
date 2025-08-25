const Story = require("../models/Story");
const { successResponse, errorResponse } = require("../utils/response");
const { uploadImage, deleteImage } = require("../utils/cloudinary");

// ✅ Create Story
exports.createStory = async (req, res, next) => {
    try {
        const { title, author, content, category, latest } = req.body;

        if (!title || !author || !content || !category) {
            return errorResponse(res, "All required fields must be provided", 400);
        }

        if (!req.files || req.files.length === 0) {
            return errorResponse(res, "At least one image is required", 400);
        }

        const uploadResults = await Promise.all(
            req.files.map((file) => uploadImage(file.buffer, "Story"))
        );

        const images = uploadResults.map((img) => ({
            url: img.secure_url,
            publicId: img.public_id,
        }));

        const story = await Story.create({
            title,
            author,
            content,
            category,
            latest: latest || false,
            images,
        });

        return successResponse(res, story, "Story created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Stories
exports.getAllStories = async (req, res, next) => {
    try {
        const stories = await Story.find().populate("category").sort({ createdAt: -1 });
        return successResponse(res, stories);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single Story
exports.getStoryById = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.id).populate("category");
        if (!story) return errorResponse(res, "Story not found", 404);
        return successResponse(res, story);
    } catch (error) {
        next(error);
    }
};

// ✅ Update Story
exports.updateStory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);
        if (!story) return errorResponse(res, "Story not found", 404);

        let updatedData = { ...req.body };

        if (req.files && req.files.length > 0) {
            await Promise.all(story.images.map((img) => deleteImage(img.publicId)));

            const uploadResults = await Promise.all(
                req.files.map((file) => uploadImage(file.buffer, "Story"))
            );

            updatedData.images = uploadResults.map((res) => ({
                url: res.secure_url,
                publicId: res.public_id,
            }));
        }

        const updatedStory = await Story.findByIdAndUpdate(id, updatedData, { new: true });
        return successResponse(res, updatedStory, "Story updated successfully");
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Story
exports.deleteStory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);
        if (!story) return errorResponse(res, "Story not found", 404);

        await Promise.all(story.images.map((img) => deleteImage(img.publicId)));
        await Story.findByIdAndDelete(id);

        return successResponse(res, {}, "Story deleted successfully");
    } catch (error) {
        next(error);
    }
};
