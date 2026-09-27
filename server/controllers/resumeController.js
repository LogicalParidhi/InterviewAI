const Resume = require('../models/resume');

const mapResumeResponse = (resume) => {
  return {
    id: resume._id.toString(),
    fileName: resume.fileName,
    fileSize: resume.fileSize,
    uploadedAt: resume.uploadedAt.toISOString(),
    status: resume.status,
  };
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided.',
      });
    }

    const isPdfExt = req.file.originalname.toLowerCase().endsWith('.pdf');
    const isPdfMime = req.file.mimetype === 'application/pdf';

    if (!isPdfExt || !isPdfMime) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files (.pdf) are accepted.',
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum size is 5 MB.',
      });
    }

    let extractedText = '';
    let parseError = '';

    try {
      const formData = new FormData();

      const fileBlob = new Blob([req.file.buffer], {
        type: req.file.mimetype,
      });

      formData.append('resume', fileBlob, req.file.originalname);

      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

      const response = await fetch(`${aiServiceUrl}/api/resume/parse`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data && result.data.text) {
          extractedText = result.data.text;
        }
      } else {
        const result = await response.json().catch(() => null);

        parseError =
          result?.error ||
          `Resume parsing failed (status ${response.status}).`;
      }
    } catch (err) {
      parseError =
        'Resume analysis is unavailable. Please start the AI service and upload again.';
    }

    if (!extractedText.trim()) {
      return res.status(parseError.includes('unavailable') ? 503 : 422).json({
        success: false,
        message:
          parseError ||
          'No readable text was found in this PDF. Please upload a text-based resume.',
      });
    }

    let resume = await Resume.findOne({ user: req.user._id });

    if (resume) {
      resume.fileName = req.file.originalname;
      resume.fileSize = req.file.size;
      resume.mimeType = req.file.mimetype;
      resume.fileData = req.file.buffer;
      resume.extractedText = extractedText;
      resume.status = 'ready';
      resume.uploadedAt = new Date();

      await resume.save();
    } else {
      resume = await Resume.create({
        user: req.user._id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileData: req.file.buffer,
        extractedText,
        status: 'ready',
        uploadedAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      resume: mapResumeResponse(resume),
    });
  } catch (error) {
    next(error);
  }
};

exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id }).select(
      '-fileData'
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    return res.status(200).json({
      success: true,
      resume: mapResumeResponse(resume),
    });
  } catch (error) {
    next(error);
  }
};