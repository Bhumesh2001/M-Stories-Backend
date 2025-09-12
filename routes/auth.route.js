const express = require("express");
const router = express.Router();
const {
    register,
    login,
    getProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateAdminProfile,
    updateAdminPassword,
    logout,
    createUser
} = require("../controllers/auth.controller");
const {
    registerValidation,
    loginValidation,
} = require("../validators/auth.validation");
const validateRequest = require("../middlewares/validateMiddleware");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/upload.middleware');

// Public
router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.post("/logout", logout);

// Protected
router.get("/me", authenticate, authorizeRoles("admin"), getProfile);
router.get("/user/me", authenticate, getProfile);

router.put(
    "/update/profile",
    authenticate,
    authorizeRoles("admin"),
    upload.single("avatar"), // ✅ Image upload
    updateAdminProfile
);
router.put("/update/password", authenticate, authorizeRoles("admin"), updateAdminPassword);
router.post('/users/register', authenticate, authorizeRoles('admin'), createUser);
router.get("/users", authenticate, authorizeRoles("admin"), getAllUsers); // ✅ Get all users
router.get("/users/:id", getUserById); // ✅ Get single user
router.put("/users/:id", authenticate, authorizeRoles("admin"), updateUser); // ✅ Update user
router.delete("/users/:id", authenticate, authorizeRoles("admin"), deleteUser); // ✅ Delete user

module.exports = router;
