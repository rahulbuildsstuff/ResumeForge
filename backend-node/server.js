const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const upload = require('./middleware/upload'); // Our RAM buffer middleware

const app = express();
const PORT = 5000;

// Allow requests from our React Vite frontend (running on port 5173 by default)
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// The 'upload.single("resume")' intercepts the file before the route logic runs
app.post('/api/resume/analyze', upload.single('resume'), async (req, res) => {
    
    if (!req.file) {
        return res.status(400).json({ error: 'No resume file uploaded.' });
    }
    if (!req.body.jobDescription) {
        return res.status(400).json({ error: 'Job description is required.' });
    }

    try {
        // We must construct a new FormData object to send to FastAPI
        const pythonFormData = new FormData();
        
        // Attach the raw RAM buffer, giving it the original file name
        pythonFormData.append('file', req.file.buffer, { filename: req.file.originalname });
        pythonFormData.append('jobDescription', req.body.jobDescription);

        // Assuming your Python server is running on port 8000
        const pythonResponse = await axios.post('http://localhost:8000/internal/v1/extract-and-score', pythonFormData, {
            headers: {
                ...pythonFormData.getHeaders()
            }
        });

        // Send the Python JSON response directly back to the user's browser
        res.json(pythonResponse.data);

    } catch (error) {
        console.error('Error communicating with Python Engine:', error.message);
        res.status(500).json({ error: 'Failed to process resume via AI engine.' });
    }
});

app.listen(PORT, () => {
    console.log(`Node.js Gateway running on http://localhost:${PORT}`);
});