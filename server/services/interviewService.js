const Interview = require('../models/Interview');
const Resume = require('../models/resume');

const TECHNOLOGIES = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express',
  'Python', 'Java', 'C++', 'C#', 'PHP', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase', 'AWS', 'Azure', 'Docker',
  'Kubernetes', 'Git', 'REST API', 'GraphQL', 'HTML', 'CSS', 'Tailwind', 'Machine Learning',
  'TensorFlow', 'PyTorch', 'Pandas',
];

const questionCountForDuration = (duration) => {
  if (duration <= 10) return 5;
  if (duration <= 15) return 7;
  if (duration <= 20) return 9;
  return 13;
};

const unique = (items) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

function extractResumeHighlights(resumeText) {
  const text = String(resumeText || '');

  const skills = TECHNOLOGIES.filter((skill) => {
    const escaped = skill
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s/g, '\\s+');

    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  });

  const projectSection = text.match(
    /(?:projects?|personal projects?|academic projects?)\s*[:\-]?([\s\S]*?)(?=\n\s*(?:experience|education|skills|certifications?|achievements?|languages?)\b|$)/i
  );

  const projectLines = (projectSection ? projectSection[1] : text)
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter((line) => line.length >= 3 && line.length <= 100)
    .filter((line) => !/^(?:skills?|technologies|tools|responsibilities)\s*:?$/i.test(line));

  const projects = unique(
    projectLines.map((line) => line.split(/\s*(?:\||:|[-–—])\s*/)[0])
  )
    .filter((name) => /[a-z]/i.test(name))
    .slice(0, 4);

  return {
    skills: skills.slice(0, 8),
    projects,
  };
}

function allocateTimeLimits(questionCount, duration) {
  const total = Math.max(questionCount * 60, Number(duration || 20) * 60);
  const base = Math.floor(total / questionCount / 10) * 10;
  let remaining = total - base * questionCount;

  return Array.from({ length: questionCount }, () => {
    const extra = remaining >= 10 ? 10 : 0;
    remaining -= extra;
    return Math.min(180, Math.max(60, base + extra));
  });
}

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const normalizeQuestion = (text) => String(text || '')
  .replace(/\s*\(Answer at a .*? level\.\)\s*/i, ' ')
  .replace(/[^a-z0-9]/gi, '')
  .toLowerCase();

function chooseQuestion(candidates, previousQuestions) {
  const seen = new Set(previousQuestions.map(normalizeQuestion));
  const unseen = candidates.filter((question) => !seen.has(normalizeQuestion(question.text)));
  return shuffle(unseen.length ? unseen : candidates)[0];
}

function buildResumeFallbackQuestions(
  resumeText,
  { jobRole, difficulty, interviewType, duration, previousQuestions = [] }
) {
  const { skills, projects } = extractResumeHighlights(resumeText);
  const total = questionCountForDuration(Number(duration || 20));
  const focusSkills = skills.length ? skills : ['the technologies listed in your resume'];
  const focusProjects = projects.length ? projects : ['a project described in your resume'];
  const projectTemplates = [
    (project, skill) => `For "${project}" on your resume, explain its architecture and how ${skill} fits into the solution.`,
    (project, skill) => `What was the hardest technical problem in "${project}"? Show how you used ${skill} to investigate and solve it.`,
    (project, skill) => `If you rebuilt "${project}" today, what would you change in its ${skill} implementation and why?`,
    (project, skill) => `How did you validate that "${project}" worked correctly? Describe the testing or debugging strategy around ${skill}.`,
    (project, skill) => `Imagine "${project}" receives ten times more users. What bottleneck would you examine first, especially around ${skill}?`,
  ];
  const skillTemplates = [
    (skill) => `You list ${skill}. Describe a production-style decision where you chose it over an alternative and explain the trade-off.`,
    (skill) => `Using your resume experience with ${skill}, walk me through how you would debug an intermittent failure.`,
    (skill) => `What are the most important performance, security, or reliability concerns when using ${skill} in a real project?`,
    (skill) => `Show me how you would test a feature built with ${skill}, including one edge case that is easy to miss.`,
    (skill) => `What misconception about ${skill} did you discover while building one of your projects, and how did you handle it?`,
  ];

  const technicalCandidates = [
    ...focusProjects.flatMap((project, index) => projectTemplates.map((template) => ({
      category: 'technical', text: template(project, focusSkills[index % focusSkills.length]),
    }))),
    ...focusSkills.flatMap((skill) => skillTemplates.map((template) => ({
      category: 'technical', text: template(skill),
    }))),
  ];
  const introductions = [
    `Which resume experience best prepares you for this ${jobRole} role, and why?`,
    `Give me a concise introduction through the project or skill on your resume that best represents you as a ${jobRole}.`,
    `Looking at your resume, what is the strongest connection between your past work and this ${jobRole} role?`,
  ].map((text) => ({ category: 'introduction', text }));
  const behavioral = [
    `Tell me about a time working on ${focusProjects[0]} did not go as planned. How did you communicate and recover?`,
    `Describe feedback you received while building ${focusProjects[0]}. What did you change as a result?`,
    `Tell me how you handled competing priorities while working on a project such as ${focusProjects[0]}.`,
  ].map((text) => ({ category: 'behavioral', text }));
  const situational = [
    `A critical issue appears in ${focusProjects[0]} just before release. How would you investigate, communicate, and decide whether to ship?`,
    `A teammate proposes replacing ${focusSkills[0]} in ${focusProjects[0]}. How would you evaluate that decision?`,
    `A new requirement changes the scope of ${focusProjects[0]}. How would you break down the work and protect quality?`,
  ].map((text) => ({ category: 'situational', text }));
  const closings = [
    `Which skill or project from your resume would you most like to deepen in this ${jobRole} role?`,
    `What is the next technical challenge you want to take on after the work shown in your resume?`,
    `Which project on your resume best shows where you want your career to go next, and why?`,
  ].map((text) => ({ category: 'closing', text }));

  const technicalSlots = Math.max(0, total - 4);
  const selectedTechnical = [];
  const usedThisInterview = [...previousQuestions];
  for (const candidate of shuffle(technicalCandidates)) {
    if (selectedTechnical.length === technicalSlots) break;
    if (!usedThisInterview.map(normalizeQuestion).includes(normalizeQuestion(candidate.text))) {
      selectedTechnical.push(candidate);
      usedThisInterview.push(candidate.text);
    }
  }
  while (selectedTechnical.length < technicalSlots) selectedTechnical.push(shuffle(technicalCandidates)[0]);

  const pick = (candidates) => chooseQuestion(candidates, usedThisInterview);
  const opening = pick(introductions); usedThisInterview.push(opening.text);
  const behavioralQuestion = pick(behavioral); usedThisInterview.push(behavioralQuestion.text);
  const situationalQuestion = pick(situational); usedThisInterview.push(situationalQuestion.text);
  const closing = pick(closings);
  const middle = String(interviewType).toLowerCase() === 'hr'
    ? [behavioralQuestion, situationalQuestion, ...selectedTechnical]
    : [...selectedTechnical, behavioralQuestion, situationalQuestion];
  const timeLimits = allocateTimeLimits(total, duration);

  return [opening, ...middle, closing].map((question, index) => ({
    id: `q${index + 1}`,
    ...question,
    text: `${question.text} (Answer at a ${difficulty} level.)`,
    timeLimitSeconds: timeLimits[index],
    order: index + 1,
  }));
}

