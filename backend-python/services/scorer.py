def calculate_total_ats_score(analysis_data: dict) -> dict:
    """
    Calculates the final ATS score out of 100 based on four weighted categories:
    1. Technical Match (45%)
    2. Proof of Impact (30%)
    3. ATS Structure (15%)
    4. Contact & Links (10%)
    """
    score = 0
    suggestions = []

    # ---------------------------------------------------------
    # 1. Technical Match (45%)
    # ---------------------------------------------------------
    matched = len(analysis_data["skills"]["matched"])
    missing = len(analysis_data["skills"]["missing"])
    total_skills = matched + missing

    if total_skills > 0:
        tech_score = (matched / total_skills) * 45
        score += tech_score
    else:
        suggestions.append("No technical skills extracted. Ensure your resume highlights specific tools and languages.")

    if missing > 0:
        # Suggest the top 3 missing skills to the user
        missing_preview = ", ".join(analysis_data['skills']['missing'][:3])
        suggestions.append(f"Missing critical JD keywords. Consider adding: {missing_preview}.")

    # ---------------------------------------------------------
    # 2. Proof of Impact (30%)
    # ---------------------------------------------------------
    metrics = analysis_data["metrics_count"]
    # Target is 5 metrics. If they have 5 or more, they get the full 30 points.
    impact_score = min((metrics / 5.0), 1.0) * 30
    score += impact_score

    # ---------------------------------------------------------
    # NEW: Smart Bullet Fixer Integration
    # ---------------------------------------------------------
    weak_bullets = analysis_data.get("weak_bullets", [])
    if len(weak_bullets) > 0:
        # Insert this at the very beginning of suggestions so it is highly visible
        suggestions.insert(0, f"Detected {len(weak_bullets)} sentences lacking metrics. Scroll down to the Smart Bullet Fixer to upgrade them with AI.")
    elif metrics < 5:
        suggestions.append(f"Low impact score ({metrics}/5 metrics found). Use the AI Rewriter to add numbers, %, and $.")

    # ---------------------------------------------------------
    # 3. ATS Structure (15%)
    # ---------------------------------------------------------
    structure = analysis_data["structure"]
    struct_score = 0
    
    if 400 <= structure.get("word_count", 0) <= 900:
        struct_score += 3
    else:
        suggestions.append("Word count is outside the optimal ATS range (400-900 words).")

    if structure.get("has_education"): struct_score += 3
    else: suggestions.append("Missing 'Education' section header.")

    if structure.get("has_experience"): struct_score += 3
    else: suggestions.append("Missing 'Experience' or 'Work History' section header.")

    if structure.get("has_skills"): struct_score += 3
    else: suggestions.append("Missing 'Skills' section header.")

    if structure.get("has_projects"): struct_score += 3
    else: suggestions.append("Missing 'Projects' section header. Highly recommended for tech roles.")

    score += struct_score

    # ---------------------------------------------------------
    # 4. Contact & Links (10%)
    # ---------------------------------------------------------
    formatting = analysis_data["formatting"]
    format_score = 0
    
    if formatting.get("has_email"): format_score += 2
    else: suggestions.append("Missing an email address.")

    if formatting.get("has_phone"): format_score += 2
    else: suggestions.append("Missing a phone number.")

    if formatting.get("has_linkedin"): format_score += 2
    else: suggestions.append("Missing a LinkedIn profile link.")

    if formatting.get("has_github"): format_score += 2
    else: suggestions.append("Missing a GitHub profile link.")

    if formatting.get("repo_link_count", 0) >= 1: 
        format_score += 2
    elif structure.get("has_projects"): 
        suggestions.append("Projects section found, but no repository links detected. Ensure your code is linked!")

    score += format_score

    # ---------------------------------------------------------
    # Final Calculation
    # ---------------------------------------------------------
    final_score = int(min(round(score), 100))

    return {
        "score": final_score,
        "suggestions": suggestions[:4] # Only return top 4 suggestions so the UI stays clean
    }