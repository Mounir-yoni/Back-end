const express = require("express");

const router = express.Router();

const { Statistic } = require("../service/Statistic");
const { protect, allowedTo } = require("../service/AuthService");

router.route("/").get(protect, allowedTo("admin", "superadmin", "manager"),Statistic);

module.exports = router;