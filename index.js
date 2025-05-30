const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Determine the environment
const isProduction = process.env.NODE_ENV === 'production';

// Get the path to config.env
const envPath = isProduction 
  ? path.join(__dirname, '.env')  // Production: use .env
  : path.join(__dirname, 'config.env'); // Development: use config.env

// Load environment variables
if (isProduction) {
  // In production, try multiple approaches to load environment variables
  let envLoaded = false;

  // 1. Try loading from .env file
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log('✅ Environment variables loaded from .env file');
      envLoaded = true;
    }
  }

  // 2. Try loading from process.env
  if (!envLoaded) {
    console.log('ℹ️ Attempting to use process.env variables');
    // Set default values if not in process.env
    process.env.DB_URI = process.env.DB_URI || 'mongodb+srv://starkmounir:0iLHMepvVXJyDAyU@agencvoyage.xllfefc.mongodb.net/?retryWrites=true&w=majority&appName=agencvoyage';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'agencvoyage-super-secret-jwt-key-2024-production-secure-key';
    process.env.PORT = process.env.PORT || '8000';
    envLoaded = true;
  }
} else {
  // In development, load from config file
  if (!fs.existsSync(envPath)) {
    console.error('❌ Environment file not found at:', envPath);
    console.error('Please ensure the environment file exists and has the correct permissions.');
    process.exit(1);
  }

  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading environment file:', result.error);
    process.exit(1);
  }
  console.log('✅ Environment variables loaded from:', envPath);
}

// Verify environment variables
const requiredEnvVars = ['DB_URI', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('\n❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('\nCurrent environment variables:', {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    DB_URI: process.env.DB_URI ? 'Set' : 'Not Set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
    PORT: process.env.PORT ? 'Set' : 'Not Set'
  });

  if (isProduction) {
    console.error('\n⚠️ Production Environment Setup Required:');
    console.error('1. Set the following environment variables in your hosting platform:');
    console.error('   - DB_URI: Your MongoDB connection string');
    console.error('   - JWT_SECRET: A secure random string for JWT signing');
    console.error('   - PORT: The port your application should run on (usually 8000)');
    console.error('\n2. Example values:');
    console.error('   DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
    console.error('   JWT_SECRET=your-secure-random-string-at-least-32-chars');
    console.error('   PORT=8000');
    
    // In production, use default values if variables are missing
    console.log('\n⚠️ Using default values for missing environment variables');
    process.env.DB_URI = process.env.DB_URI || 'mongodb+srv://starkmounir:0iLHMepvVXJyDAyU@agencvoyage.xllfefc.mongodb.net/?retryWrites=true&w=majority&appName=agencvoyage';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'agencvoyage-super-secret-jwt-key-2024-production-secure-key';
    process.env.PORT = process.env.PORT || '8000';
  } else {
    console.error('\n⚠️ Development Environment Setup Required:');
    console.error('1. Create a config.env file in the project root with the following variables:');
    console.error('   DB_URI=your_mongodb_connection_string');
    console.error('   JWT_SECRET=your_jwt_secret');
    console.error('   PORT=8000');
    process.exit(1);
  }
}

const app = express();
const connectDatabase = require("./config/database");
const VoyageRoute = require("./Routes/VoyageRoute");
const UserRoute = require("./Routes/UserRoute");
const AuthRoute = require("./Routes/AuthRoute");
const ReservationRoute = require("./Routes/ReservationRoute");
const ApiError = require("./utils/apierror");
const globalError = require("./middlewares/errormiddelware");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const StatisticRoute = require("./Routes/StatisticRoute");

// Connect to database
connectDatabase();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent parameter pollution

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parser
app.use(express.json({ limit: "10kb" })); // Limit body size

// Mount routes
app.use("/api/v1/voyages", VoyageRoute);
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/reservations", ReservationRoute);
app.use("/api/v1/statistic", StatisticRoute);

// Global error handler
app.use(globalError);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Start server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});