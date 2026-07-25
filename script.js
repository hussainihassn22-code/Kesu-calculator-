// Global variables
let display = document.getElementById('display');
let expression = '';
let calculationHistory = [];
let historyIndex = -1;
let memory = 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupTabListeners();
    setupThemeToggle();
    loadHistory();
});

function initializeApp() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

// ==================== BASIC CALCULATOR ====================
function appendNumber(num) {
    expression += num;
    display.value = expression;
}

function appendOperator(op) {
    if (expression === '' && op !== '-') return;
    if (['+', '-', '*', '/'].includes(expression[expression.length - 1])) {
        expression = expression.slice(0, -1);
    }
    expression += op;
    display.value = expression;
}

function toggleParentheses(bracket) {
    expression += bracket;
    display.value = expression;
}

function clearDisplay() {
    expression = '';
    display.value = '';
    document.getElementById('history-display').textContent = '';
}

function deleteLast() {
    expression = expression.slice(0, -1);
    display.value = expression;
}

function calculate() {
    try {
        if (expression === '') return;
        const result = eval(expression);
        const finalResult = Math.round(result * 100000000) / 100000000;
        addToHistory(`${expression} = ${finalResult}`);
        display.value = finalResult;
        document.getElementById('history-display').textContent = expression;
        expression = finalResult.toString();
    } catch (error) {
        display.value = 'Error';
        expression = '';
    }
}

function calculatePercentage() {
    try {
        if (expression === '') return;
        const result = eval(expression) / 100;
        const finalResult = Math.round(result * 100000000) / 100000000;
        addToHistory(`${expression}% = ${finalResult}`);
        display.value = finalResult;
        expression = finalResult.toString();
    } catch (error) {
        display.value = 'Error';
        expression = '';
    }
}

function undoCalculation() {
    if (historyIndex > 0) {
        historyIndex--;
        expression = calculationHistory[historyIndex].split(' = ')[0];
        display.value = expression;
    }
}

function redoCalculation() {
    if (historyIndex < calculationHistory.length - 1) {
        historyIndex++;
        const item = calculationHistory[historyIndex];
        const result = item.split(' = ')[1];
        display.value = result;
        expression = result;
    }
}

// ==================== SCIENTIFIC CALCULATOR ====================
let sciExpression = '';

function sciAppendNumber(num) {
    sciExpression += num;
    document.getElementById('sci-display').value = sciExpression;
}

function sciAppendOperator(op) {
    if (sciExpression === '' && op !== '-') return;
    if (['+', '-', '*', '/'].includes(sciExpression[sciExpression.length - 1])) {
        sciExpression = sciExpression.slice(0, -1);
    }
    sciExpression += op;
    document.getElementById('sci-display').value = sciExpression;
}

function sciClearDisplay() {
    sciExpression = '';
    document.getElementById('sci-display').value = '';
    document.getElementById('sci-history-display').textContent = '';
}

function sciCalculate(func) {
    try {
        let result;
        const value = parseFloat(sciExpression) || 0;
        
        switch(func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case 'pow':
                sciExpression += '^';
                document.getElementById('sci-display').value = sciExpression;
                return;
            case 'factorial':
                result = factorial(Math.floor(value));
                break;
            default:
                return;
        }
        
        const finalResult = Math.round(result * 100000000) / 100000000;
        addToHistory(`${func}(${value}) = ${finalResult}`);
        document.getElementById('sci-display').value = finalResult;
        document.getElementById('sci-history-display').textContent = `${func}(${value})`;
        sciExpression = finalResult.toString();
    } catch (error) {
        document.getElementById('sci-display').value = 'Error';
        sciExpression = '';
    }
}

