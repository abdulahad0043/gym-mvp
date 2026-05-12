require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

// Route Imports
const authRoutes        = require('./routes/auth');
const memberRoutes      = require('./routes/members');
const attendanceRoutes  = require('./routes/attendance');
const planRoutes        = require('./routes/plans');
const feeRoutes         = require('./routes/fees');
const memberAuthRoutes  = require('./routes/memberAuth');
const memberPortal      = require('./routes/memberPortal');
const { errorHandler }  = require('./middleware/errorHandler');

// CRITICAL: Import your WhatsApp client to initialize it when the server starts
// This ensures the QR code is generated in your Railway logs.
require('./utils/sms'); 

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Admin API Routes
app.use('/api/auth',        authRoutes);
app.use('/api/members',     memberRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/plans',       planRoutes);
app.use('/api/fees',        feeRoutes);

// Member API Routes
app.use('/api/member',      memberAuthRoutes);
app.use('/api/member',      memberPortal);

// Pages
app.get('/',            (req, res) => res.render('login'));           // Admin login
app.get('/dashboard',   (req, res) => res.render('dashboard'));       // Admin dashboard
app.get('/join',        (req, res) => res.render('memberRegister'));  // Member self-register
app.get('/member',      (req, res) => res.render('memberLogin'));     // Member login
app.get('/member/home', (req, res) => res.render('memberHome'));      // Member portal

// Global Error Handler
app.use(errorHandler);

// Database Connection & Server Start
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // Start listening only after DB is connected
    app.listen(PORT, () => {
      console.log(`🏋️ GymOS running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process so Railway knows the service failed to start
    process.exit(1); 
  });