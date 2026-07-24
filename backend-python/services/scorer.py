def calculate_total_ats_score(analysis_data: dict) -> dict:
    """
    Calculates the final ATS score out of 100 based on four weighted categories.
    """
    score = 0
    suggestions = []

    
    
    
    matched = len(analysis_data["skills"]["matched"])
    missing = len(analysis_data["skills"]["missing"])
    total_skills = matched + missing

    if total_skills > 0:
        tech_score = (matched / total_skills) * 45
        score += tech_score
    else:
        suggestions.append("No technical skills extracted. Ensure your resume highlights specific tools and languages.")

    if missing > 0:
        missing_preview = ", ".join(analysis_data['skills']['missing'][:3])
        suggestions.append(f"Missing critical JD keywords. Consider adding: {missing_preview}.")

    
    
    
    metrics = analysis_data["metrics_count"]
    impact_score = min((metrics / 5.0), 1.0) * 30
    score += impact_score

    weak_bullets = analysis_data.get("weak_bullets", [])
    if len(weak_bullets) > 0:
        suggestions.insert(0, f"Detected {len(weak_bullets)} sentences lacking metrics. Scroll down to the Smart Bullet Fixer to upgrade them with AI.")
        
    
    if metrics < 5:  
        suggestions.append(f"Low impact score ({metrics}/5 metrics found). Use the AI Rewriter to add numbers, %, and $.")

    
    
    
    structure = analysis_data["structure"]
    struct_score = 0
    
    if 400 <= structure.get("word_count", 0) <= 900:
        struct_score += 3
    else:
        suggestions.append("Word count is outside the optimal ATS range (400-900 words).")

    if structure.get("has_education"): 
        struct_score += 3
    else: 
        suggestions.append("Critical Section Missing: Add an explicit 'Education' section.")

    if structure.get("has_experience"): 
        struct_score += 3
    else: 
        suggestions.append("Critical Section Missing: Add an explicit 'Experience' or 'Work History' section.")

    if structure.get("has_skills"): 
        struct_score += 3
    else: 
        suggestions.append("Critical Section Missing: Add an explicit 'Skills' section.")

    if structure.get("has_projects"): 
        struct_score += 3
    else: 
        suggestions.append("Critical Section Missing: Add a 'Projects' section to showcase your technical portfolio.")

    score += struct_score

    
    
    
    formatting = analysis_data["formatting"]
    format_score = 0
    
    if formatting.get("has_email"): 
        format_score += 2
    else: 
        suggestions.append("Contact Error: Missing an email address.")

    if formatting.get("has_phone"): 
        format_score += 2
    else: 
        suggestions.append("Contact Error: Missing a phone number.")

    if formatting.get("has_linkedin"): 
        format_score += 2
    else: 
        suggestions.append("Link Missing: Add your LinkedIn profile link.")

    if formatting.get("has_github"): 
        format_score += 2
    else: 
        suggestions.append("Link Missing: Add your GitHub profile link.")

    repo_count = formatting.get("repo_link_count", 0)
    has_projects = structure.get("has_projects")

    
    if repo_count >= 2: 
        format_score += 2
    elif repo_count == 1:
        format_score += 1  
        if has_projects:
            suggestions.append("Only 1 repository link detected. Ensure every individual project has its own code link.")
    else: 
        if has_projects: 
            suggestions.append("Projects section found, but no repository links detected. Link your code repositories!")

    missing_projects = analysis_data.get("missing_project_links", [])
    if missing_projects:
        suggestions.append("Some of your projects are missing repository links. Please add repository links to all your projects.")

    score += format_score

    
    
    
    final_score = min(round(score), 100)

    return {
        "score": final_score,
        "suggestions": suggestions 
    }