import spacy
from sentence_transformers import SentenceTransformer, util
import re

print("Loading local AI models... (This might take a few seconds)")
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None
    
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
    """Counts numbers, percentages, and monetary signs to score quantifiable impact."""
    metrics_patterns = re.findall(r'(\d+[%$xX]|\d+\+|\$[\d,]+)', resume_text)
    return len(metrics_patterns)

def find_weak_bullets(resume_text: str) -> list:
    """Automatically hunts down sentences in the resume that lack performance metrics."""
    sentences = re.split(r'\n|\. ', resume_text)
    weak_bullets = []
    
    for sentence in sentences:
        s = sentence.strip()
        # Clean up common bullet markers like -, *, •
        clean_s = re.sub(r'^[-•*]\s*', '', s).strip()
        
        # Rule: Must be a descriptive sentence (> 5 words) and NOT contain digits, %, or $
        if len(clean_s.split()) > 5 and not re.search(r'[\d%\$]', clean_s):
            weak_bullets.append(clean_s)
            
        # Limit to top 3 to prevent overwhelming the user interface
        if len(weak_bullets) == 3:
            break
            
    return weak_bullets

def analyze_structure(resume_text: str) -> dict:
    """Evaluates word count and core section headers."""
    words = resume_text.split()
    word_count = len(words)
    
    has_education = bool(re.search(r'\b(education|university|college|btech|b\.tech|degree)\b', resume_text))
    has_experience = bool(re.search(r'\b(experience|employment|internship|work history)\b', resume_text))
    has_skills = bool(re.search(r'\b(skills|technologies|languages)\b', resume_text))
    has_projects = bool(re.search(r'\b(projects|academic projects|personal projects)\b', resume_text))
    
    return {
        "word_count": word_count,
        "has_education": has_education,
        "has_experience": has_experience,
        "has_skills": has_skills,
        "has_projects": has_projects
    }

def analyze_formatting(resume_text: str, extracted_urls: list) -> dict:
    """Checks for contact info and repository links in both text and hidden URLs."""
    text_has_email = bool(re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', resume_text))
    link_has_email = any('mailto:' in url for url in extracted_urls)
    has_email = text_has_email or link_has_email
    
    text_has_phone = bool(re.search(r'(\+\d{1,3}[- ]?)?\d{10}', resume_text) or re.search(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', resume_text))
    link_has_phone = any('tel:' in url for url in extracted_urls)
    has_phone = text_has_phone or link_has_phone
    
    text_has_linkedin = bool(re.search(r'linkedin\.com', resume_text))
    link_has_linkedin = any('linkedin.com' in url for url in extracted_urls)
    has_linkedin = text_has_linkedin or link_has_linkedin
    
    text_has_github = bool(re.search(r'github\.com', resume_text))
    
    # Isolate and count unique repository URLs (GitHub, GitLab, Bitbucket)
    repo_links = set([url for url in extracted_urls if 'github.com' in url or 'gitlab.com' in url])
    has_github = text_has_github or (len(repo_links) > 0)
    
    repo_link_count = len(repo_links)
    
    return {
        "has_email": has_email,
        "has_phone": has_phone,
        "has_linkedin": has_linkedin,
        "has_github": has_github,
        "repo_link_count": repo_link_count
    }

def get_complete_ats_analysis(resume_text: str, job_description: str, extracted_urls: list):
    """Gathers all parameters needed for the total ATS score formula and UI widgets."""
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

    # 2. Extract Sub-metrics & Weak Bullet Sentences
    metrics_count = analyze_metrics(resume_text)
    structure_data = analyze_structure(resume_text)
    formatting_data = analyze_formatting(resume_text, extracted_urls)
    weak_bullets = find_weak_bullets(resume_text)

    return {
        "skills": {
            "matched": list(matched_skills),
            "missing": list(missing_skills)
        },
        "metrics_count": metrics_count,
        "structure": structure_data,
        "formatting": formatting_data,
        "weak_bullets": weak_bullets
    }