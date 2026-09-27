// controllers/interviewController.js

const interviewService = require('../services/interviewService');

// Common response helper — frontend ke ApiResponse<T> type se match karta hai
const sendResponse = (res, statusCode, { success, message, data, error }) => {
  return res.status(statusCode).json({ success, message, data, error });
};

/**
 * POST /api/interviews
 * Naya interview create karo (Resume Upload + Interview Setup ke baad)
 */
async function createInterview(req, res, next) {
  try {
    const { jobRole, difficulty, interviewType, duration } = req.body;
    const user = req.user;

    const interview = await interviewService.createInterview({
      userId: user._id,
      candidateName: user.name,
      candidateEmail: user.email,
      jobRole,
      difficulty,
      interviewType,
      duration,
    });

    return sendResponse(res, 201, {
      success: true,
      message: 'Interview created successfully',
      data: interview,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/interviews/:id
 * Ek interview fetch karo
 */
async function getInterview(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await interviewService.getInterviewById(id);

    return sendResponse(res, 200, {
      success: true,
      data: interview,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/interviews
 * Saare interviews list karo (pagination ke saath)
 */
async function listInterviews(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await interviewService.listInterviews({
      page,
      limit,
      candidateEmail: req.user.email,
    });

    return sendResponse(res, 200, {
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/interviews/:id/start
 * Interview ko live start karo
 */
async function startInterview(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await interviewService.startInterview(id);

    return sendResponse(res, 200, {
      success: true,
      message: 'Interview started',
      data: interview,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/interviews/:id/answers
 * Current question ka answer submit karo
 */
async function submitAnswer(req, res, next) {
  try {
    const { id } = req.params;
    const { questionId, answerText, videoChunkUrl, startedAt, endedAt } = req.body;

    if (!questionId) {
      return sendResponse(res, 400, {
        success: false,
        error: 'questionId is required',
      });
    }

    const interview = await interviewService.submitAnswer(id, {
      questionId,
      answerText,
      videoChunkUrl,
      startedAt,
      endedAt,
    });

    return sendResponse(res, 200, {
      success: true,
      message: 'Answer submitted',
      data: interview,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/interviews/:id/end
 * Interview ko beech me hi end karo
 */
async function endInterview(req, res, next) {
  try {
    const { id } = req.params;
    const interview = await interviewService.endInterviewEarly(id);

    return sendResponse(res, 200, {
      success: true,
      message: 'Interview ended',
      data: interview,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/interviews/:id/result
 * Interview ka result/summary nikaalo
 */
async function getInterviewResult(req, res, next) {
  try {
    const { id } = req.params;
    const result = await interviewService.getInterviewResult(id);

    return sendResponse(res, 200, {
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
  createInterview,
  getInterview,
  listInterviews,
  startInterview,
  submitAnswer,
  endInterview,
  getInterviewResult,
  
};
