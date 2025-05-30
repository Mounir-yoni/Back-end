const express = require("express");
const router = express.Router();
const { getAllVoyage, getVoyage, createVoyage, updateVoyage, deleteVoyage } = require("../service/VoyageService");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Public routes
router.get("/", getAllVoyage);
router.get("/:id", getVoyage);

// Protected routes (require authentication)
router.use(protect);

// Admin and agent routes
router.use(restrictTo("admin", "superadmin", "manager"));

router.post(
  "/",
  upload.single("image"),
  createVoyage
);

router.patch(
  "/:id",
  upload.single("image"),
  updateVoyage
);

router.delete("/:id", deleteVoyage);

module.exports = router;

