from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import io
import fitz  # PyMuPDF for reading hidden hyperlinks

from services.extractor import get_complete_ats_analysis
from services.scorer import calculate_total_ats_score

app = FastAPI(title="Industry-Standard ATS Engine")

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
        # 1. Parse the incoming form data
        form_data = await request.form()
        resume_upload = form_data.get("resume") or form_data.get("file") or form_data.get("pdf")
        job_description = form_data.get("jobDescription") or form_data.get("job_description")
        
        if not resume_upload or not job_description:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing data. Received keys: {list(form_data.keys())}"
            )

        # 2. Read the raw uploaded PDF file into a memory stream
        pdf_bytes = await resume_upload.read()
        
        # 3. Open with PyMuPDF to extract text AND hidden hyperlinks
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        extracted_text = ""
        extracted_urls = []
        
        for page in doc:
            # Get visible text
            extracted_text += page.get_text() + " "
            # Get hidden hyperlinks
            for link in page.get_links():
                if 'uri' in link:
                    extracted_urls.append(link['uri'].lower())
                    
        # 4. Clean the text
        cleaned_resume = extracted_text.lower().strip()
        cleaned_jd = job_description.lower().strip()
        
        if not cleaned_resume:
            raise HTTPException(status_code=400, detail="Could not extract text from the provided PDF.")
        
        # 5. Run Complete ATS Extraction Analysis (passing the URLs!)
        analysis_data = get_complete_ats_analysis(cleaned_resume, cleaned_jd, extracted_urls)
        
        # 6. Calculate final score using your exact mathematical formula
        scoring_results = calculate_total_ats_score(analysis_data)
        
        # 7. Return comprehensive results to React
        return {
            "status": "success",
            "score": scoring_results["score"],
            "suggestions": scoring_results["suggestions"], # ADD THIS LINE!
            "matched_skills": analysis_data["skills"]["matched"],
            "missing_skills": analysis_data["skills"]["missing"],
            "metrics_detected": analysis_data["metrics_count"],
            "structure_check": analysis_data["structure"],
            "formatting_check": analysis_data["formatting"],
            "message": "Industry-grade ATS analysis complete!"
        }
        
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))