const News = require("../models/News");
const { successResponse, errorResponse } = require("../utils/response");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const { clearCache } = require('../middlewares/cacheMiddleware');

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
        clearCache("/api/news");

        return successResponse(res, news, "News created successfully", 201);
    } catch (error) {
        next(error);
    }
};

exports.getAllNews = async (req, res, next) => {
    try {
        // page aur limit query params se lo (default: page=1, limit=10)
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        // skip calculation
        const skip = (page - 1) * limit;

        // news list fetch with pagination
        const newsList = await News.find()
            .populate("category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // total documents count
        const totalNews = await News.countDocuments();

        return successResponse(res, {
            pagination: {
                total: totalNews,
                page,
                pages: Math.ceil(totalNews / limit),
                limit
            },
            newsList,
        });
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
        clearCache("/api/news");
        clearCache(`/api/news/${id}`);

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

        clearCache("/api/news");
        clearCache(`/api/news/${id}`);

        return successResponse(res, {}, "News deleted successfully");
    } catch (error) {
        next(error);
    }
};
