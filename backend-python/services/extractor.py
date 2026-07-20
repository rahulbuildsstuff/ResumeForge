import spacy
from sentence_transformers import SentenceTransformer, util

print("Loading local AI models... (This might take a few seconds)")
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# 1. Define the Opposing Vectors
TECH_ANCHOR = "programming language, web framework, database schema, api endpoint, cloud infrastructure, machine learning algorithm, deployment pipeline"
FLUFF_ANCHOR = "product managers, team collaboration, business requirements, soft skills, project management, daily meetings, work environment, applications, software, other developers, modern development tools"

tech_emb = model.encode(TECH_ANCHOR, convert_to_tensor=True)
fluff_emb = model.encode(FLUFF_ANCHOR, convert_to_tensor=True)

def is_truly_technical(text: str) -> bool:
    """Calculates if a phrase is mathematically closer to Tech than Fluff."""
    if not text or len(text.split()) > 3:
        return False
        
    word_emb = model.encode(text, convert_to_tensor=True)
    
    # Calculate distance to both anchors
    tech_score = util.cos_sim(word_emb, tech_emb).item()
    fluff_score = util.cos_sim(word_emb, fluff_emb).item()
    
    # It must be closer to the Tech Anchor AND meet a minimum similarity threshold
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

def get_key_skills(resume_text: str, job_description: str):
    if not resume_text or not job_description:
        return {"matched": [], "missing": []}
        
    # 2. Extract cleanly filtered entities
    jd_entities = extract_entities(job_description)
    resume_entities = extract_entities(resume_text)
    
    if not jd_entities or not resume_entities:
         return {"matched": jd_entities, "missing": jd_entities}

    # 3. Match the validated entities
    jd_embeddings = model.encode(jd_entities, convert_to_tensor=True)
    resume_embeddings = model.encode(resume_entities, convert_to_tensor=True)
    cosine_scores = util.cos_sim(jd_embeddings, resume_embeddings)
    
    matched_skills = set()
    missing_skills = set()
    
    for i in range(len(jd_entities)):
        best_score = cosine_scores[i].max().item()
        # 55% similarity threshold to group related concepts (e.g., Express / Express.js)
        if best_score >= 0.55:
            matched_skills.add(jd_entities[i])
        else:
            missing_skills.add(jd_entities[i])
            
    return {
        "matched": list(matched_skills),
        "missing": list(missing_skills)
    }