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
            shotStyle: null,            // Current selected and locked shot style
            pendingShotStyle: null,     // Selected but not locked shot style
            shotStyleLocked: false,     // Whether the shot style is locked in
            godlySightActive: false,    // Passive 2 activation state
            ultimateCharge: 0,          // Ultimate charge (0-100)
            ultimateReady: false        // Whether ultimate is ready to use
        },
        
        // Add sword class state
        sword: {
            stance: null,               // Current selected stance
            pendingStance: null,        // Selected but not locked stance
            stanceLocked: false,        // Whether the stance is locked in
            passiveActive: false,       // Passive 1 activation state (below 60% health)
            finalStandActive: false,    // Passive 2 activation state (below 10% health)
            ultimateCharge: 0,          // Ultimate charge (0-100)
            ultimateReady: false        // Whether ultimate is ready to use
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

    // Sword stances
    swordStances: {
        defensive: {
            name: "Defensive",
            description: "Reduce incoming damage by 30%, but deal 20% less damage",
            damageDealtMultiplier: 0.8,
            damageTakenMultiplier: 0.7,
            color: "#3498db" // Blue
        },
        aggressive: {
            name: "Aggressive",
            description: "Deal 30% more damage, but take 20% more damage",
            damageDealtMultiplier: 1.3,
            damageTakenMultiplier: 1.2,
            color: "#e74c3c" // Red
        },
        reckless: {
            name: "Reckless",
            description: "Deal 50% more damage, but take 50% more damage",
            damageDealtMultiplier: 1.5,
            damageTakenMultiplier: 1.5,
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
                pendingShotStyle: null,
                shotStyleLocked: false,
                godlySightActive: false,
                ultimateCharge: 0,
                ultimateReady: false
            };
        } else if (this.activeClass === 'sword') {
            this.state.sword = {
                stance: null,
                pendingStance: null,
                stanceLocked: false,
                passiveActive: false,
                finalStandActive: false,
                ultimateCharge: 0,
                ultimateReady: false
            };
        }
        
        // Add class-specific UI elements
        this.createClassUI();
        
        // Create and position the ultimate bar
        this.createUltimateBar();
        
        // Add event listeners for class abilities
        this.setupClassEventListeners();
        
        console.log(`Class ${this.activeClass} initialized successfully`);
        return true;
    },

    // yay
    createClassUI: function() {
        console.log(`Creating UI for class: ${this.activeClass}`);
        
        // Add the class UI styles first
        this.addClassUIStyles();
        
        // Create the upper controls layout first
        const upperControls = this.reorganizePlayerControls();
        
        // Create class-specific UI based on active class
        switch (this.activeClass) {
            case 'bow':
                this.createBowUI();
                break;
            case 'sword':
                this.createSwordUI();
                break;
            case 'staff':
                // Will be implemented later
                console.log('Staff UI not yet implemented');
                break;
            case 'daggers':
                // Will be implemented later
                console.log('Daggers UI not yet implemented');
                break;
            default:
                console.error(`No UI implementation for class: ${this.activeClass}`);
        }
    },

    // Add a new method to reorganize player controls
    reorganizePlayerControls: function() {
        // Create the upper controls container
        const upperControls = document.createElement('div');
        upperControls.id = 'upper-controls';
        upperControls.className = 'upper-controls';
        
        // Create left, center, and right sections for upper controls
        const leftSection = document.createElement('div');
        leftSection.className = 'upper-left-section';
        
        const centerSection = document.createElement('div');
        centerSection.className = 'upper-center-section';
        
        const rightSection = document.createElement('div');
        rightSection.className = 'upper-right-section';
        
        // Add the sections to the upper controls
        upperControls.appendChild(leftSection);
        upperControls.appendChild(centerSection);
        upperControls.appendChild(rightSection);
        
        // Find the end turn button and focus cost display
        const endTurnBtn = document.getElementById('end-turn-btn');
        const focusCostDisplay = document.getElementById('focus-cost-display');
        
        // If they exist, move them to the center section
        if (endTurnBtn) {
            centerSection.appendChild(endTurnBtn);
        }
        
        if (focusCostDisplay) {
            centerSection.appendChild(focusCostDisplay);
        }
        
        // Find the player info (health bar, etc.)
        const playerInfo = document.querySelector('.player-info');
        if (playerInfo) {
            // Insert upper controls before player info
            playerInfo.parentNode.insertBefore(upperControls, playerInfo);
        }
        
        return upperControls;
    },
    
    // Create UI for bow class
    createBowUI: function() {
        // Create shot styles selector for the left side
        const leftSection = document.querySelector('.upper-left-section');
        if (leftSection) {
            // Create shot styles container
            const shotStylesContainer = document.createElement('div');
            shotStylesContainer.className = 'active-ability-container shot-styles-container';
            
            // Add instruction text above the slot container
            const instructionText = document.createElement('div');
            instructionText.className = 'ability-instruction';
            instructionText.textContent = '(Right Click the Slot to lock in your choice.)';
            
            // Create the main slot container (for slot and options)
            const slotContainer = document.createElement('div');
            slotContainer.className = 'ability-slot-container';
            
            // Create the shot style slot
            const shotStyleSlot = document.createElement('div');
            shotStyleSlot.id = 'shot-style-slot';
            shotStyleSlot.className = 'ability-slot';
            shotStyleSlot.innerHTML = '<span>Empty</span>';
            
            // Create the shot style options
            const shotStyleOptions = document.createElement('div');
            shotStyleOptions.className = 'ability-options';
            
            // Add each shot style as an option
            const shotStyles = Object.keys(this.bowShotStyles);
            shotStyles.forEach((styleId, index) => {
                const style = this.bowShotStyles[styleId];
                // Start from the top (270 degrees or -90 degrees in radians)
                const angle = ((index / shotStyles.length) * 2 * Math.PI) - (Math.PI / 2);
                const radius = 70; // Distance from center
                
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const option = document.createElement('div');
                option.className = 'ability-option';
                option.style.backgroundColor = style.color;
                option.style.setProperty('--x', `${x}px`);
                option.style.setProperty('--y', `${y}px`);
                option.style.transform = `translate(${x}px, ${y}px)`;
                option.innerHTML = `<span>${style.name}</span>`;
                option.dataset.style = styleId;
                
                // Add click handler
                option.addEventListener('click', () => {
                    this.selectShotStyle(styleId);
                });
                
                shotStyleOptions.appendChild(option);
            });
            
            // Add slot and options to the slot container
            slotContainer.appendChild(shotStyleSlot);
            slotContainer.appendChild(shotStyleOptions);
            
            // Create text container for shot style info
            const styleTextContainer = document.createElement('div');
            styleTextContainer.className = 'ability-text-container';
            
            // Create current style indicator
            const currentStyleIndicator = document.createElement('div');
            currentStyleIndicator.id = 'current-shot-style';
            currentStyleIndicator.className = 'current-ability';
            currentStyleIndicator.textContent = 'Current Style: None';
            
            // Create style description element
            const styleDescription = document.createElement('div');
            styleDescription.id = 'shot-style-description';
            styleDescription.className = 'ability-description';
            styleDescription.textContent = '';
            
            // Add text elements to the text container
            styleTextContainer.appendChild(currentStyleIndicator);
            styleTextContainer.appendChild(styleDescription);
            
            // Add instruction text first, then slot container, then text container
            shotStylesContainer.appendChild(instructionText);
            shotStylesContainer.appendChild(slotContainer);
            shotStylesContainer.appendChild(styleTextContainer);
            
            // Add to left section
            leftSection.appendChild(shotStylesContainer);
        }
        
        // Create passive indicators for the right side
        const rightSection = document.querySelector('.upper-right-section');
        if (rightSection) {
            // Eagle Eye passive (Passive 1)
            const eagleEyeIndicator = document.createElement('div');
            eagleEyeIndicator.className = 'passive-indicator eagle-eye';
            eagleEyeIndicator.innerHTML = `
                <span class="passive-icon">🦅</span>
                <span class="passive-name">Eagle Eye</span>
            `;
            
            // Godly Sight passive (Passive 2, initially hidden)
            const godlySightIndicator = document.createElement('div');
            godlySightIndicator.className = 'passive-indicator godly-sight';
            godlySightIndicator.style.display = 'none';
            godlySightIndicator.innerHTML = `
                <span class="passive-icon">👁️</span>
                <span class="passive-name">Godly Sight</span>
            `;
            
            // Add passives to right section
            rightSection.appendChild(eagleEyeIndicator);
            rightSection.appendChild(godlySightIndicator);
        }
    },

    // Create UI for sword class
    createSwordUI: function() {
        // Create stance selector for the left side
        const leftSection = document.querySelector('.upper-left-section');
        if (leftSection) {
            // Create stances container
            const stancesContainer = document.createElement('div');
            stancesContainer.className = 'active-ability-container stances-container';
            
            // Add instruction text above the slot container
            const instructionText = document.createElement('div');
            instructionText.className = 'ability-instruction';
            instructionText.textContent = '(Right Click the Slot to lock in your choice.)';
            
            // Create the main slot container (for slot and options)
            const slotContainer = document.createElement('div');
            slotContainer.className = 'ability-slot-container';
            
            // Create the stance slot
            const stanceSlot = document.createElement('div');
            stanceSlot.id = 'stance-slot';
            stanceSlot.className = 'ability-slot';
            stanceSlot.innerHTML = '<span>Empty</span>';
            
            // Create the stance options
            const stanceOptions = document.createElement('div');
            stanceOptions.className = 'ability-options';
            
            // Add each stance as an option
            const stances = Object.keys(this.swordStances);
            stances.forEach((stanceId, index) => {
                const stance = this.swordStances[stanceId];
                // Start from the top (270 degrees or -90 degrees in radians)
                // For odd number of options, this ensures the first one is at the top
                const angle = ((index / stances.length) * 2 * Math.PI) - (Math.PI / 2);
                const radius = 70; // Distance from center
                
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const option = document.createElement('div');
                option.className = 'ability-option';
                option.style.backgroundColor = stance.color;
                option.style.setProperty('--x', `${x}px`);
                option.style.setProperty('--y', `${y}px`);
                option.style.transform = `translate(${x}px, ${y}px)`;
                option.innerHTML = `<span>${stance.name}</span>`;
                option.dataset.stance = stanceId;
                
                // Add click handler
                option.addEventListener('click', () => {
                    this.selectStance(stanceId);
                });
                
                stanceOptions.appendChild(option);
            });
            
            // Add slot and options to the slot container
            slotContainer.appendChild(stanceSlot);
            slotContainer.appendChild(stanceOptions);
            
            // Create text container for stance info
            const stanceTextContainer = document.createElement('div');
            stanceTextContainer.className = 'ability-text-container';
            
            // Create current stance indicator
            const currentStanceIndicator = document.createElement('div');
            currentStanceIndicator.id = 'current-stance';
            currentStanceIndicator.className = 'current-ability';
            currentStanceIndicator.textContent = 'Current Stance: None';
            
            // Create stance description element
            const stanceDescription = document.createElement('div');
            stanceDescription.id = 'stance-description';
            stanceDescription.className = 'ability-description';
            stanceDescription.textContent = '';
            
            // Add text elements to the text container
            stanceTextContainer.appendChild(currentStanceIndicator);
            stanceTextContainer.appendChild(stanceDescription);
            
            // Add instruction text first, then slot container, then text container
            stancesContainer.appendChild(instructionText);
            stancesContainer.appendChild(slotContainer);
            stancesContainer.appendChild(stanceTextContainer);
            
            // Add to left section
            leftSection.appendChild(stancesContainer);
        }
        
        // Create passive indicators for the right side
        const rightSection = document.querySelector('.upper-right-section');
        if (rightSection) {
            // Warrior's Resolve passive (Passive 1)
            const warriorsResolveIndicator = document.createElement('div');
            warriorsResolveIndicator.className = 'passive-indicator warriors-resolve';
            warriorsResolveIndicator.innerHTML = `
                <span class="passive-icon">⚔️</span>
                <span class="passive-name">Warrior's Resolve</span>
            `;
            
            // Final Stand passive (Passive 2, initially hidden)
            const finalStandIndicator = document.createElement('div');
            finalStandIndicator.className = 'passive-indicator final-stand';
            finalStandIndicator.style.display = 'none';
            finalStandIndicator.innerHTML = `
                <span class="passive-icon">🔥</span>
                <span class="passive-name">Final Stand</span>
            `;
            
            // Add passives to right section
            rightSection.appendChild(warriorsResolveIndicator);
            rightSection.appendChild(finalStandIndicator);
        }
    },
    
    // Set up event listeners for class abilities
    setupClassEventListeners: function() {
        console.log(`Setting up event listeners for class: ${this.activeClass}`);
        
        if (this.activeClass === 'bow') {
            // Shot style slot (for clearing with left-click and locking with right-click)
            const shotStyleSlot = document.getElementById('shot-style-slot');
            if (shotStyleSlot) {
                // Left click to clear if not locked
                shotStyleSlot.addEventListener('click', () => {
                    if (!this.state.bow.shotStyleLocked) {
                        this.unselectShotStyle();
                    }
                });
                
                // Right click to lock in
                shotStyleSlot.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // Prevent context menu
                    if (!this.state.bow.shotStyleLocked && this.state.bow.pendingShotStyle) {
                        this.lockShotStyle();
                    }
                    return false;
                });
            }
            
            // Shot style options
            const shotStyleOptions = document.querySelectorAll('.ability-option');
            shotStyleOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const styleId = option.dataset.style;
                    if (styleId) {
                        this.selectShotStyle(styleId);
                    }
                });
            });
            
            // Ultimate button
            const ultimateButton = document.getElementById('ultimate-button');
            if (ultimateButton) {
                ultimateButton.addEventListener('click', () => {
                    this.activateUltimate();
                });
            }
        } else if (this.activeClass === 'sword') {
            // Stance slot (for clearing with left-click and locking with right-click)
            const stanceSlot = document.getElementById('stance-slot');
            if (stanceSlot) {
                // Left click to clear if not locked
                stanceSlot.addEventListener('click', () => {
                    if (!this.state.sword.stanceLocked) {
                        this.unselectStance();
                    }
                });
                
                // Right click to lock in
                stanceSlot.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // Prevent context menu
                    if (!this.state.sword.stanceLocked && this.state.sword.pendingStance) {
                        this.lockStance();
                    }
                    return false;
                });
            }
            
            // Stance options
            const stanceOptions = document.querySelectorAll('.ability-option');
            stanceOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const stanceId = option.dataset.stance;
                    if (stanceId) {
                        this.selectStance(stanceId);
                    }
                });
            });
            
            // Ultimate button
            const ultimateButton = document.getElementById('ultimate-button');
            if (ultimateButton) {
                ultimateButton.addEventListener('click', () => {
                    this.activateSwordUltimate();
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
        if (this.state.bow.pendingShotStyle === styleId && !this.state.bow.shotStyleLocked) {
            this.unselectShotStyle();
            return;
        }
        
        // Cannot change if locked
        if (this.state.bow.shotStyleLocked) {
            console.log("Shot style is locked and cannot be changed");
            return;
        }
        
        // Get the style object
        const style = this.bowShotStyles[styleId];
        if (!style) {
            console.error(`Shot style ${styleId} not found`);
            return;
        }
        
        // Set the pending style
        this.state.bow.pendingShotStyle = styleId;
        
        // Update the UI
        const slot = document.getElementById('shot-style-slot');
        if (slot) {
            slot.innerHTML = `
                <div class="slotted-ability" style="background-color: ${style.color}">
                    <span>${style.name}</span>
                </div>
            `;
            slot.classList.add('filled');
        }
        
        const currentStyleIndicator = document.getElementById('current-shot-style');
        if (currentStyleIndicator) {
            currentStyleIndicator.innerHTML = `Next Style: ${style.name} (Not Locked)`;
            currentStyleIndicator.style.color = style.color;
        }
        
        // Update the style description
        const styleDescription = document.getElementById('shot-style-description');
        if (styleDescription && style.description) {
            styleDescription.textContent = style.description;
            styleDescription.style.color = style.color;
        }
        
        console.log(`Selected shot style: ${style.name} (not locked yet)`);
    },

    lockShotStyle: function() {
        if (!this.state.bow.pendingShotStyle) {
            console.log("No shot style selected to lock");
            return;
        }
        
        if (this.state.bow.shotStyleLocked) {
            console.log("Shot style already locked");
            return;
        }
        
        // Lock the shot style
        this.state.bow.shotStyleLocked = true;
        this.state.bow.shotStyle = this.state.bow.pendingShotStyle;
        
        // Update UI to show locked state
        const slot = document.getElementById('shot-style-slot');
        if (slot) {
            slot.classList.add('ability-locked');
        }
        
        const currentStyleIndicator = document.getElementById('current-shot-style');
        if (currentStyleIndicator) {
            const style = this.bowShotStyles[this.state.bow.shotStyle];
            currentStyleIndicator.innerHTML = `Current Style: ${style.name} (Locked)`;
        }
        
        console.log(`Locked in shot style: ${this.bowShotStyles[this.state.bow.shotStyle].name}`);
    },

    unselectAllCards: function() {
        // Try to find the unselectAllCards function in the global scope
        if (typeof window.unselectAllCards === 'function') {
            window.unselectAllCards();
        } else {
            console.log("Attempting to unselect cards manually");
            
            // Try to manually unselect cards
            const selectedCards = document.querySelectorAll('.card.selected');
            selectedCards.forEach(card => {
                card.classList.remove('selected');
            });
            
            // Reset the combat state selected cards if available
            if (window.combatState) {
                window.combatState.selectedCards = [];
                
                // Update focus cost display if available
                if (typeof window.updateFocusCostDisplay === 'function') {
                    window.combatState.totalFocusCost = 0;
                    window.updateFocusCostDisplay();
                }
            }
        }
    },

    unselectShotStyle: function() {
        // If no style is selected or style is locked, do nothing
        if (!this.state.bow.pendingShotStyle || this.state.bow.shotStyleLocked) {
            return;
        }
        
        // Clear the pending style
        this.state.bow.pendingShotStyle = null;
        
        // Update the UI
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
        
        // Clear the style description
        const styleDescription = document.getElementById('shot-style-description');
        if (styleDescription) {
            styleDescription.textContent = '';
        }
        
        console.log('Shot style unselected');
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
        
        // Clear the style description
        const styleDescription = document.getElementById('shot-style-description');
        if (styleDescription) {
            styleDescription.textContent = '';
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
                console.log("BOW EFFECT RESULT:", result);
                break;
            case 'sword':
                result = this.applySwordEffects(card, damage);
                console.log("SWORD EFFECT RESULT:", result);
                break;
            // Other classes will be implemented later
        }
        
        return result;
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
                const beforeCrit = finalDamage;
                finalDamage = Math.floor(finalDamage * this.state.bow.critMultiplier);
                console.log(`CRITICAL HIT! ${beforeCrit} * ${this.state.bow.critMultiplier} = ${finalDamage}`);
                
                // Add ultimate charge for crits (5% per crit)
                this.addUltimateCharge(5);
            }
        } else {
            // No shot style selected, use default crit chance
            // Check for critical hit using base crit chance
            isCrit = Math.random() < this.state.bow.critChance;
            
            // Apply critical hit multiplier if applicable
            if (isCrit) {
                const beforeCrit = finalDamage;
                finalDamage = Math.floor(finalDamage * this.state.bow.critMultiplier);
                console.log(`CRITICAL HIT! ${beforeCrit} * ${this.state.bow.critMultiplier} = ${finalDamage}`);
                
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
        } else {
            console.log(`Bow attack: Base damage: ${damage}, Final damage: ${finalDamage}, Style: ${appliedStyle || 'None'}`);
        }
        
        // Return an object with damage and crit information
        return {
            damage: finalDamage,
            isCrit: isCrit,
            critMultiplier: this.state.bow.critMultiplier,
            style: appliedStyle
        };
    },
    
    // Apply sword-specific effects to damage
    applySwordEffects: function(card, damage) {
        let finalDamage = damage;
        let isCrit = false;
        
        // Apply stance damage multiplier if one is active
        if (this.state.sword.stance) {
            const stance = this.swordStances[this.state.sword.stance];
            const beforeStance = finalDamage;
            finalDamage = Math.floor(finalDamage * stance.damageDealtMultiplier);
            console.log(`Applied ${stance.name} stance: ${beforeStance} * ${stance.damageDealtMultiplier} = ${finalDamage}`);
        }
        
        // Apply Warrior's Resolve passive if active (below 60% health)
        if (this.state.sword.passiveActive) {
            const beforePassive = finalDamage;
            finalDamage = Math.floor(finalDamage * 1.3); // 30% damage increase
            console.log(`Applied Warrior's Resolve: ${beforePassive} * 1.3 = ${finalDamage}`);
        }
        
        // Apply Final Stand passive if active (below 10% health)
        if (this.state.sword.finalStandActive) {
            const beforeFinalStand = finalDamage;
            finalDamage = Math.floor(finalDamage * 2.0); // 100% damage increase
            console.log(`Applied Final Stand: ${beforeFinalStand} * 2.0 = ${finalDamage}`);
        }
        
        // Add ultimate charge based on damage dealt (1% per 5 damage)
        this.addSwordUltimateCharge(Math.floor(finalDamage / 5));
        
        return {
            damage: finalDamage,
            isCrit: isCrit
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
        const ultimateFill = document.querySelector('.ultimate-fill');
        const ultimateButton = document.getElementById('ultimate-button');
        
        if (!ultimateFill || !ultimateButton) return;
        
        let charge = 0;
        let ready = false;
        
        if (this.activeClass === 'bow') {
            charge = this.state.bow.ultimateCharge;
            ready = this.state.bow.ultimateReady;
        } else if (this.activeClass === 'sword') {
            charge = this.state.sword.ultimateCharge;
            ready = this.state.sword.ultimateReady;
        }
        
        // Update fill width
        ultimateFill.style.width = `${charge}%`;
        
        // Update button state
        if (ready) {
            ultimateButton.disabled = false;
            ultimateButton.classList.add('ready');
        } else {
            ultimateButton.disabled = true;
            ultimateButton.classList.remove('ready');
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
        // Create ultimate bar container
        const ultimateContainer = document.createElement('div');
        ultimateContainer.className = 'ultimate-container';
        
        // Create ultimate bar
        const ultimateBarContainer = document.createElement('div');
        ultimateBarContainer.className = 'ultimate-bar-container';
        
        const ultimateFill = document.createElement('div');
        ultimateFill.className = 'ultimate-fill';
        ultimateFill.style.width = '0%';
        
        const ultimateText = document.createElement('div');
        ultimateText.className = 'ultimate-text';
        ultimateText.textContent = 'Ultimate: 0%';
        
        ultimateBarContainer.appendChild(ultimateFill);
        ultimateBarContainer.appendChild(ultimateText);
        
        // Create ultimate button
        const ultimateButton = document.createElement('button');
        ultimateButton.id = 'ultimate-button';
        ultimateButton.className = 'ultimate-button';
        ultimateButton.textContent = 'ULTIMATE';
        ultimateButton.disabled = true;
        
        // Add event listener for ultimate button
        ultimateButton.addEventListener('click', () => {
            if (this.activeClass === 'bow') {
                this.activateUltimate();
            } else if (this.activeClass === 'sword') {
                this.activateSwordUltimate();
            }
        });
        
        // Add elements to container
        ultimateContainer.appendChild(ultimateBarContainer);
        ultimateContainer.appendChild(ultimateButton);
        
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
            const criticalEyeIndicator = document.querySelector('.critical-eye');
            const godlySightIndicator = document.querySelector('.godly-sight');
            
            if (criticalEyeIndicator) {
                criticalEyeIndicator.style.display = 'none';
            }
            
            if (godlySightIndicator) {
                godlySightIndicator.style.display = 'flex';
            }
            
            displayCombatMessage("Godly Sight activated! Your vision sharpens as death approaches...");
        }
    },

    // Select a stance
    selectStance: function(stanceId) {
        // If the same stance is already selected, unselect it
        if (this.state.sword.pendingStance === stanceId && !this.state.sword.stanceLocked) {
            this.unselectStance();
            return;
        }
        
        // Cannot change if locked
        if (this.state.sword.stanceLocked) {
            console.log("Stance is locked and cannot be changed");
            return;
        }
        
        // Get the stance object
        const stance = this.swordStances[stanceId];
        if (!stance) {
            console.error(`Stance ${stanceId} not found`);
            return;
        }
        
        // Set the pending stance (will be applied next turn)
        this.state.sword.pendingStance = stanceId;
        
        // Update the UI
        const slot = document.getElementById('stance-slot');
        if (slot) {
            slot.innerHTML = `
                <div class="slotted-ability" style="background-color: ${stance.color}">
                    <span>${stance.name}</span>
                </div>
            `;
            slot.classList.add('filled');
        }
        
        const currentStanceIndicator = document.getElementById('current-stance');
        if (currentStanceIndicator) {
            currentStanceIndicator.innerHTML = `Next Stance: ${stance.name} (Not Locked)`;
            currentStanceIndicator.style.color = stance.color;
        }
        
        // Update the stance description
        const stanceDescription = document.getElementById('stance-description');
        if (stanceDescription && stance.description) {
            stanceDescription.textContent = stance.description;
            stanceDescription.style.color = stance.color;
        }
        
        console.log(`Selected stance: ${stance.name} (not locked yet)`);
    },

    unselectStance: function() {
        // If no stance is selected or stance is locked, do nothing
        if (!this.state.sword.pendingStance || this.state.sword.stanceLocked) {
            return;
        }
        
        // Clear the pending stance
        this.state.sword.pendingStance = null;
        
        // Update the UI
        const slot = document.getElementById('stance-slot');
        if (slot) {
            slot.innerHTML = '<span>Empty</span>';
            slot.classList.remove('filled');
        }
        
        const currentStanceIndicator = document.getElementById('current-stance');
        if (currentStanceIndicator) {
            currentStanceIndicator.innerHTML = 'Next Stance: None';
            currentStanceIndicator.style.color = '';
        }
        
        // Clear the stance description
        const stanceDescription = document.getElementById('stance-description');
        if (stanceDescription) {
            stanceDescription.textContent = '';
        }
        
        console.log('Stance unselected');
    },

    lockStance: function() {
        if (!this.state.sword.pendingStance) {
            console.log("No stance selected to lock");
            return;
        }
        
        if (this.state.sword.stanceLocked) {
            console.log("Stance already locked");
            return;
        }
        
        // Lock the stance (will be applied next turn)
        this.state.sword.stanceLocked = true;
        
        // Update UI to show locked state
        const slot = document.getElementById('stance-slot');
        if (slot) {
            slot.classList.add('ability-locked');
        }
        
        const currentStanceIndicator = document.getElementById('current-stance');
        if (currentStanceIndicator) {
            const stance = this.swordStances[this.state.sword.pendingStance];
            currentStanceIndicator.innerHTML = `Next Stance: ${stance.name} (Locked)`;
        }
        
        // Unselect all cards to prevent exploits
        this.unselectAllCards();
        
        console.log(`Locked in stance: ${this.swordStances[this.state.sword.pendingStance].name}`);
    },

    updateSwordStanceUI: function() {
        const slot = document.getElementById('stance-slot');
        const currentStanceIndicator = document.getElementById('current-stance');
        const stanceDescription = document.getElementById('stance-description');
        
        // Update current stance display
        if (this.state.sword.stance) {
            const stance = this.swordStances[this.state.sword.stance];
            
            if (currentStanceIndicator) {
                currentStanceIndicator.innerHTML = `Current Stance: ${stance.name}`;
                currentStanceIndicator.style.color = stance.color;
            }
            
            if (stanceDescription) {
                stanceDescription.textContent = stance.description;
                stanceDescription.style.color = stance.color;
            }
        } else {
            if (currentStanceIndicator) {
                currentStanceIndicator.innerHTML = 'Current Stance: None';
                currentStanceIndicator.style.color = '';
            }
            
            if (stanceDescription) {
                stanceDescription.textContent = '';
            }
        }
        
        // Update pending stance display
        if (slot) {
            if (this.state.sword.pendingStance) {
                const pendingStance = this.swordStances[this.state.sword.pendingStance];
                slot.innerHTML = `
                    <div class="slotted-ability" style="background-color: ${pendingStance.color}">
                        <span>${pendingStance.name}</span>
                    </div>
                `;
                slot.classList.add('filled');
                
                if (this.state.sword.stanceLocked) {
                    slot.classList.add('ability-locked');
                } else {
                    slot.classList.remove('ability-locked');
                }
            } else {
                slot.innerHTML = '<span>Empty</span>';
                slot.classList.remove('filled');
                slot.classList.remove('ability-locked');
            }
        }
    },

    // Set up event listeners for sword class
    setupSwordEventListeners: function() {
        // Stance slot (for locking with right-click)
        const stanceSlot = document.getElementById('stance-slot');
        if (stanceSlot) {
            // Left click to clear if not locked
            stanceSlot.addEventListener('click', () => {
                if (!this.state.sword.stanceLocked) {
                    this.unselectStance();
                }
            });
            
            // Right click to lock in
            stanceSlot.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Prevent context menu
                if (!this.state.sword.stanceLocked && this.state.sword.pendingStance) {
                    this.lockStance();
                }
                return false;
            });
        }
        
        // Ultimate button
        const ultimateButton = document.getElementById('ultimate-button');
        if (ultimateButton) {
            ultimateButton.addEventListener('click', () => {
                this.activateSwordUltimate();
            });
        }
    },

        // Check and activate Warrior's Resolve if health is below threshold
    checkWarriorsResolve: function() {
        if (this.activeClass !== 'sword') return;
        
        // Check if health is below 60%
        const healthPercentage = (combatState.playerHealth / combatState.playerMaxHealth) * 100;
        
        if (healthPercentage <= 60 && !this.state.sword.passiveActive) {
            // Activate Warrior's Resolve
            this.state.sword.passiveActive = true;
            
            // Update UI
            const warriorsResolveIndicator = document.querySelector('.warriors-resolve');
            if (warriorsResolveIndicator) {
                warriorsResolveIndicator.classList.add('active');
                warriorsResolveIndicator.innerHTML += `<span class="passive-status">Active</span>`;
            }
            
            displayCombatMessage("Warrior's Resolve activated! Damage increased by 30%");
        }
    },

    // Check and activate Final Stand if health is below threshold
    checkFinalStand: function() {
        if (this.activeClass !== 'sword') return;
        
        // Check if health is below 10%
        const healthPercentage = (combatState.playerHealth / combatState.playerMaxHealth) * 100;
        
        if (healthPercentage <= 10 && !this.state.sword.finalStandActive) {
            // Activate Final Stand
            this.state.sword.finalStandActive = true;
            
            // Update UI
            const warriorsResolveIndicator = document.querySelector('.warriors-resolve');
            const finalStandIndicator = document.querySelector('.final-stand');
            
            if (warriorsResolveIndicator) {
                warriorsResolveIndicator.style.display = 'none';
            }
            
            if (finalStandIndicator) {
                finalStandIndicator.style.display = 'flex';
                finalStandIndicator.classList.add('active');
                finalStandIndicator.innerHTML += `<span class="passive-status">Active</span>`;
            }
            
            displayCombatMessage("Final Stand activated! Damage doubled as you face death!");
        }
    },

    // Add ultimate charge for sword class
    addSwordUltimateCharge: function(amount) {
        if (this.activeClass !== 'sword') return;
        
        this.state.sword.ultimateCharge = Math.min(100, this.state.sword.ultimateCharge + amount);
        
        // Update the UI
        this.updateUltimateUI();
        
        // Check if ultimate is ready
        if (this.state.sword.ultimateCharge >= 100 && !this.state.sword.ultimateReady) {
            this.state.sword.ultimateReady = true;
            
            // Enable the ultimate button
            const ultimateButton = document.getElementById('ultimate-button');
            if (ultimateButton) {
                ultimateButton.classList.add('ready');
                ultimateButton.disabled = false;
            }
            
            displayCombatMessage("Ultimate ability ready!");
        }
    },

    // Activate sword ultimate ability
    activateSwordUltimate: function() {
        if (this.activeClass !== 'sword' || !this.state.sword.ultimateReady) return;
        
        console.log("Activating sword ultimate ability!");
        
        // Set the ultimate damage multiplier for the next attack
        combatState.playerDamageBoost = 5.0; // 500% damage
        combatState.playerDamageBoostDuration = 1; // Only for the next attack
        
        // Reset ultimate charge
        this.state.sword.ultimateCharge = 0;
        this.state.sword.ultimateReady = false;
        
        // Update UI
        this.updateUltimateUI();
        
        // Display message
        displayCombatMessage("ULTIMATE ACTIVATED! Next attack deals 500% damage!");
    },

    // Add a method to modify incoming damage
    modifyIncomingDamage: function(damage) {
        if (!this.activeClass) return damage;
        
        let modifiedDamage = damage;
        
        switch (this.activeClass) {
            case 'sword':
                // Apply stance effect to incoming damage
                if (this.state.sword.stance) {
                    const stance = this.swordStances[this.state.sword.stance];
                    modifiedDamage = Math.floor(modifiedDamage * stance.damageTakenMultiplier);
                    console.log(`Applied ${stance.name} stance to incoming damage: ${damage} * ${stance.damageTakenMultiplier} = ${modifiedDamage}`);
                }
                break;
            // Other classes will be implemented later
        }
        
        return modifiedDamage;
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
                // Reset shot style state
                this.state.bow.shotStyle = null;
                this.state.bow.pendingShotStyle = null;
                this.state.bow.shotStyleLocked = false;
                
                // Update UI to reflect cleared style
                const bowSlot = document.getElementById('shot-style-slot');
                if (bowSlot) {
                    bowSlot.innerHTML = '<span>Empty</span>';
                    bowSlot.classList.remove('filled');
                    bowSlot.classList.remove('ability-locked');
                }
                
                const bowCurrentStyleIndicator = document.getElementById('current-shot-style');
                if (bowCurrentStyleIndicator) {
                    bowCurrentStyleIndicator.innerHTML = 'Current Style: None';
                    bowCurrentStyleIndicator.style.color = '';
                }
                
                const bowStyleDescription = document.getElementById('shot-style-description');
                if (bowStyleDescription) {
                    bowStyleDescription.textContent = '';
                }
                break;
                
            case 'sword':
                // Apply the pending stance for the next turn
                if (this.state.sword.pendingStance && this.state.sword.stanceLocked) {
                    this.state.sword.stance = this.state.sword.pendingStance;
                } else {
                    this.state.sword.stance = null;
                }
                
                // Reset pending stance and locked state
                this.state.sword.pendingStance = null;
                this.state.sword.stanceLocked = false;
                
                // Update UI
                this.updateSwordStanceUI();
                break;
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
            /* Upper controls layout */
            .upper-controls {
                display: flex;
                justify-content: space-between;
                align-items: flex-end; /* Align items to bottom */
                width: 100%;
                margin-bottom: 10px;
            }
            
            .upper-left-section {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-end; /* Align content to bottom */
                width: 180px;
            }
            
            .upper-center-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end; /* Align content to bottom */
                flex-grow: 0;
                width: 180px;
            }
            
            .upper-right-section {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                justify-content: flex-end; /* Align content to bottom */
                width: 180px;
            }
            
            /* Generic active ability styles (for all classes) */
            .active-ability-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 180px;
            }
            
            .ability-instruction {
                color: rgba(255, 255, 255, 0.6);
                font-size: 11px;
                text-align: center;
                margin-bottom: 10px;
                width: 100%;
            }
            
            .ability-slot-container {
                position: relative;
                width: 180px;
                height: 180px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .ability-text-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                margin-top: 20px;
            }
            
            .ability-slot {
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
            
            .ability-slot.filled {
                border: 2px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            }
            
            .ability-slot.ability-locked {
                border: 2px solid gold !important;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.5) !important;
            }
            
            .ability-slot span {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                text-align: center;
            }
            
            .ability-options {
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .ability-option {
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
            
            .ability-option:hover {
                transform: scale(1.2) translate(var(--x), var(--y));
                z-index: 20;
            }
            
            .ability-option span {
                color: white;
                font-size: 10px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
                text-align: center;
            }
            
            .slotted-ability {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .slotted-ability span {
                color: white !important;
                font-size: 10px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
            }
            
            .current-ability {
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                margin-top: 5px;
                transition: color 0.3s ease;
            }
            
            .ability-description {
                text-align: center;
                font-size: 12px;
                margin-top: 5px;
                max-width: 180px;
                transition: color 0.3s ease;
                min-height: 36px;
            }
            
            /* Passive indicators */
            .passive-indicator {
                display: flex;
                align-items: center;
                padding: 5px 10px;
                margin-bottom: 10px;
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                width: auto;
                max-width: 150px;
            }
            
            .passive-indicator.active {
                background-color: rgba(46, 204, 113, 0.2);
                border: 1px solid rgba(46, 204, 113, 0.5);
            }
            
            .passive-icon {
                margin-right: 5px;
                font-size: 16px;
            }
            
            .passive-name {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .passive-status {
                margin-left: 5px;
                font-size: 10px;
                color: #2ecc71;
                font-weight: bold;
            }
            
            /* Ultimate bar */
            .ultimate-container {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 10px;
                padding: 0 10px;
            }
            
            .ultimate-bar-container {
                flex-grow: 1;
                height: 20px;
                background-color: #333;
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            }
            
            .ultimate-fill {
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
        
        // Check if Godly Sight should activate for bow
        classSystem.checkGodlySight();
        
        // Check if Warrior's Resolve should activate for sword
        classSystem.checkWarriorsResolve();
        
        // Check if Final Stand should activate for sword
        classSystem.checkFinalStand();
    };
}

const originalEnemyAttack = window.enemyAttack;
if (typeof originalEnemyAttack === 'function') {
    window.enemyAttack = function(card) {
        // If we have a sword class with a stance, modify the damage
        if (classSystem.activeClass === 'sword' && classSystem.state.sword.stance) {
            // Store the original damage calculation function
            const originalCalculateDamage = window.calculateDamage;
            
            // Override the damage calculation to apply stance modifier
            window.calculateDamage = function(base, multiplier) {
                let damage = originalCalculateDamage(base, multiplier);
                return classSystem.modifyIncomingDamage(damage);
            };
            
            // Call the original enemy attack function
            const result = originalEnemyAttack(card);
            
            // Restore the original damage calculation function
            window.calculateDamage = originalCalculateDamage;
            
            return result;
        } else {
            // No modification needed, call the original function
            return originalEnemyAttack(card);
        }
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

