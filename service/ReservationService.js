const Reservation = require("../models/Reservation");
const Voyage = require("../models/Voyage");
const APIFeatures = require("../utils/apiFeaturs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apierror");

// @desc    Get all reservations
// @route   GET /api/v1/reservations
// @access  Private (Admin, Manager)


  

exports.getAllReservations = asyncHandler(async (req, res, next) => {
  const countDocuments = await Reservation.countDocuments();

  const apiFeatures = new APIFeatures(Reservation.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination(countDocuments)
    .search();

  const { paginationResult, mongooseQuery } = apiFeatures;
  const reservations = await mongooseQuery.populate({
    path: "voyage user",
    select: "title Firstname Lastname phone email date_de_depart",
  });

  res.status(200).json({
    success: true,
    result: reservations.length,
    paginationResult,
    data: reservations,
  });
});

// @desc    Get single reservation
// @route   GET /api/v1/reservations/:id
// @access  Private
exports.getReservation = asyncHandler(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id).populate({
    path: "voyage user",
    select: "title name email duree pays",
  });

  if (!reservation) {
    return next(new ApiError("Reservation not found", 404));
  }

  // Check if user is authorized to view this reservation
  if (req.user.role !== "admin" && req.user.role !== "manager" && req.user._id.toString() !== reservation.user._id.toString()) {
    return next(new ApiError("You are not authorized to view this reservation", 403));
  }

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

// @desc    Create new reservation
// @route   POST /api/v1/reservations
// @access  Private
exports.createReservation = asyncHandler(async (req, res, next) => {
  // Get voyage details
  const voyage = await Voyage.findById(req.body.voyage);
  if (!voyage) {
    return next(new ApiError("Voyage not found", 404));
  }

  // Check if voyage is active
  if (!voyage.active) {
    return next(new ApiError("This voyage is not available for reservation", 400));
  }

  // Check if there are enough places
  if (voyage.nombre_de_personne_reserve + req.body.numberOfPeople > voyage.nombre_de_personne) {
    return next(new ApiError("Not enough places available", 400));
  }

  // Calculate total price
  const totalPrice = voyage.prix * req.body.numberOfPeople;

  // Create reservation
  const reservation = await Reservation.create({
    voyage: req.body.voyage,
    user: req.user._id,
    phone: req.body.phone,
    numberOfPeople: req.body.numberOfPeople,
    totalPrice,
    specialRequests: req.body.specialRequests,
  });

  // Update voyage reserved places
  voyage.nombre_de_personne_reserve += req.body.numberOfPeople;
  voyage.remaining_places -= req.body.numberOfPeople;
  await voyage.save();

  res.status(201).json({
    success: true,
    data: reservation,
  });
});

// @desc    Update reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private (Admin, Manager)
exports.updateReservation = asyncHandler(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return next(new ApiError("Reservation not found", 404));
  }

  // Only allow status and paymentStatus updates
  const allowedUpdates = ["status", "paymentStatus"];
  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const updatedReservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatedReservation,
  });
});

// @desc    Cancel reservation
// @route   PATCH /api/v1/reservations/:id/cancel
// @access  Private
exports.cancelReservation = asyncHandler(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return next(new ApiError("Reservation not found", 404));
  }

  // Check if user is authorized to cancel this reservation
  if (req.user.role !== "admin" && req.user.role !== "manager" && req.user._id.toString() !== reservation.user._id.toString()) {
    return next(new ApiError("You are not authorized to cancel this reservation", 403));
  }

  // Check if reservation can be cancelled
  if (reservation.status === "cancelled") {
    return next(new ApiError("Reservation is already cancelled", 400));
  }

  // Update reservation status
  reservation.status = "cancelled";
  await reservation.save();

  // Update voyage reserved places
  const voyage = await Voyage.findById(reservation.voyage);
  if (voyage) {
    voyage.nombre_de_personne_reserve -= reservation.numberOfPeople;
    voyage.remaining_places += reservation.numberOfPeople;
    await voyage.save();
  }

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

// @desc    Get user reservations
// @route   GET /api/v1/reservations/my-reservations
// @access  Private
exports.getMyReservations = asyncHandler(async (req, res, next) => {
  const reservations = await Reservation.find({ user: req.user._id }).populate({
    path: "voyage",
    select: "title date_de_depart date_de_retour prix duree pays",
  });

  res.status(200).json({
    success: true,
    result: reservations.length,
    data: reservations,
  });
}); 