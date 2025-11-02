const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const video = document.getElementById('screen');
const alarm = document.getElementById('alarm');
let stream;
let intervalId;
let alarmTriggered = false; // Prevent repeated alarm triggers

// Custom Alert Elements
const customAlert = document.getElementById('customAlert');
const closeAlertBtn = document.getElementById('closeAlertBtn');

// Event listener for starting monitoring
startBtn.addEventListener('click', async () => {
    try {
        // Request screen sharing with limited resolution for performance
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1280, height: 720 } // 720p limit - adjust for your screen
        });
        video.srcObject = stream;
        // Start periodic checks every 5 seconds
        intervalId = setInterval(checkForDeath, 5000);
        console.log('Monitoring started (optimized for speed).');
    } catch (err) {
        console.error('Error accessing screen:', err);
        alert('Failed to access screen. Try selecting a specific window.');
    }
});

// Event listener for stopping monitoring
stopBtn.addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    clearInterval(intervalId);
    console.log('Monitoring stopped.');
});

// Event listener for closing the custom alert
closeAlertBtn.addEventListener('click', () => {
    customAlert.style.display = 'none';  // Close the alert when OK is clicked
    console.log('Custom alert closed.');
    
    // Stop the alarm sound when the user clicks OK
    alarm.pause();
    alarm.currentTime = 0;  // Reset the sound to the start
    alarmTriggered = false; // Reset alarm trigger flag
    console.log('Alarm sound stopped.');
});

// Function to check for death by detecting any red pixels in the screen
function checkForDeath() {
    if (!video.videoWidth || !video.videoHeight) return;

    // Create a canvas to capture the current frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Get pixel data from the entire screen (full video frame)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let redPixelCount = 0;
    const totalPixels = data.length / 4; // 4 channels per pixel (RGBA)

    // Generalized red detection: Searching for any shade of red in the entire screen
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i]; // Red channel
        const g = data[i + 1]; // Green channel
        const b = data[i + 2]; // Blue channel

        // Check if the pixel is in the range of red hues
        if (r > 100 && g < 100 && b < 100) {  // General condition for red
            redPixelCount++;
        }
    }

    const redRatio = redPixelCount / totalPixels;
    console.log(`Red pixel ratio: ${(redRatio * 100).toFixed(2)}%`);

    const redThreshold = 0.05; // Lowered threshold to 5% of the screen pixels for red (more sensitive)
    if (redRatio > redThreshold && !alarmTriggered) {
        console.log('Red pixels detected! Playing alarm.');

        // Play the alarm sound only after red pixels are detected
        if (alarm.paused) {
            alarm.play();  // Trigger the alarm sound
            alarm.loop = true;  // Allow the alarm to repeat (keep playing)
            console.log('Alarm sound started playing.');
        }

        alarmTriggered = true;  // Flag to prevent multiple triggers

        // Show the custom alert (without blocking the code)
        customAlert.style.display = 'block';
    }
}
