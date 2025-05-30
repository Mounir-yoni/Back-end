/* eslint-disable import/order */
// eslint-disable-next-line import/no-unresolved
const crypto = require("crypto");
const usermodel = require("../models/User");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apierror");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require("jsonwebtoken");

exports.signup = asyncHandler(async (req, res, next) => {
  //1-create new user
  console.log(req.body);
  const newuser = await usermodel.create({
    Firstname: req.body.Firstname,
    Lastname: req.body.Lastname,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    Adress: req.body.Adress,
    ville: req.body.ville,
    codePostal: req.body.codePostal,

    passwordchangeAt: Date.now(),
  });
  console.log("hhellsdf")
  //2-generate token
  const token = jwt.sign({ id: newuser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  //3-send token to client
  res.status(201).json({
    status: "success",
    token,
    user: newuser,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //1-check if user exist
  const user = await usermodel.findOne({ email }).select("+password");

  if (!user) {
    return next(new ApiError("Incorrect email ", 401));
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect password", 401));
  }

  //2-generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  //3-send token to client
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("You are not logged in", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await usermodel.findById(decoded.id);

  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists", 401)
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.passwordchangeAt) {
    const changedPasswordAfter = parseInt(
      currentUser.passwordchangeAt.getTime() / 1000,
      10
    );
    if (changedPasswordAfter > decoded.iat) {
      return next(new ApiError("User recently changed password", 401));
    }
  }

  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to do this action", 403)
      );
    }
    next();
  });

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await usermodel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user with email address", 404));
  }
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const hachedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetToken = hachedResetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetverified = false;
  await user.save({ validateBeforeSave: false });
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      text: `Your password reset token is : ${resetToken} \n If you didn't forget your password, please ignore this email`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetverified = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ApiError(err.message, 500));
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email",
  });
});

exports.verifyPasswordresetcode = asyncHandler(async (req, res, next) => {
  const resetcode = req.body.resetcode;

  const hachedResetToken = crypto
    .createHash("sha256")
    .update(resetcode)
    .digest("hex");

  const user = await usermodel.findOne({
    passwordResetToken: hachedResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Invalid or expired password reset token", 400));
  }
  user.passwordResetverified = true;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "Password reset token verified",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  const user = await usermodel.findOne({ email });
  if (!user) {
    return next(new ApiError("There is no user with email address", 404));
  }
  if (!user.passwordResetverified) {
    return next(
      new ApiError("You have to verify your password reset token", 401)
    );
  }

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetverified = undefined;
  user.password = password;
  user.passwordchangeAt = Date.now();
  await user.save();
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
    token,
  });
});
