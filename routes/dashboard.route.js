const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

// ✅ GET /api/dashboard
router.get("/", authenticate, authorizeRoles("admin"), cacheMiddleware, dashboardController.getDashboardData);

module.exports = router;
