const Blog = require("../models/Blog");
const Category = require("../models/Category");
const News = require("../models/News");
const Story = require("../models/Story");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");

exports.getDashboardData = async (req, res, next) => {
    try {
        // ✅ Fetch total counts in parallel for better performance
        const [blogsCount, categoriesCount, newsCount, storiesCount, usersCount, latestUsers] =
            await Promise.all([
                Blog.countDocuments(),
                Category.countDocuments(),
                News.countDocuments(),
                Story.countDocuments(),
                User.countDocuments({ role: "user" }),
                User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5), // ✅ latest 5 users
            ]);

        return successResponse(res, {
            totals: {
                blogs: blogsCount,
                categories: categoriesCount,
                news: newsCount,
                stories: storiesCount,
                users: usersCount,
            },
            latestUsers,
        });
    } catch (err) {
        next(err); // ✅ Pass error to error middleware
    }
};
