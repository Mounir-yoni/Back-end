const Voyage = require("../models/Voyage");
const ApiError = require("../utils/apierror");
const asyncHandler = require("express-async-handler");
const path = require('path');

// Create a new voyage
exports.createVoyage = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    destination,
    price,
    duration,
    startDate,
    endDate,
    maxTravelers,
  } = req.body;

  // Check if image was uploaded
  if (!req.file) {
    throw new ApiError("Please upload a voyage image", 400);
  }

  const voyage = await Voyage.create({
    title,
    description,
    destination,
    price,
    duration,
    startDate,
    endDate,
    maxTravelers,
    image: req.file.filename,
    imagePath: `/uploads/${req.file.filename}`,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: voyage,
  });
});

// Get all voyages
exports.getAllVoyages = asyncHandler(async (req, res) => {
  const voyages = await Voyage.find().populate("createdBy", "name email");

  res.status(200).json({
    status: "success",
    results: voyages.length,
    data: voyages,
  });
});

// Get a single voyage
exports.getVoyage = asyncHandler(async (req, res) => {
  const voyage = await Voyage.findById(req.params.id).populate(
    "createdBy",
    "name email"
  );

  if (!voyage) {
    throw new ApiError("Voyage not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: voyage,
  });
});

// Update a voyage
exports.updateVoyage = asyncHandler(async (req, res) => {
  const voyage = await Voyage.findById(req.params.id);

  if (!voyage) {
    throw new ApiError("Voyage not found", 404);
  }

  // Check if user is the creator of the voyage
  if (voyage.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not authorized to update this voyage", 403);
  }

  // If new image is uploaded
  if (req.file) {
    req.body.image = req.file.filename;
    req.body.imagePath = `./uploads/${req.file.filename}`;
  }

  const updatedVoyage = await Voyage.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedVoyage,
  });
});

// Delete a voyage
exports.deleteVoyage = asyncHandler(async (req, res) => {
  const voyage = await Voyage.findById(req.params.id);

  if (!voyage) {
    throw new ApiError("Voyage not found", 404);
  }

  // Check if user is the creator of the voyage
  if (voyage.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError("You are not authorized to delete this voyage", 403);
  }

  await voyage.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
}); 