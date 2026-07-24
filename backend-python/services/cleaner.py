import re

def clean_extracted_text(text: str) -> str:
    """Sanitizes raw PDF text for optimal AI processing."""
    if not text:
        return ""
    
    
    text = text.lower()
    
    
    text = re.sub(r'\s+', ' ', text)
    
    
    text = re.sub(r'[^a-z0-9\s.,-]', '', text)
    
    return text.strip()