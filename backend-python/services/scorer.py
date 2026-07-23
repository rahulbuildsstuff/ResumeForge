def calculate_total_ats_score(analysis_data: dict) -> dict:
    """Calculates the total ATS score and generates dynamic suggestions."""
    if not analysis_data:
        return {"score": 0, "suggestions": []}

    suggestions = []

    # --- 1. Semantic Score ---
    skills = analysis_data.get("skills", {})
    matched = skills.get("matched", [])
    missing = skills.get("missing", [])
    total_required = len(matched) + len(missing)
    
    s_semantic = (len(matched) / total_required) * 100.0 if total_required > 0 else 0.0

    if len(missing) > 0:
        # Suggest up to 3 missing keywords to avoid overwhelming the user
        suggestions.append(f"Add missing keywords to your resume to pass the semantic filter: {', '.join(missing[:3])}.")

    # --- 2. Metrics Score ---
    metrics_count = analysis_data.get("metrics_count", 0)
    e_metrics = min((metrics_count / 5.0) * 100.0, 100.0)

    if metrics_count < 5:
        suggestions.append(f"Only {metrics_count} numerical metrics found. Use numbers, %, and $ (e.g., 'Increased efficiency by 20%') to prove your impact.")

    # --- 3. Structure Score ---
    structure = analysis_data.get("structure", {})
    word_count = structure.get("word_count", 0)
    
    if 400 <= word_count <= 900:
        word_score = 100.0
    elif word_count < 400:
        word_score = max((word_count / 400.0) * 100.0, 20.0)
        suggestions.append(f"Your resume is too short ({word_count} words). Aim for at least 400 words to ensure ATS parsers have enough text to read.")
    else:
        word_score = max(100.0 - ((word_count - 900) / 10.0), 40.0)
        suggestions.append(f"Your resume is too long ({word_count} words). Edit it down to under 900 words to maintain recruiter attention.")
        
    sections_found = sum([
        structure.get("has_education", False),
        structure.get("has_experience", False),
        structure.get("has_skills", False),
        structure.get("has_projects", False)
    ])
    section_score = (sections_found / 4.0) * 100.0
    
    if not structure.get("has_projects", False):
        suggestions.append("CRITICAL: Missing 'Projects' section. This is essential for technical roles.")
        
    c_structure = (word_score * 0.5) + (section_score * 0.5)

    # --- 4. Formatting Score ---
    formatting = analysis_data.get("formatting", {})
    has_email = 1.0 if formatting.get("has_email") else 0.0
    has_phone = 1.0 if formatting.get("has_phone") else 0.0
    has_linkedin = 1.0 if formatting.get("has_linkedin") else 0.0
    
    base_formatting_score = ((has_email + has_phone + has_linkedin) / 3.0) * 100.0

    if not formatting.get("has_linkedin"):
        suggestions.append("Missing LinkedIn profile. Ensure your URL is written out or hyperlinked correctly.")

    repo_link_count = formatting.get("repo_link_count", 0)
    repo_score_multiplier = 1.0
    
    if structure.get("has_projects", False):
        if repo_link_count == 0:
            repo_score_multiplier = 0.5
            suggestions.append("CRITICAL: You have a Projects section, but 0 repository links were found. Add GitHub/GitLab links to your code.")
        elif repo_link_count == 1:
            repo_score_multiplier = 0.8
            suggestions.append("Only 1 repository link found. Ensure EVERY project has a corresponding hyperlink to the code.")
            
    f_formatting = base_formatting_score * repo_score_multiplier

    # --- Final Math ---
    total_ats_score = (s_semantic * 0.45) + (e_metrics * 0.30) + (c_structure * 0.15) + (f_formatting * 0.10)

    # Return BOTH the score and the new suggestions array
    return {
        "score": int(round(total_ats_score)),
        "suggestions": suggestions
    }