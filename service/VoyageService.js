const Voyage = require("../models/Voyage");
const APIFeatures = require("../utils/apiFeaturs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apierror");

// @desc get all Voyages
// @route GET /api/v1/voyages
// @access public
exports.getAllVoyage = asyncHandler(async (req, res, next) => {
  const countDocuments = await Voyage.countDocuments();

  const apiFeatures = new APIFeatures(Voyage.find({active: true}).populate("createdBy", "name email"), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination(countDocuments)
    .search();

  const { paginationResult, mongooseQuery } = apiFeatures;
  const voyages = await mongooseQuery;


  res.status(200).json({
    success: true,
    result: voyages.length,
    paginationResult,
    data: voyages
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

  

  res.status(200).json({ success: true, data: voyage });
});

// @desc create Voyage
// @route POST /api/v1/voyages
// @access private
exports.createVoyage = asyncHandler(async (req, res, next) => {
  console.log("create voyage");
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
    image: req.file ? req.file.path : "default.jpg", // Cloudinary URL
    imageId: req.file ? req.file.filename : "default.jpg", // Cloudinary public_id
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: voyage });
});

// @desc update Voyage
// @route PUT /api/v1/voyages/:id
// @access private
exports.updateVoyage = asyncHandler(async (req, res, next) => {
  const voyage = await Voyage.findById(req.params.id);

  if (!voyage) {
    return next(new ApiError("Voyage not found", 404));
  }


  // If new image is uploaded
  if (req.file) {
    req.body.image = req.file.path; // Cloudinary URL
    req.body.imageId = req.file.filename; // Cloudinary public_id
  }

  const updatedVoyage = await Voyage.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: updatedVoyage });
});

// @desc delete Voyage
// @route DELETE /api/v1/voyages/:id
// @access private
exports.deleteVoyage = asyncHandler(async (req, res, next) => {
  const voyage = await Voyage.findById(req.params.id);

  if (!voyage) {
    return next(new ApiError("Voyage not found", 404));
  }




  await voyage.updateOne({ active: false });

  res.status(200).json({ success: true, message: "Voyage deleted successfully" });
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

