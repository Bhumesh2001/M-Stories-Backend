const cloudinary = require("../config/cloudinary.js");
const streamifier = require("streamifier");

// ✅ Upload Image
exports.uploadImage = (fileBuffer, folder = "Blog") => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) return reject(new Error("File buffer is required"));

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "auto" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// ✅ Delete Image
exports.deleteImage = async (publicId) => {
    if (!publicId) return { success: false, message: "Public ID is required" };

    try {
        await cloudinary.uploader.destroy(publicId);
        return { success: true };
    } catch (error) {
        throw new Error("Failed to delete image: " + error.message);
    }
};

// ✅ Update Image
exports.updateImage = async (fileBuffer, oldPublicId, folder = "Blog") => {
    if (!fileBuffer) throw new Error("New image file buffer is required");

    if (oldPublicId) {
        try {
            await exports.deleteImage(oldPublicId);
        } catch (err) {
            console.error("⚠️ Failed to delete old image:", err.message);
        }
    }

    return exports.uploadImage(fileBuffer, folder);
};
