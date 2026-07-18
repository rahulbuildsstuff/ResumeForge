import re

def clean_extracted_text(text: str) -> str:
    """Sanitizes raw PDF text for optimal AI processing."""
    if not text:
        return ""
    
    # 1. Convert everything to lowercase
    text = text.lower()
    
    # 2. Replace newlines, tabs, and multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    
    # 3. Remove weird special characters (keeps letters, numbers, and basic punctuation)
    text = re.sub(r'[^a-z0-9\s.,-]', '', text)
    
    return text.strip()