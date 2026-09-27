const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadResume, getResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * Express middleware wrapper to catch and handle Multer errors (e.g. file too large or wrong type)
 * before they trigger a generic unhandled 500 error.
 */
const handleUploadError = (req, res, next) => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File is too large. Maximum size is 5 MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred during file upload.',
      });
    }
    next();
  });
};

router.post('/upload', protect, handleUploadError, uploadResume);
router.get('/me', protect, getResume);

module.exports = router;
