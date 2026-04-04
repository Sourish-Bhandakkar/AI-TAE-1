from flask import Flask, request, jsonify, send_from_directory
import os
import sqlite3
import datetime

# Medical Treatment Planner using Bayesian Reasoning

# 1. Expanded Medical Model
# Prior probabilities of diseases (slightly varied, sum to 1.0)
disease_prior = {
    "Common Cold": 0.25,
    "Flu": 0.20,
    "Allergy": 0.15,
    "COVID-19": 0.15,
    "Asthma": 0.10,
    "Pneumonia": 0.05,
    "Dengue": 0.05,
    "Tuberculosis": 0.05
}

# Probability of symptoms given diseases (likelihoods)
symptom_likelihood = {
    "Fever": {"Common Cold": 0.2, "Flu": 0.8, "Allergy": 0.05, "COVID-19": 0.7, "Asthma": 0.05, "Pneumonia": 0.85, "Dengue": 0.9, "Tuberculosis": 0.7},
    "Cough": {"Common Cold": 0.85, "Flu": 0.5, "Allergy": 0.4, "COVID-19": 0.6, "Asthma": 0.8, "Pneumonia": 0.85, "Dengue": 0.1, "Tuberculosis": 0.9},
    "Fatigue": {"Common Cold": 0.3, "Flu": 0.7, "Allergy": 0.2, "COVID-19": 0.6, "Asthma": 0.4, "Pneumonia": 0.6, "Dengue": 0.8, "Tuberculosis": 0.7},
    "Headache": {"Common Cold": 0.5, "Flu": 0.65, "Allergy": 0.4, "COVID-19": 0.4, "Asthma": 0.2, "Pneumonia": 0.3, "Dengue": 0.8, "Tuberculosis": 0.2},
    "Loss Of Smell": {"Common Cold": 0.2, "Flu": 0.1, "Allergy": 0.05, "COVID-19": 0.9, "Asthma": 0.05, "Pneumonia": 0.1, "Dengue": 0.01, "Tuberculosis": 0.05},
    "Sore Throat": {"Common Cold": 0.8, "Flu": 0.6, "Allergy": 0.3, "COVID-19": 0.5, "Asthma": 0.1, "Pneumonia": 0.2, "Dengue": 0.1, "Tuberculosis": 0.2},
    "Shortness Of Breath": {"Common Cold": 0.05, "Flu": 0.1, "Allergy": 0.2, "COVID-19": 0.6, "Asthma": 0.9, "Pneumonia": 0.8, "Dengue": 0.05, "Tuberculosis": 0.6},
    "Body Pain": {"Common Cold": 0.3, "Flu": 0.8, "Allergy": 0.1, "COVID-19": 0.6, "Asthma": 0.1, "Pneumonia": 0.4, "Dengue": 0.9, "Tuberculosis": 0.3},
    "Chills": {"Common Cold": 0.1, "Flu": 0.7, "Allergy": 0.05, "COVID-19": 0.5, "Asthma": 0.05, "Pneumonia": 0.7, "Dengue": 0.6, "Tuberculosis": 0.6},
    "Nausea": {"Common Cold": 0.05, "Flu": 0.2, "Allergy": 0.05, "COVID-19": 0.2, "Asthma": 0.05, "Pneumonia": 0.2, "Dengue": 0.7, "Tuberculosis": 0.1},
    "Chest Pain": {"Common Cold": 0.05, "Flu": 0.1, "Allergy": 0.1, "COVID-19": 0.4, "Asthma": 0.5, "Pneumonia": 0.7, "Dengue": 0.1, "Tuberculosis": 0.6}
}

# Treatments
treatments = {
    "Common Cold": "Rest, hydration, over-the-counter cold medicine",
    "Flu": "Rest, fluids, antiviral medicine if prescribed",
    "Allergy": "Antihistamines, identify and avoid allergens",
    "COVID-19": "Isolation, rest, monitor oxygen levels, doctor consultation",
    "Asthma": "Use prescribed inhalers (bronchodilators), avoid triggers",
    "Pneumonia": "Antibiotics (if bacterial), rest, and medical treatment",
    "Dengue": "Hydration, acetaminophen for pain/fever, hospital monitoring if severe (avoid aspirin/ibuprofen)",
    "Tuberculosis": "Long-term specific antibiotics, strict medical supervision"
}

def calculate_probabilities(selected_symptoms):
    """
    Calculate the probability of each disease using Bayes' theorem.
    P(Disease|Symptoms) ∝ P(Disease) * product(P(Symptom|Disease))
    """
    scores = {}
    
    # Calculate unnormalized posterior probabilities
    for disease, prior_prob in disease_prior.items():
        prob = prior_prob
        
        for symptom in selected_symptoms:
            if symptom in symptom_likelihood:
                # Update probability based on likelihood of symptom given disease
                prob = prob * symptom_likelihood[symptom].get(disease, 0.01)
                
        scores[disease] = prob
        
    # Normalize probabilities so they sum to 1.0
    total = sum(scores.values())
    
    # Handle edge case where total probability is zero
    if total == 0:
        return scores
        
    for disease in scores:
        scores[disease] = scores[disease] / total
        
    return scores

app = Flask(__name__, static_url_path='', static_folder='.')

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    available_symptoms = sorted(list(symptom_likelihood.keys()))
    return jsonify({"symptoms": available_symptoms})

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    data = request.json
    selected_symptoms = data.get('symptoms', [])
    age = data.get('age', 0)
    gender = data.get('gender', 'Not Specified')
    
    scores = calculate_probabilities(selected_symptoms)
    
    # Sort diseases by probability in descending order
    sorted_diseases = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    
    # Format the response
    results = [{"disease": d, "prob": p} for d, p in sorted_diseases]
    
    return jsonify({
        "probabilities": results,
        "treatments": treatments
    })

if __name__ == "__main__":
    print("Starting Medical Treatment Planner API on http://127.0.0.1:5001")
    app.run(debug=True, port=5001)