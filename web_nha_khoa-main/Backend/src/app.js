require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const setupAssociations = require('./config/associations');
const logger = require('./utils/logger');

const authRoutes = require('./modules/auth/auth.route');
const userRoutes = require('./modules/user/user.route');
const doctorRoutes = require('./modules/doctor/doctor.route');
const appointmentRoutes = require('./modules/appointment/appointment.route');
const medicalRoutes = require('./modules/medical/medical.route');
const paymentRoutes = require('./modules/payment/payment.route');
const reviewRoutes = require('./modules/review/review.route');
const notificationRoutes = require('./modules/notification/notification.route');
const chatRoutes = require('./modules/chat/chat.route');
const blogRoutes = require('./modules/blog/blog.route');
const mediaRoutes = require('./modules/media/media.route');
const serviceRoutes = require('./modules/service/service.route');
const specialtyRoutes = require('./modules/service/specialty.route');
const contactRoutes = require('./modules/contact/contact.route');
const dashboardRoutes = require('./modules/dashboard/dashboard.route');
const holidayRoutes = require('./modules/holiday/holiday.route');
const shiftRoutes = require('./modules/shift/shift.route');
const rosterRoutes = require('./modules/roster/roster.route');
const leaveRoutes = require('./modules/leave/leave.route');
const salaryRoutes = require('./modules/salary/salary.route');

const app = express();

// Setup Sequelize associations
setupAssociations();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} không được phép`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// General
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/v1/health',
  }));
}
app.use(loggerMiddleware);
app.use('/api/', apiLimiter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
  });
});

// API Routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/doctors`, doctorRoutes);
app.use(`${API}/appointments`, appointmentRoutes);
app.use(`${API}/medical-records`, medicalRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/chats`, chatRoutes);
app.use(`${API}/blogs`, blogRoutes);
app.use(`${API}/media`, mediaRoutes);
app.use(`${API}/services`, serviceRoutes);
app.use(`${API}/specialties`, specialtyRoutes);
app.use(`${API}/contacts`, contactRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);
app.use(`${API}/holidays`, holidayRoutes);
app.use(`${API}/shifts`, shiftRoutes);
app.use(`${API}/rosters`, rosterRoutes);
app.use(`${API}/leaves`, leaveRoutes);
app.use(`${API}/salaries`, salaryRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

// Trigger nodemon restart
