import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload a PDF first!');

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      // Sending to our Node.js Gateway on port 5000
      const response = await axios.post('http://localhost:5000/api/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert('Error analyzing resume. Make sure Node and Python are running!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Resume Analyzer AI</h1>
        
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center hover:border-blue-500 transition-colors bg-gray-50 cursor-pointer">
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description (Optional)</label>
            <textarea 
              rows="4"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Paste the target job description here..."
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex justify-center items-center"
          >
            {loading ? 'Processing Pipeline...' : 'Analyze Resume'}
          </button>
        </form>

        {/* Results Card */}
       {result && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg animate-pulse">
            <h2 className="text-xl font-bold text-green-800 mb-2">Pipeline Connected!</h2>
            <p className="text-green-700">Status: <span className="font-semibold">{result.status}</span></p>
            <p className="text-green-700 text-2xl mt-2">Score: <span className="font-bold">{result.score}%</span></p>
            
            {/* New section to display extracted text */}
            {result.extracted_text && (
                <div className="mt-4 p-4 bg-white border border-green-300 rounded text-sm text-gray-700 overflow-hidden">
                    <p className="font-semibold text-green-800 mb-1">Extracted Resume Text Preview:</p>
                    <p className="italic">"{result.extracted_text}"</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;