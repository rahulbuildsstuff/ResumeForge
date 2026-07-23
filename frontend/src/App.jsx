import React, { useState } from 'react';

const ResumeAnalyzer = () => {
  // State for inputs
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  
  // State for the rich ATS data from your Python backend
  const [score, setScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [metricsCount, setMetricsCount] = useState(0);
  const [structure, setStructure] = useState({});
  const [formatting, setFormatting] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) return alert("Please provide both a PDF and a Job Description.");

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      // NOTE: Ensure this matches the port your server is running on (usually 8000 for FastAPI)
      const response = await fetch("http://localhost:8000/internal/v1/extract-and-score", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setScore(data.score);
        setMatchedSkills(data.matched_skills || []);
        setMissingSkills(data.missing_skills || []);
        setMetricsCount(data.metrics_detected || 0);
        setStructure(data.structure_check || {});
        setFormatting(data.formatting_check || {});
      } else {
        alert(data.detail || "Something went wrong.");
      }
    } catch (error) {
      alert("Error connecting to the backend. Make sure your server is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
      
      {/* FORM SECTION */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Resume ATS Scanner</h1>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Upload Resume (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Description</label>
            <textarea 
              rows="4"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Paste the job description here..."
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>
      </div>

      {/* ATS DASHBOARD RESULTS SECTION */}
      {score !== null && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          
          <div className="flex items-center justify-between mb-8 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Analysis Complete</h2>
              <p className="text-gray-500 mt-1">Based on industry-standard ATS parameters</p>
            </div>
            <div className={`text-4xl font-black rounded-full h-24 w-24 flex items-center justify-center text-white ${score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {score}%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Skills & Metrics */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-3">1. Technical Match (45%)</h3>
                <div className="mb-3">
                  <span className="font-semibold text-green-700">Matched ({matchedSkills.length}): </span>
                  <span className="text-sm text-gray-700">{matchedSkills.join(", ") || "None"}</span>
                </div>
                <div>
                  <span className="font-semibold text-red-700">Missing ({missingSkills.length}): </span>
                  <span className="text-sm text-gray-700">{missingSkills.join(", ") || "None"}</span>
                </div>
              </div>

              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                <h3 className="text-lg font-bold text-purple-900 mb-2">2. Proof of Impact (30%)</h3>
                <p className="text-sm text-gray-700 mb-2">Recruiters look for numbers, %, and $ to prove your impact.</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-xl font-bold ${metricsCount >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                    {metricsCount} Metrics Found
                  </span>
                  <span className="text-sm text-gray-500">(Target: 5+)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Structure & Formatting Checklist */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">3. ATS Structure (15%)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Word Count (Target 400-900):</span>
                    <span className={`font-bold ${structure?.word_count >= 400 && structure?.word_count <= 900 ? 'text-green-600' : 'text-red-500'}`}>{structure?.word_count || 0} words</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span>"Education" Section:</span>
                    <span>{structure?.has_education ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span>"Experience" Section:</span>
                    <span>{structure?.has_experience ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between pt-2">
                    <span>"Skills" Section:</span>
                    <span>{structure?.has_skills ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">4. Contact Data (10%)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Email Address:</span>
                    <span>{formatting?.has_email ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span>Phone Number:</span>
                    <span>{formatting?.has_phone ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between pt-2">
                    <span>LinkedIn Profile:</span>
                    <span>{formatting?.has_linkedin ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;