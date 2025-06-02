const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const {
  createVoyage,
  getAllVoyage,
  getVoyage,
  updateVoyage,
  deleteVoyage,
} = require("../service/VoyageService");
const { protect, allowedTo } = require("../service/AuthService");

// Public routes
router.get("/", getAllVoyage);
router.get("/:id", getVoyage);

// Protected routes
router.use(protect);
router.use(allowedTo("admin", "superadmin","manager"));
router.post("/", upload.single("image"), createVoyage);
router.put("/:id", upload.single("image"), updateVoyage);
router.delete("/:id", deleteVoyage);

module.exports = router;

