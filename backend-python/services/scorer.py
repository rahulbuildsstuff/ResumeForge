def calculate_total_ats_score(analysis_data: dict) -> int:
    """Calculates the total ATS score with strict Project and Repo Link parameters."""
    if not analysis_data:
        return 0

    # --- 1. Semantic Score (45% weight) ---
    skills = analysis_data.get("skills", {})
    matched = skills.get("matched", [])
    missing = skills.get("missing", [])
    total_required = len(matched) + len(missing)
    
    s_semantic = (len(matched) / total_required) * 100.0 if total_required > 0 else 0.0

    # --- 2. Metrics / Impact Score (30% weight) ---
    metrics_count = analysis_data.get("metrics_count", 0)
    e_metrics = min((metrics_count / 5.0) * 100.0, 100.0)

    # --- 3. Structure Score (15% weight) ---
    structure = analysis_data.get("structure", {})
    word_count = structure.get("word_count", 0)
    
    if 400 <= word_count <= 900:
        word_score = 100.0
    elif word_count < 400:
        word_score = max((word_count / 400.0) * 100.0, 20.0)
    else:
        word_score = max(100.0 - ((word_count - 900) / 10.0), 40.0)
        
    # NEW: Grading out of 4 core sections now (Education, Experience, Skills, Projects)
    sections_found = sum([
        structure.get("has_education", False),
        structure.get("has_experience", False),
        structure.get("has_skills", False),
        structure.get("has_projects", False)  # Now heavily weighted
    ])
    section_score = (sections_found / 4.0) * 100.0
    
    c_structure = (word_score * 0.5) + (section_score * 0.5)

    # --- 4. Formatting & Contact Score (10% weight) ---
    formatting = analysis_data.get("formatting", {})
    has_email = 1.0 if formatting.get("has_email") else 0.0
    has_phone = 1.0 if formatting.get("has_phone") else 0.0
    has_linkedin = 1.0 if formatting.get("has_linkedin") else 0.0
    
    base_formatting_score = ((has_email + has_phone + has_linkedin) / 3.0) * 100.0

    # NEW: Repo Link Penalty Logic
    repo_link_count = formatting.get("repo_link_count", 0)
    repo_score_multiplier = 1.0
    
    # If they declare a Projects section, they MUST back it up with code links
    if structure.get("has_projects", False):
        if repo_link_count == 0:
            repo_score_multiplier = 0.5  # 50% penalty for 0 links
        elif repo_link_count == 1:
            repo_score_multiplier = 0.8  # 20% penalty (assuming they have multiple projects but only linked 1)
        # If they have 2+ links, they get a 1.0 multiplier (no penalty)
            
    f_formatting = base_formatting_score * repo_score_multiplier

    # --- Final Math ---
    total_ats_score = (s_semantic * 0.45) + (e_metrics * 0.30) + (c_structure * 0.15) + (f_formatting * 0.10)

    return int(round(total_ats_score))