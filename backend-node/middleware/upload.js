const multer = require('multer');

// We use memoryStorage so the file is never saved to the hard drive.
// It stays as a raw Buffer in RAM and is automatically deleted by Node 
// once the request is finished.
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB strict limit to prevent Out-Of-Memory (OOM) crashes
    },
    fileFilter: (req, file, cb) => {
        // Security check: Only accept PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF format is allowed!'), false);
        }
    }
});

module.exports = upload;