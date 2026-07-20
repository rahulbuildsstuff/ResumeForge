from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from services.parser import extract_text_from_pdf
from services.cleaner import clean_extracted_text
from services.scorer import calculate_match_score
from services.extractor import get_key_skills # <-- 1. Import the new service

app = FastAPI()

@app.post("/internal/v1/extract-and-score")
async def analyze_resume(
    file: UploadFile = File(...),
    jobDescription: str = Form(...)
):
    # Read and Extract
    file_bytes = await file.read()
    raw_text = extract_text_from_pdf(file_bytes)
    
    if not raw_text:
        return JSONResponse(status_code=400, content={"error": "Could not extract text."})
        
    # Sanitize the Text
    cleaned_resume = clean_extracted_text(raw_text)
    cleaned_jd = clean_extracted_text(jobDescription)
    
    # Calculate Scores and Skills
    match_score = calculate_match_score(cleaned_resume, cleaned_jd)
    skills_data = get_key_skills(cleaned_resume, cleaned_jd) # <-- 2. Run the extraction
    
    # 3. Return everything to React
    return {
        "status": "success",
        "score": match_score,
        "matched_skills": skills_data["matched"],
        "missing_skills": skills_data["missing"],
        "message": "AI analysis complete!",
        "extracted_text": cleaned_resume 
    }