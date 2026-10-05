/**
 * EduNavigator Backend Server
 * AI-Powered University Admission & Comparison System
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const University = require('./models/University');

const app = express();

// ------- Middleware -------
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the frontend site directly from the website directory
app.use(express.static(path.join(__dirname, '../../edunavigator-website/public/Frontend')));

// ------- Routes -------
app.get('/', (req, res) =>
  res.json({
    name: 'EduNavigator API',
    version: '1.0.0',
    status: 'running',
    docs: '/api',
  })
);

// Phase 20 - Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'EduNavigator Core Engine',
    uptimeSeconds: process.uptime()
  });
});

// Phase 18 - Admin Analytics API Endpoint
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const totalUnis = await University.countDocuments();

    res.json({
      success: true,
      data: {
        totalUniversities: totalUnis,
        mostSearchedPrograms: ['BS Computer Science', 'BS Software Engineering', 'BS Artificial Intelligence', 'BBA'],
        averageResponseTimeMs: '240ms',
        systemStatus: 'Healthy'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Phase 19 - Admin University Knowledge Management API Endpoint
app.put('/api/admin/university/:id', async (req, res) => {
  try {
    const updatedUni = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedUni) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    res.json({ success: true, message: 'University updated instantly', data: updatedUni });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use('/api/auth',            require('./routes/auth.routes'));
app.use('/api/universities',    require('./routes/university.routes'));
app.use('/api/admissions',      require('./routes/admission.routes'));
app.use('/api/scholarships',    require('./routes/scholarship.routes'));
app.use('/api/compare',         require('./routes/compare.routes'));
app.use('/api/recommendation',  require('./routes/recommendation.routes'));
app.use('/api/applications',    require('./routes/application.routes'));
app.use('/api/notifications',   require('./routes/notification.routes'));
app.use('/api/contact',         require('./routes/contact.routes'));
app.use('/api/chat',            require('./chatbot/routes'));

// ------- 404 -------
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ------- Error handler -------
app.use((err, req, res, next) => {
  console.error('❌', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

// ------- Start -------
const PORT = process.env.PORT || 5000;
const { initEmbeddingPipeline } = require('./chatbot/embeddingService');
const { initIntentPrototypes } = require('./chatbot/intentClassifier');

connectDB().then(async () => {
  try {
    await initEmbeddingPipeline();
    await initIntentPrototypes();
  } catch (e) {
    console.warn('⚠️ Embedding service warm-up notice:', e.message);
  }
  app.listen(PORT, () => {
    console.log(`🚀 EduNavigator API running on http://localhost:5000`);
  });
});

