import React, { useState } from 'react';

const ResumeAnalyzer = () => {
  // Input State
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  
  // Dashboard Analytics State
  const [score, setScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [metricsCount, setMetricsCount] = useState(0);
  const [structure, setStructure] = useState({});
  const [formatting, setFormatting] = useState({});
  const [loading, setLoading] = useState(false);

  // Smart AI Bullet Fixer State
  const [weakBullets, setWeakBullets] = useState([]);
  const [rewrittenBullets, setRewrittenBullets] = useState({}); // Stores rewrites by index
  const [loadingIndex, setLoadingIndex] = useState(null); // Tracks which button is currently loading

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Main Analysis Request
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) {
      return alert("Please provide both a PDF resume and a Job Description.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch("http://localhost:8000/internal/v1/extract-and-score", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setScore(data.score);
        setSuggestions(data.suggestions || []);
        setMatchedSkills(data.matched_skills || []);
        setMissingSkills(data.missing_skills || []);
        setMetricsCount(data.metrics_detected || 0);
        setStructure(data.structure_check || {});
        setFormatting(data.formatting_check || {});
        setWeakBullets(data.weak_bullets || []);
        setRewrittenBullets({}); // Clear out old AI rewrites on a fresh scan
      } else {
        alert(data.detail || "Error analyzing resume.");
      }
    } catch (error) {
      alert("Error connecting to the backend server. Verify that FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Groq AI 1-Click Fix Request for Specific Weak Bullets
  const handleRewrite = async (bulletText, index) => {
    setLoadingIndex(index);

    try {
      const response = await fetch("http://localhost:8000/internal/v1/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: bulletText }),
      });

      const data = await response.json();
      if (response.ok) {
        setRewrittenBullets(prev => ({ ...prev, [index]: data.rewritten_bullet }));
      } else {
        alert(data.detail || "AI rewriting failed.");
      }
    } catch (error) {
      alert("Error connecting to the Groq AI rewriter endpoint.");
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
      
      {/* INPUT FORM SECTION */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Resume ATS Scanner</h1>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Upload Resume (PDF)</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Description</label>
            <textarea 
              rows="4"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Paste the job description here..."
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>
      </div>

      {/* DASHBOARD RESULTS SECTION */}
      {score !== null && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          
          {/* Header Score Display */}
          <div className="flex items-center justify-between mb-8 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Analysis Complete</h2>
              <p className="text-gray-500 mt-1">Based on industry-standard ATS parameters</p>
            </div>
            <div className={`text-4xl font-black rounded-full h-24 w-24 flex items-center justify-center text-white ${score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {score}%
            </div>
          </div>

          {/* HIGH-PRIORITY ACTION ITEMS / SUGGESTIONS BOX */}
          {suggestions.length > 0 && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 mb-8">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-600 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 className="text-xl font-bold text-red-900">High-Priority Action Items</h3>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-red-800 font-medium text-sm">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Skills, Metrics, and Smart Bullet Fixer */}
            <div className="space-y-6">
              
              {/* 1. Technical Match */}
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

              {/* 2. Proof of Impact */}
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

              {/* ✨ SMART AI BULLET FIXER WIDGET */}
              {weakBullets.length > 0 && (
                <div className="bg-linear-to-r from-gray-900 to-gray-800 p-5 rounded-lg border border-gray-700 shadow-inner">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">✨</span>
                    <h3 className="text-lg font-bold text-white">Smart Bullet Fixer</h3>
                  </div>
                  <p className="text-xs text-gray-300 mb-4">We automatically scanned your resume and found {weakBullets.length} sentences lacking metrics:</p>
                  
                  <div className="space-y-4">
                    {weakBullets.map((bullet, index) => (
                      <div key={index} className="bg-gray-800 border border-gray-600 rounded p-4 shadow-sm">
                        {/* Original Weak Bullet Sentence */}
                        <p className="text-sm text-gray-200 mb-3 italic">"{bullet}"</p>
                        
                        {/* 1-Click Fix Button or Result */}
                        {!rewrittenBullets[index] ? (
                          <button 
                            onClick={() => handleRewrite(bullet, index)}
                            disabled={loadingIndex !== null}
                            className="bg-blue-600 text-white font-semibold py-1.5 px-4 rounded hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 transition-colors text-xs"
                          >
                            {loadingIndex === index ? "Generating Magic..." : "Fix with AI"}
                          </button>
                        ) : (
                          <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">AI Suggestion:</p>
                            <p className="text-sm text-gray-900 font-medium leading-relaxed">{rewrittenBullets[index]}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Structure & Formatting Checklist */}
            <div className="space-y-6">
              
              {/* 3. Structure Check */}
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
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span>"Skills" Section:</span>
                    <span>{structure?.has_skills ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  
                  {/* Projects Section Check */}
                  <li className="flex justify-between pt-2">
                    <div className="flex flex-col">
                      <span>"Projects" Section:</span>
                      {!structure?.has_projects && (
                        <span className="text-xs text-red-500 mt-1 font-semibold">⚠️ Essential for tech roles. Add this section!</span>
                      )}
                    </div>
                    <span>{structure?.has_projects ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                </ul>
              </div>

              {/* 4. Formatting & Contact Check */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">4. Contact & Links (10%)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Email Address:</span>
                    <span>{formatting?.has_email ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span>Phone Number:</span>
                    <span>{formatting?.has_phone ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span>LinkedIn Profile:</span>
                    <span>{formatting?.has_linkedin ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span>GitHub Profile:</span>
                    <span>{formatting?.has_github ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  
                  {/* Repo Links Counter */}
                  <li className="flex justify-between pt-2">
                    <div className="flex flex-col">
                      <span>Project Repo Links:</span>
                      {structure?.has_projects && formatting?.repo_link_count === 0 && (
                        <span className="text-xs text-red-500 mt-1 font-semibold">⚠️ Projects found, but 0 repo links detected!</span>
                      )}
                      {structure?.has_projects && formatting?.repo_link_count > 0 && formatting?.repo_link_count < 2 && (
                        <span className="text-xs text-red-500 mt-1 font-semibold">⚠️ Ensure every project has a code link.</span>
                      )}
                    </div>
                    <span className={`font-bold ${formatting?.repo_link_count >= 2 ? 'text-green-600' : 'text-red-500'}`}>
                      {formatting?.repo_link_count > 0 ? `${formatting?.repo_link_count} Found` : '❌ Missing'}
                    </span>
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