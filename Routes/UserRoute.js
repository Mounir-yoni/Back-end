const express = require("express");

const router = express.Router();

const { getAllUsers, getUser, createUser, updateUser, deleteUser, updatePassword, updateuserme, disactivateuser, getuserloggeddata, updateuserPassword } = require("../service/UserService");
const { newUserValidator, getUservalidator, updateUservalidator, deleteUservalidator, resetPasswordValidator } = require("../utils/vallidators/UserVallidator");
const { protect, allowedTo } = require("../service/AuthService");

router.route("/").get(protect, allowedTo("admin", "superadmin", "manager"), getAllUsers).post(protect, allowedTo("admin", "superadmin", "manager"), newUserValidator, createUser);
router.route("/getme").get(protect, getuserloggeddata, getUser);
router.route("/updateme").put(protect, updateuserme);
router.route("/updatepassword").put(protect, resetPasswordValidator, updateuserPassword);

router.route("/:id").get(protect, getUservalidator, getUser).put(protect, allowedTo("admin", "superadmin", "manager"), updateUservalidator, updateUser).delete(protect, allowedTo("admin", "superadmin", "manager"), deleteUservalidator, deleteUser);

router.route("/disactivate").patch(protect, allowedTo("user","admin", "superadmin", "manager"), disactivateuser);

module.exports = router;
