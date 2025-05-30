/* eslint-disable no-unused-vars */
const express = require("express");

const router = express.Router();
const { signupValidator, loginValidator } = require("../utils/vallidators/AuthValidator");

const {
  signup,
  login,
  forgotPassword,
  verifyPasswordresetcode,
  resetPassword,
} = require("../service/AuthService");

router.route("/signup").post( signup);
router.route("/login").post(loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyPasswordresetcode", verifyPasswordresetcode);
router.put("/setPassword", resetPassword);
module.exports = router;
