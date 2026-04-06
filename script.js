// === API CONFIGURATION ===
const API_BASE_URL = 'http://127.0.0.1:8000';

// Fetch spike prediction from backend
async function fetchSpikePrediction(city) {
    try {
        const response = await fetch(`${API_BASE_URL}/predict/${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Spike Prediction API failed:', error);
        return null;
    }
}

// Mock JSON Data for Step 2
const mockHeroData = {
    currentAQI: 82,
    predictedAQI: 74,
    accuracyImprovement: 15,
    confidence: 94
};

// Mock Time-Series Data for Step 3 (Bias Correction)
const mockChartData = {
    '24h': {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        actual: [65, 59, 80, 81, 56, 55, 40],
        original: [70, 65, 85, 90, 60, 65, 50],
        corrected: [66, 60, 81, 80, 57, 56, 42]
    },
    '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        actual: [50, 45, 60, 70, 65, 55, 50],
        original: [55, 50, 65, 80, 75, 60, 60],
        corrected: [52, 47, 61, 72, 67, 56, 51]
    },
    '30d': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        actual: [55, 60, 50, 65],
        original: [65, 70, 60, 75],
        corrected: [57, 62, 52, 67]
    }
};

// Mock Data for Step 4 (Multi-Pollutant)
const mockPollutantData = {
    o3: { value: 32, category: 'good', trend: 'down', trendVal: '-2%', history: [28, 30, 35, 33, 31, 29, 32] },
    no2: { value: 65, category: 'moderate', trend: 'up', trendVal: '+5%', history: [40, 45, 50, 55, 62, 60, 65] },
    pm25: { value: 110, category: 'unhealthy', trend: 'up', trendVal: '+12%', history: [80, 85, 95, 105, 120, 115, 110] },
    pm10: { value: 250, category: 'hazardous', trend: 'down', trendVal: '-5%', history: [150, 200, 280, 300, 270, 260, 250] }
};

// Mock Data for Step 7 (Site Eval & History)
const mockEvalData = {
    downtown: {
        rmseO3: 4.2, rmseNO2: 6.8, mae: 3.5, r2: 0.92,
        o3: { actual: [40, 42, 45, 50, 48, 44, 40], predicted: [41, 44, 46, 48, 49, 45, 42] },
        no2: { actual: [60, 65, 70, 75, 72, 68, 62], predicted: [62, 64, 72, 74, 75, 65, 60] }
    },
    industrial: {
        rmseO3: 5.5, rmseNO2: 8.1, mae: 4.8, r2: 0.88,
        o3: { actual: [50, 55, 60, 65, 60, 55, 50], predicted: [52, 58, 62, 63, 58, 52, 48] },
        no2: { actual: [80, 85, 95, 100, 95, 85, 80], predicted: [82, 88, 92, 98, 96, 82, 78] }
    },
    suburban: {
        rmseO3: 3.1, rmseNO2: 4.5, mae: 2.5, r2: 0.95,
        o3: { actual: [30, 32, 35, 38, 35, 32, 30], predicted: [31, 33, 34, 39, 36, 31, 29] },
        no2: { actual: [40, 42, 45, 50, 48, 45, 40], predicted: [42, 44, 46, 48, 49, 44, 41] }
    }
};

const mockHistoryData = {
    '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [65, 59, 80, 81, 56, 55, 40] },
    '30d': { labels: ['W1', 'W2', 'W3', 'W4'], data: [62, 75, 68, 55] },
    '6m': { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [50, 55, 70, 65, 55, 60] }
};

// Setup Mock DB for Dynamic Search (City Data overrides default mockHeroData + badges)
const mockCityDatabase = {
    'london': {
        aqi: 45, pred: 38, imp: 22, conf: 96,
        o3: { val: 25, cat: 'good', tr: 'down' },
        no2: { val: 42, cat: 'moderate', tr: 'up' },
        pm25: { val: 18, cat: 'good', tr: 'down' },
        pm10: { val: 22, cat: 'good', tr: 'down' }
    },
    'delhi': {
        aqi: 280, pred: 310, imp: 8, conf: 88,
        o3: { val: 110, cat: 'unhealthy', tr: 'up' },
        no2: { val: 160, cat: 'unhealthy', tr: 'up' },
        pm25: { val: 280, cat: 'hazardous', tr: 'up' },
        pm10: { val: 350, cat: 'hazardous', tr: 'up' }
    },
    'new york': {
        aqi: 65, pred: 60, imp: 12, conf: 92,
        o3: { val: 35, cat: 'moderate', tr: 'up' },
        no2: { val: 45, cat: 'moderate', tr: 'up' },
        pm25: { val: 28, cat: 'good', tr: 'down' },
        pm10: { val: 35, cat: 'good', tr: 'down' }
    },
    'tokyo': {
        aqi: 55, pred: 50, imp: 18, conf: 95,
        o3: { val: 28, cat: 'good', tr: 'down' },
        no2: { val: 35, cat: 'good', tr: 'down' },
        pm25: { val: 22, cat: 'good', tr: 'down' },
        pm10: { val: 28, cat: 'good', tr: 'down' }
    }
};

// Mock Data for New Model Output Section
const mockModelData = {
    actual: [70, 75, 80, 78, 85],
    forecast: [72, 78, 82, 80, 90],
    corrected: [71, 76, 79, 77, 84]
};

// Mock Data for Multi-Target Regression Section
const mockMtrData = {
    o3: { value: 80, r2: 0.87, mae: 4.2 },
    no2: { value: 35, r2: 0.82, mae: 3.1 },
    pm25: { value: 60, r2: 0.79, mae: 5.5 },
    pm10: { value: 90, r2: 0.76, mae: 6.2 }
};

// Mock Data for Site Generalization Section
const mockSpatialData = {
    within: [
        { train: "Site A", test: "Site A", rmse: 4.5, r2: 0.88 },
        { train: "Site B", test: "Site B", rmse: 5.1, r2: 0.85 },
        { train: "Site C", test: "Site C", rmse: 4.8, r2: 0.86 },
        { train: "Site D", test: "Site D", rmse: 4.2, r2: 0.89 }
    ],
    cross: [
        { train: "Site A", test: "Site B", rmse: 6.2, r2: 0.75 },
        { train: "Site A", test: "Site C", rmse: 7.1, r2: 0.69 },
        { train: "Site A", test: "Site D", rmse: 5.8, r2: 0.80 },
        { train: "Site B", test: "Site A", rmse: 6.5, r2: 0.73 }
    ]
};

let biasChartInstance = null;
let evalChartInstance = null;
let historyChartInstance = null;
let moLineChartInstance = null;
let moBarChartInstance = null;
let spatialBarChartInstance = null;

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initHeroData();
    initModelOutputSection(); // New Section
    initMultiTargetRegression(); // New MTR Section
    initSiteGeneralization(); // New Spatial Section
    initBiasChart();
    initMultiPollutant();
    initAlertBanner();
    initFeatureChart();
    initEvalSection();
    initHistorySection();
    initSearch(); // Step 9
});

function initThemeToggle() {
    const themeBtn = document.getElementById("theme-toggle");
    let isDark = false;

    themeBtn.addEventListener("click", () => {
        isDark = !isDark;
        if (isDark) {
            themeBtn.textContent = '☀️';
            document.body.classList.add('dark-mode-active');
            updateChartsTheme(true);
        } else {
            themeBtn.textContent = '🌙';
            document.body.classList.remove('dark-mode-active');
            updateChartsTheme(false);
        }
    });
}

function updateChartsTheme(isDark) {
    const gridColor = isDark ? '#334155' : '#F1F5F9';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    Object.values(Chart.instances).forEach(chart => {
        // Update scales if they exist
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = gridColor;
                if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = textColor;
            }
            if (chart.options.scales.y) {
                if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
                if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = textColor;
            }
        }

        // Minor visual tweak for legends if we use them
        if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
            chart.options.plugins.legend.labels.color = textColor;
        }

        chart.update();
    });
}

function initHeroData() {
    // In a real app, you would fetch() this data
    const data = mockHeroData;

    // Animate numbers
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        // Retrieve the target value from the data attribute (which we could also set from mock data if dynamic)
        const target = +counter.getAttribute('data-target');

        animateValue(counter, 0, target, 1500); // 1.5s duration
    });
}

// Function to animate numbers counting up
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Easing out function for smoother stop
        const easeOutQuad = progress * (2 - progress);

        obj.innerHTML = Math.floor(easeOutQuad * (end - start) + start);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure final value is exact
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}

// === NEW: MODEL OUTPUT CONFIGURATION ===
function initModelOutputSection() {
    const lineCtx = document.getElementById('moLineChart');
    const barCtx = document.getElementById('moBarChart');
    if (!lineCtx || !barCtx) return;

    // 1. Comparison Line Chart
    moLineChartInstance = new Chart(lineCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [
                {
                    label: 'Actual',
                    data: mockModelData.actual,
                    borderColor: '#3498DB', // Blue
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Original Forecast',
                    data: mockModelData.forecast,
                    borderColor: '#E67E22', // Orange
                    borderDash: [5, 5],
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Corrected Forecast',
                    data: mockModelData.corrected,
                    borderColor: '#2ECC71', // Green
                    borderWidth: 3,
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
            },
            scales: {
                y: { grid: { color: '#F1F5F9' }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });

    // Calculate Errors for Bar Chart
    const errorBefore = mockModelData.actual.map((val, i) => Math.abs(val - mockModelData.forecast[i]));
    const errorAfter = mockModelData.actual.map((val, i) => Math.abs(val - mockModelData.corrected[i]));

    // 2. Error Bar Chart
    moBarChartInstance = new Chart(barCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [
                {
                    label: 'Error Before',
                    data: errorBefore,
                    backgroundColor: '#E74C3C', // Red
                    borderRadius: 4
                },
                {
                    label: 'Error After',
                    data: errorAfter,
                    backgroundColor: '#27AE60', // Green
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#F1F5F9' }, border: { display: false }, title: { display: true, text: 'Absolute Error' } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });
}

// === CHART.JS INITIALIZATION (STEP 3) ===
function initBiasChart() {
    const ctx = document.getElementById('biasChart').getContext('2d');

    // Default to 24h data
    const initialData = mockChartData['24h'];

    biasChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: initialData.labels,
            datasets: [
                {
                    label: 'Actual',
                    data: initialData.actual,
                    borderColor: '#3498DB', // Blue
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Original Forecast',
                    data: initialData.original,
                    borderColor: '#E67E22', // Orange
                    borderDash: [5, 5],
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'ML Corrected Forecast',
                    data: initialData.corrected,
                    borderColor: '#2ECC71', // Green
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(46, 204, 113, 0.05)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 31, 68, 0.9)',
                    titleFont: { family: "'Inter', sans-serif", size: 13 },
                    bodyFont: { family: "'Inter', sans-serif", size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#F1F5F9' },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });

    // Add event listeners for the toggle buttons
    const toggles = document.querySelectorAll('.time-toggle');
    toggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            toggles.forEach(t => t.classList.remove('active'));
            // Add active class to clicked
            e.target.classList.add('active');

            // Get range and update chart
            const range = e.target.getAttribute('data-range');
            updateBiasChart(range);
        });
    });
}

function updateBiasChart(range) {
    if (!biasChartInstance || !mockChartData[range]) return;

    const newData = mockChartData[range];

    // Update labels and dataset data
    biasChartInstance.data.labels = newData.labels;
    biasChartInstance.data.datasets[0].data = newData.actual;
    biasChartInstance.data.datasets[1].data = newData.original;
    biasChartInstance.data.datasets[2].data = newData.corrected;

    // Animate the update
    biasChartInstance.update();
}

// === MULTI-TARGET REGRESSION INITIALIZATION (NEW) ===
function initMultiTargetRegression() {
    const pollutants = ['o3', 'no2', 'pm25', 'pm10'];

    pollutants.forEach(key => {
        const data = mockMtrData[key];
        const card = document.getElementById(`mtr-card-${key}`);
        if (!card) return;

        // Initialize Sparkline
        const ctx = document.getElementById(`mtr-sparkline-${key}`).getContext('2d');

        // Determine line color relative to the badge (visually based on mock values which are mostly healthy)
        let lineColor = '#2ECC71'; // default good
        if (key === 'pm25') lineColor = '#F5B041'; // moderate
        if (key === 'pm10') lineColor = '#D35400'; // unhealthy

        // Create dummy history data ending at the current value
        const historyData = Array.from({ length: 7 }, (v, i) => {
            if (i === 6) return data.value;
            return Math.max(0, data.value + Math.floor(Math.random() * 20 - 10));
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7'],
                datasets: [{
                    data: historyData,
                    borderColor: lineColor,
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: true,
                    backgroundColor: `${lineColor}20`
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: {
                        display: false,
                        suggestedMin: Math.min(...historyData) * 0.9,
                        suggestedMax: Math.max(...historyData) * 1.1
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    });
}

// === SITE GENERALIZATION INITIALIZATION (NEW) ===
function initSiteGeneralization() {
    const tableBody = document.querySelector('#spatial-table tbody');
    const ctx = document.getElementById('spatialBarChart');
    if (!tableBody || !ctx) return;

    // Helper to render table rows
    const renderTable = (data) => {
        tableBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.train}</td>
                <td>${row.test}</td>
                <td>${row.rmse.toFixed(1)}</td>
                <td>${row.r2.toFixed(2)}</td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // Initialize Chart
    spatialBarChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'RMSE',
                data: [],
                backgroundColor: '#3498DB',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` RMSE: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#F1F5F9' },
                    border: { display: false },
                    title: { display: true, text: 'RMSE' }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });

    // Helper to update Chart
    const updateChart = (data) => {
        spatialBarChartInstance.data.labels = data.map(d => `${d.train} → ${d.test}`);
        spatialBarChartInstance.data.datasets[0].data = data.map(d => d.rmse);

        // Change color based on within vs cross
        const isCross = data[0].train !== data[0].test;
        spatialBarChartInstance.data.datasets[0].backgroundColor = isCross ? '#E67E22' : '#3498DB';

        spatialBarChartInstance.update();
    };

    // Initial Render (Within-Site)
    renderTable(mockSpatialData.within);
    updateChart(mockSpatialData.within);

    // Setup Toggles
    const toggles = document.querySelectorAll('.spatial-toggle');
    toggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggles.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            const type = e.target.getAttribute('data-type');
            renderTable(mockSpatialData[type]);
            updateChart(mockSpatialData[type]);
        });
    });
}

