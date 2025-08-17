import pandas as pd
import numpy as np
from flask import Flask, render_template, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- Load and Prepare Data ---
try:
    df = pd.read_csv('cleaned.csv')
    print("Dataset loaded successfully.")
    
    df['title'] = df['title'].fillna('')
    df['channelName'] = df['channelName'].fillna('')
    df['combined_features'] = df['title'] + ' ' + df['channelName']

    tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    tfidf_matrix = tfidf_vectorizer.fit_transform(df['combined_features'])
    print("TF-IDF matrix calculated.")

except FileNotFoundError:
    print("Error: 'cleaned.csv' not found. Please ensure the file is in the same directory.")
    df = pd.DataFrame()
    tfidf_matrix = np.array([])
except Exception as e:
    print(f"An unexpected error occurred: {e}")
    df = pd.DataFrame()
    tfidf_matrix = np.array([])

# --- Keywords for Recommendations ---
RECOMMENDATION_KEYWORDS = "kids cartoons, nursery rhymes, cocomelon, peppa pig, " \
                         "children songs, educational videos for toddlers, kids learning videos, " \
                         "baby songs, cartoon for kids, abc songs for kids, numbers song for children, " \
                         "learning alphabets for kids, phonics songs, bedtime stories for children, " \
                         "animated stories for kids, kids educational shows, toddler songs, " \
                         "kids dance songs, kindergarten learning videos, preschool learning videos"

def get_keyword_recommendations(keywords, tfidf_matrix, data_frame):
    """
    Generates a list of recommended videos based on a set of keywords.
    """
    if data_frame.empty or tfidf_matrix.size == 0:
        return []
    
    keyword_vector = tfidf_vectorizer.transform([keywords])
    cosine_sim_scores = cosine_similarity(keyword_vector, tfidf_matrix).flatten()
    sorted_indices = np.argsort(cosine_sim_scores)[::-1]
    
    # Get the top 10 recommended videos
    recommended_videos_indices = sorted_indices[:10]
    recommended_videos = data_frame.iloc[recommended_videos_indices]

    recommendations_list = []
    for _, row in recommended_videos.iterrows():
        recommendations_list.append({
            'id': row['id'],
            'title': row['title'],
            'channelName': row['channelName'],
            'views': f"{row['viewCount']:,}" if 'viewCount' in row and not pd.isna(row['viewCount']) else 'N/A',
            'imageUrl': f"https://img.youtube.com/vi/{row['id']}/hqdefault.jpg"
        })

    return recommendations_list

# --- Flask Routes ---
@app.route('/')
def home():
    """Renders a simple HTML page to serve as the initial entry point."""
    return "<h1>Flask Backend is running!</h1><p>The recommendation data is available at /api/recommendations</p>"

@app.route('/api/recommendations')
def get_recommendations_api():
    """New API endpoint to serve recommendations to the React frontend."""
    if df.empty:
        return jsonify({"error": "Data could not be loaded."}), 500
    
    recommendations = get_keyword_recommendations(RECOMMENDATION_KEYWORDS, tfidf_matrix, df)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, port=3005)