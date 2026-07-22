def calculate_total_ats_score(analysis_data: dict) -> int:
    """Calculates score using the formula:
       Total ATS Score = (S_semantic * 0.45) + (E_metrics * 0.30) + (C_structure * 0.15) + (F_formatting * 0.10)
    """
    if not analysis_data:
        return 0

    # --- 1. Semantic Score (45% weight) ---
    skills = analysis_data.get("skills", {})
    matched = skills.get("matched", [])
    missing = skills.get("missing", [])
    total_required = len(matched) + len(missing)
    
    if total_required == 0:
        s_semantic = 0.0
    else:
        s_semantic = (len(matched) / total_required) * 100.0

    # --- 2. Metrics / Impact Score (30% weight) ---
    # Real-world resumes ideally aim for 4 to 6 strong metrics/quantified data points.
    metrics_count = analysis_data.get("metrics_count", 0)
    e_metrics = min((metrics_count / 5.0) * 100.0, 100.0)

    # --- 3. Structure Score (15% weight) ---
    structure = analysis_data.get("structure", {})
    word_count = structure.get("word_count", 0)
    
    # Goldilocks Zone for word count: 400 to 900 words gets full points
    if 400 <= word_count <= 900:
        word_score = 100.0
    elif word_count < 400:
        word_score = max((word_count / 400.0) * 100.0, 20.0)
    else:
        word_score = max(100.0 - ((word_count - 900) / 10.0), 40.0)
        
    sections_found = sum([
        structure.get("has_education", False),
        structure.get("has_experience", False),
        structure.get("has_skills", False)
    ])
    section_score = (sections_found / 3.0) * 100.0
    
    c_structure = (word_score * 0.5) + (section_score * 0.5)

    # --- 4. Formatting & Contact Score (10% weight) ---
    formatting = analysis_data.get("formatting", {})
    has_email = 1.0 if formatting.get("has_email") else 0.0
    has_phone = 1.0 if formatting.get("has_phone") else 0.0
    has_linkedin = 1.0 if formatting.get("has_linkedin") else 0.0
    
    f_formatting = ((has_email + has_phone + has_linkedin) / 3.0) * 100.0

    # --- Final Weighted Aggregation Equation ---
    total_ats_score = (
        (s_semantic * 0.45) + 
        (e_metrics * 0.30) + 
        (c_structure * 0.15) + 
        (f_formatting * 0.10)
    )

    return int(round(total_ats_score))