function sciCalculateResult() {
    try {
        if (sciExpression === '') return;
        const expr = sciExpression.replace(/\^/g, '**');
        const result = eval(expr);
        const finalResult = Math.round(result * 100000000) / 100000000;
        addToHistory(`${sciExpression} = ${finalResult}`);
        document.getElementById('sci-display').value = finalResult;
        document.getElementById('sci-history-display').textContent = sciExpression;
        sciExpression = finalResult.toString();
    } catch (error) {
        document.getElementById('sci-display').value = 'Error';
        sciExpression = '';
    }
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// ==================== CONVERTERS ====================
function convertCurrency() {
    const amount = parseFloat(document.getElementById('currencyAmount').value);
    const from = document.getElementById('currencyFrom').value;
    const to = document.getElementById('currencyTo').value;
    
    // Conversion rates (relative to USD)
    const rates = {
        'USD': 1,
        'EUR': 0.92,
        'GBP': 0.79,
        'JPY': 149.50,
        'PKR': 278.5
    };
    
    const usdAmount = amount / rates[from];
    const result = usdAmount * rates[to];
    const finalResult = Math.round(result * 100) / 100;
    
    document.getElementById('currencyResult').innerHTML = 
        `${amount} ${from} = <strong>${finalResult} ${to}</strong>`;
    addToHistory(`${amount} ${from} → ${finalResult} ${to}`);
}

function convertTemperature() {
    const temp = parseFloat(document.getElementById('tempAmount').value);
    const from = document.getElementById('tempFrom').value;
    const to = document.getElementById('tempTo').value;
    
    let result;
    
    // Convert to Celsius first
    let celsius;
    if (from === 'C') celsius = temp;
    else if (from === 'F') celsius = (temp - 32) * 5/9;
    else if (from === 'K') celsius = temp - 273.15;
    
    // Convert from Celsius to target
    if (to === 'C') result = celsius;
    else if (to === 'F') result = (celsius * 9/5) + 32;
    else if (to === 'K') result = celsius + 273.15;
    
    result = Math.round(result * 100) / 100;
    
    document.getElementById('tempResult').innerHTML = 
        `${temp}°${from} = <strong>${result}°${to}</strong>`;
    addToHistory(`${temp}°${from} → ${result}°${to}`);
}

function convertUnits() {
    const value = parseFloat(document.getElementById('unitAmount').value);
    const from = document.getElementById('unitFrom').value;
    const to = document.getElementById('unitTo').value;
    
    // Conversion factors to meters or kg
    const conversions = {
        'm': 1,
        'km': 1000,
        'ft': 0.3048,
        'mi': 1609.34,
        'kg': 1,
        'lb': 0.453592
    };
    
    const baseValue = value * conversions[from];
    const result = baseValue / conversions[to];
    const finalResult = Math.round(result * 10000) / 10000;
    
    document.getElementById('unitResult').innerHTML = 
        `${value} ${from} = <strong>${finalResult} ${to}</strong>`;
    addToHistory(`${value} ${from} → ${finalResult} ${to}`);
}

// ==================== MEMORY FUNCTIONS ====================
function memoryAdd() {
    const value = parseFloat(display.value || expression) || 0;
    memory += value;
    updateMemoryDisplay();
}

function memorySubtract() {
    const value = parseFloat(display.value || expression) || 0;
    memory -= value;
    updateMemoryDisplay();
}

function memoryRecall() {
    expression = memory.toString();
    display.value = expression;
    document.getElementById('history-display').textContent = `MR: ${memory}`;
}

function memoryClear() {
    memory = 0;
    updateMemoryDisplay();
}

function updateMemoryDisplay() {
    document.getElementById('memoryValue').textContent = 
        Math.round(memory * 100000000) / 100000000;
}

// ==================== HISTORY MANAGEMENT ====================
function addToHistory(entry) {
    calculationHistory.push(entry);
    historyIndex = calculationHistory.length - 1;
    saveHistory();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('fullHistory');
    historyList.innerHTML = calculationHistory.map((item, index) => 
        `<div class="history-item" onclick="selectHistoryItem(${index})">${item}</div>`
    ).join('');
    
    const modalHistory = document.getElementById('modalHistory');
    modalHistory.innerHTML = calculationHistory.map((item, index) => 
        `<div class="history-item" onclick="selectHistoryItem(${index})">${item}</div>`
    ).join('');
}

function selectHistoryItem(index) {
    const item = calculationHistory[index];
    const result = item.split(' = ')[1] || item.split(' → ')[1];
    display.value = result;
    expression = result;
    historyIndex = index;
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        calculationHistory = [];
        historyIndex = -1;
        saveHistory();
        updateHistoryDisplay();
    }
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
}

function loadHistory() {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
        calculationHistory = JSON.parse(saved);
        historyIndex = calculationHistory.length - 1;
        updateHistoryDisplay();
    }
}

// ==================== TAB MANAGEMENT ====================
function setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ==================== THEME TOGGLE ====================
function setupThemeToggle() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('historyBtn').addEventListener('click', openHistory);
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    document.getElementById('themeToggle').textContent = isDarkMode ? '☀️' : '🌙';
}

function openHistory() {
    document.getElementById('historyModal').classList.add('active');
}

function closeHistory() {
    document.getElementById('historyModal').classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('historyModal');
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// ==================== KEYBOARD SUPPORT ====================
document.addEventListener('keydown', (e) => {
    const activeTab = document.querySelector('.tab-content.active').id;
    
    if (activeTab === 'calculator') {
        if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
        else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            if (e.key !== '-' || expression !== '') appendOperator(e.key);
        }
        else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculate();
        }
        else if (e.key === 'Backspace') deleteLast();
        else if (e.key === 'Escape') clearDisplay();
        else if (e.key === '.') appendOperator('.');
    } else if (activeTab === 'scientific') {
        if (e.key >= '0' && e.key <= '9') sciAppendNumber(e.key);
        else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            if (e.key !== '-' || sciExpression !== '') sciAppendOperator(e.key);
        }
        else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            sciCalculateResult();
        }
        else if (e.key === 'Escape') sciClearDisplay();
        else if (e.key === '.') sciAppendNumber('.');
    }
});