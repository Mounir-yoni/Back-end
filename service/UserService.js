const User = require("../models/User");
const APIFeatures = require("../utils/apiFeaturs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apierror");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const countDocuments = await User.countDocuments();

    const apiFeatures = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination(countDocuments)
      .search();
  
    const { paginationResult, mongooseQuery } = apiFeatures;
    const Users = await mongooseQuery;
  
    res.status(200).json({
      success: true,
      result: Users.length,
      paginationResult,
      data: Users
    });
});

exports.getUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return next(new ApiError(`No user found for this id ${id}`, 404));
    }
    res.status(200).json({ user });
});

exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    res.status(201).json({ user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(
        req.params.id,
        {
          Firstname: req.body.Firstname,
          Lastname: req.body.Lastname,
          email: req.body.email,
          phone: req.body.phone,
          role: req.body.role,
          profileImage: req.body.profileImage,
          Adress: req.body.Adress,
          ville: req.body.ville,
          codePostal: req.body.codePostal
        },
        {
          new: true,
        }
      );
      if (!document) {
        return next(new ApiError("document not found", 404));
      }
      res.status(200).json({ data: document });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await User.findByIdAndUpdate(id, { active: false });
    if (!document) {
        return next(new ApiError("document not found", 404));
    }
    res.status(200).json({ data: document });
});


exports.updatePassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordchangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError("document not found", 404));
  }
  res.status(200).json({ data: document });
});
// @desc get logged in user data
// @route get /api/v1/users/me
// @access private
exports.getuserloggeddata = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc update logged  user password
// @route put /api/v1/users/updatepassword
// @access private/protected

exports.updateuserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordchangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
  res.status(200).json({
    status: "success",
    token,
  });
});

// @desc update logged  user data
// @route put /api/v1/users/updateme
// @access private/protected

exports.updateuserme = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      Firstname: req.body.Firstname,
      Lastname: req.body.Lastname,
      email: req.body.email,
      phone: req.body.phone,
      Adress: req.body.address,
      ville: req.body.city,
      codePostal: req.body.postalCode
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    user: user
  });
});


// @desc disactivate logged  user 
// @route put /api/v1/users/disactivate
// @access private/protected

exports.disactivateuser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    user: user
  });
});