const multer = require('multer');
const path = require('path');

// Store file as Buffer in memory
const storage = multer.memoryStorage();

// File filter to accept strictly PDF resumes
const fileFilter = (req, file, cb) => {
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  const isPdfMime = file.mimetype === 'application/pdf';

  if (isPdfExt && isPdfMime) {
    cb(null, true);
  } else {
    // Custom error that we will intercept and format as 400 Bad Request
    cb(new Error('Only PDF files (.pdf) are accepted. Please choose a PDF resume.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1, // Only 1 file allowed at a time
  },
  fileFilter: fileFilter,
});

module.exports = upload;