// === MULTI-POLLUTANT INITIALIZATION (STEP 4) ===
function initMultiPollutant() {
    const pollutants = ['o3', 'no2', 'pm25', 'pm10'];

    pollutants.forEach(key => {
        const data = mockPollutantData[key];
        const card = document.getElementById(`card-${key}`);

        if (!card) return;

        // 1. Update Value
        card.querySelector('.val').textContent = data.value;

        // 2. Setup Health Badge
        const badge = card.querySelector('.health-badge');
        badge.textContent = data.category;
        badge.classList.add(`badge-${data.category}`);

        // 3. Setup Trend Arrow
        const trendEl = card.querySelector('.trend-arrow');
        trendEl.textContent = `${data.trend === 'up' ? '↑' : '↓'} ${data.trendVal}`;
        trendEl.classList.add(`trend-${data.trend}`);

        // 4. Initialize Sparkline
        const ctx = document.getElementById(`sparkline-${key}`).getContext('2d');

        // Determine line color based on category
        let lineColor = '#94A3B8'; // default
        if (data.category === 'good') lineColor = '#2ECC71';
        if (data.category === 'moderate') lineColor = '#F5B041';
        if (data.category === 'unhealthy') lineColor = '#E67E22';
        if (data.category === 'hazardous') lineColor = '#E74C3C';

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7'], // dummy labels for sparkline
                datasets: [{
                    data: data.history,
                    borderColor: lineColor,
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: true,
                    backgroundColor: `${lineColor}20` // 20 hex is 12% opacity
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: {
                        display: false,
                        // Add some padding to top/bottom so line doesn't cut off
                        suggestedMin: Math.min(...data.history) * 0.9,
                        suggestedMax: Math.max(...data.history) * 1.1
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    });
}

// === SMART ALERT BANNER (STEP 5) ===
// Accepts optional prediction data from the Spike Prediction API + city name
// prediction shape: { prediction, confidence, level, color, message }
function initAlertBanner(predictionData, cityName) {
    const bannerContainer = document.getElementById('alert-banner');
    if (!bannerContainer) return;

    // Color map for model color names → hex
    const colorHexMap = { green: '#2ECC71', yellow: '#F5B041', orange: '#E67E22', red: '#E74C3C' };

    // Level configurations
    const levelConfig = {
        'Safe': {
            icon: '🛡️', title: 'AIR QUALITY IS OPTIMAL',
            action: 'Enjoy Outdoors', duration: 'Next 48h',
            bannerClass: 'alert-safe', hex: '#2ECC71',
            reasons: ['Low O₃ forecast levels', 'Stable NO₂ concentrations', 'Good wind dispersion patterns']
        },
        'Moderate': {
            icon: '⚡', title: 'MODERATE POLLUTION RISK',
            action: 'Limit Prolonged Outdoor Exertion', duration: 'Next 24h',
            bannerClass: 'alert-moderate', hex: '#F5B041',
            reasons: ['Slightly elevated O₃ forecast', 'Moderate NO₂ levels detected', 'Reduced wind dispersion expected']
        },
        'High Risk': {
            icon: '🔥', title: 'HIGH POLLUTION RISK DETECTED',
            action: 'Reduce Outdoor Activity', duration: 'Next 12h',
            bannerClass: 'alert-warning', hex: '#E67E22',
            reasons: ['High O₃ forecast values', 'Rising NO₂ levels in region', 'Low wind dispersion capacity']
        },
        'Severe': {
            icon: '🚨', title: 'SEVERE POLLUTION SPIKE DETECTED',
            action: 'Stay Indoors', duration: 'Immediate',
            bannerClass: 'alert-danger', hex: '#E74C3C',
            reasons: ['Critical O₃ forecast spike', 'Dangerously high NO₂ levels', 'Near-zero wind dispersion']
        }
    };

    // Determine config values
    let config, confidence, message, colorHex;

    if (predictionData) {
        const level = predictionData.level;
        confidence = predictionData.confidence;
        message = predictionData.message;
        config = levelConfig[level] || levelConfig['Safe'];
        colorHex = colorHexMap[predictionData.color] || config.hex;
    } else {
        const aqi = mockHeroData.predictedAQI;
        if (aqi > 150) {
            config = levelConfig['Severe'];
            confidence = 92;
            message = 'Predicted AQI exceeds safe thresholds. Sensitive groups should avoid outdoor exertion.';
            colorHex = '#E74C3C';
        } else {
            config = levelConfig['Safe'];
            confidence = 96;
            message = 'Current forecasts indicate clear skies and healthy air quality.';
            colorHex = '#2ECC71';
        }
    }

    const displayCity = cityName ? cityName.charAt(0).toUpperCase() + cityName.slice(1) : 'Your City';
    // The API returns spike probability (0-100). For display:
    // - If prediction=1 (spike detected), confidence = how sure about the spike
    // - If prediction=0 (safe), confidence = how sure it's safe = (100 - spike_prob)
    let displayConfidence = confidence;
    if (predictionData && predictionData.prediction === 0) {
        displayConfidence = parseFloat((100 - confidence).toFixed(2));
    }
    const confPercent = Math.min(Math.max(displayConfidence, 0), 100);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSevere = config === levelConfig['Severe'] || config === levelConfig['High Risk'];

    // SVG gauge
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (confPercent / 100) * circumference;

    // Build reasons HTML
    const reasonsHTML = config.reasons.map(r =>
        `<li><span class="reason-dot" style="background:${colorHex}"></span>${r}</li>`
    ).join('');

    const bannerHTML = `
        <!-- Status Strip -->
        <div class="ab-status-strip">
            <div class="ab-live-group">
                <span class="ab-pulse-dot ${isSevere ? 'ab-pulse-severe' : ''}" style="background:${colorHex};box-shadow:0 0 8px ${colorHex}"></span>
                <span class="ab-live-label">● LIVE AI MODEL</span>
                <span class="ab-timestamp">Updated ${timeStr}</span>
            </div>
            <div class="ab-badge-group">
                <span class="ab-system-label">AI-Powered Prediction System</span>
                <span class="ab-level-badge" style="background:${colorHex}22;color:${colorHex};border:1px solid ${colorHex}55">${config.title.includes('SEVERE') ? '🔴' : config.title.includes('HIGH') ? '🟠' : config.title.includes('MODERATE') ? '🟡' : '🟢'} ${predictionData ? predictionData.level : (mockHeroData.predictedAQI > 150 ? 'Severe' : 'Safe')}</span>
            </div>
        </div>

        <!-- Hero Row -->
        <div class="ab-hero-row">
            <!-- Left: Icon + Text -->
            <div class="ab-hero-left">
                <div class="ab-icon-ring ${isSevere ? 'ab-ring-pulse' : ''}" style="border-color:${colorHex}40;background:${colorHex}15">
                    <span class="ab-icon-emoji">${config.icon}</span>
                </div>
                <div class="ab-hero-text">
                    <h3 class="ab-title">${config.title}</h3>
                    <p class="ab-subtitle">${message}</p>
                    <span class="ab-city-tag" style="background:${colorHex}20;color:${colorHex};border:1px solid ${colorHex}40">📍 ${displayCity}</span>
                </div>
            </div>

            <!-- Right: SVG Confidence Gauge -->
            <div class="ab-gauge-wrap">
                <svg class="ab-gauge-svg" viewBox="0 0 86 86">
                    <circle class="ab-gauge-track" cx="43" cy="43" r="${radius}" />
                    <circle class="ab-gauge-fill" cx="43" cy="43" r="${radius}"
                        stroke="${colorHex}"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${circumference}"
                        data-target-offset="${dashOffset}" />
                </svg>
                <div class="ab-gauge-center">
                    <span class="ab-gauge-val">${confPercent}</span>
                    <span class="ab-gauge-pct">%</span>
                </div>
                <span class="ab-gauge-label">AI Confidence</span>
            </div>
        </div>

        <!-- Stat Cards Row -->
        <div class="ab-stats-row">
            <div class="ab-stat-card" style="--ab-accent:${colorHex}">
                <div class="ab-stat-icon">📊</div>
                <span class="ab-stat-label">Risk Level</span>
                <span class="ab-stat-value" style="color:${colorHex}">${predictionData ? predictionData.level : (mockHeroData.predictedAQI > 150 ? 'Severe' : 'Safe')}</span>
            </div>
            <div class="ab-stat-card" style="--ab-accent:${colorHex}">
                <div class="ab-stat-icon">🛡️</div>
                <span class="ab-stat-label">Recommended Action</span>
                <span class="ab-stat-value">${config.action}</span>
            </div>
            <div class="ab-stat-card" style="--ab-accent:${colorHex}">
                <div class="ab-stat-icon">⏱️</div>
                <span class="ab-stat-label">Duration</span>
                <span class="ab-stat-value">${config.duration}</span>
            </div>
            <div class="ab-stat-card" style="--ab-accent:${colorHex}">
                <div class="ab-stat-icon">🤖</div>
                <span class="ab-stat-label">AI Confidence</span>
                <span class="ab-stat-value">${confPercent}%</span>
            </div>
        </div>

        <!-- Confidence Progress Bar -->
        <div class="ab-progress-section">
            <div class="ab-progress-header">
                <span class="ab-progress-title">Model Confidence</span>
                <span class="ab-progress-pct" style="color:${colorHex}">${confPercent}%</span>
            </div>
            <div class="ab-progress-track">
                <div class="ab-progress-fill" style="background:${colorHex}" data-width="${confPercent}%"></div>
            </div>
        </div>

        <!-- Explainable AI Section -->
        <div class="ab-explain-section">
            <div class="ab-explain-header">
                <span class="ab-explain-icon">🧠</span>
                <span class="ab-explain-title">Why this alert?</span>
            </div>
            <ul class="ab-reason-list">
                ${reasonsHTML}
            </ul>
        </div>
    `;

    bannerContainer.classList.add(config.bannerClass);
    bannerContainer.innerHTML = bannerHTML;

    // Animate in
    setTimeout(() => {
        bannerContainer.classList.add('show');

        // Animate gauge fill — use setAttribute for SVG compatibility
        const gaugeFill = bannerContainer.querySelector('.ab-gauge-fill');
        if (gaugeFill) {
            const target = gaugeFill.getAttribute('data-target-offset');
            // Use requestAnimationFrame to ensure the initial offset is rendered first
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    gaugeFill.setAttribute('stroke-dashoffset', target);
                });
            });
        }

        // Animate progress bar
        const progressFill = bannerContainer.querySelector('.ab-progress-fill');
        if (progressFill) {
            requestAnimationFrame(() => {
                progressFill.style.width = progressFill.getAttribute('data-width');
            });
        }
    }, 400);
}

