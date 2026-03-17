// Medical Model Data (Ported from python)

const diseasePrior = {
    "Common Cold": 0.25,
    "Flu": 0.20,
    "Allergy": 0.15,
    "COVID-19": 0.15,
    "Asthma": 0.10,
    "Pneumonia": 0.05,
    "Dengue": 0.05,
    "Tuberculosis": 0.05
};

const symptomLikelihood = {
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
};

const treatments = {
    "Common Cold": "Rest, hydration, over-the-counter cold medicine",
    "Flu": "Rest, fluids, antiviral medicine if prescribed",
    "Allergy": "Antihistamines, identify and avoid allergens",
    "COVID-19": "Isolation, rest, monitor oxygen levels, doctor consultation",
    "Asthma": "Use prescribed inhalers (bronchodilators), avoid triggers",
    "Pneumonia": "Antibiotics (if bacterial), rest, and medical treatment",
    "Dengue": "Hydration, acetaminophen for pain/fever, hospital monitoring if severe (avoid aspirin/ibuprofen)",
    "Tuberculosis": "Long-term specific antibiotics, strict medical supervision"
};

// UI Variables
const availableSymptoms = Object.keys(symptomLikelihood).sort();
let selectedSymptomsList = [];

// DOM Elements
const inputEl = document.getElementById("symptom-input");
const dropdownEl = document.getElementById("dropdown-options");
const selectedTagsEl = document.getElementById("selected-tags");
const multiselectBox = document.getElementById("multiselect-box");

// Setup Dropdown Options
function renderDropdown() {
    dropdownEl.innerHTML = "";
    
    // Filter out already selected symptoms
    const unselectedSymptoms = availableSymptoms.filter(s => !selectedSymptomsList.includes(s));
    
    // Filter by search text
    const searchText = inputEl.value.toLowerCase();
    const filteredSymptoms = unselectedSymptoms.filter(s => s.toLowerCase().includes(searchText));
    
    if (filteredSymptoms.length === 0) {
        dropdownEl.innerHTML = "<div class='st-option' style='color: #888;'>No symptoms found</div>";
        return;
    }

    filteredSymptoms.forEach(symptom => {
        const option = document.createElement("div");
        option.className = "st-option";
        option.textContent = symptom;
        option.onclick = () => {
            addSymptom(symptom);
            inputEl.value = "";
            renderDropdown();
            inputEl.focus();
        };
        dropdownEl.appendChild(option);
    });
}

function renderTags() {
    selectedTagsEl.innerHTML = "";
    selectedSymptomsList.forEach(symptom => {
        const tag = document.createElement("div");
        tag.className = "st-tag";
        tag.innerHTML = `${symptom} <span class="st-tag-close" onclick="removeSymptom('${symptom}')">&times;</span>`;
        selectedTagsEl.appendChild(tag);
    });
}

function addSymptom(symptom) {
    if (!selectedSymptomsList.includes(symptom)) {
        selectedSymptomsList.push(symptom);
        renderTags();
    }
}

function removeSymptom(symptom) {
    selectedSymptomsList = selectedSymptomsList.filter(s => s !== symptom);
    renderTags();
    renderDropdown();
}

// Event Listeners for Multiselect Dropdown
inputEl.addEventListener("focus", () => {
    dropdownEl.style.display = "block";
    renderDropdown();
});

inputEl.addEventListener("input", renderDropdown);

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!multiselectBox.contains(e.target) && !dropdownEl.contains(e.target)) {
        dropdownEl.style.display = "none";
    }
});

// Focus input when clicking anywhere in the multiselect box (except on close tags)
multiselectBox.addEventListener("click", (e) => {
    if (!e.target.classList.contains("st-tag-close")) {
        inputEl.focus();
    }
});


// Logic: Calculate Probabilities (Bayesian)
function calculateProbabilities(selectedSymptoms) {
    let scores = {};
    let total = 0;

    for (const [disease, priorProb] of Object.entries(diseasePrior)) {
        let prob = priorProb;
        
        selectedSymptoms.forEach(symptom => {
            if (symptomLikelihood[symptom]) {
                const likelihood = symptomLikelihood[symptom][disease] || 0.01;
                prob *= likelihood;
            }
        });
        
        scores[disease] = prob;
        total += prob;
    }

    if (total === 0) return [];

    let sortedArray = [];
    for (const [disease, prob] of Object.entries(scores)) {
        scores[disease] = prob / total;
        sortedArray.push({ disease: disease, prob: scores[disease] });
    }

    // Sort descending
    sortedArray.sort((a, b) => b.prob - a.prob);
    return sortedArray;
}

