// settings.js

// DOM Elements
const pushSwitch = document.getElementById('push-notifications');
const locationInput = document.getElementById('location-input');
const saveButton = document.getElementById('save-settings');
const backButton = document.getElementById('back-button');

// Fetch current settings from the server and update the UI
async function loadSettings() {
    try {
        const response = await fetch('/settings');
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        const settings = await response.json();
        
        // Update switch states and location input
        pushSwitch.checked = settings.pushNotifications;
        locationInput.value = settings.location;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save updated settings to the server
async function saveSettings() {
    const settings = {
        pushNotifications: pushSwitch.checked,
        location: locationInput.value,
    };

    try {
        const response = await fetch('/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });
        const updatedSettings = await response.json();
        alert('Settings saved successfully');
        loadSettings();  // Reload settings after saving
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
    }
}

// Event listeners for button clicks
saveButton.addEventListener('click', saveSettings);
backButton.addEventListener('click', () => {
    window.location.href = 'index.html';  // Go back to the home page
});

// Load the settings when the page loads
document.addEventListener('DOMContentLoaded', loadSettings);
