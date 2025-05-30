const express = require("express");
const router = express.Router();

const {
  getAllReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  getMyReservations,
} = require("../service/ReservationService");

const {
  createReservationValidator,
  updateReservationValidator,
  cancelReservationValidator,
} = require("../utils/vallidators/ReservationVallidator");

const { protect, allowedTo } = require("../service/AuthService");

// Protect all routes
router.use(protect);

// Get user's reservations
router.get("/my-reservations", getMyReservations);

// Admin and manager routes
router
  .route("/")
  .get(allowedTo("admin", "manager"), getAllReservations)
  .post(createReservationValidator, createReservation);

router
  .route("/:id")
  .get(getReservation)
  .put(allowedTo("admin", "manager"), updateReservationValidator, updateReservation);

router
  .route("/:id/cancel")
  .patch(cancelReservationValidator, cancelReservation);

module.exports = router; 