function getConfidenceLevel(probability) {
    if (probability >= 0.7) return "High";
    if (probability >= 0.4) return "Medium";
    return "Low";
}


// Submission and Results Rendering
document.getElementById("btn-submit").addEventListener("click", () => {
    const errorMsg = document.getElementById("error-message");
    const resultsContainer = document.getElementById("results-container");

    if (selectedSymptomsList.length === 0) {
        errorMsg.style.display = "flex";
        resultsContainer.style.display = "none";
        return;
    }

    errorMsg.style.display = "none";
    resultsContainer.style.display = "block";

    const probabilities = calculateProbabilities(selectedSymptomsList);
    const topResult = probabilities[0];
    const topDisease = topResult.disease;
    const topProbPct = (topResult.prob * 100).toFixed(1);
    const confidence = getConfidenceLevel(topResult.prob);

    // 1. Setup Primary Alert
    const primaryAlert = document.getElementById("primary-diagnosis-alert");
    const primaryAlertText = document.getElementById("primary-diagnosis-text");
    
    primaryAlert.className = "st-alert"; // reset
    if (confidence === "High") {
        primaryAlert.classList.add("st-success");
    } else if (confidence === "Medium") {
        primaryAlert.classList.add("st-warning");
    } else {
        primaryAlert.classList.add("st-error");
    }

    primaryAlertText.innerHTML = `<strong>Most Probable Disease:</strong> ${topDisease} (${topProbPct}%) — Confidence: ${confidence}`;

    // 2. Setup Top 3 Expanders
    const top3Container = document.getElementById("top-conditions-container");
    top3Container.innerHTML = "";
    
    const topCount = Math.min(3, probabilities.length);
    for (let i = 0; i < topCount; i++) {
        const item = probabilities[i];
        const confText = getConfidenceLevel(item.prob);
        const itemPct = (item.prob * 100).toFixed(1);
        
        const expander = document.createElement("div");
        expander.className = `st-expander ${i === 0 ? "open" : ""}`;
        
        expander.innerHTML = `
            <div class="st-expander-header" onclick="this.parentElement.classList.toggle('open')">
                <span>#${i+1}: ${item.disease} — ${itemPct}% (${confText} Confidence)</span>
                <span class="expander-icon">▼</span>
            </div>
            <div class="st-expander-content">
                <strong>🩺 Recommended Treatment:</strong><br>
                ${treatments[item.disease]}
            </div>
        `;
        top3Container.appendChild(expander);
    }

    // 3. Setup Progress Bars for all probabilities
    const allProbContainer = document.getElementById("all-probabilities-container");
    allProbContainer.innerHTML = "";

    probabilities.forEach(item => {
        const itemPct = (item.prob * 100).toFixed(1);
        const confText = getConfidenceLevel(item.prob);
        
        let barClass = "bar-low";
        if (confText === "High") barClass = "bar-high";
        else if (confText === "Medium") barClass = "bar-medium";

        const probRow = document.createElement("div");
        probRow.className = "st-prob-row";
        probRow.innerHTML = `
            <div class="st-prob-label">${item.disease}</div>
            <div class="st-prob-bar-container">
                <div class="st-prob-bar ${barClass}" style="width: 0%"></div>
            </div>
            <div class="st-prob-value">${itemPct}%</div>
        `;
        allProbContainer.appendChild(probRow);

        // Animate progress bar slightly after insertion
        setTimeout(() => {
            probRow.querySelector('.st-prob-bar').style.width = `${itemPct}%`;
        }, 50);
    });
});

// Reset logic
document.getElementById("btn-reset").addEventListener("click", () => {
    selectedSymptomsList = [];
    renderTags();
    inputEl.value = "";
    
    document.getElementById("error-message").style.display = "none";
    document.getElementById("results-container").style.display = "none";
});

// Initialize multiselect tags as empty
renderTags();
