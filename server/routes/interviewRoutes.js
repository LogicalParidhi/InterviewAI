// routes/interviewRoutes.js

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes under /api/interviews
router.use(protect);

// ==========================================
// Interview Routes
// Base path (server.js/app.js me mount hoga): /api/interviews
// ==========================================

// Create new interview  (Resume Upload -> Interview Setup ke baad)
router.post('/', interviewController.createInterview);

// List all interviews (dashboard / admin view)
router.get('/', interviewController.listInterviews);

// Get single interview by id
router.get('/:id', interviewController.getInterview);

// Start the interview (Interview Setup -> Live Interview)
router.patch('/:id/start', interviewController.startInterview);

// Submit an answer for the current question
router.post('/:id/answers', interviewController.submitAnswer);

// End interview early (user clicks "End")
router.patch('/:id/end', interviewController.endInterview);

// Get interview result/summary (End Interview screen)
router.get('/:id/result', interviewController.getInterviewResult);

module.exports = router;