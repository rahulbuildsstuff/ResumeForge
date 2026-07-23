import os
import io
import httpx
import fitz  # PyMuPDF for extracting hidden hyperlinks
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.extractor import get_complete_ats_analysis
from services.scorer import calculate_total_ats_score

# Load environment variables (GROQ_API_KEY) from .env
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI(title="Industry-Standard ATS Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schema for the AI Rewriter request
class BulletRequest(BaseModel):
    bullet: str

# ------------------------------------------------------------------
# Route 1: Groq AI Bullet Rewriter Endpoint
# ------------------------------------------------------------------
@app.post("/internal/v1/rewrite-bullet")
async def rewrite_bullet(request: BulletRequest):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Groq API key is missing. Ensure GROQ_API_KEY is set in your .env file."
        )
    
    if not request.bullet.strip():
        raise HTTPException(status_code=400, detail="Bullet point text cannot be empty.")

    prompt = (
        f"Rewrite this resume bullet point to be highly professional, use strong action verbs, "
        f"and include realistic placeholders for quantifiable metrics (such as [X]%, $[Y], or [Z]+ users). "
        f"Return ONLY the single rewritten bullet point without conversational commentary or quotes. "
        f"Original bullet: {request.bullet}"
    )
    
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Payload for Groq's LLaMA 3.1 model
        payload = {
            "model": "llama-3.1-8b-instant", 
            "messages": [
                {"role": "system", "content": "You are an expert technical recruiter and resume writer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1024
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions", 
                json=payload, 
                headers=headers, 
                timeout=15.0
            )
            response.raise_for_status()
            
            data = response.json()
            rewritten_text = data['choices'][0]['message']['content'].strip()
            rewritten_text = rewritten_text.strip('"').strip("'")
            
        return {"status": "success", "rewritten_bullet": rewritten_text}
        
    except httpx.HTTPStatusError as exc:
        error_details = exc.response.text
        print(f"Groq API Rejected Request: {exc.response.status_code} - {error_details}")
        raise HTTPException(status_code=500, detail="Groq API rejected the request. Check your backend terminal for exact details.")
        
    except Exception as e:
        print(f"AI Rewriter Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with Groq AI service.")

# ------------------------------------------------------------------
# Route 2: Main ATS Extraction and Scoring Endpoint
# ------------------------------------------------------------------
@app.post("/internal/v1/extract-and-score")
async def extract_and_score(request: Request):
    try:
        # 1. Parse incoming multipart form data
        form_data = await request.form()
        resume_upload = form_data.get("resume") or form_data.get("file") or form_data.get("pdf")
        job_description = form_data.get("jobDescription") or form_data.get("job_description")
        
        if not resume_upload or not job_description:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields. Received form keys: {list(form_data.keys())}"
            )

        # 2. Read PDF into byte stream
        pdf_bytes = await resume_upload.read()
        
        # 3. Open document using PyMuPDF to parse visible text AND hidden hyperlinks
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        extracted_text = ""
        extracted_urls = []
        
        for page in doc:
            extracted_text += page.get_text() + " "
            for link in page.get_links():
                if 'uri' in link:
                    extracted_urls.append(link['uri'].lower())
                    
        cleaned_resume = extracted_text.lower().strip()
        cleaned_jd = job_description.lower().strip()
        
        if not cleaned_resume:
            raise HTTPException(status_code=400, detail="Could not extract readable text from PDF.")
        
        # 4. Perform NLP skill extraction & metadata analysis
        analysis_data = get_complete_ats_analysis(cleaned_resume, cleaned_jd, extracted_urls)
        
        # 5. Compute mathematical ATS score & generate actionable suggestions
        scoring_results = calculate_total_ats_score(analysis_data)
        
        # 6. Return response to React dashboard
        return {
            "status": "success",
            "score": scoring_results["score"],
            "suggestions": scoring_results["suggestions"],
            "matched_skills": analysis_data["skills"]["matched"],
            "missing_skills": analysis_data["skills"]["missing"],
            "metrics_detected": analysis_data["metrics_count"],
            "structure_check": analysis_data["structure"],
            "formatting_check": analysis_data["formatting"],
            "weak_bullets": analysis_data["weak_bullets"],
            "message": "Industry-grade ATS analysis complete!"
        }
        
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))