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
       {/* Results Card */}
        {result && (
          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
                <div className="text-right">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Match Score</p>
                    <p className={`text-4xl font-extrabold ${result.score > 70 ? 'text-green-600' : result.score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {result.score}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Matched Skills */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        Matched Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.matched_skills?.length > 0 ? result.matched_skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                                {skill}
                            </span>
                        )) : <span className="text-sm text-green-600">No major matches found.</span>}
                    </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.missing_skills?.length > 0 ? result.missing_skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">
                                {skill}
                            </span>
                        )) : <span className="text-sm text-red-600">You hit all the keywords!</span>}
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;