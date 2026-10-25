document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Buttons
    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const statusBadge = document.getElementById('statusBadge');

    // DOM Elements - Config Inputs
    const tempMinInput = document.getElementById('tempMin');
    const tempMaxInput = document.getElementById('tempMax');
    const umidMinInput = document.getElementById('umidMin');
    const umidMaxInput = document.getElementById('umidMax');

    // DOM Elements - LED Toggles
    const led1 = document.getElementById('led1');
    const led2 = document.getElementById('led2');
    const led3 = document.getElementById('led3');
    const led4 = document.getElementById('led4');

    // DOM Elements - Displays
    const displayTimestamp = document.getElementById('displayTimestamp');
    const displayTemp = document.getElementById('displayTemp');
    const displayUmid = document.getElementById('displayUmid');
    const displayLeds = document.getElementById('displayLeds');

    let simulationInterval = null;

    // Helper: Generate Random Number between Min and Max
    function getRandomNumber(min, max, decimals = 1) {
        const numMin = parseFloat(min) || 0;
        const numMax = parseFloat(max) || 100;
        const minVal = Math.min(numMin, numMax);
        const maxVal = Math.max(numMin, numMax);
        const rand = Math.random() * (maxVal - minVal) + minVal;
        return rand.toFixed(decimals);
    }

    // Helper: Format Date to DD/MM/YYYY HH:MM:SS
    function getFormattedNow() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    // Helper: Format LED Active Status String
    function getLedsStatusString() {
        const activeLeds = [];
        if (led1.checked) activeLeds.push('1');
        if (led2.checked) activeLeds.push('2');
        if (led3.checked) activeLeds.push('3');
        if (led4.checked) activeLeds.push('4');

        if (activeLeds.length === 0) return 'ALL-OFF';
        if (activeLeds.length === 4) return 'ALL-ON';

        return `${activeLeds.join(',')}-ON...`;
    }

    // Function to perform a single simulation tick/publish
    function sendSimulatedData() {
        // Update Timestamp
        displayTimestamp.innerText = getFormattedNow();

        // Generate Random Values based on Min/Max inputs
        const currentTemp = getRandomNumber(tempMinInput.value, tempMaxInput.value, 1);
        const currentUmid = getRandomNumber(umidMinInput.value, umidMaxInput.value, 0);

        // Update Display Readings
        displayTemp.innerText = `${currentTemp} °C`;
        displayUmid.innerText = `${currentUmid} %`;
        displayLeds.innerText = getLedsStatusString();
    }

    // Start Simulation Event
    btnStart.addEventListener('click', () => {
        if (simulationInterval) clearInterval(simulationInterval);

        // Initial publish immediately
        sendSimulatedData();

        // Set interval for periodic automatic execution
        simulationInterval = setInterval(sendSimulatedData, 3000);

        // Update UI state
        btnStart.disabled = true;
        btnStop.disabled = false;
        statusBadge.innerText = 'Em Execução';
        statusBadge.className = 'status-badge running';
    });

    // Stop Simulation Event
    btnStop.addEventListener('click', () => {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }

        // Update UI state
        btnStart.disabled = false;
        btnStop.disabled = true;
        statusBadge.innerText = 'Parado';
        statusBadge.className = 'status-badge stopped';
    });
});