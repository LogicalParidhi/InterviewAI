// services/dashboardService.js

const Interview = require('../models/Interview');

/**
 * getDashboardStats — Dashboard ke top section ke liye aggregated stats
 * Total interviews, average score, best score, total practice time
 */
async function getDashboardStats(candidateEmail) {
  if (!candidateEmail) {
    return { totalInterviews: 0, averageScore: 0, bestScore: 0, totalPracticeMinutes: 0 };
  }

  const interviews = await Interview.find({
    candidateEmail: candidateEmail.toLowerCase(),
    status: { $in: ['completed', 'ended_early'] },
  })
    .select('answers startedAt endedAt')
    .lean();

  if (!interviews.length) {
    return { totalInterviews: 0, averageScore: 0, bestScore: 0, totalPracticeMinutes: 0 };
  }

  const totalInterviews = interviews.length;

  // Per-interview average score (0-10 → 0-100%)
  const interviewAverages = interviews.map((interview) => {
    const scored = interview.answers.filter((a) => a.score != null);
    if (!scored.length) return 0;
    return scored.reduce((sum, a) => sum + a.score, 0) / scored.length;
  });

  const averageScore = Math.round(
    (interviewAverages.reduce((sum, avg) => sum + avg, 0) / interviewAverages.length) * 10
  );

  const bestScore = Math.round(Math.max(...interviewAverages) * 10);

  // Total practice time in minutes
  const totalPracticeMinutes = Math.round(
    interviews.reduce((sum, interview) => {
      const answerTime = interview.answers.reduce(
        (s, a) => s + (a.durationSeconds || 0),
        0
      );
      if (answerTime > 0) return sum + answerTime;
      // Fallback: startedAt to endedAt
      if (interview.startedAt && interview.endedAt) {
        return sum + (new Date(interview.endedAt) - new Date(interview.startedAt)) / 1000;
      }
      return sum;
    }, 0) / 60
  );

  return { totalInterviews, averageScore, bestScore, totalPracticeMinutes };
}

/**
 * getRecentInterviews — Dashboard ke "Recent Interviews" section ke liye
 */
async function getRecentInterviews(candidateEmail, limit = 5) {
  if (!candidateEmail) return [];

  const interviews = await Interview.find({
    candidateEmail: candidateEmail.toLowerCase(),
    status: { $in: ['completed', 'ended_early'] },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('jobRole interviewType difficulty createdAt answers status startedAt endedAt duration')
    .lean();

  return interviews.map((interview) => {
    const scored = interview.answers.filter((a) => a.score != null);
    const avgScore = scored.length
      ? Math.round((scored.reduce((sum, a) => sum + a.score, 0) / scored.length) * 10)
      : 0;

    return {
      _id: interview._id,
      jobRole: interview.jobRole || 'Interview',
      interviewType: interview.interviewType || 'Technical',
      difficulty: interview.difficulty || 'Medium',
      date: interview.createdAt,
      score: avgScore,
      status: interview.status,
      questionsCount: interview.answers.length,
    };
  });
}

/**
 * getInterviewReport — Full detailed report for a single interview
 */
async function getInterviewReport(interviewId) {
  const interview = await Interview.findById(interviewId).lean();

  if (!interview) {
    const err = new Error('Interview not found');
    err.statusCode = 404;
    throw err;
  }

  // Overall score
  const scored = interview.answers.filter((a) => a.score != null);
  const overallScore = scored.length
    ? Math.round((scored.reduce((sum, a) => sum + a.score, 0) / scored.length) * 10)
    : 0;

  // Aggregated sub-category scores
  const subScoreFields = [
    'technicalScore',
    'communicationScore',
    'grammarScore',
    'confidenceScore',
    'problemSolvingScore',
  ];

  const subScores = {};
  subScoreFields.forEach((field) => {
    const withScore = interview.answers.filter((a) => a[field] != null);
    subScores[field.replace('Score', '')] = withScore.length
      ? Math.round((withScore.reduce((sum, a) => sum + a[field], 0) / withScore.length) * 10)
      : null;
  });

  // Duration calculation
  let durationMinutes = interview.duration || 20;
  if (interview.startedAt && interview.endedAt) {
    durationMinutes = Math.round(
      (new Date(interview.endedAt) - new Date(interview.startedAt)) / 60000
    );
  }

  // Per-question breakdown
  const questions = interview.questions.map((q) => {
    const answer = interview.answers.find((a) => a.questionId === q.id);
    return {
      id: q.id,
      text: q.text,
      category: q.category,
      order: q.order,
      answer: answer
        ? {
            answerText: answer.answerText || '',
            score: answer.score,
            justification: answer.justification || '',
            improvementTips: answer.improvementTips || [],
            durationSeconds: answer.durationSeconds || 0,
          }
        : null,
    };
  });

  return {
    _id: interview._id,
    jobRole: interview.jobRole || 'Interview',
    interviewType: interview.interviewType || 'Technical',
    difficulty: interview.difficulty || 'Medium',
    date: interview.createdAt,
    durationMinutes,
    status: interview.status,
    overallScore,
    subScores,
    questions,
    candidateName: interview.candidateName,
  };
}

module.exports = {
  getDashboardStats,
  getRecentInterviews,
  getInterviewReport,
};
