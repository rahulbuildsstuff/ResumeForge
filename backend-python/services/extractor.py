import spacy
from sentence_transformers import SentenceTransformer, util
import re

print("Loading local AI models... (This might take a few seconds)")
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

TECH_ANCHOR = "programming language, web framework, database schema, api endpoint, cloud infrastructure, machine learning algorithm, deployment pipeline"
FLUFF_ANCHOR = "product managers, team collaboration, business requirements, soft skills, project management, daily meetings, work environment, applications, software, other developers, modern development tools"

tech_emb = model.encode(TECH_ANCHOR, convert_to_tensor=True)
fluff_emb = model.encode(FLUFF_ANCHOR, convert_to_tensor=True)

def is_truly_technical(text: str) -> bool:
    if not text or len(text.split()) > 3:
        return False
    word_emb = model.encode(text, convert_to_tensor=True)
    tech_score = util.cos_sim(word_emb, tech_emb).item()
    fluff_score = util.cos_sim(word_emb, fluff_emb).item()
    return (tech_score > fluff_score) and (tech_score >= 0.25)

def extract_entities(text: str) -> list:
    doc = nlp(text)
    entities = set()
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT"]:
            clean = ent.text.lower().strip()
            if is_truly_technical(clean):
                entities.add(clean)
    for chunk in doc.noun_chunks:
        clean = chunk.text.lower().strip()
        if is_truly_technical(clean):
            entities.add(clean)
    return list(entities)

def analyze_metrics(resume_text: str) -> int:
    """Counts numbers, percentages, and monetary signs to score quantifiable impact (E_metrics)."""
    # Matches patterns like '20%', '$50k', '15+', '3x'
    metrics_patterns = re.findall(r'(\d+[%$xX]|\d+\+|\$[\d,]+)', resume_text)
    return len(metrics_patterns)

def analyze_structure(resume_text: str) -> dict:
    """Evaluates word count and core section headers (C_structure)."""
    words = resume_text.split()
    word_count = len(words)
    
    has_education = bool(re.search(r'\b(education|university|college|btech|b\.tech|degree)\b', resume_text))
    has_experience = bool(re.search(r'\b(experience|projects|employment|internship)\b', resume_text))
    has_skills = bool(re.search(r'\b(skills|technologies|languages)\b', resume_text))
    
    return {
        "word_count": word_count,
        "has_education": has_education,
        "has_experience": has_experience,
        "has_skills": has_skills
    }

def analyze_formatting(resume_text: str) -> dict:
    """Checks for core parsing and contact compliance elements (F_formatting)."""
    has_email = bool(re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', resume_text))
    has_phone = bool(re.search(r'(\+\d{1,3}[- ]?)?\d{10}', resume_text) or re.search(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', resume_text))
    has_linkedin = bool(re.search(r'linkedin\.com', resume_text))
    
    return {
        "has_email": has_email,
        "has_phone": has_phone,
        "has_linkedin": has_linkedin
    }

def get_complete_ats_analysis(resume_text: str, job_description: str):
    """Gathers all parameters needed for the total ATS score formula."""
    if not resume_text or not job_description:
        return {}

    # 1. Semantic Skill Extraction
    jd_entities = extract_entities(job_description)
    resume_entities = extract_entities(resume_text)
    
    matched_skills = set()
    missing_skills = set()
    
    if jd_entities and resume_entities:
        jd_embeddings = model.encode(jd_entities, convert_to_tensor=True)
        resume_embeddings = model.encode(resume_entities, convert_to_tensor=True)
        cosine_scores = util.cos_sim(jd_embeddings, resume_embeddings)
        
        for i in range(len(jd_entities)):
            best_score = cosine_scores[i].max().item()
            if best_score >= 0.55:
                matched_skills.add(jd_entities[i])
            else:
                missing_skills.add(jd_entities[i])
    else:
        missing_skills = set(jd_entities)

    # 2. Extract Sub-metrics
    metrics_count = analyze_metrics(resume_text)
    structure_data = analyze_structure(resume_text)
    formatting_data = analyze_formatting(resume_text)

    return {
        "skills": {
            "matched": list(matched_skills),
            "missing": list(missing_skills)
        },
        "metrics_count": metrics_count,
        "structure": structure_data,
        "formatting": formatting_data
    }