// === FEATURE IMPORTANCE CHART (STEP 6) ===
function initFeatureChart() {
    const ctx = document.getElementById('featureChart');
    if (!ctx) return;

    // Create gradient for bars
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 400, 0);
    gradient.addColorStop(0, '#00BFA6'); // Accent Teal
    gradient.addColorStop(1, '#0A1F44'); // Primary Blue

    new Chart(ctx, {
        type: 'bar', // Horizontal bar is specified in options via indexAxis
        data: {
            labels: [
                'Wind Speed',
                'Temperature',
                'Satellite NO₂',
                'Humidity',
                'Boundary Layer',
                'Vertical Wind'
            ],
            datasets: [{
                label: 'Contribution (%)',
                data: [35, 22, 18, 12, 8, 5],
                backgroundColor: gradient,
                borderRadius: 4,
                barThickness: 24
            }]
        },
        options: {
            indexAxis: 'y', // Makes it horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 31, 68, 0.9)',
                    titleFont: { family: "'Inter', sans-serif", size: 13 },
                    bodyFont: { family: "'Inter', sans-serif", size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return ` Contribution: ${context.parsed.x}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 40,
                    grid: { color: '#F1F5F9' },
                    border: { display: false },
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                y: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        font: { family: "'Inter', sans-serif", weight: '500' }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// === SITE PERFORMANCE EVALUATION (STEP 7) ===
function initEvalSection() {
    const siteSelect = document.getElementById('site-eval-select');
    const toggles = document.querySelectorAll('.pollutant-toggle');
    const ctx = document.getElementById('evalChart');
    if (!ctx || !siteSelect) return;

    let currentSite = siteSelect.value;
    let currentPollutant = 'o3';

    // Initialize Chart
    evalChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: getEvalChartData(currentSite, currentPollutant),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
            },
            scales: {
                y: { beginAtZero: false, grid: { color: '#F1F5F9' }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });

    // Handle Site Change
    siteSelect.addEventListener('change', (e) => {
        currentSite = e.target.value;
        updateEvalMetrics(currentSite);
        updateEvalChart(currentSite, currentPollutant);
    });

    // Handle Pollutant Toggle
    toggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggles.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentPollutant = e.target.getAttribute('data-target');
            updateEvalChart(currentSite, currentPollutant);
        });
    });
}

function updateEvalMetrics(site) {
    const data = mockEvalData[site];
    document.getElementById('eval-rmse-o3').textContent = data.rmseO3;
    document.getElementById('eval-rmse-no2').textContent = data.rmseNO2;
    document.getElementById('eval-mae').textContent = data.mae;
    document.getElementById('eval-r2').textContent = data.r2;
}

function getEvalChartData(site, pollutant) {
    const data = mockEvalData[site][pollutant];
    return {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [
            {
                label: 'Actual',
                data: data.actual,
                borderColor: '#3498DB',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Predicted',
                data: data.predicted,
                borderColor: '#E67E22',
                borderDash: [5, 5],
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };
}

function updateEvalChart(site, pollutant) {
    if (!evalChartInstance) return;
    evalChartInstance.data = getEvalChartData(site, pollutant);
    evalChartInstance.update();
}

// === HISTORICAL TRENDS (STEP 7) ===
function initHistorySection() {
    const toggles = document.querySelectorAll('.history-toggle');
    const ctx = document.getElementById('historyChart');
    if (!ctx) return;

    let currentRange = '7d';

    historyChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: getHistoryChartData(currentRange),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false, grid: { color: '#F1F5F9' }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });

    toggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggles.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentRange = e.target.getAttribute('data-range');
            updateHistoryChart(currentRange);
        });
    });
}

function getHistoryChartData(range) {
    const data = mockHistoryData[range];
    return {
        labels: data.labels,
        datasets: [{
            label: 'AQI Trend',
            data: data.data,
            borderColor: '#9B59B6', // Purple trend
            backgroundColor: 'rgba(155, 89, 182, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };
}

function updateHistoryChart(range) {
    if (!historyChartInstance) return;
    historyChartInstance.data = getHistoryChartData(range);
    historyChartInstance.update();
}

// === CITY SEARCH (STEP 9) ===
function initSearch() {
    const searchInput = document.getElementById('city-search');
    const searchBtn = document.getElementById('search-btn');

    const performSearch = async () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        const cityData = mockCityDatabase[query];

        // 1. Call the Spike Prediction API for any searched city
        const spikePrediction = await fetchSpikePrediction(query);

        if (cityData) {
            updateDashboardForCity(query, cityData, spikePrediction);
        } else {
            // Even if not in mock DB, still update the alert banner if API returned data
            if (spikePrediction) {
                const bannerContainer = document.getElementById('alert-banner');
                if (bannerContainer) {
                    bannerContainer.classList.remove('alert-danger', 'alert-safe', 'alert-moderate', 'alert-warning', 'show');
                    setTimeout(() => {
                        initAlertBanner(spikePrediction, query);
                    }, 300);
                }
            } else {
                alert(`No forecast data found for "${query}". Try London, Delhi, New York, or Tokyo.`);
            }
        }
    };

    // Click on search button
    searchBtn.addEventListener('click', performSearch);

    // Press Enter in input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function updateDashboardForCity(cityName, data, spikePrediction) {
    // 1. Update Hero Cards (Using the shared animateValue function)
    const counters = document.querySelectorAll('#hero-summary .counter');

    if (counters.length >= 4) {
        // Current AQI
        animateValue(counters[0], parseInt(counters[0].innerText) || 0, data.aqi, 1000);
        // Predicted AQI
        animateValue(counters[1], parseInt(counters[1].innerText) || 0, data.pred, 1000);
        // ML Accuracy (Mock it slightly different for effect or just use a new random diff)
        animateValue(counters[2], parseInt(counters[2].innerText) || 0, data.imp, 1000);
        // Confidence
        animateValue(counters[3], parseInt(counters[3].innerText) || 0, data.conf, 1000);
    }

    // 2. Update Multi-Pollutant Cards
    const pollutants = ['o3', 'no2', 'pm25', 'pm10'];
    pollutants.forEach(key => {
        const pData = data[key];
        const card = document.getElementById(`card-${key}`);
        if (card && pData) {
            // Value
            card.querySelector('.val').textContent = pData.val;

            // Badge
            const badge = card.querySelector('.health-badge');
            // Remove old classes
            badge.className = 'health-badge';
            badge.textContent = pData.cat;
            badge.classList.add(`badge-${pData.cat}`);

            // Trend
            const trendEl = card.querySelector('.trend-arrow');
            trendEl.className = 'trend-arrow';
            trendEl.textContent = `${pData.tr === 'up' ? '↑' : '↓'} ${Math.floor(Math.random() * 10) + 1}%`;
            trendEl.classList.add(`trend-${pData.tr}`);

            // Update Sparkline colors dynamically
            let lineColor = '#94A3B8'; // default
            if (pData.cat === 'good') lineColor = '#2ECC71';
            if (pData.cat === 'moderate') lineColor = '#F5B041';
            if (pData.cat === 'unhealthy') lineColor = '#E67E22';
            if (pData.cat === 'hazardous') lineColor = '#E74C3C';

            // Find the specific chart instance inside this canvas to update colors
            const chartId = `sparkline-${key}`;
            Object.values(Chart.instances).forEach(instance => {
                if (instance.canvas.id === chartId) {
                    instance.data.datasets[0].borderColor = lineColor;
                    instance.data.datasets[0].backgroundColor = `${lineColor}20`; // 20 hex is 12% opacity

                    // Generate new history data leading up to the current val
                    const len = instance.data.datasets[0].data.length;
                    const isUp = pData.tr === 'up';

                    const newData = Array.from({ length: len }, (v, i) => {
                        if (i === len - 1) return pData.val;
                        const diff = Math.floor(pData.val * (Math.random() * 0.3));
                        return isUp ? Math.max(0, pData.val - diff) : pData.val + diff;
                    });

                    // Shuffle points slightly for realism, except the last point
                    for (let i = 0; i < len - 2; i++) {
                        if (Math.random() > 0.5) {
                            let temp = newData[i];
                            newData[i] = newData[i + 1];
                            newData[i + 1] = temp;
                        }
                    }

                    instance.data.datasets[0].data = newData;

                    // Update Y scale so new value fits
                    instance.options.scales.y.suggestedMin = Math.min(...newData) * 0.9;
                    instance.options.scales.y.suggestedMax = Math.max(...newData) * 1.1;

                    instance.update();
                }
            });
        }
    });

    // 3. Update Risk Alert Banner using real model prediction data
    mockHeroData.predictedAQI = data.pred;

    // Reset banner classes and re-run init with API prediction data
    const bannerContainer = document.getElementById('alert-banner');
    if (bannerContainer) {
        bannerContainer.classList.remove('alert-danger', 'alert-safe', 'alert-moderate', 'alert-warning', 'show');
        // small timeout to allow CSS transition to hide it before showing new data
        setTimeout(() => {
            initAlertBanner(spikePrediction || null, cityName);
        }, 300);
    }

    // 4. Update Bias Chart and Metrics
    if (biasChartInstance) {
        const base = data.aqi;
        const len = biasChartInstance.data.labels.length;

        // Generate new data based on the city's AQI
        const newActual = Array.from({ length: len }, () => Math.max(0, base + Math.floor(Math.random() * 20 - 10)));
        const newOriginal = newActual.map(v => v + Math.floor(Math.random() * 20 + 5));
        const newCorrected = newActual.map((v, i) => i === len - 1 ? data.pred : Math.max(0, v + Math.floor(Math.random() * 10 - 5)));

        biasChartInstance.data.datasets[0].data = newActual;
        biasChartInstance.data.datasets[1].data = newOriginal;
        biasChartInstance.data.datasets[2].data = newCorrected;
        biasChartInstance.update();

        const biasMetrics = document.querySelectorAll('.bias-metrics .block-value');
        if (biasMetrics.length >= 3) {
            biasMetrics[0].innerHTML = `${newOriginal[len - 1]} <small>µg/m³</small>`;
            biasMetrics[1].className = 'block-value text-success';
            biasMetrics[1].innerHTML = `${data.pred} <small>µg/m³</small>`;
            biasMetrics[2].innerHTML = `+${data.imp}%`;
        }
    }

    // 5. Update Feature Importance Chart
    const featureChart = Object.values(Chart.instances).find(c => c.canvas.id === 'featureChart');
    if (featureChart) {
        // Generate random contributions that sum to ~100
        let remaining = 100;
        const newData = [];
        for (let i = 0; i < 5; i++) {
            const val = Math.floor(Math.random() * (remaining * 0.5)) + 5;
            newData.push(val);
            remaining -= val;
        }
        newData.push(remaining); // the 6th item

        // Sort descending to keep the chart looking nice
        newData.sort((a, b) => b - a);
        featureChart.data.datasets[0].data = newData;
        featureChart.update();

        // Update the AI Insight text
        const topFeature = featureChart.data.labels[0]; // Assuming it's sorted, index 0 is largest
        const aiInsight = document.getElementById('ai-insight-text');
        if (aiInsight) {
            aiInsight.innerHTML = `${topFeature} is currently the dominant factor influencing pollution in ${cityName}.`;
        }
    }

    // 6. Update Site Performance & Model Evaluation
    if (evalChartInstance) {
        // Randomize the RMSE/MAE metrics slightly
        const r2Element = document.getElementById('eval-r2');
        if (r2Element) {
            const newR2 = (0.85 + Math.random() * 0.1).toFixed(2);
            r2Element.textContent = newR2;
        }

        ['eval-rmse-o3', 'eval-rmse-no2', 'eval-mae'].forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) {
                const baseVal = index === 2 ? 3 : 5; // lower base for MAE
                el.textContent = (baseVal + Math.random() * 3).toFixed(1);
            }
        });

        // Update EVAL Chart lines based on the currently selected pollutant
        // Update EVAL Chart lines based on the currently selected pollutant
        const len = evalChartInstance.data.labels.length;

        // Find which pollutant is active in the Eval section
        const activePollutantBtn = document.querySelector('.pollutant-toggle.active');
        const activePollutant = activePollutantBtn ? activePollutantBtn.getAttribute('data-target') : 'o3';

        // Use the searched city's specific pollutant value as the baseline
        // Note: The UI has O3 and NO2 toggle buttons.
        const baseActual = (activePollutant === 'no2' && data.no2) ? data.no2.val : data.o3.val;

        const actData = Array.from({ length: len }, () => Math.max(0, baseActual + Math.floor(Math.random() * 15 - 7)));
        const predData = actData.map(v => Math.max(0, v + Math.floor(Math.random() * 6 - 3)));

        evalChartInstance.data.datasets[0].data = actData;
        evalChartInstance.data.datasets[1].data = predData;
        evalChartInstance.update();

        // Now override the mock Eval datasets that the user interacts with 
        // to also reflect this city's specific numbers natively, so flipping
        // between O3/NO2 also draws relative to this city's general values
        const siteSelect = document.getElementById('site-eval-select');
        const currentSite = siteSelect ? siteSelect.value : 'downtown';

        if (mockEvalData[currentSite]) {
            // Re-map O3 simulated history values relative to the city's current O3
            const newO3Act = Array.from({ length: 7 }, () => Math.max(0, data.o3.val + Math.floor(Math.random() * 15 - 7)));
            const newO3Pred = newO3Act.map(v => Math.max(0, v + Math.floor(Math.random() * 6 - 3)));

            // Re-map NO2 simulated history values relative to the city's current NO2
            const newNO2Act = Array.from({ length: 7 }, () => Math.max(0, data.no2.val + Math.floor(Math.random() * 20 - 10)));
            const newNO2Pred = newNO2Act.map(v => Math.max(0, v + Math.floor(Math.random() * 8 - 4)));

            mockEvalData[currentSite].o3.actual = newO3Act;
            mockEvalData[currentSite].o3.predicted = newO3Pred;
            mockEvalData[currentSite].no2.actual = newNO2Act;
            mockEvalData[currentSite].no2.predicted = newNO2Pred;

            // Re-render chart so if we just switched to Delhi, we immediately see
            // the NO2 numbers change if NO2 was currently toggled active
            updateEvalChart(currentSite, activePollutant);
        }
    }

    // 7. Update Historical Trends
    if (historyChartInstance) {
        const len = historyChartInstance.data.labels.length;
        const baseAQI = data.aqi;

        // Make the last point match the current AQI, and previous points fluctuate around it
        const histData = Array.from({ length: len }, (v, i) => {
            if (i === len - 1) return baseAQI;
            return Math.max(0, baseAQI + Math.floor(Math.random() * 40 - 20));
        });

        historyChartInstance.data.datasets[0].data = histData;
        historyChartInstance.update();
    }

    console.log(`Successfully loaded forecast for ${cityName.toUpperCase()}`);
}
