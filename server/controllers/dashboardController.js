// controllers/dashboardController.js

const dashboardService = require('../services/dashboardService');

const sendResponse = (res, statusCode, { success, message, data, error }) => {
  return res.status(statusCode).json({ success, message, data, error });
};

/**
 * GET /api/dashboard/stats
 * Dashboard aggregated stats (total interviews, avg score, best score, practice time)
 */
async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats(req.user.email);

    return sendResponse(res, 200, {
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/recent
 * Recent completed interviews for dashboard cards
 */
async function getRecent(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const recent = await dashboardService.getRecentInterviews(req.user.email, limit);

    return sendResponse(res, 200, {
      success: true,
      data: recent,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/report/:id
 * Full detailed interview report
 */
async function getReport(req, res, next) {
  try {
    const { id } = req.params;
    const report = await dashboardService.getInterviewReport(id);

    return sendResponse(res, 200, {
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  getRecent,
  getReport,
};
