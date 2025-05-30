const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    voyage: {
      type: mongoose.Schema.ObjectId,
      ref: "Voyage",
      required: [true, "Reservation must belong to a voyage"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Reservation must belong to a user"],
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Please specify number of people"],
      min: [1, "Number of people must be at least 1"],
    },
    phone:String,
    totalPrice: {
      type: Number,
      required: [true, "Reservation must have a total price"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
reservationSchema.index({ voyage: 1, user: 1 });

// Virtual populate
reservationSchema.virtual("voyageDetails", {
  ref: "Voyage",
  foreignField: "_id",
  localField: "voyage",
});

module.exports = mongoose.model("Reservation", reservationSchema);
