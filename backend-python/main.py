from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from services.parser import extract_text_from_pdf
from services.cleaner import clean_extracted_text # <-- Add this import

app = FastAPI()

@app.post("/internal/v1/extract-and-score")
async def analyze_resume(
    file: UploadFile = File(...),
    jobDescription: str = Form(...)
):
    # 1. Read and Extract
    file_bytes = await file.read()
    raw_text = extract_text_from_pdf(file_bytes)
    
    if not raw_text:
        return JSONResponse(status_code=400, content={"error": "Could not extract text."})
        
    # 2. Sanitize the Text
    cleaned_resume_text = clean_extracted_text(raw_text)
    cleaned_job_description = clean_extracted_text(jobDescription)
    
    # 3. Return the cleaned text to the frontend
    return {
        "status": "success",
        "score": 85,
        "message": "Text extracted and sanitized!",
        "extracted_text": cleaned_resume_text 
    }