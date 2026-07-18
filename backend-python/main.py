from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from services.parser import extract_text_from_pdf
from services.cleaner import clean_extracted_text
from services.scorer import calculate_match_score # <-- 1. Import the scorer

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
    
    # 2. Calculate the dynamic AI score
    match_score = calculate_match_score(cleaned_resume, cleaned_jd)
    
    # 3. Return the dynamic score to React!
    return {
        "status": "success",
        "score": match_score, # <-- Replaced the hardcoded 85
        "message": "AI analysis complete!",
        "extracted_text": cleaned_resume 
    }