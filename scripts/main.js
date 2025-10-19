const targetWord = "BIKE";
const captured = [];
const scene = document.querySelector("a-scene");
const lettersContainer = document.getElementById("letters-container");

console.log("Main script starting...");
console.log("Scene found:", !!scene);
console.log("Container found:", !!lettersContainer);

// Detect if we're on mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log("Mobile device:", isMobile);

let debugInfo = document.getElementById('debugInfo');
function updateDebug(message) {
    console.log(message);
    if (debugInfo) {
        debugInfo.innerHTML = message;
    }
}

// Diagnostics first
function runDiagnostics() {
    updateDebug("Running diagnostics...");
    
    console.log("Scene ready state:", scene.hasLoaded);
    console.log("Scene object3D:", !!scene.object3D);
    console.log("Container object3D:", !!lettersContainer.object3D);
    
    // Check if A-Frame is working at all
    const camera = scene.querySelector('a-camera');
    console.log("Camera found:", !!camera);
    
    if (camera && camera.object3D) {
        console.log("Camera position:", camera.object3D.position);
        console.log("Camera rotation:", camera.object3D.rotation);
    }
    
    updateDebug("Diagnostics complete - check console");
}

// Wait for scene to be ready, then run diagnostics
if (scene.hasLoaded) {
    runDiagnostics();
    setTimeout(createSimpleTest, 500);
} else {
    scene.addEventListener('loaded', function() {
        updateDebug("Scene loaded event fired");
        runDiagnostics();
        setTimeout(createSimpleTest, 500);
    });
}

// Create the simplest possible test
function createSimpleTest() {
    updateDebug("Creating simple test...");
    
    if (!lettersContainer) {
        updateDebug("ERROR: No container found!");
        return;
    }
    
    // Clear container
    lettersContainer.innerHTML = '';
    
    // Create a single, very large, very close red box
    const testBox = document.createElement("a-box");
    testBox.setAttribute("position", "0 0 -1");  // Very close to camera
    testBox.setAttribute("width", "2");
    testBox.setAttribute("height", "2");
    testBox.setAttribute("depth", "2");
    testBox.setAttribute("color", "#FF0000");
    testBox.setAttribute("id", "test-box");
    
    lettersContainer.appendChild(testBox);
    
    updateDebug("Added large red box at 0,0,-1");
    console.log("Test box added:", testBox);
    
    // Check if it was actually added
    setTimeout(() => {
        const addedBox = document.getElementById("test-box");
        console.log("Box in DOM:", !!addedBox);
        console.log("Box object3D:", !!addedBox?.object3D);
        console.log("Container children:", lettersContainer.children.length);
        
        if (addedBox && addedBox.object3D) {
            console.log("Box world position:", addedBox.object3D.getWorldPosition(new THREE.Vector3()));
            updateDebug("Box added successfully");
        } else {
            updateDebug("Box failed to create 3D object");
        }
    }, 1000);
    
    // Try adding letters after the box test
    setTimeout(() => {
        createBasicLetters();
    }, 2000);
}

function createBasicLetters() {
    updateDebug("Creating basic letters...");
    
    // Create very simple letters without complex styling
    for (let i = 0; i < targetWord.length; i++) {
        const letter = targetWord[i];
        
        // Create just a colored box with the letter as an attribute
        const letterBox = document.createElement("a-box");
        letterBox.setAttribute("position", `${i * 2 - 3} 1 -3`); // Spread out horizontally
        letterBox.setAttribute("width", "1");
        letterBox.setAttribute("height", "1");
        letterBox.setAttribute("depth", "0.2");
        letterBox.setAttribute("color", ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"][i]); // Different colors
        letterBox.setAttribute("data-letter", letter);
        letterBox.setAttribute("data-index", i);
        letterBox.setAttribute("id", `letter-${i}`);
        
        // Add simple rotation animation
        letterBox.setAttribute("animation", {
            property: "rotation",
            dur: 2000,
            loop: true,
            to: "0 360 0"
        });
        
        lettersContainer.appendChild(letterBox);
        console.log(`Added letter box ${letter} at position ${i * 2 - 3}, 1, -3`);
    }
    
    updateDebug(`Added ${targetWord.length} letter boxes`);
    
    // Final check
    setTimeout(() => {
        console.log("Final container children count:", lettersContainer.children.length);
        updateDebug(`Total objects: ${lettersContainer.children.length}`);
        
        // List all children
        for (let i = 0; i < lettersContainer.children.length; i++) {
            const child = lettersContainer.children[i];
            console.log(`Child ${i}: ${child.tagName} at ${child.getAttribute('position')}`);
        }
    }, 1000);
}

// Simplified capture button
const captureButton = document.getElementById("captureButton");
if (captureButton) {
    captureButton.addEventListener("click", () => {
        updateDebug("Capture button clicked");
        console.log("Available letters:", document.querySelectorAll('[data-letter]').length);
        
        // Just remove the first available letter box
        const letterBoxes = document.querySelectorAll('[data-letter]');
        if (letterBoxes.length > 0) {
            const firstBox = letterBoxes[0];
            const letter = firstBox.getAttribute('data-letter');
            updateDebug(`Captured: ${letter}`);
            
            // Make it green and bigger
            firstBox.setAttribute('color', '#00FF00');
            firstBox.setAttribute('scale', '2 2 2');
            
            setTimeout(() => {
                firstBox.remove();
                updateDebug(`Removed: ${letter}`);
            }, 1000);
        } else {
            updateDebug("No letters found to capture");
        }
    });
}

updateDebug("Simplified script loaded");
