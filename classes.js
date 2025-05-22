// Class System for Athazagoraphobia
console.log("Classes.js loaded successfully!");

// Main class system object
const classSystem = {
    // Current active class
    activeClass: null,
    
    // Class-specific state
    state: {
        // Bow class state
        bow: {
            critChance: 0.2,           // Base 20% crit chance
            critMultiplier: 1.5,        // Crit damage multiplier
            shotStyle: null,            // Current selected shot style
            godlySightActive: false,    // Passive 2 activation state
            ultimateCharge: 0,          // Ultimate charge (0-100)
            ultimateReady: false        // Whether ultimate is ready to use
        },
        
        // Sword class state (placeholder)
        sword: {
            // Will be implemented later
        },
        
        // Staff class state (placeholder)
        staff: {
            // Will be implemented later
        },
        
        // Daggers class state (placeholder)
        daggers: {
            // Will be implemented later
        }
    },
    
    // Shot styles for bow class
    bowShotStyles: {
        quickDraw: {
            name: "Quick Draw",
            description: "All cards -1 focus cost (except ones that already cost 1), but -20% damage and 0% crit chance",
            focusCostReduction: 1,
            damageMultiplier: 0.8,
            critChance: 0,
            color: "#3498db" // Blue
        },
        steadyAim: {
            name: "Steady Aim",
            description: "Crit chance becomes 50%",
            focusCostReduction: 0,
            damageMultiplier: 1.0,
            critChance: 0.5,
            color: "#2ecc71" // Green
        },
        spray: {
            name: "Spray",
            description: "75% initial damage, then the same move gets played a second time for 20% damage",
            focusCostReduction: 0,
            damageMultiplier: 0.75,
            secondaryAttack: 0.2,
            critChance: 0.2, // Maintains default crit chance
            color: "#e74c3c" // Red
        },
        perfection: {
            name: "Perfection",
            description: "100% crit, +20% damage, but double the focus cost",
            focusCostReduction: 0,
            focusCostMultiplier: 2.0,
            damageMultiplier: 1.2,
            critChance: 1.0,
            color: "#f39c12" // Orange
        }
    },
    
    // Initialize the class system
    initialize: function(className) {
        console.log(`Initializing class system with class: ${className}`);
        
        if (!className || !['sword', 'staff', 'bow', 'daggers'].includes(className.toLowerCase())) {
            console.error(`Invalid class name: ${className}`);
            return false;
        }
        
        this.activeClass = className.toLowerCase();
        
        // Reset class-specific state
        if (this.activeClass === 'bow') {
            this.state.bow = {
                critChance: 0.2,
                critMultiplier: 1.5,
                shotStyle: null,
                godlySightActive: false,
                ultimateCharge: 0,
                ultimateReady: false
            };
        }
        
        // Add class-specific UI elements
        this.createClassUI();
        
        // Create and position the ultimate bar
        if (this.activeClass === 'bow') {
            this.createUltimateBar();
        }
        
        // Add event listeners for class abilities
        this.setupClassEventListeners();
        
        console.log(`Class ${this.activeClass} initialized successfully`);
        return true;
    },

    
    // Create class-specific UI elements
    createClassUI: function() {
        console.log(`Creating UI for class: ${this.activeClass}`);
        
        // Clear any existing class UI
        const existingUI = document.getElementById('class-abilities-container');
        if (existingUI) {
            existingUI.remove();
        }
        
        // Create container for class abilities
        const container = document.createElement('div');
        container.id = 'class-abilities-container';
        
        // Add class-specific UI based on active class
        switch (this.activeClass) {
            case 'bow':
                this.createBowUI(container);
                break;
            case 'sword':
                // Placeholder for sword UI
                container.innerHTML = '<div class="placeholder">Sword abilities coming soon</div>';
                break;
            case 'staff':
                // Placeholder for staff UI
                container.innerHTML = '<div class="placeholder">Staff abilities coming soon</div>';
                break;
            case 'daggers':
                // Placeholder for daggers UI
                container.innerHTML = '<div class="placeholder">Daggers abilities coming soon</div>';
                break;
        }
        
        // Add the container to the player area
        const playerArea = document.getElementById('player-area');
        if (playerArea) {
            // Insert the class UI container at the beginning of the player area
            playerArea.insertBefore(container, playerArea.firstChild);
        } else {
            console.error('Player area not found in the DOM');
        }
        
        // Add styles for class UI
        this.addClassUIStyles();
    },
    
    // Create UI for bow class
    createBowUI: function(container) {
        // Create the shot styles section
        const shotStylesContainer = document.createElement('div');
        shotStylesContainer.className = 'shot-styles-container';
        
        // Create the shot style slot
        const shotStyleSlot = document.createElement('div');
        shotStyleSlot.id = 'shot-style-slot';
        shotStyleSlot.className = 'shot-style-slot';
        shotStyleSlot.innerHTML = '<span>Empty</span>';
        
        // Create the shot style options
        const shotStyleOptions = document.createElement('div');
        shotStyleOptions.className = 'shot-style-options';
        
        // Add each shot style as an option
        const styles = Object.keys(this.bowShotStyles);
        styles.forEach((styleId, index) => {
            const style = this.bowShotStyles[styleId];
            const angle = (index / styles.length) * 2 * Math.PI;
            const radius = 80;
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const option = document.createElement('div');
            option.className = 'shot-style-option';
            option.style.backgroundColor = style.color;
            option.style.setProperty('--x', `${x}px`);
            option.style.setProperty('--y', `${y}px`);
            option.style.transform = `translate(${x}px, ${y}px)`;
            option.innerHTML = `<span>${style.name}</span>`;
            
            // Add click handler
            option.addEventListener('click', () => {
                this.selectShotStyle(styleId);
            });
            
            shotStyleOptions.appendChild(option);
        });
        
        // Add shot style elements to container
        shotStylesContainer.appendChild(shotStyleSlot);
        shotStylesContainer.appendChild(shotStyleOptions);
        
        // Add the shot styles container to the main container
        container.appendChild(shotStylesContainer);
        
        // Create current style indicator (moved below the shot style container)
        const currentStyleIndicator = document.createElement('div');
        currentStyleIndicator.id = 'current-shot-style';
        currentStyleIndicator.className = 'current-shot-style';
        currentStyleIndicator.textContent = 'Current Style: None';
        container.appendChild(currentStyleIndicator);
        
        // Create passive indicators section
        const passiveContainer = document.createElement('div');
        passiveContainer.className = 'passive-container';
        
        // Critical Eye passive
        const criticalEyeIndicator = document.createElement('div');
        criticalEyeIndicator.className = 'passive-indicator critical-eye';
        criticalEyeIndicator.innerHTML = `
            <span class="passive-icon">👁️</span>
            <span class="passive-name">Critical Eye</span>
            <span class="passive-status">(Active)</span>
        `;
        
        // Godly Sight passive (initially hidden)
        const godlySightIndicator = document.createElement('div');
        godlySightIndicator.className = 'passive-indicator godly-sight';
        godlySightIndicator.style.display = 'none';
        godlySightIndicator.innerHTML = `
            <span class="passive-icon">✨</span>
            <span class="passive-name">Godly Sight</span>
            <span class="passive-status">(Inactive)</span>
        `;
        
        // Add passives to container
        passiveContainer.appendChild(criticalEyeIndicator);
        passiveContainer.appendChild(godlySightIndicator);
        container.appendChild(passiveContainer);
        
        // Update the UI to reflect the current state
        this.updateUltimateUI();
    },
    
    // Set up event listeners for class abilities
    setupClassEventListeners: function() {
        console.log(`Setting up event listeners for class: ${this.activeClass}`);
        
        if (this.activeClass === 'bow') {
            // Shot styles button
            const shotStylesButton = document.getElementById('shot-styles-button');
            if (shotStylesButton) {
                shotStylesButton.addEventListener('click', () => {
                    this.toggleShotStylesSelector();
                });
            }
            
            // Shot style options
            const shotStyleOptions = document.querySelectorAll('.shot-style-option');
            shotStyleOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const style = e.currentTarget.dataset.style;
                    this.selectShotStyle(style, e.currentTarget);
                });
            });
            
            // Shot style slot (for clearing)
            const shotStyleSlot = document.getElementById('shot-style-slot');
            if (shotStyleSlot) {
                shotStyleSlot.addEventListener('click', () => {
                    this.clearShotStyle();
                });
            }
            
            // Ultimate button
            const ultimateButton = document.getElementById('ultimate-button');
            if (ultimateButton) {
                ultimateButton.addEventListener('click', () => {
                    this.activateUltimate();
                });
            }
        }
    },
    
    // Toggle shot styles selector visibility
    toggleShotStylesSelector: function() {
        const selector = document.getElementById('shot-styles-selector');
        if (selector) {
            selector.classList.toggle('hidden');
        }
    },
    
    // Select a shot style
