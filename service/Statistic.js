const Reservation = require("../models/Reservation");
const Voyage = require("../models/Voyage");
const User = require("../models/User");

const asyncHandler = require("express-async-handler");

exports.Statistic = asyncHandler(async (req, res) => {
  // استخدام Promise.all لتحسين الأداء
  const [reservations, voyages, users] = await Promise.all([
    Reservation.find(),
    Voyage.find(),
    User.find(),
  ]);

  const [voyageCount, reservationCount, userCount] = await Promise.all([
    Voyage.countDocuments(),
    Reservation.countDocuments(),
    User.countDocuments(),
  ]);

  // تهيئة القيم
  let totalRevenue = 0;
  let activeUserCount = 0;
  let confirmedReservationCount = 0;
  let pendingReservationCount = 0;

  // التكرار على الحجوزات لحساب الدخل والحالات
  for (const reservation of reservations) {
    if (reservation.paymentStatus === "paid") {
      totalRevenue += reservation.totalPrice;
    }
    if (reservation.status === "confirmed") {
      confirmedReservationCount++;
    }
    if (reservation.status === "pending") {
      pendingReservationCount++;
    }
  }

  // عدد المستخدمين النشطين
  for (const user of users) {
    if (user.active) activeUserCount++;
  }

  // إرسال الرد
  res.status(200).json({
    success: true,
    voyageCount,
    reservationCount,
    userCount,
    totalRevenue,
    activeUserCount,
    confirmedReservationCount,
    pendingReservationCount,
  });
});
