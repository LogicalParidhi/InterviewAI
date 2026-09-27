// routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes under /api/dashboard
router.use(protect);

// Dashboard aggregated stats
router.get('/stats', dashboardController.getStats);

// Recent completed interviews
router.get('/recent', dashboardController.getRecent);

// Full interview report
router.get('/report/:id', dashboardController.getReport);

module.exports = router;
