const targetWord = "BIKE";
const captured = [];
const scene = document.querySelector("a-scene");
const lettersContainer = document.getElementById("letters-container");

console.log("Main script starting...");

let debugInfo = document.getElementById('debugInfo');
let debugMessages = [];

function updateDebug(message) {
    console.log(message);
    debugMessages.push(message);
    
    // Keep only last 8 messages
    if (debugMessages.length > 8) {
        debugMessages = debugMessages.slice(-8);
    }
    
    if (debugInfo) {
        debugInfo.innerHTML = debugMessages.join('<br>');
        debugInfo.style.display = 'block';
        debugInfo.style.fontSize = '14px';
        debugInfo.style.maxHeight = '200px';
        debugInfo.style.overflow = 'scroll';
    }
}

updateDebug("Script loaded");
updateDebug("Scene: " + (!!scene));
updateDebug("Container: " + (!!lettersContainer));

// Try multiple approaches
let attempt = 0;

function tryCreateObjects() {
    attempt++;
    updateDebug(`Attempt ${attempt}: Creating objects...`);
    
    if (!scene || !lettersContainer) {
        updateDebug("ERROR: Missing scene or container");
        return;
    }
    
    // Clear container
    lettersContainer.innerHTML = '';
    
    // Method 1: Try creating objects directly in the scene (bypass container)
    if (attempt === 1) {
        updateDebug("Method 1: Direct to scene");
        createDirectInScene();
    }
    // Method 2: Try with container but different positioning
    else if (attempt === 2) {
        updateDebug("Method 2: Container with close positioning");
        createInContainer();
    }
    // Method 3: Try with HTML instead of JavaScript creation
    else if (attempt === 3) {
        updateDebug("Method 3: HTML injection");
        createWithHTML();
    }
}

function createDirectInScene() {
    // Create a big red box directly in the scene
    const testBox = document.createElement("a-box");
    testBox.setAttribute("position", "0 1.6 -2");  // At eye level
    testBox.setAttribute("width", "1");
    testBox.setAttribute("height", "1");
    testBox.setAttribute("depth", "1");
    testBox.setAttribute("color", "#FF0000");
    testBox.setAttribute("id", "direct-box");
    
    scene.appendChild(testBox);
    updateDebug("Added box directly to scene");
    
    setTimeout(() => {
        const box = document.getElementById("direct-box");
        updateDebug("Direct box exists: " + !!box);
    }, 1000);
}

function createInContainer() {
    // Try with container but very close positioning
    const testSphere = document.createElement("a-sphere");
    testSphere.setAttribute("position", "0 0 -0.5");  // Very close
    testSphere.setAttribute("radius", "0.5");
    testSphere.setAttribute("color", "#00FF00");
    testSphere.setAttribute("id", "container-sphere");
    
    lettersContainer.appendChild(testSphere);
    updateDebug("Added sphere to container");
    
    setTimeout(() => {
        updateDebug("Container children: " + lettersContainer.children.length);
    }, 1000);
}

function createWithHTML() {
    // Try injecting HTML directly
    lettersContainer.innerHTML = `
        <a-cylinder position="1 0 -1" radius="0.3" height="1" color="#0000FF" id="html-cylinder">
            <a-animation attribute="rotation" dur="2000" fill="forwards" to="0 360 0" repeat="indefinite"></a-animation>
        </a-cylinder>
        <a-text value="TEST" position="0 2 -2" align="center" color="#FFFFFF" width="20"></a-text>
    `;
    updateDebug("Injected HTML directly");
    
    setTimeout(() => {
        const cylinder = document.getElementById("html-cylinder");
        updateDebug("HTML cylinder exists: " + !!cylinder);
    }, 1000);
}

// Start attempts
setTimeout(() => {
    tryCreateObjects();
}, 1000);

// Try again after 3 seconds if first attempt fails
setTimeout(() => {
    if (attempt < 2) {
        tryCreateObjects();
    }
}, 4000);

// Try third method after 6 seconds
setTimeout(() => {
    if (attempt < 3) {
        tryCreateObjects();
    }
}, 7000);

// Capture button for testing
const captureButton = document.getElementById("captureButton");
if (captureButton) {
    captureButton.addEventListener("click", () => {
        updateDebug("Button clicked!");
        
        // Try to find ANY a-frame object
        const allBoxes = document.querySelectorAll('a-box');
        const allSpheres = document.querySelectorAll('a-sphere');
        const allCylinders = document.querySelectorAll('a-cylinder');
        
        updateDebug(`Found: ${allBoxes.length} boxes, ${allSpheres.length} spheres, ${allCylinders.length} cylinders`);
        
        // If nothing exists, try creating something new
        if (allBoxes.length === 0 && allSpheres.length === 0 && allCylinders.length === 0) {
            updateDebug("Creating emergency test object...");
            
            const emergencyBox = document.createElement("a-box");
            emergencyBox.setAttribute("position", "0 0 -1");
            emergencyBox.setAttribute("width", "3");
            emergencyBox.setAttribute("height", "3");
            emergencyBox.setAttribute("depth", "1");
            emergencyBox.setAttribute("color", "#FFFF00");
            
            scene.appendChild(emergencyBox);
            updateDebug("Emergency box created");
        } else {
            // Change color of first found object
            const firstObj = allBoxes[0] || allSpheres[0] || allCylinders[0];
            if (firstObj) {
                firstObj.setAttribute('color', '#FF00FF');
                updateDebug("Changed object color to pink");
            }
        }
    });
}

// Scene diagnostics
if (scene) {
    scene.addEventListener('loaded', function() {
        updateDebug("Scene loaded event");
    });
    
    scene.addEventListener('renderstart', function() {
        updateDebug("Rendering started");
    });
    
    setTimeout(() => {
        updateDebug("Scene hasLoaded: " + scene.hasLoaded);
        
        const camera = scene.querySelector('a-camera');
        updateDebug("Camera found: " + !!camera);
        
        if (camera) {
            const pos = camera.getAttribute('position');
            updateDebug("Camera pos: " + (pos || 'default'));
        }
    }, 2000);
}

updateDebug("All event listeners set up");
