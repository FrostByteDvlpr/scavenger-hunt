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

// Create letters immediately with fallback positioning
createLetters();

function createLetters() {
    updateDebug("Creating letters...");
    
    if (!lettersContainer) {
        console.error("Letters container not found!");
        return;
    }
    
    // Clear any existing letters
    lettersContainer.innerHTML = '';
    
    // Create letters with GPS-like positioning for better mobile AR
    for (let i = 0; i < targetWord.length; i++) {
        const letter = targetWord[i];
        console.log("Creating letter:", letter);
        
        // Create main entity
        const entity = document.createElement("a-entity");
        
        // Use GPS positioning for more stable mobile AR
        const gpsPositions = [
            "40.7128, -74.0061, 20",  // B - North
            "40.7127, -74.0060, 25",  // I - Center  
            "40.7129, -74.0059, 30",  // K - East
            "40.7126, -74.0060, 15"   // E - South
        ];
        
        // Fallback to relative positioning if GPS doesn't work
        const relativePositions = [
            { x: -3, y: 2, z: -5 },   // B - Left back
            { x: 0, y: 3, z: -4 },    // I - Center high
            { x: 3, y: 1, z: -6 },    // K - Right back
            { x: -1, y: 2.5, z: -3 } // E - Left front
        ];
        
        const pos = relativePositions[i];
        
        // Try GPS positioning first, fallback to relative
        if (isMobile) {
            entity.setAttribute("gps-entity-place", {
                latitude: 40.7128 + (i * 0.0001),
                longitude: -74.0060 + (i * 0.0001)
            });
        }
        
        // Set relative position as backup
        entity.setAttribute("position", `${pos.x} ${pos.y} ${pos.z}`);
        
        // Create visible letter with better contrast
        entity.innerHTML = `
            <a-box 
                position="0 0 0"
                scale="1.5 1.5 0.1" 
                color="#000000" 
                opacity="0.9">
            </a-box>
            <a-text 
                value="${letter}"
                position="0 0 0.1"
                align="center"
                color="#FFD700"
                width="8"
                shader="msdf"
                geometry="primitive: plane; width: auto; height: auto">
            </a-text>
        `;
        
        // Add floating animation
        entity.setAttribute("animation", {
            property: "position",
            dir: "alternate",
            dur: 3000 + (i * 300),
            easing: "easeInOutSine",
            loop: true,
            to: `${pos.x} ${pos.y + 0.5} ${pos.z}`
        });
        
        // Add rotation for visibility
        entity.setAttribute("animation__rotate", {
            property: "rotation",
            dur: 8000 + (i * 1000),
            easing: "linear",
            loop: true,
            to: "0 360 0"
        });
        
        // Letter data for interaction
        entity.setAttribute("data-letter", letter);
        entity.setAttribute("data-index", i);
        entity.setAttribute("class", "letter-entity");
        entity.setAttribute("cursor-listener", "");
        
        lettersContainer.appendChild(entity);
        console.log(`Letter ${letter} created at position: ${pos.x}, ${pos.y}, ${pos.z}`);
    }
    
    updateDebug(`Created ${lettersContainer.children.length} letters`);
    
    // Add a test sphere to verify 3D rendering
    const testSphere = document.createElement("a-sphere");
    testSphere.setAttribute("position", "0 1 -2");
    testSphere.setAttribute("radius", "0.3");
    testSphere.setAttribute("color", "#FF0000");
    testSphere.setAttribute("animation", {
        property: "rotation",
        dur: 2000,
        loop: true,
        to: "360 0 0"
    });
    lettersContainer.appendChild(testSphere);
    updateDebug("Test sphere added");
}

// Enhanced mobile interaction
AFRAME.registerComponent('cursor-listener', {
    init: function () {
        const el = this.el;
        
        // Touch events for mobile
        el.addEventListener('touchstart', function (evt) {
            evt.preventDefault();
            const letter = el.getAttribute('data-letter');
            const index = parseInt(el.getAttribute('data-index'));
            if (letter && index !== null && !isNaN(index)) {
                console.log('Letter touched:', letter);
                captureLetter(letter, index, el);
            }
        });
        
        // Click for desktop testing
        el.addEventListener('click', function (evt) {
            const letter = el.getAttribute('data-letter');
            const index = parseInt(el.getAttribute('data-index'));
            if (letter && index !== null && !isNaN(index)) {
                console.log('Letter clicked:', letter);
                captureLetter(letter, index, el);
            }
        });
    }
});

function captureLetter(letter, index, element) {
    updateDebug(`Capturing: ${letter}`);
    
    if (captured.includes(index)) {
        updateDebug("Already captured");
        return;
    }
    
    captured.push(index);
    
    // Enhanced feedback
    element.setAttribute("animation__capture", {
        property: "scale",
        dur: 1000,
        to: "3 3 3",
        easing: "easeOutBounce"
    });
    
    // Change color to green
    const textEl = element.querySelector('a-text');
    if (textEl) {
        textEl.setAttribute('color', '#00FF00');
    }
    
    const boxEl = element.querySelector('a-box');
    if (boxEl) {
        boxEl.setAttribute('color', '#004400');
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    setTimeout(() => {
        element.remove();
        checkProgress();
    }, 2000);
}

// Capture button
const captureButton = document.getElementById("captureButton");
if (captureButton) {
    captureButton.addEventListener("click", () => {
        updateDebug("Capture clicked");
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // Capture first available letter
        for (let i = 0; i < targetWord.length; i++) {
            if (!captured.includes(i)) {
                const letterElement = document.querySelector(`[data-index="${i}"]`);
                if (letterElement) {
                    captureLetter(letterElement.getAttribute('data-letter'), i, letterElement);
                    break;
                }
            }
        }
    });
}

function checkProgress() {
    const wordDisplay = document.getElementById("targetWord");
    if (wordDisplay) {
        let displayWord = "";
        for (let i = 0; i < targetWord.length; i++) {
            displayWord += captured.includes(i) ? targetWord[i] : "_";
        }
        wordDisplay.textContent = displayWord;
        
        if (captured.length === targetWord.length) {
            // Haptic celebration
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
            
            setTimeout(() => {
                alert("🎉 Congratulations! You found: " + targetWord);
                location.reload();
            }, 500);
        }
    }
}

updateDebug("Game script loaded");
