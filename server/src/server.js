const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./config/db');
connectDB();

const app = express();

// Core Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for local reports & prescriptions fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'MediTrack Healthcare API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/lab', require('./routes/labRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/feedback', require('./routes/reviewComplaintRoutes'));

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[MediTrack API Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
