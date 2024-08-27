let firstCall = true;
let totalEnergy = 0;
let balance = 50;
let panelCount = 2;
let days = 0;
let years = 0;
let currentSeason = 0;
let inverterHealth = 100;
let inverterAge = 0;
const seasons = ['Frühling', 'Sommer', 'Herbst', 'Winter'];
const seasonalProduction = [
    [0.8, 2], // Frühling
    [1.5, 2.3], // Sommer
    [1.1, 1.8], // Herbst
    [0.1, 0.8] // Winter
];

function updateDisplay() {
    document.getElementById('total').textContent = totalEnergy.toFixed(1);
    document.getElementById('money').textContent = balance.toFixed(2);
    document.getElementById('panels').textContent = panelCount;
    document.getElementById('days').textContent = days;
    document.getElementById('years').textContent = years;
    document.getElementById('current-season').textContent = seasons[currentSeason];
    document.getElementById('inverter').textContent = inverterHealth;
    document.getElementById('upgrade-btn').disabled = balance < 69;
    document.getElementById('replace-inverter-btn').disabled = balance < 150 || inverterHealth === 100;
}

function updatePanelImage() {
    const images = ['panel-spring', 'panel-summer', 'panel-autumn', 'panel-winter'];
    images.forEach((id, index) => {
        document.getElementById(id).style.display = index === currentSeason ? 'block' : 'none';
    });
}

function showNotification(message, timeout) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    if (!timeout) {
        setTimeout(() => {
            notification.textContent = '';
        }, 3000);
    } else {
        setTimeout(() => {
            notification.textContent = '';
        }, timeout);
    }
}

function simulateDay() {
    days++;
    if (days > 360) {
        years++
        days = 0;
        inverterAge++;
    }

    if (firstCall) {
        showNotification(
            "Klicke auf das Bild, um einen weiteren Tag zu simulieren oder lass einfach die Zeit verstreichen",
            5000);
        firstCall = false;
    }

    const oldSeason = currentSeason;
    currentSeason = Math.floor((days - 1) / 90);

    const [min, max] = seasonalProduction[currentSeason];
    const dailyProduction = Math.random() * (max - min) + min;
    const generatedEnergy = panelCount * dailyProduction * (inverterHealth / 100);

    totalEnergy += generatedEnergy;
    const earnings = generatedEnergy * 0.063; // 6.3 cents per kWh
    balance += earnings;

    // Wechselrichter-Verschleiß
    if (inverterAge >= 15 && Math.random() < 0.001) {
        inverterHealth = Math.max(0, inverterHealth - Math.floor(Math.random() * 20));
        if (inverterHealth < 50) {
            showNotification("Der Wechselrichter altert. Ersatz in Betracht ziehen!");
        }
    }
    if (inverterAge >= 20 && inverterHealth > 0) {
        inverterHealth = 0;
        showNotification("Der Wechselrichter ist komplett ausgefallen und muss ersetzt werden!");
    }

    updateDisplay();
    updatePanelImage();

    if (currentSeason !== oldSeason) {
        showNotification(`Neue Jahreszeit: ${seasons[currentSeason]}!`);
    }
}

function buyPanel() {
    if (balance >= 69) {
        balance -= 69;
        panelCount++;
        updateDisplay();
        showNotification(`Neues Solarpanel gekauft! Du hast jetzt ${panelCount} Panels.`);
    }
}

function replaceInverter() {
    if (balance >= 150) {
        balance -= 150;
        inverterHealth = 100;
        inverterAge = 0;
        updateDisplay();
        showNotification("Wechselrichter wurde erfolgreich ersetzt!");
    }
}

// Spielstand speichern
function saveGame() {
    const gameState = {
        totalEnergy: totalEnergy,
        balance: balance,
        panelCount: panelCount,
        days: days,
        years: years,
        currentSeason: currentSeason,
        inverterHealth: inverterHealth,
        inverterAge: inverterAge
    };
    localStorage.setItem('balkonkraftwerkSave', JSON.stringify(gameState));
}

// Spielstand laden
function loadGame() {
    const savedState = localStorage.getItem('balkonkraftwerkSave');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        totalEnergy = gameState.totalEnergy || 0;
        balance = gameState.balance || 50;
        panelCount = gameState.panelCount || 2;
        days = gameState.days || 0;
        currentSeason = gameState.currentSeason || 0;
        inverterHealth = gameState.inverterHealth || 100;
        inverterAge = gameState.inverterAge || 0;
        years = gameState.years || 0;
    } else {
        // Setze Standardwerte, wenn kein Spielstand vorhanden ist
        totalEnergy = 0;
        balance = 50;
        panelCount = 2;
        days = 0;
        currentSeason = 0;
        inverterHealth = 100;
        inverterAge = 0;
        years = 0;
    }
    updateDisplay();
    updatePanelImage();
}

function resetGame() {
    document.getElementById('reset-dialog').style.display = 'flex';
    
    document.getElementById('reset-confirm').onclick = function() {
        // Setze alle Spielvariablen auf ihre Anfangswerte zurück
        totalEnergy = 0;
        balance = 50;
        panelCount = 2;
        days = 1;
        currentSeason = 0;
        inverterHealth = 100;
        inverterAge = 0;
        years = 0;

        // Lösche den gespeicherten Spielstand
        localStorage.removeItem('balkonkraftwerkSave');

        // Aktualisiere die Anzeige
        updateDisplay();
        updatePanelImage();

        // Zeige eine Bestätigungsnachricht
        showNotification("Spiel wurde zurückgesetzt!");
        
        // Schließe den Dialog
        document.getElementById('reset-dialog').style.display = 'none';
    };
    
    document.getElementById('reset-cancel').onclick = function() {
        document.getElementById('reset-dialog').style.display = 'none';
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Hier kommen alle Event-Listener und Initialisierungscode
    document.getElementById('solar-panel-container').addEventListener('click', simulateDay);
    document.getElementById('upgrade-btn').addEventListener('click', buyPanel);
    document.getElementById('replace-inverter-btn').addEventListener('click', replaceInverter);
    document.getElementById('reset-game').addEventListener('click', resetGame);

    // Initialer Aufruf von Funktionen
    loadGame();
    updateDisplay();
    updatePanelImage();
});

// Automatische Simulation
setInterval(simulateDay, 5000); // Simuliert einen Tag jede Sekunde
// Automatisches Speichern alle 30 Sekunden
setInterval(saveGame, 10000);

// Laden beim Start des Spiels
window.onload = loadGame;