selectShotStyle: function(styleId) {
    // If the same style is already selected, unselect it
    if (this.state.bow.shotStyle === styleId) {
        this.unselectShotStyle();
        return;
    }
    
    // Get the style object
    const style = this.bowShotStyles[styleId];
    if (!style) {
        console.error(`Shot style ${styleId} not found`);
        return;
    }
    
    // If another style was previously selected, remove its focus cost first
    if (this.state.bow.shotStyle) {
        const previousStyle = this.bowShotStyles[this.state.bow.shotStyle];
        if (previousStyle && previousStyle.focusCost) {
            // No need to update the total focus cost here, we'll set it correctly below
        }
    }
    
    // Set the new style
    this.state.bow.shotStyle = styleId;
    
    // Update the UI
    const slot = document.getElementById('shot-style-slot');
    if (slot) {
        slot.innerHTML = `
            <div class="slotted-style" style="background-color: ${style.color}">
                <span>${style.name}</span>
            </div>
        `;
        slot.classList.add('filled');
    }
    
    const currentStyleIndicator = document.getElementById('current-shot-style');
    if (currentStyleIndicator) {
        currentStyleIndicator.innerHTML = `Current Style: ${style.name}`;
        currentStyleIndicator.style.color = style.color;
    }
    
    console.log(`Selected shot style: ${style.name}`);
},
    
    // Clear the selected shot style
    clearShotStyle: function() {
        console.log('Clearing shot style');
        
        const slot = document.getElementById('shot-style-slot');
        if (slot) {
            slot.innerHTML = '<span>Empty</span>';
            slot.classList.remove('filled');
        }
        
        // Update the current style indicator
        const currentStyleIndicator = document.getElementById('current-shot-style');
        if (currentStyleIndicator) {
            currentStyleIndicator.innerHTML = 'Current Style: None';
            currentStyleIndicator.style.color = '';
        }
        
        // If we had a style selected, reduce the focus cost
        if (this.state.bow.shotStyle) {
            combatState.totalFocusCost -= 1;
            updateFocusCostDisplay();
        }
        
        // Clear the stored style
        this.state.bow.shotStyle = null;
    },
    
    // Apply class-specific card modifications
    modifyCardEffect: function(card, damage) {
        if (!this.activeClass) return damage;
        
        let result = { damage: damage, isCrit: false };
        
        switch (this.activeClass) {
            case 'bow':
                result = this.applyBowEffects(card, damage);
                break;
            // Other classes will be implemented later
        }
        
        return result.damage; // Still return just the damage for compatibility
    },
    
    // Apply bow-specific effects to damage
    applyBowEffects: function(card, damage) {
        let finalDamage = damage;
        let isCrit = false;
        let appliedStyle = null;
        
        // Get the current shot style if any
        const shotStyle = this.state.bow.shotStyle ? this.bowShotStyles[this.state.bow.shotStyle] : null;
        
        // Apply shot style effects if one is selected
        if (shotStyle) {
            appliedStyle = shotStyle.name;
            
            // Apply damage multiplier from the style
            finalDamage = Math.floor(finalDamage * shotStyle.damageMultiplier);
            
            // Determine crit chance based on style
            const critChance = shotStyle.critChance !== undefined ? shotStyle.critChance : this.state.bow.critChance;
            
            // Check for critical hit
            isCrit = Math.random() < critChance;
            
            // Apply critical hit multiplier if applicable
            if (isCrit) {
                finalDamage = Math.floor(finalDamage * this.state.bow.critMultiplier);
                
                // Add ultimate charge for crits (5% per crit)
                this.addUltimateCharge(5);
            }
        } else {
            // No shot style selected, use default crit chance
            // Check for critical hit using base crit chance
            isCrit = Math.random() < this.state.bow.critChance;
            
            // Apply critical hit multiplier if applicable
            if (isCrit) {
                finalDamage = Math.floor(finalDamage * this.state.bow.critChance);
                
                // Add ultimate charge for crits (5% per crit)
                this.addUltimateCharge(5);
            }
        }
        
        // Apply Godly Sight effect if active (implementation will be added later)
        if (this.state.bow.godlySightActive) {
            // For now, just log that it's active
            console.log("Godly Sight is active, additional effects would apply here");
        }
        
        // Log the damage calculation
        if (isCrit) {
            console.log(`BOW CRITICAL HIT! Base damage: ${damage}, Final damage: ${finalDamage}, Style: ${appliedStyle || 'None'}`);
            displayCombatMessage(`CRITICAL HIT! ${finalDamage} damage!`);
        } else {
            console.log(`Bow attack: Base damage: ${damage}, Final damage: ${finalDamage}, Style: ${appliedStyle || 'None'}`);
        }
        
        // Return an object with damage and crit information
        return {
            damage: finalDamage,
            isCrit: isCrit,
            style: appliedStyle
        };
    },

    // Check if we should apply secondary attack (for Spray shot style)
    shouldApplySecondaryAttack: function() {
        if (this.activeClass !== 'bow') return false;
        
        const shotStyle = this.state.bow.shotStyle ? this.bowShotStyles[this.state.bow.shotStyle] : null;
        return shotStyle && shotStyle.secondaryAttack !== undefined;
    },
    
    // Get secondary attack multiplier
    getSecondaryAttackMultiplier: function() {
        if (this.activeClass !== 'bow') return 0;
        
        const shotStyle = this.state.bow.shotStyle ? this.bowShotStyles[this.state.bow.shotStyle] : null;
        return shotStyle && shotStyle.secondaryAttack !== undefined ? shotStyle.secondaryAttack : 0;
    },
    
    // Add ultimate charge
    addUltimateCharge: function(amount) {
        if (this.activeClass !== 'bow') return;
        
        this.state.bow.ultimateCharge = Math.min(100, this.state.bow.ultimateCharge + amount);
        
        // Update the UI
        this.updateUltimateUI();
        
        // Check if ultimate is ready
        if (this.state.bow.ultimateCharge >= 100 && !this.state.bow.ultimateReady) {
            this.state.bow.ultimateReady = true;
            
            // Enable the ultimate button
            const ultimateButton = document.getElementById('ultimate-button');
            if (ultimateButton) {
                ultimateButton.disabled = false;
            }
            
            displayCombatMessage("Ultimate ability ready!");
        }
    },
    
    // Update ultimate UI
    updateUltimateUI: function() {
        if (this.activeClass !== 'bow') return;
        
        const ultimateFill = document.querySelector('.ultimate-bar-fill');
        const ultimateText = document.querySelector('.ultimate-text');
        
        if (ultimateFill && ultimateText) {
            ultimateFill.style.width = `${this.state.bow.ultimateCharge}%`;
            ultimateText.textContent = `Ultimate: ${this.state.bow.ultimateCharge}%`;
        }
    },
    
    // Activate ultimate ability
    activateUltimate: function() {
        if (this.activeClass !== 'bow' || !this.state.bow.ultimateReady) return;
        
        console.log("Activating bow ultimate ability!");
        
        // Set the ultimate damage multiplier for the next attack
        combatState.playerDamageBoost = 5.0; // 500% damage
        combatState.playerDamageBoostDuration = 1; // Only for the next attack
        
        // Reset ultimate charge
        this.state.bow.ultimateCharge = 0;
        this.state.bow.ultimateReady = false;
        
        // Update UI
        this.updateUltimateUI();
        
        // Disable the ultimate button
        const ultimateButton = document.getElementById('ultimate-button');
        if (ultimateButton) {
            ultimateButton.disabled = true;
        }
        
        displayCombatMessage("ULTIMATE ACTIVATED! Next attack deals 500% damage!");
    },

    // Create and position the ultimate bar
    createUltimateBar: function() {
        // Create ultimate bar
        const ultimateContainer = document.createElement('div');
        ultimateContainer.className = 'ultimate-container';
        ultimateContainer.innerHTML = `
            <div class="ultimate-bar-container">
                <div class="ultimate-bar-fill" style="width: 0%"></div>
                <div class="ultimate-text">Ultimate: 0%</div>
            </div>
            <button id="ultimate-button" class="ultimate-button" disabled>ULTIMATE</button>
        `;
        
        // Add event listener for ultimate button
        ultimateContainer.querySelector('#ultimate-button').addEventListener('click', () => {
            this.activateUltimate();
        });
        
        // Find the player hand element to insert the ultimate bar after it
        const playerHand = document.getElementById('player-hand');
        if (playerHand) {
            // Insert after player hand
            if (playerHand.nextSibling) {
                playerHand.parentNode.insertBefore(ultimateContainer, playerHand.nextSibling);
            } else {
                playerHand.parentNode.appendChild(ultimateContainer);
            }
        } else {
            // If player hand not found, add to the player area
            const playerArea = document.getElementById('player-area');
            if (playerArea) {
                playerArea.appendChild(ultimateContainer);
            }
        }
        
        return ultimateContainer;
    },

    // Check and activate Godly Sight if health is below threshold
    checkGodlySight: function() {
        if (this.activeClass !== 'bow') return;
        
        // Check if health is below 10%
        const healthPercentage = (combatState.playerHealth / combatState.playerMaxHealth) * 100;
        
        if (healthPercentage <= 10 && !this.state.bow.godlySightActive) {
            // Activate Godly Sight
            this.state.bow.godlySightActive = true;
            
            // Update UI
            const godlySightIndicator = document.querySelector('.godly-sight');
            if (godlySightIndicator) {
                godlySightIndicator.classList.add('active');
                const statusSpan = godlySightIndicator.querySelector('.passive-status');
                if (statusSpan) {
                    statusSpan.textContent = '(Active)';
                }
            }
            
            displayCombatMessage("Godly Sight activated! Your vision sharpens as death approaches...");
        }
    },
    
    // Apply focus cost modifications based on class and abilities
    modifyFocusCost: function(card, cost) {
        if (!this.activeClass) return cost;
        
        let modifiedCost = cost;
        
        switch (this.activeClass) {
            case 'bow':
                // Check if Quick Draw is active
                if (this.state.bow.shotStyle === 'quickDraw') {
                    // Reduce focus cost by 1, but not below 1
                    modifiedCost = Math.max(1, cost - 1);
                }
                // Check if Perfection is active
                else if (this.state.bow.shotStyle === 'perfection') {
                    // Double the focus cost
                    modifiedCost = cost * 2;
                }
                break;
            // Other classes will be implemented later
        }
        
        return modifiedCost;
    },
    
    // Process end of turn class-specific effects
    processTurnEnd: function() {
        if (!this.activeClass) return;
        
        switch (this.activeClass) {
            case 'bow':
                // Clear shot style after turn ends
                this.state.bow.shotStyle = null;
                
                // Update UI to reflect cleared style
                const slot = document.getElementById('shot-style-slot');
                if (slot) {
                    slot.innerHTML = '<span>Empty</span>';
                    slot.classList.remove('filled');
                }
                
                const currentStyleIndicator = document.getElementById('current-shot-style');
                if (currentStyleIndicator) {
                    currentStyleIndicator.innerHTML = 'Current Style: None';
                    currentStyleIndicator.style.color = '';
                }
                break;
            // Other classes will be implemented later
        }
    },
    
    // Add CSS styles for class UI
    addClassUIStyles: function() {
        // Check if styles already exist
        if (document.getElementById('class-ui-styles')) {
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'class-ui-styles';
        
        // Add CSS rules
        style.textContent = `
            #class-abilities-container {
                margin-bottom: 10px;
                padding: 8px;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
            }
            
            /* Make health and focus bars wider */
            .health-bar, .focus-bar {
                width: 100%;
                margin: 5px 0;
            }
            
            .ultimate-container {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 10px;
                margin-bottom: 10px;
                width: 100%;
            }
            
            .ultimate-bar-container {
                flex-grow: 1;
                height: 20px;
                background-color: #333;
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            }
            
            .ultimate-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #9b59b6, #8e44ad);
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .ultimate-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
            }
            
            .ultimate-button {
                background-color: #8e44ad;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .ultimate-button:disabled {
                background-color: #555;
                cursor: not-allowed;
                opacity: 0.7;
            }
            
            .ultimate-button:not(:disabled):hover {
                background-color: #9b59b6;
                transform: scale(1.05);
            }
            
            .passive-container {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                position: absolute;
                right: 20px;
                top: 5px;
            }
            
            .passive-indicator {
                display: flex;
                align-items: center;
                gap: 5px;
                background-color: rgba(255, 255, 255, 0.1);
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
            }
            
            .passive-icon {
                font-size: 16px;
            }
            
            .passive-name {
                font-weight: bold;
            }
            
            .passive-status {
                color: #e74c3c;
                font-style: italic;
            }
            
            .godly-sight.active .passive-status {
                color: #2ecc71;
            }
            
            .shot-styles-container {
                position: relative;
                width: 180px;
                height: 180px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .shot-style-slot {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.1);
                border: 2px dashed rgba(255, 255, 255, 0.3);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .shot-style-slot.filled {
                border: 2px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            }
            
            .shot-style-slot span {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                text-align: center;
            }
            
            .shot-style-options {
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .shot-style-option {
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 5;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            }
            
            .shot-style-option:hover {
                transform: scale(1.2) translate(var(--x), var(--y));
                z-index: 20;
            }
            
            .shot-style-option span {
                color: white;
                font-size: 10px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
                text-align: center;
            }
            
            .slotted-style {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .slotted-style span {
                color: white !important;
                font-size: 10px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
            }
            
            .current-shot-style {
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                margin-top: 5px;
                transition: color 0.3s ease;
            }
        `;
        
        // Add the style to document head
        document.head.appendChild(style);
    }
};

