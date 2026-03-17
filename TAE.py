import streamlit as st

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

def get_confidence_level(probability):
    """Return a confidence categorization based on numerical probability."""
    if probability >= 0.7:
        return "High"
    elif probability >= 0.4:
        return "Medium"
    else:
        return "Low"

def main():
    # Set page config for a modern layout
    st.set_page_config(page_title="Medical Treatment Planner", page_icon="🏥", layout="centered")
    
    # UI Header
    st.title("🏥 Medical Treatment Planner")
    st.markdown("### Powered by Bayesian Reasoning")
    st.divider()
    
    # Non-medical diagnosis warning
    st.warning("⚠️ **Warning: This is an educational AI project and NOT a medical diagnosis.** Please consult a licensed healthcare professional for medical advice.")
    
    # Initialize session state for symptoms
    if 'selected_symptoms' not in st.session_state:
        st.session_state.selected_symptoms = []

    def reset_app():
        st.session_state.selected_symptoms = []

    st.markdown("#### Patient Symptoms Input")
    available_symptoms = sorted(list(symptom_likelihood.keys()))
    
    # Multiselect widget
    symptoms_input = st.multiselect(
        "Check all symptoms that apply to the patient:",
        options=available_symptoms,
        key="selected_symptoms",
        placeholder="Choose symptoms..."
    )
    
    col1, col2 = st.columns([1, 4])
    with col1:
        submit = st.button("Submit Diagnosis", type="primary", use_container_width=True)
    with col2:
        st.button("Reset", on_click=reset_app, use_container_width=False)
        
    st.divider()
    
    # Process user input gracefully
    if submit:
        if not symptoms_input:
            st.error("❌ Please select at least one symptom to get a diagnosis prediction.")
        else:
            # Calculate and sort probabilities
            scores = calculate_probabilities(symptoms_input)
            sorted_diseases = sorted(scores.items(), key=lambda item: item[1], reverse=True)
            
            top_disease, top_prob = sorted_diseases[0]
            
            st.markdown("## 🔍 Diagnosis Results")
            
            # Highlight most probable disease with confidence level
            confidence = get_confidence_level(top_prob)
            
            if confidence == "High":
                st.success(f"**Most Probable Disease:** {top_disease} ({top_prob*100:.1f}%) — Confidence: {confidence}")
            elif confidence == "Medium":
                st.warning(f"**Most Probable Disease:** {top_disease} ({top_prob*100:.1f}%) — Confidence: {confidence}")
            else:
                st.error(f"**Most Probable Disease:** {top_disease} ({top_prob*100:.1f}%) — Confidence: {confidence}")
            
            # Show top 3 probable diseases with treatment plans
            st.markdown("### 🏆 Top 3 Probable Conditions")
            
            for i in range(min(3, len(sorted_diseases))):
                disease, prob = sorted_diseases[i]
                conf = get_confidence_level(prob)
                
                # Render as an expandable section (card)
                with st.expander(f"#{i+1}: {disease} — {prob*100:.1f}% ({conf} Confidence)", expanded=(i==0)):
                    st.markdown(f"**🩺 Recommended Treatment:**\n{treatments[disease]}")
                    
            st.markdown("### 📊 All Disease Probabilities")
            # Create a simple table or list for all probabilities (highest to lowest)
            for disease, prob in sorted_diseases:
                st.write(f"- **{disease}**: {prob*100:.1f}%")

if __name__ == "__main__":
    main()