const mongoose = require("mongoose");

const connectDatabase = () => {
  const DB_URI = process.env.DB_URI;
  
  if (!DB_URI) {
    console.error("Database URI is not defined in environment variables!");
    process.exit(1);
  }

  mongoose
    .connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ Database connection successful!");
      console.log(`📦 Connected to MongoDB: ${DB_URI.split('@')[1]}`);
    })
    .catch((err) => {
      console.error("❌ Database connection error:", err.message);
      process.exit(1);
    });

  // Handle connection events
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB disconnection:', err);
      process.exit(1);
    }
  });
};

module.exports = connectDatabase;