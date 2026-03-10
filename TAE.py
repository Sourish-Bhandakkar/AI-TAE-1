# Medical Treatment Planner using Bayesian Reasoning

# Prior probabilities of diseases
disease_prior = {
    "Flu": 0.25,
    "Common Cold": 0.25,
    "COVID-19": 0.25,
    "Pneumonia": 0.25
}

# Probability of symptoms given diseases
symptom_likelihood = {
    "Fever": {"Flu": 0.8, "Common Cold": 0.2, "COVID-19": 0.7, "Pneumonia": 0.85},
    "Cough": {"Flu": 0.5, "Common Cold": 0.85, "COVID-19": 0.6, "Pneumonia": 0.65},
    "Fatigue": {"Flu": 0.7, "Common Cold": 0.3, "COVID-19": 0.6, "Pneumonia": 0.6},
    "Headache": {"Flu": 0.65, "Common Cold": 0.5, "COVID-19": 0.4, "Pneumonia": 0.3},
    "Loss Of Smell": {"Flu": 0.1, "Common Cold": 0.2, "COVID-19": 0.9, "Pneumonia": 0.1}
}

# Treatments
treatments = {
    "Flu": "Rest, fluids, antiviral medicine",
    "Common Cold": "Rest, hydration, cold medicine",
    "COVID-19": "Isolation and doctor consultation",
    "Pneumonia": "Antibiotics and medical treatment"
}

print("\nMedical Treatment Planner")
print("--------------------------")

print("\nAvailable Symptoms:")
for s in symptom_likelihood:
    print("-", s)

# User input
user_input = input("\nEnter symptoms separated by comma: ")
symptoms = [s.strip().title() for s in user_input.split(",")]

# Calculate probabilities
scores = {}

for disease in disease_prior:
    prob = disease_prior[disease]

    for symptom in symptoms:
        if symptom in symptom_likelihood:
            prob = prob * symptom_likelihood[symptom][disease]

    scores[disease] = prob

# Normalize probabilities
total = sum(scores.values())

for disease in scores:
    scores[disease] = scores[disease] / total

print("\nDisease Probabilities:")
for disease, value in scores.items():
    print(disease, ":", round(value, 2))

# Find best disease
predicted = max(scores, key=scores.get)

print("\nMost Probable Disease:", predicted)
print("Confidence:", round(scores[predicted]*100, 2), "%")

print("\nRecommended Treatment:")
print(treatments[predicted])