async function extractAndSaveResumeText(resume) {
  if (!resume?.fileData?.length) return '';

  const formData = new FormData();

  const fileBlob = new Blob([resume.fileData], {
    type: resume.mimeType || 'application/pdf',
  });

  formData.append('resume', fileBlob, resume.fileName);

  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  let response;

  try {
    response = await fetch(`${aiServiceUrl}/api/resume/parse`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    const err = new Error(
      'Resume analysis is unavailable. Start the AI service and try again.'
    );
    err.statusCode = 503;
    throw err;
  }

  const result = await response.json().catch(() => null);
  const text = result?.success ? String(result.data?.text || '').trim() : '';

  if (!text) {
    const err = new Error(
      result?.error ||
        'We could not read text from this resume. Please upload a text-based PDF.'
    );
    err.statusCode = 422;
    throw err;
  }

  resume.extractedText = text;
  resume.status = 'ready';

  await resume.save();

  return text;
}

async function getPreviousQuestionTexts(candidateEmail) {
  if (!candidateEmail) return [];
  const interviews = await Interview.find({ candidateEmail: candidateEmail.toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('questions')
    .lean();
  return interviews.flatMap((interview) => interview.questions.map((question) => question.text));
}

async function createInterview({
  userId,
  candidateName,
  candidateEmail,
  jobRole,
  difficulty,
  interviewType,
  duration,
}) {
  let resumeFileName = null;
  let resumeText = '';

  if (userId) {
    const resume = await Resume.findOne({ user: userId });

    if (resume) {
      resumeFileName = resume.fileName;
      resumeText = resume.extractedText || '';

      if (!resumeText.trim()) {
        resumeText = await extractAndSaveResumeText(resume);
      }
    }
  }

  if (!resumeText.trim()) {
    const err = new Error(
      'Please upload a readable resume before starting an interview.'
    );
    err.statusCode = 400;
    throw err;
  }

  const previousQuestions = await getPreviousQuestionTexts(candidateEmail);
  let questions = buildResumeFallbackQuestions(resumeText, {
    jobRole,
    difficulty,
    interviewType,
    duration,
    previousQuestions,
  });

  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    const response = await fetch(
      `${aiServiceUrl}/api/interview/generate-questions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobRole,
          requirements: `Difficulty: ${difficulty}, Type: ${interviewType}`,
          duration: duration || 20,
          difficulty,
          interviewType,
          previousQuestions,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();

      if (result.success && Array.isArray(result.data) && result.data.length) {
        questions = result.data;
      }
    } else {
      console.error(
        'AI service question generation failed with status:',
        response.status
      );
    }
  } catch (err) {
    console.error(
      'AI service unavailable; using resume-based fallback questions:',
      err.message
    );
  }

  return Interview.create({
    candidateName,
    candidateEmail,
    resumeFileName,
    jobRole,
    difficulty,
    interviewType,
    duration: duration || 20,
    status: 'setup',
    questions,
    answers: [],
    currentQuestionIndex: 0,
  });
}

async function startInterview(interviewId) {
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    const err = new Error('Interview not found');
    err.statusCode = 404;
    throw err;
  }

  interview.status = 'in_progress';
  interview.startedAt = new Date();
  interview.currentQuestionIndex = 0;

  await interview.save();

  return interview;
}

async function submitAnswer(
  interviewId,
  { questionId, answerText, videoChunkUrl, startedAt, endedAt }
) {
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    const err = new Error('Interview not found');
    err.statusCode = 404;
    throw err;
  }

  if (interview.status !== 'in_progress') {
    const err = new Error('Interview is not in progress');
    err.statusCode = 400;
    throw err;
  }

  const question = interview.questions.find((q) => q.id === questionId);
  const questionText = question ? question.text : '';
  const category = question ? question.category : 'technical';

  let score = 0;
  let technicalScore = null;
  let communicationScore = null;
  let grammarScore = null;
  let confidenceScore = null;
  let problemSolvingScore = null;
  let justification = 'AI evaluation service did not return feedback.';
  let improvementTips = ['Review the core concepts of this question.'];

  if (answerText && answerText.trim() && questionText) {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

      const response = await fetch(
        `${aiServiceUrl}/api/interview/evaluate-answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText,
            category,
            answerText,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          score = result.data.score ?? 0;
          justification = result.data.justification ?? '';
          improvementTips = result.data.improvementTips ?? [];
          technicalScore = result.data.technicalScore ?? null;
          communicationScore = result.data.communicationScore ?? null;
          grammarScore = result.data.grammarScore ?? null;
          confidenceScore = result.data.confidenceScore ?? null;
          problemSolvingScore = result.data.problemSolvingScore ?? null;
        }
      }
    } catch (err) {
      console.error(
        'Error connecting to AI service for answer evaluation:',
        err.message
      );
    }
  } else {
    justification = 'No answer was provided.';
    improvementTips = ['Try to speak or type a concise answer next time.'];
  }

  const start = startedAt ? new Date(startedAt) : new Date();
  const end = endedAt ? new Date(endedAt) : new Date();

  interview.answers.push({
    questionId,
    answerText: answerText || '',
    videoChunkUrl: videoChunkUrl || null,
    startedAt: start,
    endedAt: end,
    durationSeconds: Math.max(0, Math.round((end - start) / 1000)),
    score,
    technicalScore: typeof technicalScore === 'number' ? technicalScore : null,
    communicationScore: typeof communicationScore === 'number' ? communicationScore : null,
    grammarScore: typeof grammarScore === 'number' ? grammarScore : null,
    confidenceScore: typeof confidenceScore === 'number' ? confidenceScore : null,
    problemSolvingScore: typeof problemSolvingScore === 'number' ? problemSolvingScore : null,
    justification,
    improvementTips,
  });

  if (interview.currentQuestionIndex >= interview.questions.length - 1) {
    interview.status = 'completed';
    interview.endedAt = new Date();
  } else {
    interview.currentQuestionIndex += 1;
  }

  await interview.save();

  return interview;
}

