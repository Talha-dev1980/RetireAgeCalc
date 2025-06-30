// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - script.js is running.');

    // --- API Base URL ---
    const BASE_URL = 'http://dotdev.alwaysdata.net'; // Updated base URL

    // --- UI Element Selectors ---
    const landingPage = document.getElementById('landing-page');
    const step1Page = document.getElementById('step-1-page');
    const step2Page = document.getElementById('step-2-page');
    const step3Page = document.getElementById('step-3-page');
    const dashboardPage = document.getElementById('dashboard-page'); // Renamed from scenarioBDashboardPage
    const projectionsPage = document.getElementById('projections-page');
    const downloadReportSection = document.getElementById('download-report-section'); // The new download modal-like section

    // Get references to buttons
    const startPlanningBtn = document.getElementById('start-planning-btn');
    const nextStep1Btn = document.getElementById('next-step-1-btn');
    const backStep1Btn = document.getElementById('back-step-1-btn');
    const nextStep2Btn = document.getElementById('next-step-2-btn');
    const backStep2Btn = document.getElementById('back-step-2-btn');
    const nextStep3Btn = document.getElementById('next-step-3-btn');
    const backStep3Btn = document.getElementById('back-step-3-btn');

    // Universal Dashboard Buttons & Elements (formerly Scenario B)
    const dashboardRetirementAgeDisplayHeader = document.getElementById('dashboard-retirement-age-display-header'); // Text in header
    const dashboardHeaderMessage = document.getElementById('dashboard-header-message'); // Text below header

    const dashboardRetirementAgeCard = document.getElementById('dashboard-retirement-age-card');
    const dashboardRetirementAgeLabel = document.getElementById('dashboard-retirement-age-label');
    const dashboardRetirementAgeSubtext = document.getElementById('dashboard-retirement-age-subtext');

    const dashboardYearsToRetirementCard = document.getElementById('dashboard-years-to-retirement-card');
    const dashboardYearsToRetirementLabel = document.getElementById('dashboard-years-to-retirement-label');
    const dashboardYearsToRetirementSubtext = document.getElementById('dashboard-years-to-retirement-subtext');

    // New element for Investment Growth Rate
    const dashboardReturnRateCard = document.getElementById('dashboard-return-rate-card');
    const dashboardReturnRateLabel = document.getElementById('dashboard-return-rate-label');
    const dashboardReturnRateSubtext = document.getElementById('dashboard-return-rate-subtext');


    const dashboardMonthlyIncomeCard = document.getElementById('dashboard-monthly-income-card');
    const dashboardMonthlyIncomeLabel = document.getElementById('dashboard-monthly-income-label');
    const dashboardMonthlyIncomeSubtext = document.getElementById('dashboard-monthly-income-subtext');

    const dashboardMoneyDurationCard = document.getElementById('dashboard-money-duration-card');
    const dashboardMoneyDurationLabel = document.getElementById('dashboard-money-duration-label');
    const dashboardMoneyDurationSubtext = document.getElementById('dashboard-money-duration-subtext');

    const dashboardCorpusGrowthChartCanvas = document.getElementById('dashboard-corpus-growth-chart');
    const dashboardSummaryMessage = document.getElementById('dashboard-summary-message');
    const dashboardEncouragingMetrics = document.getElementById('dashboard-encouraging-metrics');

    const seeDetailedBreakdownBtn = document.getElementById('see-detailed-breakdown-btn'); // Unified button
    const generateReportBtnDashboard = document.getElementById('generate-report-btn-dashboard'); // Unified button
    const adjustMyPlanBtn = document.getElementById('adjust-my-plan-btn'); // Unified button (replaces start over/adjust)

    // Universal Dashboard Timeline
    const timelineCurrentAge = document.getElementById('timeline-current-age');
    const timelineRetirementAge = document.getElementById('timeline-retirement-age');
    const timelineMoneyLasts = document.getElementById('timeline-money-lasts');
    let dashboardCorpusGrowthChart; // To store Chart.js instance for the unified Dashboard

    // Projections Page Buttons & Elements
    const generateReportBtnProjections = document.getElementById('generate-report-btn-projections');
    const backProjectionsBtn = document.getElementById('back-projections-btn');
    const projectionsTableBody = document.getElementById('projections-table-body'); // Changed to id
    const projectionsChartCanvas = document.getElementById('projections-chart');
    let projectionsChart; // To store the Chart.js instance

    // Summary Card Elements on Projections Page
    const projTotalCorpus = document.getElementById('proj-total-corpus');
    const projMonthlyIncome = document.getElementById('proj-monthly-income');
    const projYearsLast = document.getElementById('proj-years-last');
    const projGrowthRate = document.getElementById('proj-growth-rate');
    const projectionsMessage = document.getElementById('projections-message'); // Message area for projections page


    // Input fields for Step 1
    const currentAgeInput = document.getElementById('current-age');
    const targetRetirementAgeInput = document.getElementById('target-retirement-age');
    const targetAgeToggle = document.getElementById('target-age-toggle');
    const step1Message = document.getElementById('step1-message');

    // Input fields for Step 2
    const lumpSumAmountInput = document.getElementById('lump-sum-amount');
    const monthlyInvestmentInput = document.getElementById('monthly-investment');
    const annualIncreaseInput = document.getElementById('annual-increase');
    const expectedReturnRateGroup = document.getElementById('expected-return-rate-group'); // New group for Scenario B input
    const expectedReturnRateInput = document.getElementById('expected-return-rate'); // Input for Scenario B
    const step2Message = document.getElementById('step2-message');


    // Input fields for Step 3
    const monthlyRetirementExpensesInput = document.getElementById('monthly-retirement-expenses');
    const majorExpenseTypeSelect = document.getElementById('major-expense-type');
    const majorExpenseAmountInput = document.getElementById('major-expense-amount');
    const majorExpenseAgeInput = document.getElementById('major-expense-age');
    const inflationRateInput = document.getElementById('inflation-rate'); // Inflation moved here
    const step3Message = document.getElementById('step3-message');

    // Download Report Section Elements
    const downloadEmailInput = document.getElementById('download-email-input');
    const confirmDownloadBtn = document.getElementById('confirm-download-btn');
    const cancelDownloadBtn = document.getElementById('cancel-download-btn');
    const downloadMessage = document.getElementById('download-message');


    // Store user inputs and calculated data
    let userData = {
        CurrentAge: 0,
        RetirementAge: 0, // Target retirement age for Scenario A
        hasTargetAge: true, // True for Scenario A, False for Scenario B
        LumpSumInvestment: 0,
        MonthlySIP: 0,
        SIPEscalationRate: 0,
        ExpectedReturnRate: 0, // Expected return rate for Scenario B
        InflationRate: 0.06, // Default to 6%
        PostRetirementMonthlyExpense: 0,
        PlannedMajorExpenses: [],
        // Calculated results from backend will be stored here
        summaryMetrics: {}, // Stores the result object from /calculate-retirement-a or -b
        projectionSummary: {}, // Stores the summary object from /generate-projections
        projectionData: [] // Stores the data array from /generate-projections
    };

    let lastGeneratedReportFileName = null; // Stores the filename for download
    let currentPage = landingPage; // Track the currently active main content page

    // --- Utility Functions ---

    /**
     * Function to show a specific page and hide others.
     * @param {HTMLElement} pageToShow - The page element to display.
     */
    const showPage = (pageToShow) => {
        console.log('showPage called, attempting to show:', pageToShow.id);

        // If the download section is being shown, it's an overlay. Don't hide the current page.
        if (pageToShow === downloadReportSection) {
            downloadReportSection.classList.remove('d-none');
            return;
        }

        // Hide all main page sections
        const allMainPages = [
            landingPage, step1Page, step2Page, step3Page,
            dashboardPage, projectionsPage
        ];
        allMainPages.forEach(page => page.classList.add('d-none'));

        // Always hide the download section when switching main pages
        downloadReportSection.classList.add('d-none');

        // Show the desired main page
        pageToShow.classList.remove('d-none');
        currentPage = pageToShow; // Update the current page tracker
        console.log('Page visibility updated for:', pageToShow.id);

        // Hide all messages when switching pages
        hideMessage(step1Message);
        hideMessage(step2Message);
        hideMessage(step3Message);
        hideMessage(downloadMessage);
        if (projectionsMessage) hideMessage(projectionsMessage);


        // Conditional UI updates / API calls after showing page
        if (pageToShow.id === 'dashboard-page') { // Universal Dashboard
            handleDashboardDisplay();
        } else if (pageToShow.id === 'projections-page') {
            fetchDetailedProjections();
        } else if (pageToShow.id === 'step-2-page') { // Special handling for Step 2
            toggleExpectedReturnRateInput();
        }
        // When showing Step 3, ensure inflation rate is pre-filled from userData if available
        if (pageToShow.id === 'step-3-page') {
             inflationRateInput.value = (userData.InflationRate * 100) || 6.0;
        }
    };

    /**
     * Formats a number as Indian Rupee currency.
     * @param {number} amount - The numeric amount to format.
     * @returns {string} The formatted currency string.
     */
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) return '₹ N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    /**
     * Displays a message on the UI.
     * @param {HTMLElement} element - The HTML element to display the message in.
     * @param {string} message - The message text.
     * @param {string} type - 'info', 'success', or 'error' for styling.
     */
    const showMessage = (element, message, type = 'info') => {
        if (!element) {
            console.error('showMessage: Target element is null or undefined.');
            return;
        }
        element.textContent = message;
        element.classList.remove('d-none', 'alert-info', 'alert-success', 'alert-danger'); // Clear previous types
        element.classList.add('alert', 'mt-3', 'd-block'); // Add common alert classes
        if (type === 'error') {
            element.classList.add('alert-danger');
        } else if (type === 'success') {
            element.classList.add('alert-success');
        } else {
            element.classList.add('alert-info');
        }
        console.log(`Message shown on ${element.id || 'unknown element'}: ${message} (${type})`);
    };

    /**
     * Hides a displayed message.
     * @param {HTMLElement} element - The HTML element containing the message.
     */
    const hideMessage = (element) => {
        if (!element) {
            console.warn('hideMessage: Target element is null or undefined, cannot hide.');
            return;
        }
        element.classList.add('d-none');
        element.textContent = '';
    };

    /**
     * Validates form inputs.
     * @param {HTMLElement} inputElement - The input element to validate.
     * @param {function} validationFn - A function that returns true if valid, false otherwise.
     * @returns {boolean} - True if valid, false otherwise.
     */
    const validateInput = (inputElement, validationFn) => {
        if (validationFn(inputElement.value)) {
            inputElement.classList.remove('is-invalid');
            return true;
        } else {
            inputElement.classList.add('is-invalid');
            return false;
        }
    };

    /**
     * Helper to show/hide the Expected Return Rate input on Step 2 based on target age toggle.
     */
    const toggleExpectedReturnRateInput = () => {
        if (userData.hasTargetAge) {
            expectedReturnRateGroup.style.display = 'none';
            expectedReturnRateInput.removeAttribute('required');
            expectedReturnRateInput.classList.remove('is-invalid'); // Clear validation
        } else {
            expectedReturnRateGroup.style.display = 'block';
            expectedReturnRateInput.setAttribute('required', 'required');
            // Populate with user data or default if coming from a different scenario
            expectedReturnRateInput.value = userData.ExpectedReturnRate || 7.0;
        }
    };

    // --- Core API Integration Functions ---

    /**
     * Handles API calls for both Scenario A and B calculations and updates UI for the unified dashboard.
     */
    const handleDashboardDisplay = async () => {
        // Decide which API to call and how to interpret results based on hasTargetAge
        const apiEndpoint = userData.hasTargetAge ? '/api/calculate-retirement-a' : '/api/calculate-retirement-b';
        let inputs = {};

        if (userData.hasTargetAge) {
            inputs = {
                CurrentAge: userData.CurrentAge,
                RetirementAge: userData.RetirementAge,
                MonthlySIP: userData.MonthlySIP,
                SIPEscalationRate: userData.SIPEscalationRate,
                LumpSumInvestment: userData.LumpSumInvestment,
                InflationRate: userData.InflationRate,
                PostRetirementMonthlyExpense: userData.PostRetirementMonthlyExpense,
                PlannedMajorExpenses: userData.PlannedMajorExpenses
            };
        } else {
            inputs = {
                CurrentAge: userData.CurrentAge,
                MonthlySIP: userData.MonthlySIP,
                SIPEscalationRate: userData.SIPEscalationRate,
                LumpSumInvestment: userData.LumpSumInvestment,
                ExpectedReturnRate: userData.ExpectedReturnRate,
                InflationRate: userData.InflationRate,
                PostRetirementMonthlyExpense: userData.PostRetirementMonthlyExpense,
                PlannedMajorExpenses: userData.PlannedMajorExpenses
            };
        }

        // Check if summaryMetrics already contains valid data for the current scenario
        const isDataStale = !userData.summaryMetrics ||
                           (userData.hasTargetAge && userData.summaryMetrics.retirementAge !== userData.RetirementAge) ||
                           (!userData.hasTargetAge && userData.summaryMetrics.calculatedRetirementAge === undefined); // Check for existence of calculatedRetirementAge for Scenario B

        if (!isDataStale) {
            // Data is fresh for current scenario, just display it
            console.log(`Dashboard: Displaying existing data for ${userData.hasTargetAge ? 'Scenario A' : 'Scenario B'}.`);
            updateDashboardUI(userData.summaryMetrics);
            hideMessage(dashboardSummaryMessage);
            return;
        }

        // If data is not fresh, make API call
        console.log(`Initiating API call to ${BASE_URL}${apiEndpoint} due to missing/stale data...`);
        showMessage(dashboardSummaryMessage, 'Calculating your plan... Please wait.', 'info');

        try {
            const response = await fetch(`${BASE_URL}${apiEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputs)
            });
            const result = await response.json();

            if (response.ok && result.status === "success") {
                const data = result.data;
                userData.summaryMetrics = data; // Store calculation results
                updateDashboardUI(data);
                hideMessage(dashboardSummaryMessage);
            } else {
                const errorMessage = result.message || 'Something went wrong.';
                showMessage(dashboardSummaryMessage, `Error: ${errorMessage}`, 'error');
                console.error('API Error:', result);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showMessage(dashboardSummaryMessage, 'Network error or server unreachable. Please check your connection.', 'error');
        }
    };

    /**
     * Updates the unified dashboard UI elements based on the calculated data.
     * @param {object} data - The data object received from the API.
     */
    const updateDashboardUI = (data) => {
        if (userData.hasTargetAge) {
            // Scenario A specific display
            dashboardRetirementAgeDisplayHeader.textContent = data.retirementAge;
            dashboardHeaderMessage.textContent = `To achieve your retirement at age ${data.retirementAge}, here's what you need.`;

            // Card 1: Target Retirement Age
            dashboardRetirementAgeCard.textContent = data.retirementAge;
            dashboardRetirementAgeLabel.textContent = "Target Retirement Age";
            dashboardRetirementAgeSubtext.textContent = "Your chosen target";

            // Card 2: Years to Retirement (calculated based on current and target)
            dashboardYearsToRetirementCard.textContent = `${data.retirementAge - userData.CurrentAge} Years`;
            dashboardYearsToRetirementLabel.textContent = "Years to Retirement";
            dashboardYearsToRetirementSubtext.textContent = "From today until your target";

            // Card 3: Required Annual Return
            dashboardReturnRateCard.textContent = `${data.calculatedExpectedReturnRate.toFixed(1)}%`;
            dashboardReturnRateLabel.textContent = "Required Annual Return";
            dashboardReturnRateSubtext.textContent = data.riskStatus;
            dashboardReturnRateSubtext.className = `small text-muted ${data.riskStatus.includes('High Risk') || data.riskStatus.includes('Not Achievable') ? 'text-danger' : 'text-success'}`;


            // Card 4: Total Retirement Corpus (this was Monthly Income in Scenario B originally)
            dashboardMonthlyIncomeCard.textContent = formatCurrency(data.totalRetirementCorpus);
            dashboardMonthlyIncomeLabel.textContent = "Total Retirement Corpus";
            dashboardMonthlyIncomeSubtext.textContent = `At age ${data.retirementAge}`;

            // Card 5: Years Money Will Last
            dashboardMoneyDurationCard.textContent = data.yearsMoneyWillLast === 0 ? 'N/A' : `${data.yearsMoneyWillLast} Years`;
            dashboardMoneyDurationLabel.textContent = "Years Money Will Last";
            // FIX: Changed !data.isAchievability to !data.isAchievable
            dashboardMoneyDurationSubtext.textContent = `Until age ${data.moneyWillLastUntilAge}. ${data.isAchievable ? 'Your plan is on track.' : 'Requires adjustment.'}`;
            if (!data.isAchievable) { // Corrected property name
                 dashboardMoneyDurationSubtext.classList.add('text-danger');
                 dashboardPage.querySelector('.fa-trophy')?.classList.replace('fa-trophy', 'fa-exclamation-triangle').classList.remove('text-success').classList.add('text-danger'); // Change icon and color
                 dashboardPage.querySelector('.bg-success-light')?.classList.replace('bg-success-light', 'bg-danger-light');
                 dashboardPage.querySelector('.text-success')?.classList.replace('text-success', 'text-danger');
                 dashboardEncouragingMetrics.classList.add('d-none'); // Hide encouraging metrics if not achievable
            } else {
                 dashboardMoneyDurationSubtext.classList.remove('text-danger');
                 dashboardPage.querySelector('.fa-exclamation-triangle')?.classList.replace('fa-exclamation-triangle', 'fa-trophy').classList.remove('text-danger').classList.add('text-success');
                 dashboardPage.querySelector('.bg-danger-light')?.classList.replace('bg-danger-light', 'bg-success-light');
                 dashboardPage.querySelector('.text-danger')?.classList.replace('text-danger', 'text-success');
                 dashboardEncouragingMetrics.classList.remove('d-none'); // Show encouraging metrics
            }

            timelineCurrentAge.textContent = userData.CurrentAge;
            timelineRetirementAge.textContent = data.retirementAge;
            timelineMoneyLasts.textContent = data.moneyWillLastUntilAge;

            renderDashboardChart(data.retirementAge, data.moneyWillLastUntilAge, data.calculatedExpectedReturnRate);

        } else {
            // Scenario B specific display (original logic)
            dashboardRetirementAgeDisplayHeader.textContent = data.calculatedRetirementAge;
            dashboardHeaderMessage.textContent = "Based on your investment plan, here's when financial freedom awaits";

            // Card 1: Your retirement age
            dashboardRetirementAgeCard.textContent = data.calculatedRetirementAge;
            dashboardRetirementAgeLabel.textContent = "Your retirement age";
            dashboardRetirementAgeSubtext.textContent = "Based on your investment capacity";

            // Card 2: Time until retirement
            dashboardYearsToRetirementCard.textContent = `${data.yearsToRetirement} Years`;
            dashboardYearsToRetirementLabel.textContent = "Time until retirement";
            dashboardYearsToRetirementSubtext.textContent = "From today";

            // Card 3: Expected Annual Return Rate
            dashboardReturnRateCard.textContent = `${userData.ExpectedReturnRate.toFixed(1)}%`;
            dashboardReturnRateLabel.textContent = "Expected Annual Return";
            dashboardReturnRateSubtext.textContent = "Your assumed investment growth";

            // Card 4: Monthly income in retirement
            dashboardMonthlyIncomeCard.textContent = formatCurrency(data.monthlyIncomeInRetirement);
            dashboardMonthlyIncomeLabel.textContent = "Monthly income in retirement";
            dashboardMonthlyIncomeSubtext.textContent = "Inflation-adjusted purchasing power";

            // Card 5: Your money will last until age
            dashboardMoneyDurationCard.textContent = data.yearsMoneyWillLast === 0 ? 'N/A' : `${data.yearsMoneyWillLast} Years`;
            dashboardMoneyDurationLabel.textContent = "Your money will last until age";
            dashboardMoneyDurationSubtext.textContent = `Covering all planned expenses (until age ${data.moneyWillLastUntilAge})`;
            // Ensure icons/colors are reset for B if they were changed by A previously
            dashboardPage.querySelector('.fa-exclamation-triangle')?.classList.replace('fa-exclamation-triangle', 'fa-trophy').classList.remove('text-danger').classList.add('text-success');
            dashboardPage.querySelector('.bg-danger-light')?.classList.replace('bg-danger-light', 'bg-success-light');
            dashboardPage.querySelector('.text-danger')?.classList.replace('text-danger', 'text-success');
            dashboardEncouragingMetrics.classList.remove('d-none'); // Show encouraging metrics

            timelineCurrentAge.textContent = userData.CurrentAge;
            timelineRetirementAge.textContent = data.calculatedRetirementAge;
            timelineMoneyLasts.textContent = data.moneyWillLastUntilAge;

            renderDashboardChart(data.calculatedRetirementAge, data.moneyWillLastUntilAge, userData.ExpectedReturnRate);
        }
        dashboardSummaryMessage.textContent = data.summaryMessage;
    };


    /**
     * Renders the Chart.js line chart for corpus growth and depletion for the unified Dashboard.
     * @param {number} retirementAge - The retirement age (target or calculated).
     * @param {number} moneyLastsUntilAge - The age until money is projected to last.
     * @param {number} effectiveReturnRatePercent - The return rate to use for plotting (either calculated for A, or expected for B).
     */
    const renderDashboardChart = (retirementAge, moneyLastsUntilAge, effectiveReturnRatePercent) => {
        if (dashboardCorpusGrowthChart) {
            dashboardCorpusGrowthChart.destroy(); // Destroy previous chart instance if exists
        }

        const currentAge = userData.CurrentAge;
        const lumpSum = userData.LumpSumInvestment;
        const monthlyInvestment = userData.MonthlySIP;
        const annualIncreaseRate = userData.SIPEscalationRate / 100;
        const effectiveReturnRate = effectiveReturnRatePercent / 100; // Convert to decimal
        const monthlyRetirementExpenses = userData.PostRetirementMonthlyExpense;
        const majorExpenseAge = userData.PlannedMajorExpenses.length > 0 ? userData.PlannedMajorExpenses[0].age : 0;
        const majorExpenseAmount = userData.PlannedMajorExpenses.length > 0 ? userData.PlannedMajorExpenses[0].amount : 0;
        const inflationRate = userData.InflationRate;
        const postRetirementGrowthRate = 0.03; // Fixed for now, can be made dynamic

        let chartData = [];
        let currentCorpus = lumpSum;
        let effectiveMonthlyInvestment = monthlyInvestment;

        // Determine the maximum age for the chart to show depletion
        const maxChartAge = Math.max(moneyLastsUntilAge + 5, retirementAge + 10, 100);

        // Generate data points for the chart
        for (let age = currentAge; age <= maxChartAge; age++) {
            let expensesThisYear = 0;
            if (age === majorExpenseAge && majorExpenseAmount > 0) {
                expensesThisYear = majorExpenseAmount;
            }

            if (age > currentAge) {
                if (age <= retirementAge) {
                    // Pre-retirement growth
                    currentCorpus = currentCorpus * (1 + effectiveReturnRate) + (effectiveMonthlyInvestment * 12);
                    effectiveMonthlyInvestment *= (1 + annualIncreaseRate);
                } else {
                    // Post-retirement depletion
                    const inflationAdjustedMonthlyExpenses = monthlyRetirementExpenses * Math.pow(1 + inflationRate, age - retirementAge);
                    currentCorpus -= inflationAdjustedMonthlyExpenses * 12;
                    currentCorpus *= (1 + postRetirementGrowthRate);
                }
            }
            // Apply major expense after calculations for the year
            currentCorpus -= expensesThisYear;

            chartData.push({
                age: age,
                corpus: Math.max(0, currentCorpus) // Ensure corpus doesn't go below 0 on chart
            });

            if (currentCorpus <= 0 && age > retirementAge) {
                // If corpus depletes significantly after retirement, stop plotting to avoid long tail of zeros
                if (age - moneyLastsUntilAge > 5) break; // Plot a few years beyond depletion age
            }
        }

        const labels = chartData.map(d => d.age);
        const corpusValues = chartData.map(d => d.corpus);

        const ctx = dashboardCorpusGrowthChartCanvas.getContext('2d');
        dashboardCorpusGrowthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Corpus Balance',
                        data: corpusValues,
                        borderColor: 'rgba(255, 123, 91, 1)', // Primary color
                        backgroundColor: 'rgba(255, 123, 91, 0.2)',
                        fill: true,
                        tension: 0.4, // Smooth curves
                        pointRadius: 2,
                        pointBackgroundColor: 'rgba(255, 123, 91, 1)',
                        pointBorderColor: 'rgba(255, 123, 91, 1)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Let parent container control size
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    annotation: { // Vertical line at retirement age - requires chartjs-plugin-annotation
                        annotations: [
                            {
                                type: 'line',
                                mode: 'vertical',
                                scaleID: 'x',
                                value: retirementAge, // Use the actual retirement age for the line
                                borderColor: 'green',
                                borderWidth: 2,
                                label: {
                                    content: 'Retirement Age',
                                    enabled: true,
                                    position: 'top',
                                    backgroundColor: 'rgba(40, 167, 69, 0.8)', // Success green
                                    color: '#fff',
                                    font: { size: 10 }
                                }
                            }
                        ]
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Age'
                        },
                        grid: {
                            display: false
                        },
                        // Allowing Chart.js to automatically manage ticks for better alignment
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index, values) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2
                    }
                }
            }
        });
    };

    /**
     * Fetches detailed projections from the backend and updates the UI.
     */
    const fetchDetailedProjections = async () => {
        showMessage(projectionsMessage, 'Loading detailed projections... This may take a moment.', 'info');
        projectionsTableBody.innerHTML = ''; // Clear existing rows
        projTotalCorpus.textContent = '--';
        projMonthlyIncome.textContent = '--';
        projYearsLast.textContent = '--';
        projGrowthRate.textContent = '--';

        // Prepare inputs for /api/generate-projections based on which scenario was run
        const inputsForProjections = {
            CurrentAge: userData.CurrentAge,
            LumpSumInvestment: userData.LumpSumInvestment,
            MonthlySIP: userData.MonthlySIP,
            SIPEscalationRate: userData.SIPEscalationRate,
            InflationRate: userData.InflationRate,
            PostRetirementMonthlyExpense: userData.PostRetirementMonthlyExpense,
            PlannedMajorExpenses: userData.PlannedMajorExpenses,
        };

        if (userData.hasTargetAge) {
            inputsForProjections.RetirementAge = userData.RetirementAge;
            inputsForProjections.CalculatedExpectedReturnRate = userData.summaryMetrics.calculatedExpectedReturnRate;
        } else {
            inputsForProjections.CalculatedRetirementAgeB = userData.summaryMetrics.calculatedRetirementAge;
            inputsForProjections.ExpectedReturnRate = userData.ExpectedReturnRate;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/generate-projections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputsForProjections)
            });
            const result = await response.json();

            if (response.ok && result.status === "success") {
                userData.projectionData = result.data; // Store projection data
                userData.projectionSummary = result.summary; // Store projection summary

                // Populate summary cards
                projTotalCorpus.textContent = formatCurrency(userData.projectionSummary.totalCorpusAtRetirement);
                projMonthlyIncome.textContent = formatCurrency(userData.projectionSummary.monthlyIncome);
                projYearsLast.textContent = `${userData.projectionSummary.yearsMoneyWillLast} years (until age ${userData.projectionSummary.moneyWillLastUntilAge})`;
                projGrowthRate.textContent = `${userData.projectionSummary.investmentGrowthRateAssumption.toFixed(1)}%`;

                renderProjectionsTable();
                renderProjectionsChart();
                hideMessage(projectionsMessage); // Hide loading message
            } else {
                const errorMessage = result.message || 'Something went wrong.';
                showMessage(projectionsMessage, `Error: ${errorMessage}`, 'error');
                console.error('API Error:', result);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showMessage(projectionsMessage, 'Network error or server unreachable. Please check your connection.', 'error');
        }
    };

    /**
     * Renders the projections table using generated data.
     */
    const renderProjectionsTable = () => {
        projectionsTableBody.innerHTML = ''; // Clear existing rows

        const retirementAge = userData.hasTargetAge ? userData.RetirementAge : userData.summaryMetrics.calculatedRetirementAge;
        const majorExpenseAge = userData.PlannedMajorExpenses.length > 0 ? userData.PlannedMajorExpenses[0].age : 0;

        userData.projectionData.forEach(row => {
            const tr = document.createElement('tr');

            // Add highlight classes
            if (row.age === retirementAge) {
                tr.classList.add('row-retirement-age');
            } else if (row.age === majorExpenseAge && row.expenses > 0) {
                tr.classList.add('row-major-expense');
            }

            // Determine balance color
            let balanceClass = '';
            if (row.remainingBalance <= 0) {
                balanceClass = 'balance-depleted';
            } else if (row.remainingBalance < userData.PostRetirementMonthlyExpense * 12 * 5 && row.age >= retirementAge) { // Less than 5 years of expenses left post-retirement
                balanceClass = 'balance-caution';
            } else {
                balanceClass = 'balance-healthy';
            }


            tr.innerHTML = `
                <td>${row.age}</td>
                <td>${formatCurrency(row.corpus)}</td>
                <td>${row.expenses > 0 ? formatCurrency(row.expenses) : '-'}</td>
                <td class="${balanceClass}">${formatCurrency(row.remainingBalance)}</td>
                <td>${row.notes}</td>
            `;
            projectionsTableBody.appendChild(tr);
        });
    };

    /**
     * Renders the Chart.js line chart for corpus growth and depletion on the projections page.
     */
    const renderProjectionsChart = () => {
        if (projectionsChart) {
            projectionsChart.destroy(); // Destroy previous chart instance if exists
        }

        const labels = userData.projectionData.map(d => d.age);
        const corpusData = userData.projectionData.map(d => d.remainingBalance); // Chart the actual remaining balance

        const ctx = projectionsChartCanvas.getContext('2d');
        projectionsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Corpus & Balance',
                        data: corpusData,
                        borderColor: 'rgba(255, 123, 91, 1)', // Primary color
                        backgroundColor: 'rgba(255, 123, 91, 0.2)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointBackgroundColor: 'rgba(255, 123, 91, 1)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Let parent container control size
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    annotation: { // Optional: Add annotation for retirement age if plugin is included
                        annotations: [
                            {
                                type: 'line',
                                mode: 'vertical',
                                scaleID: 'x',
                                value: userData.hasTargetAge ? userData.RetirementAge : userData.summaryMetrics.calculatedRetirementAge,
                                borderColor: 'green',
                                borderWidth: 2,
                                label: {
                                    content: 'Retirement Age',
                                    enabled: true,
                                    position: 'top',
                                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                                    color: '#fff',
                                    font: { size: 10 }
                                }
                            }
                        ]
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Age'
                        },
                        grid: {
                            display: false
                        },
                        // Allowing Chart.js to automatically manage ticks for better alignment
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index, values) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2
                    }
                }
            }
        });
    };


    /**
     * Resets all form fields, user data, and chart instances.
     */
    const startOver = () => {
        // Reset form fields
        currentAgeInput.value = '';
        targetRetirementAgeInput.value = '';
        targetAgeToggle.checked = true; // Reset toggle to default
        targetRetirementAgeInput.disabled = false; // Enable input
        lumpSumAmountInput.value = '';
        monthlyInvestmentInput.value = '';
        annualIncreaseInput.value = '';
        expectedReturnRateInput.value = ''; // Clear B scenario input
        expectedReturnRateGroup.style.display = 'none'; // Hide it
        monthlyRetirementExpensesInput.value = '';
        majorExpenseTypeSelect.value = '';
        majorExpenseAmountInput.value = '';
        majorExpenseAgeInput.value = '';
        majorExpenseAmountInput.disabled = true; // Disable
        majorExpenseAgeInput.disabled = true; // Disable
        inflationRateInput.value = 6; // Reset to default

        // Clear user data object
        userData = {
            CurrentAge: 0,
            RetirementAge: 0,
            hasTargetAge: true,
            LumpSumInvestment: 0,
            MonthlySIP: 0,
            SIPEscalationRate: 0,
            ExpectedReturnRate: 0,
            InflationRate: 0.06,
            PostRetirementMonthlyExpense: 0,
            PlannedMajorExpenses: [],
            summaryMetrics: {},
            projectionSummary: {},
            projectionData: []
        };
        lastGeneratedReportFileName = null;

        // Remove any validation classes
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // Destroy charts if they exist
        if (projectionsChart) {
            projectionsChart.destroy();
            projectionsChart = null;
        }
        if (dashboardCorpusGrowthChart) { // Updated chart reference
            dashboardCorpusGrowthChart.destroy();
            dashboardCorpusGrowthChart = null;
        }

        // Hide download section
        downloadReportSection.classList.add('d-none');
    };


    // --- Event Listeners ---

    // Landing Page -> Step 1
    startPlanningBtn.addEventListener('click', () => {
        startOver(); // Reset everything when starting a new plan
        showPage(step1Page);
    });

    // Step 1 -> Step 2
    nextStep1Btn.addEventListener('click', () => {
        const currentAge = parseInt(currentAgeInput.value);
        let targetAge = parseInt(targetRetirementAgeInput.value);
        const hasTargetAge = targetAgeToggle.checked;

        // Validation for Step 1
        let isValid = true;
        isValid = validateInput(currentAgeInput, val => !isNaN(parseInt(val)) && parseInt(val) > 0);

        if (hasTargetAge) {
            isValid = validateInput(targetRetirementAgeInput, val => !isNaN(parseInt(val)) && parseInt(val) > currentAge) && isValid;
        } else {
            // If no target age, ensure the input is not marked invalid from previous attempts
            targetRetirementAgeInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            showMessage(step1Message, 'Please correct the highlighted fields.', 'error');
            return;
        }
        hideMessage(step1Message);


        userData.CurrentAge = currentAge;
        userData.hasTargetAge = hasTargetAge;
        userData.RetirementAge = hasTargetAge ? targetAge : 0; // Store 0 if no target age

        showPage(step2Page);
    });

    // Step 1 Back button -> Landing Page
    backStep1Btn.addEventListener('click', () => {
        showPage(landingPage);
    });

    // Toggle for target retirement age (Step 1)
    targetAgeToggle.addEventListener('change', () => {
        targetRetirementAgeInput.disabled = !targetAgeToggle.checked;
        if (!targetAgeToggle.checked) {
            targetRetirementAgeInput.value = '';
            targetRetirementAgeInput.classList.remove('is-invalid');
        }
        // This also affects the visibility of Expected Return Rate on Step 2
        toggleExpectedReturnRateInput();
    });

    // Step 2 -> Step 3
    nextStep2Btn.addEventListener('click', () => {
        console.log('Next (Step 2) button clicked, attempting to navigate to Step 3.');

        const lumpSum = parseFloat(lumpSumAmountInput.value);
        const monthlyInvestment = parseFloat(monthlyInvestmentInput.value);
        const annualIncrease = parseFloat(annualIncreaseInput.value);
        const expectedReturnRate = parseFloat(expectedReturnRateInput.value); // Only read if visible

        // Validation for Step 2
        let isValid = true;
        isValid = validateInput(lumpSumAmountInput, val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0) && isValid;
        isValid = validateInput(monthlyInvestmentInput, val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0) && isValid;
        isValid = validateInput(annualIncreaseInput, val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100) && isValid;

        if (!userData.hasTargetAge) { // If Scenario B, expected return rate is required
            isValid = validateInput(expectedReturnRateInput, val => !isNaN(parseFloat(val)) && parseFloat(val) > 0) && isValid;
        }

        if (!isValid) {
            showMessage(step2Message, 'Please correct the highlighted fields.', 'error');
            return;
        }
        hideMessage(step2Message);

        userData.LumpSumInvestment = lumpSum;
        userData.MonthlySIP = monthlyInvestment;
        userData.SIPEscalationRate = annualIncrease;
        if (!userData.hasTargetAge) {
            userData.ExpectedReturnRate = expectedReturnRate;
        } else {
            userData.ExpectedReturnRate = 0; // Reset if not applicable
        }

        showPage(step3Page);
    });

    // Step 2 Back button -> Step 1 Page
    backStep2Btn.addEventListener('click', () => {
        showPage(step1Page);
    });

    // Major Expense Type selection (Step 3) to enable/disable amount/age inputs
    majorExpenseTypeSelect.addEventListener('change', () => {
        const isMajorExpenseSelected = majorExpenseTypeSelect.value !== '';
        majorExpenseAmountInput.disabled = !isMajorExpenseSelected;
        majorExpenseAgeInput.disabled = !isMajorExpenseSelected;
        // Clear validation and remove 'required' if unselected
        if (!isMajorExpenseSelected) {
            majorExpenseAmountInput.value = '';
            majorExpenseAgeInput.value = '';
            majorExpenseAmountInput.classList.remove('is-invalid');
            majorExpenseAgeInput.classList.remove('is-invalid');
            majorExpenseAmountInput.removeAttribute('required'); // Explicitly remove required
            majorExpenseAgeInput.removeAttribute('required');   // Explicitly remove required
        } else {
            // Add 'required' if selected and inputs are empty, otherwise validation will handle it
            if (!majorExpenseAmountInput.value) majorExpenseAmountInput.setAttribute('required', 'required');
            if (!majorExpenseAgeInput.value) majorExpenseAgeInput.setAttribute('required', 'required');
        }
    });

    // Step 3 -> Universal Dashboard Page
    nextStep3Btn.addEventListener('click', async () => { // Made async for API call
        console.log('Next (Step 3) button clicked, attempting to calculate and navigate to Results.');

        const monthlyExpenses = parseFloat(monthlyRetirementExpensesInput.value);
        const majorExpenseAmount = parseFloat(majorExpenseAmountInput.value);
        const majorExpenseAge = parseInt(majorExpenseAgeInput.value);
        const inflationRate = parseFloat(inflationRateInput.value);

        // Validation for Step 3
        let isValid = true;
        isValid = validateInput(monthlyRetirementExpensesInput, val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0) && isValid;
        isValid = validateInput(inflationRateInput, val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100) && isValid;

        // Conditional validation for major expense fields
        if (majorExpenseTypeSelect.value !== '') {
            isValid = validateInput(majorExpenseAmountInput, val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0) && isValid;
            isValid = validateInput(majorExpenseAgeInput, val => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) >= userData.CurrentAge) && isValid;
        } else {
            // If no major expense selected, ensure inputs are clear of validation states
            majorExpenseAmountInput.classList.remove('is-invalid');
            majorExpenseAgeInput.classList.remove('is-invalid');
        }

        if (!isValid) {
            showMessage(step3Message, 'Please correct the highlighted fields.', 'error');
            return;
        }
        hideMessage(step3Message);

        userData.PostRetirementMonthlyExpense = monthlyExpenses;
        userData.InflationRate = inflationRate / 100; // Store as decimal
        userData.PlannedMajorExpenses = [];
        if (majorExpenseTypeSelect.value !== '' && !isNaN(majorExpenseAmount) && !isNaN(majorExpenseAge)) {
            userData.PlannedMajorExpenses.push({
                type: majorExpenseTypeSelect.value, // Store the type
                amount: majorExpenseAmount,
                age: majorExpenseAge
            });
        }

        showPage(dashboardPage); // Always show the unified dashboard
    });

    // Step 3 Back button -> Step 2 Page
    backStep3Btn.addEventListener('click', () => {
        showPage(step2Page);
    });

    // Unified Dashboard -> Projections Page
    seeDetailedBreakdownBtn.addEventListener('click', () => { // Unified button
        showPage(projectionsPage);
    });

    // Unified Dashboard "Generate Report" button (opens the download modal)
    generateReportBtnDashboard.addEventListener('click', () => { // Unified button
        showPage(downloadReportSection); // Show the download modal as an overlay
    });

    // Unified Dashboard "Adjust My Plan" button (goes back to Step 1 and resets)
    adjustMyPlanBtn.addEventListener('click', () => { // Unified button
        startOver(); // Reset all data and inputs
        showPage(step1Page);
    });

    // Projections Page "Generate Report" button (opens the download modal)
    generateReportBtnProjections.addEventListener('click', () => {
        showPage(downloadReportSection); // Show the download modal as an overlay
    });

    // Projections Page -> Dashboard (Back button) - goes to the unified dashboard
    backProjectionsBtn.addEventListener('click', () => {
        showPage(dashboardPage); // Go back to the unified Dashboard
    });

    // Initial page load: show the landing page
    showPage(landingPage);

    // Set default values for input fields (Step 2 and 3)
    // Ensures they have initial values even if user skips input
    if (inflationRateInput) inflationRateInput.value = userData.InflationRate * 100; // Display 6.0
    if (expectedReturnRateInput) expectedReturnRateInput.value = 7.0; // Example default for B

    // Initial state for major expense inputs (disabled until type is selected)
    majorExpenseAmountInput.disabled = true;
    majorExpenseAgeInput.disabled = true;

    // --- Download Report Section Logic ---
    cancelDownloadBtn.addEventListener('click', () => {
        // Just hide the modal and show the previous main page
        downloadReportSection.classList.add('d-none');
        hideMessage(downloadMessage);
        downloadEmailInput.classList.remove('is-invalid'); // Clear any validation
        showPage(currentPage); // Re-show the page that was active before the modal
    });

    confirmDownloadBtn.addEventListener('click', async () => {
        const email = downloadEmailInput.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Basic email validation
            showMessage(downloadMessage, 'Please enter a valid email address.', 'error');
            downloadEmailInput.classList.add('is-invalid');
            return;
        }
        downloadEmailInput.classList.remove('is-invalid');

        // Store email for potential future use or re-download
        userData.email = email;

        hideMessage(downloadMessage);
        showMessage(downloadMessage, 'Generating report... This may take a moment.', 'info');

        // Prepare inputs for /api/generate-report (comprehensive data from userData)
        const inputsForReport = {
            email: email,
            CurrentAge: userData.CurrentAge,
            MonthlySIP: userData.MonthlySIP,
            SIPEscalationRate: userData.SIPEscalationRate,
            LumpSumInvestment: userData.LumpSumInvestment,
            InflationRate: userData.InflationRate,
            PostRetirementMonthlyExpense: userData.PostRetirementMonthlyExpense,
            PlannedMajorExpenses: userData.PlannedMajorExpenses,
        };

        // Add scenario-specific parameters which determine backend calculation path
        if (userData.hasTargetAge) {
            inputsForReport.RetirementAge = userData.RetirementAge;
            // The calculatedExpectedReturnRate is used internally by server, not passed here.
        } else {
            inputsForReport.ExpectedReturnRate = userData.ExpectedReturnRate;
            // The calculatedRetirementAgeB is used internally by server.
        }

        try {
            // First, call the API to generate the PDF and get the filename
            const response = await fetch(`${BASE_URL}/api/generate-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputsForReport)
            });
            const result = await response.json();

            if (response.ok && result.status === "success") {
                showMessage(downloadMessage, 'Report generated successfully! Starting download...', 'success');
                lastGeneratedReportFileName = result.downloadFileName; // Get the specific filename from the server response

                // Trigger download using the /api/download-report endpoint
                // IMPORTANT: Use a temporary anchor element to trigger the download
                const downloadUrl = `${BASE_URL}/api/download-report?email=${encodeURIComponent(email)}&fileName=${encodeURIComponent(lastGeneratedReportFileName)}`;
                
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = lastGeneratedReportFileName; // Suggest the file name for the download
                document.body.appendChild(link); // Append to body is necessary for Firefox
                link.click(); // Programmatically click the link to trigger download
                document.body.removeChild(link); // Clean up the element

                // Optionally hide the modal after a short delay
                setTimeout(() => {
                    downloadReportSection.classList.add('d-none');
                    hideMessage(downloadMessage);
                    showPage(currentPage); // Re-show the page that was active before the modal
                }, 3000);

            } else {
                const errorMessage = result.message || 'Something went wrong during report generation.';
                showMessage(downloadMessage, `Error: ${errorMessage}`, 'error');
                console.error('API Error for generate-report:', result);
            }
        } catch (error) {
            console.error('Fetch error for generate-report:', error);
            showMessage(downloadMessage, 'Network error or server unreachable during report generation. Please check your connection.', 'error');
        }
    });
});
