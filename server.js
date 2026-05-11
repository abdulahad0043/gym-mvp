require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

const authRoutes       = require('./routes/auth');
const memberRoutes     = require('./routes/members');
const attendanceRoutes = require('./routes/attendance');
const planRoutes       = require('./routes/plans');
const feeRoutes        = require('./routes/fees');
const { errorHandler } = require('./middleware/errorHandler');

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

app.use('/api/auth',       authRoutes);
app.use('/api/members',    memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/plans',      planRoutes);
app.use('/api/fees',       feeRoutes);

app.get('/',          (req, res) => res.render('login'));
app.get('/dashboard', (req, res) => res.render('dashboard'));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🏋️  Gym MVP running on http://localhost:${PORT}`));