async function endInterviewEarly(interviewId) {
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    const err = new Error('Interview not found');
    err.statusCode = 404;
    throw err;
  }

  interview.status = 'ended_early';
  interview.endedAt = new Date();

  await interview.save();

  return interview;
}

async function getInterviewById(interviewId) {
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    const err = new Error('Interview not found');
    err.statusCode = 404;
    throw err;
  }

  return interview;
}

async function listInterviews({ page = 1, limit = 20, candidateEmail } = {}) {
  const skip = (page - 1) * limit;
  const filter = candidateEmail ? { candidateEmail: candidateEmail.toLowerCase() } : {};

  const [items, total] = await Promise.all([
    Interview.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Interview.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
}

async function getInterviewResult(interviewId) {
  const interview = await getInterviewById(interviewId);

  const totalQuestions = interview.questions.length;
  const answeredQuestions = interview.answers.length;

  return {
    sessionId: interview._id.toString(),
    candidateName: interview.candidateName,
    totalQuestions,
    answeredQuestions,
    skippedQuestions: Math.max(0, totalQuestions - answeredQuestions),
    totalDurationSeconds: interview.answers.reduce(
      (sum, answer) => sum + (answer.durationSeconds || 0),
      0
    ),
    completedAt: interview.endedAt
      ? interview.endedAt.toISOString()
      : new Date().toISOString(),
  };
}

module.exports = {
  buildResumeFallbackQuestions,
  extractResumeHighlights,
  extractAndSaveResumeText,
  getPreviousQuestionTexts,
  createInterview,
  startInterview,
  submitAnswer,
  endInterviewEarly,
  getInterviewById,
  listInterviews,
  getInterviewResult,
};
