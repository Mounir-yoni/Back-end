const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/ValidatorMiddelwares");

exports.createVoyageVallidator = [
    check("title")
    .notEmpty()
    .withMessage("title is required")
    .isLength({ min: 3 })
    .withMessage("title must be at least 3 characters long")
    .isLength({ max: 100 })
    .withMessage("title must be less than 100 characters long"),
    check("description")
    .notEmpty()
    .withMessage("description is required")
    .isLength({ min: 10 })
    .withMessage("description must be at least 10 characters long")
    .isLength({ max: 2000 })
    .withMessage("description must be less than 1000 characters long"),
    check("image")
    .optional()
    .isURL()
    .withMessage("image must be a valid URL"),  
    check("ville")
    .notEmpty()
    .withMessage("ville is required")
    .isArray()
    .withMessage("ville must be an array")
    .isLength({ min: 1 })
    .withMessage("ville must be at least 1 item long"),
    check("pays")
    .notEmpty()
    .withMessage("pays is required")
    .isString()
    .withMessage("pays must be a string")
    .isLength({ min: 1 })
    .withMessage("pays must be at least 1 character long"),
    check("nombre_de_personne")
    .notEmpty()
    .withMessage("nombre_de_personne is required")
    .isInt()
    .withMessage("nombre_de_personne must be an integer")
    .isLength({ min: 1 })
    .withMessage("nombre_de_personne must be at least 1"),
    check("nombre_de_personne_reserve")
    .notEmpty()
    .withMessage("nombre_de_personne_reserve is required")
    .isInt()
    .withMessage("nombre_de_personne_reserve must be an integer")
    .isLength({ min: 1 })
    .withMessage("nombre_de_personne_reserve must be at least 1"),
    check("prix")
    .notEmpty()
    .withMessage("prix is required")
    .isInt()
    .withMessage("prix must be an integer")
    .isLength({ min: 1 })
    .withMessage("prix must be at least 1"),
    check("date_de_depart")
    .notEmpty()
    .withMessage("date_de_depart is required")
    .isDate()
    .withMessage("date_de_depart must be a valid date")
    .isLength({ min: 1 })
    .withMessage("date_de_depart must be at least 1 character long"),
    check("date_de_retour")
    .notEmpty()
    .withMessage("date_de_retour is required")
    .isDate()
    .withMessage("date_de_retour must be a valid date")
    .isLength({ min: 1 })
    .withMessage("date_de_retour must be at least 1 character long"),
    check("duree")
    .notEmpty()
    .withMessage("duree is required")
    .isInt()
    .withMessage("duree must be an integer")
    .isLength({ min: 1 })
    .withMessage("duree must be at least 1 character long"),
    body("title").custom((val, { req }) => {
        req.body.slug = slugify(val, { lower: true });
        return true;
    }),
    validatorMiddleware,
]