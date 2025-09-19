// Application State
let userProfile = {};
let marketData = {};
let calculationResults = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupEventListeners();
    loadDefaultProfile();
});

function initializeData() {
    // Market data from the provided JSON
    marketData = {
        current_boc_rate: 2.5,
        cities: [
            {
                name: "Abbotsford",
                median_price_detached: 1213441,
                median_price_townhouse: 677634,
                median_price_apartment: 400000,
                price_to_income_ratio: 9.7,
                days_on_market: 61,
                market_status: "Balanced"
            },
            {
                name: "Langley",
                median_price_detached: 1393229,
                median_price_townhouse: 822340,
                median_price_apartment: 450000,
                price_to_income_ratio: 10.3,
                days_on_market: 58,
                market_status: "Competitive"
            },
            {
                name: "Surrey",
                median_price_detached: 1507321,
                median_price_townhouse: 885314,
                median_price_apartment: 500000,
                price_to_income_ratio: 12.4,
                days_on_market: 49,
                market_status: "Competitive"
            },
            {
                name: "Vancouver",
                median_price_detached: 2000000,
                median_price_townhouse: 1200000,
                median_price_apartment: 750000,
                price_to_income_ratio: 19.4,
                days_on_market: 35,
                market_status: "Seller's Market"
            },
            {
                name: "Calgary",
                median_price_detached: 650000,
                median_price_townhouse: 450000,
                median_price_apartment: 320000,
                price_to_income_ratio: 6.1,
                days_on_market: 45,
                market_status: "Balanced"
            },
            {
                name: "Toronto",
                median_price_detached: 1800000,
                median_price_townhouse: 1100000,
                median_price_apartment: 650000,
                price_to_income_ratio: 16.5,
                days_on_market: 25,
                market_status: "Seller's Market"
            }
        ]
    };

    window.seasonalPatterns = [
        {month: "January", activity_index: 3.5, price_volatility: 0.08, recommendation: "Low activity, stable prices"},
        {month: "February", activity_index: 4.2, price_volatility: 0.09, recommendation: "Good time - low volatility"},
        {month: "March", activity_index: 6.2, price_volatility: 0.15, recommendation: "Activity picking up"},
        {month: "April", activity_index: 7.8, price_volatility: 0.18, recommendation: "Peak spring market"},
        {month: "May", activity_index: 8.4, price_volatility: 0.19, recommendation: "Highest activity"},
        {month: "June", activity_index: 7.8, price_volatility: 0.20, recommendation: "Still active but competitive"},
        {month: "July", activity_index: 6.2, price_volatility: 0.16, recommendation: "Summer slowdown begins"},
        {month: "August", activity_index: 5.8, price_volatility: 0.12, recommendation: "Slower market"},
        {month: "September", activity_index: 7.2, price_volatility: 0.17, recommendation: "Fall surge"},
        {month: "October", activity_index: 6.8, price_volatility: 0.15, recommendation: "Good activity"},
        {month: "November", activity_index: 4.1, price_volatility: 0.10, recommendation: "Slowing down"},
        {month: "December", activity_index: 3.8, price_volatility: 0.11, recommendation: "Year-end quiet"}
    ];

    window.fthbPrograms = [
        {
            name: "RRSP Home Buyer's Plan",
            max_benefit: 60000,
            description: "Withdraw up to $60K from RRSP tax-free",
            eligibility: "First-time buyer with RRSP savings"
        },
        {
            name: "First-Home Savings Account",
            max_benefit: 40000,
            description: "Tax-deductible contributions, tax-free withdrawals",
            eligibility: "First-time buyer, age 18+"
        },
        {
            name: "First-Time Home Buyer Incentive",
            max_benefit: 40000,
            description: "5-10% shared equity loan from government",
            eligibility: "Household income under $120K"
        },
        {
            name: "BC Property Transfer Tax Exemption",
            max_benefit: 8000,
            description: "Full or partial exemption up to $835K home",
            eligibility: "First-time buyer in BC"
        }
    ];
}

