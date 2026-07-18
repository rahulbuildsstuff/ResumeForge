import pdfplumber
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Reads raw memory bytes from Node.js and extracts text."""
    text = ""
    try:
        # io.BytesIO tricks pdfplumber into reading memory bytes like a physical file
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""