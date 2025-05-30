const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/ValidatorMiddelwares");
const User = require("../../models/User");
// eslint-disable-next-line import/order, import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");

const signupValidator = [
  check("Firstname")
    .notEmpty()
    .withMessage("Please add a Firstname")
    .isLength({ min: 3 })
    .withMessage("User name must be at least 3 characters")
    .isLength({ max: 30 })
    .withMessage("User name must be less than 30 characters"),
  check("Lastname")
    .notEmpty()
    .withMessage("Please add a Lastname")
    .isLength({ min: 3 })
    .withMessage("User name must be at least 3 characters")
    .isLength({ max: 30 })
    .withMessage("User name must be less than 30 characters"),
  check("email")
    .notEmpty()
    .withMessage("Please add a email")
    .isEmail()
    .withMessage("User email is invalid")
    .isLength({ max: 100 })
    .withMessage("User email must be less than 100 characters")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Please add a password")
    .isLength({ min: 6 })
    .withMessage("User password must be at least 6 characters")
    .isLength({ max: 30 })
    .withMessage("User password must be less than 30 characters"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation is invalid");
      }
      return true;
    }),
  validatorMiddleware,
];

const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Please add a email")
    .isEmail()
    .withMessage("User email is invalid")
    ,
  check("password")
    .notEmpty()
    .withMessage("Please add a password")
    .isLength({ min: 6 })
    .withMessage("User password must be at least 6 characters")
    .isLength({ max: 30 })
    .withMessage("User password must be less than 30 characters"),
  
  validatorMiddleware,
];




module.exports = {
  signupValidator,
  loginValidator,
};
