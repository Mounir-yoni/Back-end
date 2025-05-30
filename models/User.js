const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    Firstname: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      unique: [true, "User name already exists"],
      minlength: [3, "User name must be at least 3 characters"],
      maxlength: [30, "User name must be less than 30 characters"],
    },
    Lastname: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      unique: [true, "User name already exists"],
      minlength: [3, "User name must be at least 3 characters"],
      maxlength: [30, "User name must be less than 30 characters"],
    },
    Adress: String,
    ville: String,
    codePostal: String,
    email: {
      type: String,
      required: [true, "Please add a email"],
      trim: true,
      unique: [true, "User email already exists"],
      minlength: [3, "User email must be at least 3 characters"],
      maxlength: [100, "User email must be less than 100 characters"],
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "Please add a password"],
      trim: true,
      minlength: [6, "User password must be at least 6 characters"],
      maxlength: [30, "User password must be less than 30 characters"],
    },
    passwordchangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordResetverified: Boolean,
    role: {
      type: String,
      enum: ["user", "admin","superadmin","manager"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre(/^save/, async function (next) {
  if (!this.isModified("password")) return next();
  // hashing password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);