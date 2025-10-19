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

// Create letters after initialization
setTimeout(() => {
    createLetters();
}, 3000);

function createLetters() {
    console.log("Creating letters for mobile AR...");
    
    if (!lettersContainer) {
        console.error("Letters container not found!");
        return;
    }
    
    // Create letters positioned for mobile AR experience
    for (let i = 0; i < targetWord.length; i++) {
        const letter = targetWord[i];
        console.log("Creating letter:", letter);
        
        const entity = document.createElement("a-entity");
        
        // Position letters in a more mobile-friendly layout
        // Spread them around so users can discover them by moving their phone
        const positions = [
            { x: -2, y: 1, z: -3 },   // B - Left
            { x: 0, y: 2, z: -4 },    // I - Center high
            { x: 2, y: 0.5, z: -2 }, // K - Right low  
            { x: -1, y: 1.5, z: -5 } // E - Left back
        ];
        
        const pos = positions[i];
        entity.setAttribute("position", `${pos.x} ${pos.y} ${pos.z}`);
        
        // Larger letters for mobile viewing
        entity.setAttribute("text", {
            value: letter,
            color: "#FFD700",
            align: "center",
            width: 10,
            shader: "msdf",
            font: "roboto"
        });
        
        // Dark background for contrast
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
        
        // Floating animation
        entity.setAttribute("animation", {
            property: "position",
            dir: "alternate",
            dur: 3000 + (i * 200),
            easing: "easeInOutSine",
            loop: true,
            to: `${pos.x} ${pos.y + 0.3} ${pos.z}`
        });
        
        // Letter data for interaction
        entity.setAttribute("data-letter", letter);
        entity.setAttribute("data-index", i);
        entity.setAttribute("cursor-listener", "");
        
        // Make letters more visible with glow effect
        entity.setAttribute("material", {
            color: "#222222",
            opacity: 0.9,
            transparent: true,
            shader: "flat"
        });
        
        lettersContainer.appendChild(entity);
        console.log(`Letter ${letter} positioned at: ${pos.x}, ${pos.y}, ${pos.z}`);
    }
    
    console.log("Created", lettersContainer.children.length, "letters");
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
    console.log("Capturing letter:", letter);
    
    if (captured.includes(index)) {
        console.log("Already captured");
        return;
    }
    
    captured.push(index);
    
    // Enhanced mobile feedback
    element.setAttribute("animation__capture", {
        property: "scale",
        dur: 1000,
        to: "3 3 3",
        easing: "easeOutBounce"
    });
    
    // Change to green
    element.setAttribute("text", {
        value: letter,
        color: "#00FF00",
        align: "center",
        width: 10,
        shader: "msdf",
        font: "roboto"
    });
    
    element.setAttribute('material', 'color', '#004400');
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    setTimeout(() => {
        element.remove();
        checkProgress();
    }, 2000);
}

// Capture button with mobile optimization
const captureButton = document.getElementById("captureButton");
if (captureButton) {
    captureButton.addEventListener("click", () => {
        console.log("Capture button clicked");
        
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
    
    // Prevent double-tap zoom on mobile
    captureButton.addEventListener('touchend', function(e) {
        e.preventDefault();
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

console.log("Mobile AR script loaded successfully");
