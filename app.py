import torch
from sentence_transformers import SentenceTransformer, util
import pdfplumber
import re
import spacy
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os

# Load models
model = SentenceTransformer('all-MiniLM-L6-v2')
nlp = spacy.load("en_core_web_sm")

# Skill list (expandable)
SKILL_LIST = ["python", "machine learning", "node.js", "aws", "terraform", "react", "sql", "docker", "cloud", "nlp"]

# Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Extract text from PDF
def extract_text_from_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = "\n".join([page.extract_text() or "" for page in pdf.pages])
    return text

# Clean text
def clean_text(text):
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# Semantic similarity scorer
def calculate_similarity(resume_text, job_desc_text):
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    jd_embedding = model.encode(job_desc_text, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(resume_embedding, jd_embedding).item()
    return round(similarity * 100, 2)

# Skill extractor
def extract_skills(text):
    doc = nlp(text.lower())
    extracted = set()
    for token in doc:
        if token.text in SKILL_LIST:
            extracted.add(token.text)
    return list(extracted)

# Compare skills
def compare_skills(resume_skills, job_skills):
    matched = set(resume_skills).intersection(set(job_skills))
    missing = set(job_skills) - set(resume_skills)
    return list(matched), list(missing)

# Suggest bullet points
def suggest_bullet(skill):
    return f"Demonstrated experience with {skill} in professional or academic settings."

def generate_bullet_suggestions(missing_skills):
    return [suggest_bullet(skill) for skill in missing_skills]

# API endpoint
@app.route('/upload', methods=['POST'])
def upload_files():
    resume = request.files['resume']
    job = request.files['job']
    resume_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(resume.filename))
    job_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(job.filename))
    resume.save(resume_path)
    job.save(job_path)

    resume_text = clean_text(extract_text_from_pdf(resume_path))
    job_text = clean_text(extract_text_from_pdf(job_path))
    score = calculate_similarity(resume_text, job_text)

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_text)
    matched, missing = compare_skills(resume_skills, job_skills)
    suggestions = generate_bullet_suggestions(missing)

    return jsonify({
        "score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "suggestions": suggestions
    })

if __name__ == '__main__':
    app.run(debug=True)
