from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match_score(resume_text: str, job_description: str) -> int:
    """Calculates the cosine similarity between the resume and job description."""
    if not resume_text or not job_description:
        return 0
    
    # Create a list of the two documents to compare
    documents = [resume_text, job_description]
    
    # Initialize the Vectorizer (this automatically removes standard English stop-words like 'the', 'is', 'at')
    vectorizer = TfidfVectorizer(stop_words='english')
    
    try:
        # Convert the text into a mathematical matrix of token counts
        tfidf_matrix = vectorizer.fit_transform(documents)
        
        # Calculate the cosine similarity between document 0 (resume) and document 1 (job description)
        similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        
        # Extract the raw float value (e.g., 0.8532) and convert it to a percentage out of 100
        raw_score = similarity_matrix[0][0]
        final_score = int(round(raw_score * 100))
        
        return final_score
        
    except Exception as e:
        print(f"Error calculating score: {e}")
        return 0