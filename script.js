// UI Variables
let availableSymptoms = [];
let selectedSymptomsList = [];
let diagnosisChartInstance = null;

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
    const ageVal = document.getElementById("age-input").value;
    const genderVal = document.getElementById("gender-input").value;

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
            body: JSON.stringify({ 
                symptoms: selectedSymptomsList,
                age: ageVal ? parseInt(ageVal) : 0,
                gender: genderVal || "Not Specified"
            })
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

        // 3. Setup Chart.js Graph
        const ctx = document.getElementById("diagnosisChart").getContext("2d");
        
        const labels = probabilities.map(p => p.disease);
        const dataVals = probabilities.map(p => (p.prob * 100).toFixed(1));
        const bgColors = probabilities.map(p => {
            const conf = getConfidenceLevel(p.prob);
            if (conf === "High") return "rgba(0, 204, 102, 0.6)"; // Green
            if (conf === "Medium") return "rgba(255, 170, 0, 0.6)"; // Yellow/Orange
            return "rgba(255, 75, 75, 0.6)"; // Red
        });
        const borderColors = probabilities.map(p => {
            const conf = getConfidenceLevel(p.prob);
            if (conf === "High") return "rgba(0, 204, 102, 1)";
            if (conf === "Medium") return "rgba(255, 170, 0, 1)";
            return "rgba(255, 75, 75, 1)";
        });

        const existingChart = Chart.getChart("diagnosisChart");
        if (existingChart) {
            existingChart.destroy();
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Probability (%)',
                    data: dataVals,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { 
                            color: 'rgba(255, 255, 255, 0.05)',
                            borderDash: [5, 5]
                        },
                        ticks: { color: '#bbb' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#bbb', font: { weight: '500' } }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(38, 39, 48, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '% Confidence';
                            }
                        }
                    }
                }
            }
        });
        
        // Fetch history after new diagnosis saved
        fetchHistory();
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
    document.getElementById("age-input").value = "";
    document.getElementById("gender-input").value = "";
    
    document.getElementById("error-message").style.display = "none";
    document.getElementById("results-container").style.display = "none";
});

// Initialize multiselect tags as empty
renderTags();
fetchSymptoms();
fetchHistory();

// History Fetching Logic
async function fetchHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        
        const tbody = document.getElementById("history-table-body");
        tbody.innerHTML = "";
        
        if (data.history && data.history.length > 0) {
            data.history.forEach(row => {
                const tr = document.createElement("tr");
                const dateObj = new Date(row.timestamp);
                const timeStr = dateObj.toLocaleString();
                
                tr.innerHTML = `
                    <td>${timeStr}</td>
                    <td>${row.age || "N/A"}</td>
                    <td>${row.gender || "N/A"}</td>
                    <td>${row.symptoms.join(", ")}</td>
                    <td><strong style="color: var(--primary-color)">${row.top_disease}</strong></td>
                    <td>${(row.probability * 100).toFixed(1)}%</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align: center'>No history found.</td></tr>";
        }
    } catch (err) {
        console.error("Error fetching history:", err);
    }
}

document.getElementById("btn-refresh-history").addEventListener("click", fetchHistory);
