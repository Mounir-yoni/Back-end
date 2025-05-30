const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB connection successful!"))
    .catch((err) => {
      console.error("DB connection error:", err);
      process.exit(1);
    });
};

module.exports = connectDatabase;