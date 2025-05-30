const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/ValidatorMiddelwares");
const Voyage = require("../../models/Voyage");

exports.createReservationValidator = [
  check("voyage")
    .notEmpty()
    .withMessage("Voyage ID is required")
    .isMongoId()
    .withMessage("Invalid voyage ID")
    .custom(async (value) => {
      const voyage = await Voyage.findById(value);
      if (!voyage) {
        throw new Error("Voyage not found");
      }
      if (!voyage.active) {
        throw new Error("This voyage is not available for reservation");
      }
      return true;
    }),

  check("numberOfPeople")
    .notEmpty()
    .withMessage("Number of people is required")
    .isInt({ min: 1 })
    .withMessage("Number of people must be at least 1")
    .custom(async (value, { req }) => {
      const voyage = await Voyage.findById(req.body.voyage);
      if (voyage.nombre_de_personne_reserve + value > voyage.nombre_de_personne) {
        throw new Error("Not enough places available");
      }
      return true;
    }),

  check("specialRequests")
    .optional()
    .isString()
    .withMessage("Special requests must be a string")
    .isLength({ max: 500 })
    .withMessage("Special requests must be less than 500 characters"),

  validatorMiddleware,
];

exports.updateReservationValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid reservation ID"),

  check("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled"])
    .withMessage("Invalid status"),

  check("paymentStatus")
    .optional()
    .isIn(["pending", "paid", "refunded"])
    .withMessage("Invalid payment status"),

  validatorMiddleware,
];

exports.cancelReservationValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid reservation ID"),
  validatorMiddleware,
]; 