const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Load env vars FIRST before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allows your local Vite dev server AND your deployed Vercel frontend.
// Add FRONTEND_URL in Render env vars once you deploy frontend to Vercel.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin: Postman, curl, mobile apps
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS policy: origin not allowed - ' + origin));
  },
  credentials: true,
}));

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health Check (Render will ping this) ─────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Smart Campus API is running ✅', status: 'OK' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/students',      studentRoutes);
app.use('/api/companies',     companyRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discussions',   discussionRoutes);
app.use('/api/mocktests',     mockTestRoutes);
app.use('/api/quiz',          quizRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'} mode]`);
});