// Hook into the combat system to initialize class
function initializeClassForCombat(fight) {
    if (!fight || !fight.player || !fight.player.class) {
        console.error("No class specified in fight configuration");
        return;
    }
    
    // Initialize the class system with the specified class
    classSystem.initialize(fight.player.class);
}

// Modify the original applyCardEffect function to include class effects
const originalApplyCardEffect = window.applyCardEffect;
if (typeof originalApplyCardEffect === 'function') {
    window.applyCardEffect = function(card, source) {
        // Call the original function to get the base damage
        const baseDamage = originalApplyCardEffect(card, source);
        
        // If this is a player attack card, apply class-specific modifications
        if (source === 'player' && card.type === 'attack') {
            return classSystem.modifyCardEffect(card, baseDamage);
        }
        
        // For enemy attacks or non-attack cards, return the original result
        return baseDamage;
    };
}

// Modify the focus cost calculation to include class effects
function getModifiedFocusCost(card) {
    if (!card) return 0;
    
    // Get the base focus cost
    const baseCost = card.focus_cost || 0;
    
    // Apply class-specific modifications
    return classSystem.modifyFocusCost(card, baseCost);
}

// Hook into the end turn function to process class-specific effects
const originalEndPlayerTurn = window.endPlayerTurn;
if (typeof originalEndPlayerTurn === 'function') {
    window.endPlayerTurn = function() {
        // Process class-specific end of turn effects
        classSystem.processTurnEnd();
        
        // Call the original function
        originalEndPlayerTurn();
    };
}

// Hook into the player health update to check for Godly Sight activation
const originalUpdatePlayerHealth = window.updatePlayerHealth;
if (typeof originalUpdatePlayerHealth === 'function') {
    window.updatePlayerHealth = function() {
        // Call the original function
        originalUpdatePlayerHealth();
        
        // Check if Godly Sight should activate
        classSystem.checkGodlySight();
    };
}

// Hook into the combat initialization to set up the class
const originalInitiateCombat = window.initiateCombat;
if (typeof originalInitiateCombat === 'function') {
    window.initiateCombat = function(fight) {
        // Call the original function
        originalInitiateCombat(fight);
        
        // Initialize the class system
        initializeClassForCombat(fight);
    };
}

// Export the class system for use in other modules
window.classSystem = classSystem;

