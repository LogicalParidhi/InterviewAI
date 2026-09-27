// models/Interview.js

const mongoose = require('mongoose');

// ==========================================
// Sub-schema: Question (hardcoded questions snapshot per interview)
// ==========================================
const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    category: {
      type: String,
      enum: ['introduction', 'technical', 'behavioral', 'situational', 'closing'],
      required: true,
    },
    timeLimitSeconds: { type: Number, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

// ==========================================
// Sub-schema: Answer (per question response)
// ==========================================
const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answerText: { type: String, default: '' },
    videoChunkUrl: { type: String, default: null },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
    score: { type: Number, default: null },
    technicalScore: { type: Number, default: null },
    communicationScore: { type: Number, default: null },
    grammarScore: { type: Number, default: null },
    confidenceScore: { type: Number, default: null },
    problemSolvingScore: { type: Number, default: null },
    justification: { type: String, default: null },
    improvementTips: { type: [String], default: [] },
  },
  { _id: false }
);

// ==========================================
// Main schema: Interview
// ==========================================
const interviewSchema = new mongoose.Schema(
  {
    candidateName: { type: String, required: true, trim: true },
    candidateEmail: { type: String, trim: true, lowercase: true },

    resumeUrl: { type: String, default: null },
    resumeFileName: { type: String, default: null },

    jobRole: { type: String, default: 'Backend Developer' },
    difficulty: { type: String, default: 'Medium' },
    interviewType: { type: String, default: 'Technical' },
    duration: { type: Number, default: 20 },

    status: {
      type: String,
      enum: ['idle', 'setup', 'in_progress', 'paused', 'completed', 'ended_early'],
      default: 'setup',
    },

    questions: { type: [questionSchema], default: [] },
    answers: { type: [answerSchema], default: [] },

    currentQuestionIndex: { type: Number, default: 0 },

    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt automatically
  }
);

// ==========================================
// Virtual: quick summary counts (result screen ke liye)
// ==========================================
interviewSchema.virtual('totalQuestions').get(function () {
  return this.questions.length;
});

interviewSchema.virtual('answeredQuestions').get(function () {
  return this.answers.length;
});

interviewSchema.set('toJSON', { virtuals: true });
interviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Interview', interviewSchema);