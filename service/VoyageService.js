const Voyage = require("../models/Voyage");
const APIFeatures = require("../utils/apiFeaturs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apierror");

// @desc get all Voyages
// @route GET /api/v1/voyages
// @access public
exports.getAllVoyage = asyncHandler(async (req, res, next) => {
  const countDocuments = await Voyage.countDocuments();

  const apiFeatures = new APIFeatures(Voyage.find().populate("createdBy", "name email"), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination(countDocuments)
    .search();

  const { paginationResult, mongooseQuery } = apiFeatures;
  const voyages = await mongooseQuery;

  // Transform the response to include full image URLs
  const voyagesResponse = voyages.map(voyage => {
    const voyageObj = voyage.toObject();
    voyageObj.imageUrl = `${process.env.BASE_URL || 'http://localhost:8000'}${voyage.imagePath}`;
    return voyageObj;
  });

  res.status(200).json({
    success: true,
    result: voyagesResponse.length,
    paginationResult,
    data: voyagesResponse
  });
});

// @desc get single Voyage
// @route GET /api/v1/voyages/:id
// @access public
exports.getVoyage = asyncHandler(async (req, res, next) => {
  const voyage = await Voyage.findById(req.params.id).populate(
    "createdBy",
    "name email"
  );

  if (!voyage) {
    return next(new ApiError("Voyage not found", 404));
  }

  // Transform the response to include the full image URL
  const voyageResponse = voyage.toObject();
  voyageResponse.imageUrl = `${process.env.BASE_URL || 'http://localhost:8000'}${voyage.imagePath}`;

  res.status(200).json({ success: true, data: voyageResponse });
});

// @desc create Voyage
// @route POST /api/v1/voyages
// @access private
exports.createVoyage = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    destination,
    prix,
    duree,
    date_de_depart,
    date_de_retour,
    nombre_de_personne,
    ville,
    pays,
  } = req.body;

  // Check if image was uploaded
  if (!req.file) {
    return next(new ApiError("Please upload a voyage image", 400));
  }

  const voyage = await Voyage.create({
    title,
    description,
    destination,
    prix,
    duree,
    date_de_depart,
    date_de_retour,
    nombre_de_personne,
    ville,
    pays,
    remaining_places: nombre_de_personne,
    image: req.file.filename,
    imagePath: `/uploads/${req.file.filename}`,
    createdBy: req.user._id,
  });

  // Transform the response to include the full image URL
  const voyageResponse = voyage.toObject();
  voyageResponse.imageUrl = `${process.env.BASE_URL || 'http://localhost:8000'}${voyage.imagePath}`;

  res.status(201).json({ success: true, data: voyageResponse });
});

// @desc update Voyage
// @route PUT /api/v1/voyages/:id
// @access private
exports.updateVoyage = asyncHandler(async (req, res, next) => {
  const voyage = await Voyage.findById(req.params.id);

  if (!voyage) {
    return next(new ApiError("Voyage not found", 404));
  }

  // Check if user is the creator of the voyage
  if (voyage.createdBy.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not authorized to update this voyage", 403));
  }

  // If new image is uploaded
  if (req.file) {
    req.body.image = req.file.filename;
    req.body.imagePath = `/uploads/${req.file.filename}`;
  }

  const updatedVoyage = await Voyage.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  // Transform the response to include the full image URL
  const voyageResponse = updatedVoyage.toObject();
  voyageResponse.imageUrl = `${process.env.BASE_URL || 'http://localhost:8000'}${updatedVoyage.imagePath}`;

  res.status(200).json({ success: true, data: voyageResponse });
});

// @desc delete Voyage
// @route DELETE /api/v1/voyages/:id
// @access private
exports.deleteVoyage = asyncHandler(async (req, res, next) => {
  const voyage = await Voyage.findById(req.params.id);

  if (!voyage) {
    return next(new ApiError("Voyage not found", 404));
  }

  // Check if user is the creator of the voyage
  if (voyage.createdBy.toString() !== req.user._id.toString()) {
    return next(new ApiError("You are not authorized to delete this voyage", 403));
  }

  await voyage.deleteOne();

  res.status(204).json({ success: true, data: null });
});

// @desc deactivate Voyage
// @route PATCH /api/v1/voyages/:id
// @access private
exports.deactivateVoyage = asyncHandler(async (req, res, next) => {
  const voyage = await Voyage.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!voyage) {
    return next(new ApiError("Voyage not found", 404));
  }

  res.status(200).json({ success: true, message: "Voyage deactivated successfully" });
});

