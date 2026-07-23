import React, { useState, useRef } from 'react';

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

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
    <div className="text-slate-800 antialiased min-h-screen pb-16 bg-[#F8F9FA]">
      
      {/* BEGIN: TopNavigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-blue-600 font-extrabold text-xl tracking-tight">
            ResumeForge<span className="text-indigo-900"> AI</span>
          </span>
        </div>
      </nav>
      {/* END: TopNavigation */}

      {/* BEGIN: MainContent */}
      <main className="max-w-6xl mx-auto mt-8 px-4 space-y-6">
        
        {/* BEGIN: StartNewAnalysis Section */}
        <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 p-6 md:p-8">
          <div className="flex items-center mb-6">
            <span className="material-icons-outlined text-blue-500 mr-2 text-[22px]">auto_awesome</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Start New Analysis</h2>
          </div>
          
          <form onSubmit={handleAnalyze}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* File Upload Area */}
              <div 
                onClick={handleUploadClick}
                className="border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center p-8 text-center h-64 cursor-pointer transition-all duration-200 relative group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />

                {file ? (
                  <div className="flex flex-col items-center justify-center w-full animate-fade-in">
                    <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
                      <span className="material-icons-outlined text-2xl">description</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-0.5 max-w-[240px] truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="flex items-center text-red-500 hover:text-red-700 bg-red-50/50 hover:bg-red-50 border border-red-100/50 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="material-icons-outlined text-[14px] mr-1">delete</span> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-blue-50/80 text-blue-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                      <span className="material-icons-outlined text-2xl">cloud_upload</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">Drag &amp; Drop Resume PDF</p>
                    <p className="text-xs text-slate-400">or click to browse files (Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* Job Description Area */}
              <div className="flex flex-col h-64">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  Target Job Description
                </label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="flex-grow w-full border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 resize-none bg-white transition-all focus:outline-none"
                  placeholder="Paste the job description here to tailor the analysis..."
                />
              </div>

            </div>

            <div className="mt-8 flex justify-center">
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-md shadow-blue-500/10 transition-colors w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-icons-outlined text-lg mr-2">
                  {loading ? 'sync' : 'analytics'}
                </span> 
                {loading ? "Analyzing Document..." : "Analyze Resume"}
              </button>
            </div>
          </form>
        </section>
        {/* END: StartNewAnalysis Section */}

        {score !== null && (
          <div className="space-y-6">
            
            {/* BEGIN: Analysis Complete & Alert */}
            <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Score and Info */}
                <div className="flex items-center flex-1 w-full">
                  {/* Circular Progress */}
                  <div className="w-32 h-32 relative flex-shrink-0">
                    <svg className="w-full h-full max-h-[250px] mx-auto block transform -rotate-90" viewBox="0 0 36 36">
                      <path 
                        className="fill-none stroke-slate-100 stroke-[3.2]" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      ></path>
                      <circle 
                        className={`fill-none stroke-[2.4] stroke-linecap-round stroke-current transition-all duration-1000 ease-out ${
                          score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'
                        }`}
                        cx="18" 
                        cy="18" 
                        r="15.9155"
                        strokeDasharray={`${score}, 100`}
                      ></circle>
                    </svg>
                    {/* Overlay for text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-slate-900 leading-none">{score}%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-bold text-slate-950 mb-1">Analysis Complete</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {score >= 75 
                        ? "Your resume shows strong compatibility! Complete the remaining action items below to optimize for automated selection."
                        : score >= 50 
                        ? "Your resume has a solid baseline match, but key refinements are recommended to optimize performance against applicant tracking systems."
                        : "Your resume has a low suitability score. Review keyword presence, experience formatting, and ATS layout guidelines to improve performance."}
                    </p>
                  </div>
                </div>

                {/* High Priority Alerts */}
                {suggestions.length > 0 && (
                  <div className="bg-rose-50/30 border border-rose-100/60 rounded-2xl p-5 lg:w-1/2 w-full flex-shrink-0">
                    <div className="flex items-center mb-3 text-rose-500">
                      <span className="material-icons-outlined text-lg mr-2">warning_amber</span>
                      <h4 className="text-xs font-bold uppercase tracking-widest">High-Priority Action Items</h4>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx} className="marker:text-rose-400">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
            {/* END: Analysis Complete & Alert */}

            {/* BEGIN: Grid Content (Match & Impact) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Technical Match */}
              <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <span className="material-icons-outlined text-orange-600 mr-2 text-[20px]">grid_view</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Technical Match</h3>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {matchedSkills.length + missingSkills.length > 0 
                      ? `${Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100)}% coverage`
                      : "0% coverage"}
                  </span>
                </div>
                
                <div className="mb-5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Matched Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50/60 text-indigo-600 text-xs font-semibold border border-indigo-100/50">
                          <span className="material-icons text-[12px] mr-1">check</span> {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Missing From JD</h4>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg bg-rose-50/60 text-rose-600 text-xs font-semibold border border-rose-100/50 animate-pulse">
                          <span className="material-icons text-[12px] mr-1">close</span> {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-green-600 font-semibold">None! Perfect match.</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Proof of Impact */}
              <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 p-6 relative overflow-hidden flex flex-col justify-center">
                {/* Background Icon Watermark */}
                <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 text-slate-50 opacity-40 z-0 select-none pointer-events-none">
                  <span className="material-icons" style={{ fontSize: "150px" }}>emoji_events</span>
                </div>
                
                <div className="relative z-10 w-full">
                  <div className="flex items-center mb-6 text-blue-600">
                    <span className="material-icons-outlined mr-2 text-[20px]">trending_up</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Proof of Impact</h3>
                  </div>
                  
                  <div className="flex items-end mb-4">
                    <span className="text-6xl font-extrabold text-blue-600 leading-none mr-3 tracking-tight">{metricsCount}</span>
                    <div className="pb-1">
                      <p className="text-sm font-bold text-slate-800">Metrics Found</p>
                      <p className={`text-xs font-semibold ${metricsCount >= 5 ? 'text-green-600' : 'text-slate-400'}`}>
                        {metricsCount >= 5 ? '(Strong Impact Goal Met)' : `(Goal: 5+ minimum)`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${metricsCount >= 5 ? 'bg-green-500' : 'bg-blue-600'}`} 
                      style={{ width: `${Math.min(100, (metricsCount / 5) * 100)}%`, transition: 'width 0.8s ease-in-out' }}
                    ></div>
                  </div>
                </div>
              </section>

            </div>
            {/* END: Grid Content (Match & Impact) */}

            {/* BEGIN: Grid Content (ATS & Links) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ATS Structure Check */}
              <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 p-6">
                <div className="flex items-center mb-6">
                  <span className="material-icons-outlined text-slate-500 mr-2 text-[20px]">format_list_bulleted</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">ATS Structure Check</h3>
                </div>
                <div className="space-y-3">
                  {/* Word Count */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-[18px] ${(structure?.word_count >= 400 && structure?.word_count <= 900) ? 'text-indigo-500' : 'text-rose-500'}`}>
                        {(structure?.word_count >= 400 && structure?.word_count <= 900) ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium text-slate-600">Word Count (Target 400-800 words)</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{structure?.word_count || 0} words</span>
                  </div>
                  
                  {/* Education */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-[18px] ${structure?.has_education ? 'text-indigo-500' : 'text-rose-500'}`}>
                        {structure?.has_education ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium text-slate-600">Education Section</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{structure?.has_education ? 'Found' : 'Missing'}</span>
                  </div>
                  
                  {/* Experience */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-[18px] ${structure?.has_experience ? 'text-indigo-500' : 'text-rose-500'}`}>
                        {structure?.has_experience ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium text-slate-600">Experience Section</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{structure?.has_experience ? 'Found' : 'Missing'}</span>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-[18px] ${structure?.has_skills ? 'text-indigo-500' : 'text-rose-500'}`}>
                        {structure?.has_skills ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium text-slate-600">Skills Section</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{structure?.has_skills ? 'Found' : 'Missing'}</span>
                  </div>
                  
                  {/* Projects */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-[18px] ${structure?.has_projects ? 'text-indigo-500' : 'text-rose-500'}`}>
                        {structure?.has_projects ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium text-slate-600">Projects Section</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{structure?.has_projects ? 'Found' : 'Missing'}</span>
                  </div>
                </div>
              </section>

              {/* Contact & Links */}
              <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 p-6">
                <div className="flex items-center mb-6">
                  <span className="material-icons-outlined text-slate-500 mr-2 text-[20px]">link</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact &amp; Links</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Email */}
                  <div className="bg-indigo-50/30 rounded-xl p-3 border border-indigo-100/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</p>
                    <div className="flex items-center text-indigo-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_email ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-semibold">{formatting?.has_email ? 'Verified' : 'Missing'}</span>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="bg-indigo-50/30 rounded-xl p-3 border border-indigo-100/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                    <div className="flex items-center text-indigo-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_phone ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-semibold">{formatting?.has_phone ? 'Verified' : 'Missing'}</span>
                    </div>
                  </div>
                  {/* LinkedIn */}
                  <div className="bg-indigo-50/30 rounded-xl p-3 border border-indigo-100/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">LinkedIn Link</p>
                    <div className="flex items-center text-indigo-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_linkedin ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-semibold">{formatting?.has_linkedin ? 'Present' : 'Missing'}</span>
                    </div>
                  </div>
                  {/* GitHub */}
                  <div className="bg-indigo-50/30 rounded-xl p-3 border border-indigo-100/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">GitHub Link</p>
                    <div className="flex items-center text-indigo-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_github ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-semibold">{formatting?.has_github ? 'Present' : 'Missing'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Project Repo Links */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">Project Repo Links</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">GitHub / GitLab References</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${formatting?.repo_link_count >= 2 ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                      {formatting?.repo_link_count || 0} Found
                    </span>
                  </div>
                </div>
              </section>

            </div>
            {/* END: Grid Content (ATS & Links) */}

            {/* BEGIN: Smart Bullet Fixer */}
            {weakBullets.length > 0 && (
              <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 p-6 md:p-8">
                <div className="flex items-center mb-2">
                  <span className="material-icons-outlined text-orange-600 mr-2 text-[22px]">auto_fix_high</span>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Smart Bullet Fixer</h2>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  We scanned your resume and detected {weakBullets.length} bullet points lacking measurable metrics. Click AI to generate impact improvements.
                </p>
                
                <div className="space-y-4">
                  {weakBullets.map((bullet, index) => (
                    <div key={index} className="flex flex-col gap-3">
                      
                      {/* Weak Bullet row container */}
                      <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 text-rose-500">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Weak Impact</span>
                          </div>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                            "{bullet}"
                          </p>
                        </div>
                        {!rewrittenBullets[index] && (
                          <button 
                            type="button"
                            onClick={() => handleRewrite(bullet, index)}
                            disabled={loadingIndex !== null}
                            className="flex-shrink-0 bg-blue-50/50 hover:bg-blue-50 text-blue-600 border border-blue-100/50 px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-end md:self-auto shadow-sm"
                          >
                            <span className="material-icons text-sm mr-1">
                              {loadingIndex === index ? 'sync' : 'auto_fix_high'}
                            </span>
                            {loadingIndex === index ? 'Rewriting...' : 'Fix with AI'}
                          </button>
                        )}
                      </div>

                      {/* Rewritten (Applied) suggest box */}
                      {rewrittenBullets[index] && (
                        <div className="bg-green-50/30 border border-green-100/80 rounded-xl p-5 flex flex-col gap-2 relative animate-fade-in">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center mr-2 tracking-wider">
                                <span className="material-icons text-[12px] mr-1">check</span> APPLIED
                              </span>
                              <span className="text-xs text-green-700 font-semibold">Replaced in analysis</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setRewrittenBullets(prev => {
                                  const updated = { ...prev };
                                  delete updated[index];
                                  return updated;
                                });
                              }}
                              className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors cursor-pointer"
                            >
                              Discard
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed italic border-l-2 border-green-400 pl-3">
                            "{rewrittenBullets[index]}"
                          </p>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* END: Smart Bullet Fixer */}

          </div>
        )}

      </main>
      {/* END: MainContent */}
    </div>
  );
};

export default ResumeAnalyzer;