function loadDefaultProfile() {
    // Load default values only if elements exist
    const incomeSlider = document.getElementById('annual-income');
    const savingsSlider = document.getElementById('current-savings');
    const expensesSlider = document.getElementById('monthly-expenses');
    
    if (incomeSlider) incomeSlider.value = 188000;
    if (savingsSlider) savingsSlider.value = 172000;
    if (expensesSlider) expensesSlider.value = 2400;
    
    const riskSelect = document.getElementById('risk-tolerance');
    const timelineSelect = document.getElementById('timeline');
    if (riskSelect) riskSelect.value = 'moderate';
    if (timelineSelect) timelineSelect.value = '2026';
    
    // Check default target regions
    const defaultRegions = ['Surrey', 'Langley', 'Abbotsford'];
    defaultRegions.forEach(region => {
        const checkbox = document.querySelector(`input[type="checkbox"][value="${region}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Check default property types
    const defaultPropertyTypes = ['detached', 'townhouse'];
    defaultPropertyTypes.forEach(type => {
        const checkbox = document.querySelector(`input[type="checkbox"][value="${type}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    updateSliderDisplays();
}

function setupEventListeners() {
    // Slider updates
    const incomeSlider = document.getElementById('annual-income');
    const savingsSlider = document.getElementById('current-savings');
    const expensesSlider = document.getElementById('monthly-expenses');
    const testRateSlider = document.getElementById('test-rate-slider');
    
    if (incomeSlider) incomeSlider.addEventListener('input', updateSliderDisplays);
    if (savingsSlider) savingsSlider.addEventListener('input', updateSliderDisplays);
    if (expensesSlider) expensesSlider.addEventListener('input', updateSliderDisplays);
    if (testRateSlider) testRateSlider.addEventListener('input', updateInterestRateScenarios);
    
    // Form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // Property type selector
    document.querySelectorAll('.property-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.property-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateCityComparison();
        });
    });
}

function updateSliderDisplays() {
    const incomeSlider = document.getElementById('annual-income');
    const savingsSlider = document.getElementById('current-savings');
    const expensesSlider = document.getElementById('monthly-expenses');
    
    const incomeDisplay = document.getElementById('income-display');
    const savingsDisplay = document.getElementById('savings-display');
    const expensesDisplay = document.getElementById('expenses-display');
    
    if (incomeSlider && incomeDisplay) {
        incomeDisplay.textContent = formatCurrency(incomeSlider.value);
    }
    if (savingsSlider && savingsDisplay) {
        savingsDisplay.textContent = formatCurrency(savingsSlider.value);
    }
    if (expensesSlider && expensesDisplay) {
        expensesDisplay.textContent = formatCurrency(expensesSlider.value);
    }
}

function formatCurrency(amount) {
    return Number(amount).toLocaleString('en-CA');
}

// Make this function globally available
window.startAnalysis = function() {
    showScreen('profile-screen');
}

function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Initialize screen-specific content
        if (screenId === 'market-screen') {
            setTimeout(() => updateCityComparison(), 100);
        } else if (screenId === 'timing-screen') {
            setTimeout(() => {
                createSeasonalChart();
                updateTimingRecommendations();
            }, 100);
        } else if (screenId === 'programs-screen') {
            setTimeout(() => updateFirstTimeBuyerPrograms(), 100);
        } else if (screenId === 'recommendations-screen') {
            setTimeout(() => generateFinalRecommendations(), 100);
        }
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Make showScreen globally available for HTML onclick handlers
window.showScreen = showScreen;

function handleProfileSubmit(e) {
    e.preventDefault();
    
    console.log('Profile form submitted');
    
    // Collect form data
    const incomeSlider = document.getElementById('annual-income');
    const savingsSlider = document.getElementById('current-savings');
    const expensesSlider = document.getElementById('monthly-expenses');
    const riskSelect = document.getElementById('risk-tolerance');
    const timelineSelect = document.getElementById('timeline');
    const firstTimeBuyerCheck = document.getElementById('first-time-buyer');
    
    userProfile = {
        annualIncome: incomeSlider ? parseInt(incomeSlider.value) : 188000,
        currentSavings: savingsSlider ? parseInt(savingsSlider.value) : 172000,
        monthlyExpenses: expensesSlider ? parseInt(expensesSlider.value) : 2400,
        riskTolerance: riskSelect ? riskSelect.value : 'moderate',
        timeline: timelineSelect ? timelineSelect.value : '2026',
        isFirstTimeBuyer: firstTimeBuyerCheck ? firstTimeBuyerCheck.checked : true,
        targetRegions: Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .filter(cb => ['Vancouver', 'Toronto', 'Calgary', 'Surrey', 'Langley', 'Abbotsford'].includes(cb.value))
            .map(cb => cb.value),
        propertyTypes: Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .filter(cb => ['detached', 'townhouse', 'apartment'].includes(cb.value))
            .map(cb => cb.value)
    };
    
    console.log('User profile:', userProfile);
    
    // Calculate affordability
    calculateAffordability();
    
    // Show results
    showScreen('affordability-screen');
}

function calculateAffordability() {
    const income = userProfile.annualIncome;
    const monthlyIncome = income / 12;
    const currentRate = 2.5; // Current BoC rate + spread
    const actualMortgageRate = currentRate + 2.0; // Add typical mortgage spread
    
    // Calculate maximum monthly housing payment (32% GDS rule)
    const maxHousingPayment = monthlyIncome * 0.32;
    
    // Subtract property tax and insurance estimate ($500/month)
    const maxMortgagePayment = maxHousingPayment - 500;
    
    // Calculate maximum loan amount
    const monthlyRate = actualMortgageRate / 100 / 12;
    const numPayments = 25 * 12; // 25-year amortization
    const maxLoanAmount = maxMortgagePayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
    
    // Add down payment to get max home price
    const downPaymentAmount = Math.min(userProfile.currentSavings * 0.8, userProfile.currentSavings - 10000); // Keep some emergency fund
    const maxHomePrice = maxLoanAmount + downPaymentAmount;
    
    // Calculate debt service ratios
    const gdsRatio = (maxMortgagePayment + 500) / monthlyIncome;
    const tdsRatio = (maxMortgagePayment + 500 + userProfile.monthlyExpenses) / monthlyIncome;
    
    // Qualification status
    const qualified = gdsRatio <= 0.32 && tdsRatio <= 0.40 && downPaymentAmount >= maxHomePrice * 0.05;
    
    calculationResults = {
        maxHomePrice,
        maxMortgagePayment,
        maxLoanAmount,
        downPaymentAmount,
        gdsRatio,
        tdsRatio,
        qualified,
        currentRate: actualMortgageRate
    };
    
    console.log('Calculation results:', calculationResults);
    
    updateAffordabilityDisplay();
}

function updateAffordabilityDisplay() {
    const maxHomePriceEl = document.getElementById('max-home-price');
    const piPaymentEl = document.getElementById('pi-payment');
    const totalPaymentEl = document.getElementById('total-payment');
    
    if (maxHomePriceEl) maxHomePriceEl.textContent = `$${formatCurrency(Math.round(calculationResults.maxHomePrice))}`;
    if (piPaymentEl) piPaymentEl.textContent = `$${formatCurrency(Math.round(calculationResults.maxMortgagePayment))}`;
    if (totalPaymentEl) totalPaymentEl.textContent = `$${formatCurrency(Math.round(calculationResults.maxMortgagePayment + 500))}`;
    
    // Update ratios
    const gdsPercent = Math.round(calculationResults.gdsRatio * 100);
    const tdsPercent = Math.round(calculationResults.tdsRatio * 100);
    
    const gdsRatioEl = document.getElementById('gds-ratio');
    const tdsRatioEl = document.getElementById('tds-ratio');
    
    if (gdsRatioEl) gdsRatioEl.textContent = `${gdsPercent}%`;
    if (tdsRatioEl) tdsRatioEl.textContent = `${tdsPercent}%`;
    
    // Update ratio bars
    const gdsBar = document.getElementById('gds-fill');
    const tdsBar = document.getElementById('tds-fill');
    
    if (gdsBar) {
        gdsBar.style.width = `${Math.min(gdsPercent / 32 * 100, 100)}%`;
        gdsBar.className = `ratio-fill ${gdsPercent > 32 ? 'danger' : gdsPercent > 28 ? 'warning' : ''}`;
    }
    
    if (tdsBar) {
        tdsBar.style.width = `${Math.min(tdsPercent / 40 * 100, 100)}%`;
        tdsBar.className = `ratio-fill ${tdsPercent > 40 ? 'danger' : tdsPercent > 35 ? 'warning' : ''}`;
    }
    
    // Qualification status
    const statusElement = document.getElementById('qualification-status');
    if (statusElement) {
        if (calculationResults.qualified) {
            statusElement.innerHTML = '<span class="status status--success">Qualified</span>';
        } else {
            statusElement.innerHTML = '<span class="status status--error">Not Qualified</span>';
        }
    }
    
    // Initialize interest rate scenarios
    updateInterestRateScenarios();
}

function updateInterestRateScenarios() {
    const testRateSlider = document.getElementById('test-rate-slider');
    const testRateDisplay = document.getElementById('test-rate-display');
    const resultsContainer = document.getElementById('scenario-results');
    
    if (!testRateSlider || !resultsContainer) return;
    
    const testRate = parseFloat(testRateSlider.value);
    if (testRateDisplay) testRateDisplay.textContent = `${testRate}%`;
    
    const scenarios = [2.0, 2.5, 3.0, 3.5, 4.0];
    
    resultsContainer.innerHTML = '';
    
    scenarios.forEach(rate => {
        const actualRate = rate + 2.0; // Add mortgage spread
        const monthlyRate = actualRate / 100 / 12;
        const numPayments = 25 * 12;
        const loanAmount = calculationResults.maxLoanAmount;
        
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        const scenarioElement = document.createElement('div');
        scenarioElement.className = 'scenario-item';
        scenarioElement.innerHTML = `
            <div class="scenario-rate">${rate}%</div>
            <div class="scenario-payment">$${formatCurrency(Math.round(monthlyPayment))}/mo</div>
        `;
        
        resultsContainer.appendChild(scenarioElement);
    });
}

function updateCityComparison() {
    const activePropertyBtn = document.querySelector('.property-btn.active');
    const activePropertyType = activePropertyBtn ? activePropertyBtn.dataset.type : 'detached';
    const citiesGrid = document.getElementById('cities-grid');
    
    if (!citiesGrid) return;
    
    citiesGrid.innerHTML = '';
    
    // Filter cities based on user's target regions
    const targetCities = marketData.cities.filter(city => 
        userProfile.targetRegions && userProfile.targetRegions.includes(city.name)
    );
    
    targetCities.forEach(city => {
        let price;
        switch(activePropertyType) {
            case 'detached':
                price = city.median_price_detached;
                break;
            case 'townhouse':
                price = city.median_price_townhouse;
                break;
            case 'apartment':
                price = city.median_price_apartment;
                break;
            default:
                price = city.median_price_detached;
        }
        
        const affordable = calculationResults.maxHomePrice && price <= calculationResults.maxHomePrice;
        const cityElement = document.createElement('div');
        cityElement.className = `city-card ${affordable ? 'recommended' : ''}`;
        
        let statusClass = 'balanced';
        if (city.market_status === 'Competitive') statusClass = 'competitive';
        if (city.market_status === "Seller's Market") statusClass = 'sellers';
        
        cityElement.innerHTML = `
            <div class="city-header">
                <div class="city-name">${city.name}</div>
                <div class="market-status ${statusClass}">${city.market_status}</div>
            </div>
            <div class="city-metrics">
                <div class="metric-item">
                    <span class="metric-label">Median Price</span>
                    <span class="metric-value">$${formatCurrency(price)}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Affordability</span>
                    <span class="metric-value ${affordable ? 'status--success' : 'status--error'}">
                        ${affordable ? 'Affordable' : 'Above Budget'}
                    </span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Price-to-Income</span>
                    <span class="metric-value">${city.price_to_income_ratio}x</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Days on Market</span>
                    <span class="metric-value">${city.days_on_market} days</span>
                </div>
            </div>
        `;
        
        citiesGrid.appendChild(cityElement);
    });
}

function createSeasonalChart() {
    const chartCanvas = document.getElementById('seasonal-chart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: window.seasonalPatterns.map(p => p.month.substr(0, 3)),
            datasets: [
                {
                    label: 'Market Activity',
                    data: window.seasonalPatterns.map(p => p.activity_index),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Price Volatility',
                    data: window.seasonalPatterns.map(p => p.price_volatility * 50), // Scale for visibility
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Activity Index'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Volatility (scaled)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Seasonal Market Patterns'
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function updateTimingRecommendations() {
    const recommendationsContainer = document.getElementById('month-recommendations');
    if (!recommendationsContainer) return;
    
    recommendationsContainer.innerHTML = '';
    
    // Sort months by activity index (lower is better for buyers)
    const sortedMonths = [...window.seasonalPatterns].sort((a, b) => a.activity_index - b.activity_index);
    
    sortedMonths.slice(0, 6).forEach((month, index) => {
        const monthElement = document.createElement('div');
        let cardClass = 'month-card';
        if (index < 2) cardClass += ' best';
        else if (index < 4) cardClass += ' good';
        
        monthElement.className = cardClass;
        monthElement.innerHTML = `
            <div class="month-name">${month.month}</div>
            <div class="month-score">${month.recommendation}</div>
        `;
        
        recommendationsContainer.appendChild(monthElement);
    });
}

function updateFirstTimeBuyerPrograms() {
    const programsGrid = document.getElementById('programs-grid');
    const totalBenefitsElement = document.getElementById('total-benefits');
    const optimizationTips = document.getElementById('optimization-tips');
    
    if (!programsGrid || !totalBenefitsElement || !optimizationTips) return;
    
    let totalBenefits = 0;
    programsGrid.innerHTML = '';
    
    window.fthbPrograms.forEach(program => {
        let eligible = userProfile.isFirstTimeBuyer;
        let benefit = 0;
        
        // Check specific eligibility
        if (program.name === 'First-Time Home Buyer Incentive' && userProfile.annualIncome > 120000) {
            eligible = false;
        }
        
        if (program.name === 'BC Property Transfer Tax Exemption' && 
            !userProfile.targetRegions.some(city => ['Vancouver', 'Surrey', 'Langley', 'Abbotsford'].includes(city))) {
            eligible = false;
        }
        
        if (eligible) {
            if (program.name === 'RRSP Home Buyer\'s Plan') {
                benefit = Math.min(program.max_benefit, userProfile.currentSavings * 0.6);
            } else if (program.name === 'BC Property Transfer Tax Exemption') {
                benefit = Math.min(program.max_benefit, calculationResults.maxHomePrice * 0.02);
            } else {
                benefit = program.max_benefit;
            }
            totalBenefits += benefit;
        }
        
        const programElement = document.createElement('div');
        programElement.className = `program-card ${eligible ? 'eligible' : ''}`;
        programElement.innerHTML = `
            <div class="program-header">
                <div class="program-name">${program.name}</div>
                <div class="program-benefit">${eligible ? '$' + formatCurrency(benefit) : 'N/A'}</div>
            </div>
            <div class="program-description">${program.description}</div>
            <div class="eligibility-status">
                <span class="status ${eligible ? 'status--success' : 'status--info'}">
                    ${eligible ? 'Eligible' : 'Not Eligible'}
                </span>
            </div>
        `;
        
        programsGrid.appendChild(programElement);
    });
    
    totalBenefitsElement.textContent = `$${formatCurrency(totalBenefits)}`;
    
    // Add optimization tips
    optimizationTips.innerHTML = `
        <div class="tip-item">
            <div class="tip-icon">💰</div>
            <div class="tip-content">
                <div class="tip-title">Maximize RRSP Contributions</div>
                <p class="tip-description">Consider increasing RRSP contributions now to maximize your Home Buyer's Plan benefit.</p>
            </div>
        </div>
        <div class="tip-item">
            <div class="tip-icon">📈</div>
            <div class="tip-content">
                <div class="tip-title">Open FHSA Account</div>
                <p class="tip-description">Start contributing to a First Home Savings Account for tax-deductible savings.</p>
            </div>
        </div>
        <div class="tip-item">
            <div class="tip-icon">🏠</div>
            <div class="tip-content">
                <div class="tip-title">Time Your Purchase</div>
                <p class="tip-description">Consider purchasing in Q1 or Q4 for better market conditions and lower prices.</p>
            </div>
        </div>
    `;
}

function generateFinalRecommendations() {
    const topRecommendation = document.getElementById('top-recommendation');
    const cityRecommendations = document.getElementById('city-recommendations');
    const timingRecommendation = document.getElementById('timing-recommendation');
    const riskAssessment = document.getElementById('risk-assessment');
    const actionSteps = document.getElementById('action-steps');
    
    if (!topRecommendation || !cityRecommendations || !timingRecommendation || !riskAssessment || !actionSteps) return;
    
    // Find best affordable cities
    const affordableCities = marketData.cities.filter(city => {
        if (!userProfile.targetRegions || !userProfile.targetRegions.includes(city.name)) return false;
        
        const price = userProfile.propertyTypes && userProfile.propertyTypes.includes('detached') ? city.median_price_detached :
                     userProfile.propertyTypes && userProfile.propertyTypes.includes('townhouse') ? city.median_price_townhouse :
                     city.median_price_apartment;
        
        return calculationResults.maxHomePrice && price <= calculationResults.maxHomePrice;
    }).sort((a, b) => a.price_to_income_ratio - b.price_to_income_ratio);
    
    // Top recommendation
    if (affordableCities.length > 0) {
        const topCity = affordableCities[0];
        const propertyType = userProfile.propertyTypes && userProfile.propertyTypes[0] ? userProfile.propertyTypes[0] : 'detached';
        topRecommendation.innerHTML = `
            <h4>Purchase a ${propertyType} in ${topCity.name}</h4>
            <p>Best combination of affordability (${topCity.price_to_income_ratio}x income) and market conditions (${topCity.market_status}).</p>
            <p><strong>Timeline:</strong> ${userProfile.timeline} - ${getOptimalMonth()}</p>
        `;
    } else {
        topRecommendation.innerHTML = `
            <h4>Consider expanding your search or waiting</h4>
            <p>Current budget may be tight for your target regions. Consider increasing savings or exploring additional areas.</p>
        `;
    }
    
    // City recommendations
    cityRecommendations.innerHTML = affordableCities.slice(0, 3).map((city, index) => `
        <div class="city-rec-item">
            <div>
                <strong>${index + 1}. ${city.name}</strong><br>
                <small>${city.market_status} - ${city.price_to_income_ratio}x income</small>
            </div>
            <span class="status status--success">Recommended</span>
        </div>
    `).join('');
    
    // Timing recommendation
    const bestMonths = ['February', 'March', 'November'];
    timingRecommendation.innerHTML = `
        <div class="timing-rec-item">
            <div>
                <strong>Optimal Months:</strong><br>
                <small>${bestMonths.join(', ')} - Lower competition</small>
            </div>
        </div>
        <div class="timing-rec-item">
            <div>
                <strong>Interest Rate Window:</strong><br>
                <small>Next 6-12 months while rates remain stable</small>
            </div>
        </div>
    `;
    
    // Risk assessment
    const riskLevel = userProfile.riskTolerance || 'moderate';
    const riskColor = riskLevel === 'conservative' ? 'status--success' : 
                     riskLevel === 'moderate' ? 'status--warning' : 'status--error';
    
    riskAssessment.innerHTML = `
        <div class="risk-item">
            <div>
                <strong>Risk Level:</strong><br>
                <small>Based on your profile and market conditions</small>
            </div>
            <span class="status ${riskColor}">${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}</span>
        </div>
        <div class="risk-item">
            <div>
                <strong>Market Risk:</strong><br>
                <small>Interest rate increases could affect affordability</small>
            </div>
            <span class="status status--warning">Monitor</span>
        </div>
    `;
    
    // Action steps
    const maxHomePrice = calculationResults.maxHomePrice || 0;
    const topCities = affordableCities.slice(0, 2).map(c => c.name).join(' and ') || 'your target areas';
    
    actionSteps.innerHTML = `
        <div class="action-step">
            <div class="step-number">1</div>
            <div class="step-content">
                <div class="step-title">Get Pre-Approved</div>
                <p class="step-description">Contact a mortgage broker to get pre-approved up to $${formatCurrency(Math.round(maxHomePrice))}</p>
            </div>
        </div>
        <div class="action-step">
            <div class="step-number">2</div>
            <div class="step-content">
                <div class="step-title">Optimize First-Time Buyer Benefits</div>
                <p class="step-description">Set up FHSA account and maximize RRSP contributions for Home Buyer's Plan</p>
            </div>
        </div>
        <div class="action-step">
            <div class="step-number">3</div>
            <div class="step-content">
                <div class="step-title">Start House Hunting</div>
                <p class="step-description">Focus on ${topCities} in ${getOptimalMonth()}</p>
            </div>
        </div>
        <div class="action-step">
            <div class="step-number">4</div>
            <div class="step-content">
                <div class="step-title">Monitor Market Conditions</div>
                <p class="step-description">Watch for interest rate changes and seasonal market patterns</p>
            </div>
        </div>
    `;
}

function getOptimalMonth() {
    const bestMonths = window.seasonalPatterns
        .sort((a, b) => a.activity_index - b.activity_index)
        .slice(0, 3)
        .map(m => m.month);
    
    return bestMonths[0];
}

// Make printSummary globally available
window.printSummary = function() {
    // Create a summary for printing/saving
    const summaryData = {
        profile: userProfile,
        results: calculationResults,
        recommendations: {
            maxBudget: calculationResults.maxHomePrice,
            recommendedCities: marketData.cities.filter(city => 
                userProfile.targetRegions && userProfile.targetRegions.includes(city.name)
            ).slice(0, 3),
            optimalTiming: getOptimalMonth(),
            totalBenefits: window.fthbPrograms.reduce((sum, program) => sum + program.max_benefit, 0)
        }
    };
    
    // In a real application, this would generate a PDF or printable page
    alert('Analysis summary prepared! In a real application, this would generate a downloadable PDF report.');
    console.log('Summary Data:', summaryData);
}