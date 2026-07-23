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
    <div className="text-gray-800 antialiased min-h-screen pb-12 bg-[#F8F9FA] font-sans">
      
      {/* BEGIN: TopNavigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-blue-600 font-bold text-lg tracking-tight">
            ResumeForge<span className="text-indigo-900"> AI</span>
          </span>
        </div>
        {/* Nav Links */}
        <div className="hidden md:flex space-x-8 mt-2">
          <a className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium text-sm transition-all duration-200" href="#">Dashboard</a>
          <a className="text-gray-500 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300 transition-all duration-200 font-medium text-sm" href="#">My Resumes</a>
          <a className="text-gray-500 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300 transition-all duration-200 font-medium text-sm" href="#">Job Tracker</a>
          <a className="text-gray-500 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300 transition-all duration-200 font-medium text-sm" href="#">Templates</a>
        </div>
        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <span className="material-icons-outlined text-xl align-middle">search</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center shadow-sm transition-colors cursor-pointer">
            <span className="material-icons text-sm mr-1">bolt</span> Upgrade Pro
          </button>
          {/* Avatar Placeholder */}
          <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden border border-gray-200">
            <img 
              alt="User Avatar" 
              className="h-full w-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8yj3ShZRGtn95Hf9Nt1VUeSHgCjE589iklfdYN7tTigTtI_7vZv3285HGihITWNnWZBqX7YeWz3k42nBSy3JyI0jl9EjPvbqI3-SZjr8gSQKnNHffbMAVMJbdmRTYbAccB8jp68GzJI1X_FyCqbxuB_kK7V_yjNu6U-TgYootES-kA_KmmkFxhTmbV5IEnjmKktMyAxsM2P6_deuG4e-lMA3LwnqQ5OzoQL-5J3bONlxAoZv3AFjy"
            />
          </div>
        </div>
      </nav>
      {/* END: TopNavigation */}

      {/* BEGIN: MainContent */}
      <main className="max-w-6xl mx-auto mt-8 px-4 space-y-6">
        
        {/* BEGIN: StartNewAnalysis Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center mb-6">
            <span className="material-icons-outlined text-blue-500 mr-2 text-xl">auto_awesome</span>
            <h2 className="text-lg font-semibold text-gray-900">Start New Analysis</h2>
          </div>
          
          <form onSubmit={handleAnalyze}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* File Upload Area */}
              <div 
                onClick={handleUploadClick}
                className="border border-dashed border-gray-300 rounded-lg bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center h-64 cursor-pointer hover:bg-gray-100/50 transition-colors relative"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />

                {file ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                      <span className="material-icons-outlined text-2xl">description</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1 max-w-[220px] truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="flex items-center text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-medium transition-colors border border-red-100 shadow-sm cursor-pointer"
                    >
                      <span className="material-icons-outlined text-[14px] mr-1">delete</span> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                      <span className="material-icons-outlined text-2xl">cloud_upload</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">Drag &amp; Drop Resume PDF</p>
                    <p className="text-xs text-gray-500">or click to browse files (Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* Job Description Area */}
              <div className="flex flex-col h-64">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Target Job Description
                </label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="flex-grow w-full border border-gray-200 rounded-lg p-4 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white focus:outline-none"
                  placeholder="Paste the job description here to tailor the analysis..."
                />
              </div>

            </div>

            <div className="mt-8 flex justify-center">
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center shadow-md transition-colors w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Score and Info */}
                <div className="flex items-center flex-1 w-full">
                  {/* Circular Progress */}
                  <div className="w-32 h-32 relative flex-shrink-0">
                    <svg className="w-full h-full max-h-[250px] mx-auto block transform -rotate-90" viewBox="0 0 36 36">
                      <path 
                        className="fill-none stroke-gray-200 stroke-[3.8]" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      ></path>
                      <circle 
                        className={`fill-none stroke-[2.8] stroke-linecap-round stroke-current transition-all duration-1000 ease-out ${
                          score >= 75 ? 'text-green-600' : score >= 50 ? 'text-amber-500' : 'text-red-600'
                        }`}
                        cx="18" 
                        cy="18" 
                        r="15.9155"
                        strokeDasharray={`${score}, 100`}
                      ></circle>
                    </svg>
                    {/* Overlay for text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 leading-none">{score}%</span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-1">Score</span>
                    </div>
                    {/* Background Glow Effect */}
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-10 -z-10"></div>
                  </div>
                  
                  {/* Text */}
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Analysis Complete</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
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
                  <div className="bg-red-50/50 border border-red-100 rounded-lg p-5 lg:w-1/2 w-full flex-shrink-0">
                    <div className="flex items-center mb-3 text-red-600">
                      <span className="material-icons-outlined text-lg mr-2">warning_amber</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider">High-Priority Action Items</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
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
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <span className="material-icons-outlined text-orange-700 mr-2 text-lg">grid_view</span>
                    <h3 className="text-md font-semibold text-gray-900">Technical Match</h3>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded">
                    {matchedSkills.length + missingSkills.length > 0 
                      ? `${Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100)}% coverage`
                      : "0% coverage"}
                  </span>
                </div>
                
                <div className="mb-5">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Matched Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                          <span className="material-icons text-[12px] mr-1">check</span> {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">None</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Missing From JD</h4>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                          <span className="material-icons text-[12px] mr-1">close</span> {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-green-600 font-medium">None! Perfect match.</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Proof of Impact */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden flex flex-col justify-center">
                {/* Background Icon Watermark */}
                <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 text-gray-100 opacity-50 z-0 select-none pointer-events-none">
                  <span className="material-icons" style={{ fontSize: "150px" }}>emoji_events</span>
                </div>
                
                <div className="relative z-10 w-full">
                  <div className="flex items-center mb-6 text-blue-600">
                    <span className="material-icons-outlined mr-2 text-lg">trending_up</span>
                    <h3 className="text-md font-semibold text-gray-900">Proof of Impact</h3>
                  </div>
                  
                  <div className="flex items-end mb-4">
                    <span className="text-6xl font-bold text-blue-700 leading-none mr-3">{metricsCount}</span>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-gray-800">Metrics Found</p>
                      <p className={`text-xs font-medium ${metricsCount >= 5 ? 'text-blue-600' : 'text-red-500'}`}>
                        {metricsCount >= 5 ? '(Strong Impact Goal Met)' : `(Goal: 5+ minimum)`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full ${metricsCount >= 5 ? 'bg-green-600' : 'bg-blue-700'}`} 
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
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <span className="material-icons-outlined text-gray-500 mr-2 text-lg">format_list_bulleted</span>
                  <h3 className="text-md font-semibold text-gray-900">ATS Structure Check</h3>
                </div>
                <div className="space-y-4">
                  {/* Word Count */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-xl ${(structure?.word_count >= 400 && structure?.word_count <= 900) ? 'text-purple-500' : 'text-red-500'}`}>
                        {(structure?.word_count >= 400 && structure?.word_count <= 900) ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm text-gray-600">Word Count (Target 400-800 words)</span>
                    </div>
                    <span className="text-xs text-gray-500">{structure?.word_count || 0} words</span>
                  </div>
                  
                  {/* Education */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-xl ${structure?.has_education ? 'text-purple-500' : 'text-red-500'}`}>
                        {structure?.has_education ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm text-gray-600">Education Section</span>
                    </div>
                    <span className="text-xs text-gray-500">{structure?.has_education ? 'Found' : 'Missing'}</span>
                  </div>
                  
                  {/* Experience */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-xl ${structure?.has_experience ? 'text-purple-500' : 'text-red-500'}`}>
                        {structure?.has_experience ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm text-gray-600">Experience Section</span>
                    </div>
                    <span className="text-xs text-gray-500">{structure?.has_experience ? 'Found' : 'Missing'}</span>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-xl ${structure?.has_skills ? 'text-purple-500' : 'text-red-500'}`}>
                        {structure?.has_skills ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm text-gray-600">Skills Section</span>
                    </div>
                    <span className="text-xs text-gray-500">{structure?.has_skills ? 'Found' : 'Missing'}</span>
                  </div>
                  
                  {/* Projects */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center">
                      <span className={`material-icons-outlined mr-3 text-xl ${structure?.has_projects ? 'text-purple-500' : 'text-red-500'}`}>
                        {structure?.has_projects ? 'check_circle_outline' : 'cancel'}
                      </span>
                      <span className="text-sm text-gray-600">Projects Section</span>
                    </div>
                    <span className="text-xs text-gray-500">{structure?.has_projects ? 'Found' : 'Missing'}</span>
                  </div>
                </div>
              </section>

              {/* Contact & Links */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <span className="material-icons-outlined text-gray-500 mr-2 text-lg">link</span>
                  <h3 className="text-md font-semibold text-gray-900">Contact &amp; Links</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Email */}
                  <div className="bg-indigo-50/50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                    <div className="flex items-center text-purple-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_email ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium">{formatting?.has_email ? 'Verified' : 'Missing'}</span>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="bg-indigo-50/50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                    <div className="flex items-center text-purple-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_phone ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium">{formatting?.has_phone ? 'Verified' : 'Missing'}</span>
                    </div>
                  </div>
                  {/* LinkedIn */}
                  <div className="bg-indigo-50/50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">LinkedIn Link</p>
                    <div className="flex items-center text-purple-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_linkedin ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium">{formatting?.has_linkedin ? 'Present' : 'Missing'}</span>
                    </div>
                  </div>
                  {/* GitHub */}
                  <div className="bg-indigo-50/50 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">GitHub Link</p>
                    <div className="flex items-center text-purple-600">
                      <span className="material-icons-outlined text-sm mr-1">
                        {formatting?.has_github ? 'check_circle' : 'cancel'}
                      </span>
                      <span className="text-sm font-medium">{formatting?.has_github ? 'Present' : 'Missing'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Project Repo Links */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Project Repo Links</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">GitHub / GitLab References</span>
                    <span className={`text-xs font-bold ${formatting?.repo_link_count >= 2 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatting?.repo_link_count || 0} Found
                    </span>
                  </div>
                </div>
              </section>

            </div>
            {/* END: Grid Content (ATS & Links) */}

            {/* BEGIN: Smart Bullet Fixer */}
            {weakBullets.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-2">
                  <span className="material-icons-outlined text-orange-700 mr-2 text-xl">auto_fix_high</span>
                  <h2 className="text-lg font-semibold text-gray-900">Smart Bullet Fixer</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  We scanned your resume and detected {weakBullets.length} bullet points lacking measurable metrics. Click AI to generate impact improvements.
                </p>
                
                <div className="space-y-4">
                  {weakBullets.map((bullet, index) => (
                    <div key={index} className="flex flex-col gap-3">
                      
                      {/* Weak Bullet row container */}
                      <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-1.5 text-red-500">
                            <span className="text-xs font-bold uppercase tracking-wider">Weak Impact</span>
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            "{bullet}"
                          </p>
                        </div>
                        {!rewrittenBullets[index] && (
                          <button 
                            type="button"
                            onClick={() => handleRewrite(bullet, index)}
                            disabled={loadingIndex !== null}
                            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-end md:self-auto"
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
                        <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 flex flex-col gap-2 relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center mr-2">
                                <span className="material-icons text-[12px] mr-1">check</span> APPLIED
                              </span>
                              <span className="text-xs text-green-700">Replaced in analysis</span>
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
                              className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                            >
                              Discard
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 italic">
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