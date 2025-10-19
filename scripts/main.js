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

// Create letters immediately
createLetters();

function createLetters() {
    updateDebug("Creating letters...");
    
    if (!lettersContainer) {
        console.error("Letters container not found!");
        return;
    }
    
    // Clear any existing letters
    lettersContainer.innerHTML = '';
    
    // Create letters with simple positioning that should work
    for (let i = 0; i < targetWord.length; i++) {
        const letter = targetWord[i];
        console.log("Creating letter:", letter);
        
        // Create main entity
        const entity = document.createElement("a-entity");
        
        // Simple positions in front of camera
        const positions = [
            { x: -2, y: 1.5, z: -3 },   // B - Left
            { x: -0.5, y: 2, z: -3 },   // I - Left center
            { x: 0.5, y: 1, z: -3 },    // K - Right center
            { x: 2, y: 1.5, z: -3 }     // E - Right
        ];
        
        const pos = positions[i];
        entity.setAttribute("position", `${pos.x} ${pos.y} ${pos.z}`);
        
        // Create visible letter with high contrast
        entity.setAttribute("text", {
            value: letter,
            color: "#FFD700",
            align: "center",
            width: 8,
            shader: "msdf",
            font: "roboto"
        });
        
        // Add dark background for visibility
        entity.setAttribute("geometry", {
            primitive: "plane",
            width: 1.2,
            height: 1.2
        });
        entity.setAttribute("material", {
            color: "#000000",
            opacity: 0.8,
            transparent: true
        });
        
        // Gentle floating animation
        entity.setAttribute("animation", {
            property: "position",
            dir: "alternate",
            dur: 3000 + (i * 300),
            easing: "easeInOutSine",
            loop: true,
            to: `${pos.x} ${pos.y + 0.3} ${pos.z}`
        });
        
        // Letter data for interaction
        entity.setAttribute("data-letter", letter);
        entity.setAttribute("data-index", i);
        entity.setAttribute("cursor-listener", "");
        
        lettersContainer.appendChild(entity);
        console.log(`Letter ${letter} created at position: ${pos.x}, ${pos.y}, ${pos.z}`);
    }
    
    updateDebug(`Created ${lettersContainer.children.length} letters`);
    
    // Add a test sphere to verify 3D rendering
    const testSphere = document.createElement("a-sphere");
    testSphere.setAttribute("position", "0 0.5 -2");
    testSphere.setAttribute("radius", "0.2");
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

// Mobile interaction
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
    
    // Visual feedback
    element.setAttribute("animation__capture", {
        property: "scale",
        dur: 1000,
        to: "2 2 2",
        easing: "easeOutBounce"
    });
    
    // Change to green
    element.setAttribute("text", {
        value: letter,
        color: "#00FF00",
        align: "center",
        width: 8,
        shader: "msdf",
        font: "roboto"
    });
    
    element.setAttribute('material', 'color', '#004400');
    
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
