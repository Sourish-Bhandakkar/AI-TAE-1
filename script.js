// UI Variables
let availableSymptoms = [];
let selectedSymptomsList = [];

// DOM Elements
const inputEl = document.getElementById("symptom-input");
const dropdownEl = document.getElementById("dropdown-options");
const selectedTagsEl = document.getElementById("selected-tags");
const multiselectBox = document.getElementById("multiselect-box");

// Fetch symptoms on load
async function fetchSymptoms() {
    try {
        const response = await fetch('/api/symptoms');
        const data = await response.json();
        availableSymptoms = data.symptoms;
        renderDropdown();
    } catch (error) {
        console.error("Error fetching symptoms:", error);
    }
}

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

function getConfidenceLevel(probability) {
    if (probability >= 0.7) return "High";
    if (probability >= 0.4) return "Medium";
    return "Low";
}


// Submission and Results Rendering
document.getElementById("btn-submit").addEventListener("click", async () => {
    const errorMsg = document.getElementById("error-message");
    const resultsContainer = document.getElementById("results-container");

    if (selectedSymptomsList.length === 0) {
        // Reset message to default text
        errorMsg.innerHTML = `<span class="st-icon">❌</span><div class="st-alert-body">Please select at least one symptom to get a diagnosis prediction.</div>`;
        errorMsg.style.display = "flex";
        resultsContainer.style.display = "none";
        return;
    }

    errorMsg.style.display = "none";
    
    try {
        // Fetch diagnosis from Python backend
        const response = await fetch('/api/diagnose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: selectedSymptomsList })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const probabilities = data.probabilities;
        const treatments = data.treatments;

        resultsContainer.style.display = "block";

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
    } catch(err) {
        console.error("Diagnosis error:", err);
        errorMsg.innerHTML = `<span class="st-icon">❌</span><div class="st-alert-body">Error communicating with Python server. Is TAE.py running?</div>`;
        errorMsg.style.display = "flex";
        resultsContainer.style.display = "none";
    }
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
fetchSymptoms();
