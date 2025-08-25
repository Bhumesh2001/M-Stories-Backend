const News = require("../models/News");
const { successResponse, errorResponse } = require("../utils/response");
const { uploadImage, deleteImage } = require("../utils/cloudinary");

exports.createNews = async (req, res, next) => {
    try {
        const { title, reporter, content, category, sourceUrl } = req.body;

        if (!title || !reporter || !content || !category) {
            return errorResponse(res, "All required fields must be provided", 400);
        }

        if (!req.files || req.files.length === 0) {
            return errorResponse(res, "At least one image is required", 400);
        }

        // ✅ Upload images
        const uploadResults = await Promise.all(
            req.files.map((file) => uploadImage(file.buffer, "News"))
        );

        const images = uploadResults.map((img) => ({
            url: img.secure_url,
            publicId: img.public_id,
        }));

        const news = await News.create({
            title,
            reporter,
            content,
            category,
            sourceUrl,
            images,
        });

        return successResponse(res, news, "News created successfully", 201);
    } catch (error) {
        next(error);
    }
};

exports.getAllNews = async (req, res, next) => {
    try {
        const newsList = await News.find().populate("category").sort({ createdAt: -1 });
        return successResponse(res, newsList);
    } catch (error) {
        next(error);
    }
};

exports.getNewsById = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id).populate("category");
        if (!news) return errorResponse(res, "News not found", 404);
        return successResponse(res, news);
    } catch (error) {
        next(error);
    }
};

exports.updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const news = await News.findById(id);
        if (!news) return errorResponse(res, "News not found", 404);

        let updatedData = { ...req.body };

        // ✅ If new images uploaded → delete old ones & upload new
        if (req.files && req.files.length > 0) {
            await Promise.all(news.images.map((img) => deleteImage(img.publicId)));

            const uploadResults = await Promise.all(
                req.files.map((file) => uploadImage(file.buffer, "News"))
            );

            updatedData.images = uploadResults.map((res) => ({
                url: res.secure_url,
                publicId: res.public_id,
            }));
        }

        const updatedNews = await News.findByIdAndUpdate(id, updatedData, { new: true });
        return successResponse(res, updatedNews, "News updated successfully");
    } catch (error) {
        next(error);
    }
};

exports.deleteNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const news = await News.findById(id);
        if (!news) return errorResponse(res, "News not found", 404);

        await Promise.all(news.images.map((img) => deleteImage(img.publicId)));
        await News.findByIdAndDelete(id);

        return successResponse(res, {}, "News deleted successfully");
    } catch (error) {
        next(error);
    }
};
