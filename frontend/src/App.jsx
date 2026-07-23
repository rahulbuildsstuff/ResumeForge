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
  const [rewrittenBullets, setRewrittenBullets] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null); 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) return alert("Please provide both a PDF resume and a Job Description.");

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
        setRewrittenBullets({});
      } else {
        alert(data.detail || "Error analyzing resume.");
      }
    } catch (error) {
      alert("Error connecting to the backend server.");
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (error) {
      alert("Error connecting to the AI rewriter.");
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-black text-blue-600 tracking-tight">ResumeForge AI</h1>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
            <span className="text-blue-600 border-b-2 border-blue-600 pb-1">Dashboard</span>
            <span className="hover:text-blue-600 cursor-pointer">My Resumes</span>
            <span className="hover:text-blue-600 cursor-pointer">Job Tracker</span>
            <span className="hover:text-blue-600 cursor-pointer">Templates</span>
          </div>
        </div>
        <div>
          <button className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-blue-700 transition">
            ⚡ Upgrade Pro
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-6">
        
        {/* INPUT FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-lg font-bold mb-6 flex items-center">
            <span className="mr-2 text-blue-500">✨</span> Start New Analysis
          </h2>
          <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 transition bg-gray-50">
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Job Description</label>
              <textarea 
                rows="6"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                placeholder="Paste the job description here..."
              />
            </div>
            <div className="md:col-span-2 flex justify-center mt-2">
              <button type="submit" disabled={loading} className="bg-blue-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition w-full md:w-auto shadow-md">
                {loading ? "Analyzing Document..." : "Analyze Resume"}
              </button>
            </div>
          </form>
        </div>

        {/* DASHBOARD RESULTS */}
        {score !== null && (
          <div className="space-y-6">
            
            {/* MASTER SCORE & ACTION PLAN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center space-x-6">
                <div className={`text-4xl font-black rounded-full h-32 w-32 flex items-center justify-center border-8 ${score >= 75 ? 'border-green-500 text-green-600' : score >= 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                  {score}%
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
                  <p className="text-gray-500 mt-1 max-w-sm text-sm leading-relaxed">Your resume has been processed. Review the detailed parameter breakdowns below to optimize your score.</p>
                </div>
              </div>
              
              {/* DYNAMIC SUGGESTIONS BOX */}
              {suggestions.length > 0 && (
                <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex-1 w-full">
                  <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest mb-3 flex items-center">
                    <span className="mr-2">⚠️</span> High-Priority Action Items
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-red-700 text-sm font-medium">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4-PILLAR GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1: Technical Match */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4">1. Technical Match (45%)</h3>
                <div className="mb-4">
                  <span className="font-bold text-green-700">Matched ({matchedSkills.length}): </span>
                  <span className="text-sm text-gray-700 leading-relaxed">{matchedSkills.join(", ") || "None"}</span>
                </div>
                <div>
                  <span className="font-bold text-red-700">Missing ({missingSkills.length}): </span>
                  <span className="text-sm text-gray-700 leading-relaxed">{missingSkills.join(", ") || "None"}</span>
                </div>
              </div>

              {/* CARD 2: Proof of Impact */}
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-bold text-purple-900 mb-2">2. Proof of Impact (30%)</h3>
                <p className="text-sm text-gray-600 mb-4">Recruiters look for numbers, %, and $ to prove your impact.</p>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-black ${metricsCount >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                    {metricsCount} Metrics Found
                  </span>
                  <span className="text-sm text-gray-500">(Target: 5+)</span>
                </div>
              </div>

              {/* CARD 3: ATS Structure */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">3. ATS Structure (15%)</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Word Count (Target 400-900):</span>
                    <span className={`font-bold ${structure?.word_count >= 400 && structure?.word_count <= 900 ? 'text-green-600' : 'text-red-600'}`}>
                      {structure?.word_count || 0} words
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-700">"Education" Section:</span>
                    <span className={structure?.has_education ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{structure?.has_education ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-700">"Experience" Section:</span>
                    <span className={structure?.has_experience ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{structure?.has_experience ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-700">"Skills" Section:</span>
                    <span className={structure?.has_skills ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{structure?.has_skills ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between pt-2">
                    <span className="text-gray-700">"Projects" Section:</span>
                    <span className={structure?.has_projects ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{structure?.has_projects ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                </ul>
              </div>

              {/* CARD 4: Contact & Links */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">4. Contact & Links (10%)</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Email Address:</span>
                    <span className={formatting?.has_email ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{formatting?.has_email ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-700">Phone Number:</span>
                    <span className={formatting?.has_phone ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{formatting?.has_phone ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-700">LinkedIn Profile:</span>
                    <span className={formatting?.has_linkedin ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{formatting?.has_linkedin ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-700">GitHub Profile:</span>
                    <span className={formatting?.has_github ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{formatting?.has_github ? '✅ Found' : '❌ Missing'}</span>
                  </li>
                  <li className="flex justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-gray-700">Project Repo Links:</span>
                      {structure?.has_projects && formatting?.repo_link_count === 0 && (
                        <span className="text-xs text-amber-600 mt-1 font-bold">⚠️ Ensure every project has a code link.</span>
                      )}
                    </div>
                    <span className={`font-bold ${formatting?.repo_link_count >= 2 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatting?.repo_link_count} Found
                    </span>
                  </li>
                </ul>
              </div>

            </div>

            {/* SMART BULLET FIXER */}
            {weakBullets.length > 0 && (
              <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl mt-8">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">✨</span>
                  <h3 className="text-xl font-bold text-white">Smart Bullet Fixer</h3>
                </div>
                <p className="text-sm text-slate-400 mb-6">We automatically scanned your resume and found {weakBullets.length} sentences lacking metrics:</p>
                
                <div className="space-y-4">
                  {weakBullets.map((bullet, index) => (
                    <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                      <p className="text-sm text-slate-300 mb-4 italic leading-relaxed">"{bullet}"</p>
                      
                      {!rewrittenBullets[index] ? (
                        <button 
                          onClick={() => handleRewrite(bullet, index)}
                          disabled={loadingIndex !== null}
                          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-500 disabled:bg-slate-600 transition text-sm shadow-md"
                        >
                          {loadingIndex === index ? "Generating Magic..." : "Fix with AI"}
                        </button>
                      ) : (
                        <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center mb-2">
                            <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">✓ Applied</span>
                            <span className="text-xs text-emerald-800 ml-3 font-semibold">AI Suggestion</span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium leading-relaxed">{rewrittenBullets[index]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;