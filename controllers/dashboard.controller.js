const Blog = require("../models/Blog");
const Category = require("../models/Category");
const News = require("../models/News");
const Story = require("../models/Story");
const User = require("../models/User");
const Visitor = require("../models/Visitor");
const { successResponse } = require("../utils/response");

exports.getDashboardData = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const month = today.slice(0, 7);

        // ✅ Fetch total counts in parallel for better performance
        const [blogsCount, categoriesCount, newsCount, storiesCount, usersCount, latestUsers, todayCount, monthCount, totalCount] =
            await Promise.all([
                Blog.countDocuments(),
                Category.countDocuments(),
                News.countDocuments(),
                Story.countDocuments(),
                User.countDocuments({ role: "user" }),
                User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5), // ✅ latest 5 users
                Visitor.countDocuments({ date: today }),
                Visitor.countDocuments({ date: { $regex: `^${month}` } }),
                Visitor.countDocuments(),
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
            stats: {
                today: todayCount,
                month: monthCount,
                total: totalCount,
            },
        });
    } catch (err) {
        next(err);
    }
};
