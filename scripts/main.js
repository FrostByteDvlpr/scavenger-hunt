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

// Wait a bit longer before creating letters to ensure AR is ready
setTimeout(() => {
    createLetters();
}, 1000);

function createLetters() {
    updateDebug("Creating letters...");
    
    if (!lettersContainer) {
        console.error("Letters container not found!");
        updateDebug("ERROR: No container!");
        return;
    }
    
    // Clear any existing letters
    lettersContainer.innerHTML = '';
    
    // Create letters with very visible styling
    for (let i = 0; i < targetWord.length; i++) {
        const letter = targetWord[i];
        console.log("Creating letter:", letter);
        
        // Create a container entity for each letter
        const letterEntity = document.createElement("a-entity");
        
        // Position them closer and more spread out
        const positions = [
            { x: -1.5, y: 1.5, z: -2 },   // B - Left
            { x: -0.5, y: 2.5, z: -2 },   // I - Left center, higher
            { x: 0.5, y: 0.5, z: -2 },    // K - Right center, lower
            { x: 1.5, y: 1.5, z: -2 }     // E - Right
        ];
        
        const pos = positions[i];
        letterEntity.setAttribute("position", `${pos.x} ${pos.y} ${pos.z}`);
        
        // Create the background box first
        const backgroundBox = document.createElement("a-box");
        backgroundBox.setAttribute("position", "0 0 0");
        backgroundBox.setAttribute("width", "1");
        backgroundBox.setAttribute("height", "1");
        backgroundBox.setAttribute("depth", "0.1");
        backgroundBox.setAttribute("color", "#000000");
        backgroundBox.setAttribute("opacity", "0.9");
        
        // Create the text
        const textElement = document.createElement("a-text");
        textElement.setAttribute("value", letter);
        textElement.setAttribute("position", "0 0 0.06"); // In front of box
        textElement.setAttribute("align", "center");
        textElement.setAttribute("color", "#FFD700");
        textElement.setAttribute("width", "10");
        textElement.setAttribute("shader", "msdf");
        textElement.setAttribute("font", "roboto");
        
        // Add both to the letter entity
        letterEntity.appendChild(backgroundBox);
        letterEntity.appendChild(textElement);
        
        // Add floating animation
        letterEntity.setAttribute("animation", {
            property: "position",
            dir: "alternate",
            dur: 3000 + (i * 300),
            easing: "easeInOutSine",
            loop: true,
            to: `${pos.x} ${pos.y + 0.3} ${pos.z}`
        });
        
        // Add rotation for better visibility
        letterEntity.setAttribute("animation__rotate", {
            property: "rotation",
            dur: 6000 + (i * 1000),
            easing: "linear",
            loop: true,
            to: "0 360 0"
        });
        
        // Letter data for interaction
        letterEntity.setAttribute("data-letter", letter);
        letterEntity.setAttribute("data-index", i);
        letterEntity.setAttribute("cursor-listener", "");
        
        lettersContainer.appendChild(letterEntity);
        console.log(`Letter ${letter} created at position: ${pos.x}, ${pos.y}, ${pos.z}`);
    }
    
    // Add some highly visible test objects
    const testObjects = [
        { type: "sphere", pos: "0 1 -1.5", color: "#FF0000", size: "0.3" },
        { type: "box", pos: "-1 2 -1.5", color: "#00FF00", size: "0.3" },
        { type: "cylinder", pos: "1 2 -1.5", color: "#0000FF", size: "0.3" }
    ];
    
    testObjects.forEach((obj, index) => {
        const testEl = document.createElement(`a-${obj.type}`);
        testEl.setAttribute("position", obj.pos);
        testEl.setAttribute("color", obj.color);
        
        if (obj.type === "sphere") {
            testEl.setAttribute("radius", obj.size);
        } else if (obj.type === "box") {
            testEl.setAttribute("width", obj.size);
            testEl.setAttribute("height", obj.size);
            testEl.setAttribute("depth", obj.size);
        } else if (obj.type === "cylinder") {
            testEl.setAttribute("radius", obj.size);
            testEl.setAttribute("height", obj.size);
        }
        
        testEl.setAttribute("animation", {
            property: "rotation",
            dur: 2000,
            loop: true,
            to: "360 360 0"
        });
        
        lettersContainer.appendChild(testEl);
    });
    
    updateDebug(`Created ${lettersContainer.children.length} objects total (${targetWord.length} letters + 3 test shapes)`);
    
    // Log what's actually in the container
    setTimeout(() => {
        console.log("Container children:", lettersContainer.children.length);
        for (let i = 0; i < lettersContainer.children.length; i++) {
            const child = lettersContainer.children[i];
            console.log(`Child ${i}:`, child.tagName, child.getAttribute('position'));
        }
        
        updateDebug(`Container has ${lettersContainer.children.length} children`);
    }, 500);
}

// Mobile interaction
AFRAME.registerComponent('cursor-listener', {
    init: function () {
        const el = this.el;
        console.log('Cursor listener added to:', el.getAttribute('data-letter'));
        
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
    
    // Change text color to green
    const textEl = element.querySelector('a-text');
    if (textEl) {
        textEl.setAttribute('color', '#00FF00');
    }
    
    // Change background to green
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
                } else {
                    console.log("Letter element not found for index:", i);
                    updateDebug(`Letter ${i} not found`);
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
