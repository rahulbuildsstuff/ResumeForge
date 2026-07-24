# ResumeForge AI 🚀

ResumeForge AI is an advanced ATS resume scanner and bullet-point rewriter. This project consists of a React Vite frontend and a FastAPI Python backend.

## Prerequisites
- **Node.js** (v18+)
- **Python** (3.9+)
- A **Groq API Key** (for the AI rewriting feature)

---

## 1. Starting the Backend (Python FastAPI)

1. Open a new terminal.
2. Navigate to the backend directory:
   ```bash
   cd backend-python
   ```
3. Activate the virtual environment:
   - **Windows:**
     ```powershell
     .\venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```
4. Start the server:
   ```bash
   python -m uvicorn main:app --reload
   ```
   > The API will now be running at `http://127.0.0.1:8000`. Keep this terminal running!

---

## 2. Starting the Frontend (React Vite)

1. Open a **second, separate terminal**.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install the dependencies (if you haven't already):
   ```bash
   npm install --legacy-peer-deps
   ```
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   > The website will now be running at `http://localhost:5173`. 

---

## 3. Usage
- Open `http://localhost:5173` in your browser.
- Drop your PDF resume in the upload box.
- Paste the Job Description in the text area.
- Click **Analyze** to see your ATS score and get instant AI recommendations!
