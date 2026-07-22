from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import io
import PyPDF2

# Import the comprehensive ATS services we just built
from services.extractor import get_complete_ats_analysis
from services.scorer import calculate_total_ats_score

app = FastAPI(title="Industry-Standard ATS Engine")

# Enable CORS so your React frontend (or Node.js gateway) can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/internal/v1/extract-and-score")
async def extract_and_score(request: Request):
    try:
        # 1. Parse the incoming form data dynamically (Bypasses 422 errors!)
        form_data = await request.form()
        
        # Print the exact keys Node.js sent to your terminal for debugging
        print("Keys received from Node.js:", form_data.keys())
        
        # 2. Extract the file and text using dynamic fallback names
        resume_upload = form_data.get("resume") or form_data.get("file") or form_data.get("pdf")
        job_description = form_data.get("jobDescription") or form_data.get("job_description")
        
        if not resume_upload or not job_description:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing data. Received keys: {list(form_data.keys())}"
            )

        # 3. Read the raw uploaded PDF file into a memory stream
        pdf_bytes = await resume_upload.read()
        pdf_file = io.BytesIO(pdf_bytes)
        
        # 4. Extract the text from the PDF
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        extracted_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + " "
                
        # 5. Clean the text
        cleaned_resume = extracted_text.lower().strip()
        cleaned_jd = job_description.lower().strip()
        
        if not cleaned_resume:
            raise HTTPException(status_code=400, detail="Could not extract text from the provided PDF.")
        
        # 6. Run Complete ATS Extraction Analysis (Skills, Metrics, Structure, Formatting)
        analysis_data = get_complete_ats_analysis(cleaned_resume, cleaned_jd)
        
        # 7. Calculate final score using your exact mathematical formula (45/30/15/10)
        match_score = calculate_total_ats_score(analysis_data)
        
        # 8. Return comprehensive results to React
        return {
            "status": "success",
            "score": match_score,
            "matched_skills": analysis_data["skills"]["matched"],
            "missing_skills": analysis_data["skills"]["missing"],
            "metrics_detected": analysis_data["metrics_count"],
            "structure_check": analysis_data["structure"],
            "formatting_check": analysis_data["formatting"],
            "message": "Industry-grade ATS analysis complete!",
            "extracted_text": cleaned_resume 
        }
        
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))