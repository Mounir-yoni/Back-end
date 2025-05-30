const ApiError = require("../utils/apierror");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for debugging
    console.error("ERROR 💥", err);

    // Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const handleJWTErrorSignature = () =>
  new ApiError("Invalid Token Please login again", 401);

const handleJWTErrorTokenExpiredError = () =>
  new ApiError("Token Expired Please login again", 401);

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? Object.values(err.keyValue)[0] : 'value';
  const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
  const message = `Duplicate field value: ${value}. Please use another ${field}`;
  return new ApiError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ApiError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handle specific errors
  if (err.code === 11000) {
    err = handleDuplicateFieldsDB(err);
  }
  if (err.name === "JsonWebTokenError") {
    err = handleJWTErrorSignature();
  }
  if (err.name === "TokenExpiredError") {
    err = handleJWTErrorTokenExpiredError();
  }
  if (err.name === "ValidationError") {
    err = handleValidationErrorDB(err);
  }
  if (err.name === "CastError") {
    err = handleCastErrorDB(err);
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

module.exports = globalError;
