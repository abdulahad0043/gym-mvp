require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

const authRoutes        = require('./routes/auth');
const memberRoutes      = require('./routes/members');
const attendanceRoutes  = require('./routes/attendance');
const planRoutes        = require('./routes/plans');
const feeRoutes         = require('./routes/fees');
const memberAuthRoutes  = require('./routes/memberAuth');
const memberPortal      = require('./routes/memberPortal');
const { errorHandler }  = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch((err) => { console.error('❌  MongoDB error:', err); process.exit(1); });

// Admin API
app.use('/api/auth',        authRoutes);
app.use('/api/members',     memberRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/plans',       planRoutes);
app.use('/api/fees',        feeRoutes);

// Member API
app.use('/api/member',      memberAuthRoutes);
app.use('/api/member',      memberPortal);

// Pages
app.get('/',           (req, res) => res.render('login'));        // Admin login
app.get('/dashboard',  (req, res) => res.render('dashboard'));    // Admin dashboard
app.get('/join',       (req, res) => res.render('memberRegister')); // Member self-register
app.get('/member',     (req, res) => res.render('memberLogin'));  // Member login
app.get('/member/home',(req, res) => res.render('memberHome'));   // Member portal

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🏋️  GymOS running on http://localhost:${PORT}`));
