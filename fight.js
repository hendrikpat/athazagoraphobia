console.log("Fight.js loaded successfully!");

// Combat System for Athazagoraphobia
let combatState = {
    currentFight: null,
    playerHand: [],
    playedCards: [],
    playerAttackPool: [],
    playerActionPool: [],
    enemyAttackPool: [],
    enemyActionPool: [],
    turnCount: 0,
    playerFocus: 0, // Will be set from fight config
    maxPlayerFocus: 0, // Will be set from fight config
    minPlayerFocus: 0, // Will be set from fight config
    handSize: 10,
    selectedCards: [],
    discardCards: [],
    playerDefenseMultiplier: 1.0,
    enemyDefenseMultiplier: 1.0,
    playerVulnerabilityMultiplier: 1.0,
    enemyVulnerabilityMultiplier: 1.0,
    playerTankHealAmount: 0,
    enemyTankHealAmount: 0,
    playerReflectAmount: 0,
    enemyReflectAmount: 0,
    playerDamageBoost: 1.0,
    playerDamageBoostDuration: 0,
    totalFocusCost: 0,
    playerMaxHealth: 100,
    playerHealth: 100,
    enemyMaxHealth: 0,
    enemyHealth: 0,
    playerDamageMultiplier: 1.0,
    enemyDamageMultiplier: 1.0
};

const SYNERGIES = {
    perfect: ['fire', 'water', 'thunder', 'light', 'dark'],
    monochromatic: {
        fire: ['fire', 'fire', 'fire'],
        water: ['water', 'water', 'water'],
        thunder: ['thunder', 'thunder', 'thunder'],
        light: ['light', 'light', 'light'],
        dark: ['dark', 'dark', 'dark']
    },
    unluck: ['normal', 'normal', 'normal', 'normal', 'normal'],
    regular: [
        ['fire', 'water'],
        ['water', 'thunder'],
        ['thunder', 'fire'],
        ['light', 'dark']
    ]
};


// Initialize combat with a specific fight
function initiateCombat(fight) {
    console.log("Initiating combat with:", fight);
    
    // Store the current fight
    combatState.currentFight = fight;
    
    // Reset combat state
    combatState.playerHand = [];
    combatState.playedCards = [];
    combatState.turnCount = 0;
    
    // Set health values from the fight configuration
    if (fight.player && fight.player.maxHealth) {
        combatState.playerMaxHealth = fight.player.maxHealth;
        combatState.playerHealth = fight.player.maxHealth;
    } else {
        // Default values if not specified
        combatState.playerMaxHealth = 100;
        combatState.playerHealth = 100;
    }
    
    if (fight.enemy && fight.enemy.maxHealth) {
        combatState.enemyMaxHealth = fight.enemy.maxHealth;
        combatState.enemyHealth = fight.enemy.currentHealth || fight.enemy.maxHealth;
    } else {
        console.error("Enemy health not specified in fight configuration");
        combatState.enemyMaxHealth = 50;
        combatState.enemyHealth = 50;
    }
    
    // Set damage multipliers
    combatState.playerDamageMultiplier = fight.player?.damageMultiplier || 1.0;
    combatState.enemyDamageMultiplier = fight.enemy?.damageMultiplier || 1.0;
    
    // Set up player attack and action card pools
    combatState.playerAttackPool = [];
    combatState.playerActionPool = [];
    
    if (fight.player && Array.isArray(fight.player.attackDeck)) {
        combatState.playerAttackPool = [...fight.player.attackDeck];
    } else {
        console.error("Player attack deck is missing or not an array:", fight.player);
        combatState.playerAttackPool = [];
    }
    
    if (fight.player && Array.isArray(fight.player.actionDeck)) {
        combatState.playerActionPool = [...fight.player.actionDeck];
    } else {
        console.error("Player action deck is missing or not an array:", fight.player);
        combatState.playerActionPool = [];
    }
    
    // Set up enemy deck
    combatState.enemyAttackPool = [];
    combatState.enemyActionPool = [];
    
    if (fight.enemy && Array.isArray(fight.enemy.attackDeck)) {
        combatState.enemyAttackPool = [...fight.enemy.attackDeck];
    } else {
        console.error("Enemy attack deck is missing or not an array:", fight.enemy);
        combatState.enemyAttackPool = [];
    }
    
    if (fight.enemy && Array.isArray(fight.enemy.actionDeck)) {
        combatState.enemyActionPool = [...fight.enemy.actionDeck];
    } else {
        console.error("Enemy action deck is missing or not an array:", fight.enemy);
        combatState.enemyActionPool = [];
    }
    
    // Initialize focus from fight configuration
    if (fight.player && typeof fight.player.focus === 'number') {
        combatState.playerFocus = fight.player.focus;
    } else {
        console.warn("Player focus not specified, defaulting to 5");
        combatState.playerFocus = 5;
    }
    
    if (fight.player && typeof fight.player.maxFocus === 'number') {
        combatState.maxPlayerFocus = fight.player.maxFocus;
    } else {
        console.warn("Player max focus not specified, defaulting to 10");
        combatState.maxPlayerFocus = 10;
    }
    
    if (fight.player && typeof fight.player.minFocus === 'number') {
        combatState.minPlayerFocus = fight.player.minFocus;
    } else {
        console.warn("Player min focus not specified, defaulting to 3");
        combatState.minPlayerFocus = 3;
    }
    
    // Ensure focus is within bounds
    combatState.playerFocus = Math.min(combatState.playerFocus, combatState.maxPlayerFocus);
    combatState.playerFocus = Math.max(combatState.playerFocus, combatState.minPlayerFocus);
    
    // Reset multipliers and effects
    combatState.playerDefenseMultiplier = 1.0;
    combatState.enemyDefenseMultiplier = 1.0;
    combatState.playerVulnerabilityMultiplier = 1.0;
    combatState.enemyVulnerabilityMultiplier = 1.0;
    combatState.playerTankHealAmount = 0;
    combatState.enemyTankHealAmount = 0;
    combatState.playerReflectAmount = 0;
    combatState.enemyReflectAmount = 0;
    combatState.playerDamageBoost = 1.0;
    combatState.playerDamageBoostDuration = 0;
    
    // Deal initial hand
    dealPlayerHand();
    
    // Display the combat UI
    displayCombatUI();
    
    console.log("Combat initialized:", combatState);
}

// Load fight data from fights.json
async function loadFight(fightId) {
    try {
        console.log("Loading fight data for:", fightId);
        
        // Load all necessary data in parallel
        const [fightsResponse, attackResponse, actionResponse] = await Promise.all([
            fetch('fight/fights.json'),
            fetch('fight/attack.json'),
            fetch('fight/action.json')
        ]);
        
        const fights = await fightsResponse.json();
        const attackData = await attackResponse.json();
        const actionData = await actionResponse.json();
        
        // Store the loaded card data in combatState
        combatState.attackCards = attackData;
        combatState.actionCards = actionData;
        
        console.log("Card data loaded successfully:", {
            attackCards: Object.keys(attackData),
            actionCards: actionData.length
        });
        
        if (!fights[fightId]) {
            console.error(`Fight ID ${fightId} not found!`);
            return null;
        }
        
        // Return the fight data
        return fights[fightId];
    } catch (error) {
        console.error("Error loading fight data:", error);
        return null;
    }
}

// Get card data by ID
function getCardById(cardId) {
    if (!cardId || typeof cardId !== 'string') {
        console.error("Invalid card ID:", cardId);
        return null;
    }
    
    // Check if card data is loaded
    if (!combatState.attackCards || !combatState.actionCards) {
        console.error("Card data not loaded yet for card:", cardId);
        return null;
    }
    
    // Look for attack cards
    if (combatState.attackCards) {
        // Check each weapon type
        for (const weaponType in combatState.attackCards) {
            if (Array.isArray(combatState.attackCards[weaponType])) {
                const card = combatState.attackCards[weaponType].find(c => c.id === cardId);
                if (card) {
                    return card;
                }
            }
        }
    }
    
    // Look for action cards
    if (Array.isArray(combatState.actionCards)) {
        const card = combatState.actionCards.find(c => c.id === cardId);
        if (card) {
            return card;
        }
    }
    
    // If card not found, log an error and return null
    console.error(`Card with ID ${cardId} not found in loaded data`);
    return null;
}

// Deal cards to player's hand
function dealPlayerHand() {
    // Clear the current hand
    combatState.playerHand = [];
    
    // Deal 7 attack cards
    for (let i = 0; i < 7; i++) {
        if (combatState.playerAttackPool.length > 0) {
            const cardIndex = Math.floor(Math.random() * combatState.playerAttackPool.length);
            const drawnCardId = combatState.playerAttackPool[cardIndex];
            // Add a unique instance ID to the card
            const cardInstance = {
                cardId: drawnCardId,
                instanceId: `${drawnCardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            combatState.playerHand.push(cardInstance);
        }
    }
    
    // Deal 3 action cards
    for (let i = 0; i < 3; i++) {
        if (combatState.playerActionPool.length > 0) {
            const cardIndex = Math.floor(Math.random() * combatState.playerActionPool.length);
            const drawnCardId = combatState.playerActionPool[cardIndex];
            // Add a unique instance ID to the card
            const cardInstance = {
                cardId: drawnCardId,
                instanceId: `${drawnCardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            combatState.playerHand.push(cardInstance);
        }
    }
    
    console.log("Player hand dealt:", combatState.playerHand);
}

// Update the createCardElement function for better card design
function createCardElement(card) {
    if (!card) {
        console.error("Attempted to create card element with null card data");
        return document.createElement('div'); // Return empty div to avoid errors
    }
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.cardId = card.id || '';
    
    // Determine card color class based on type and affinity
    let affinityClass = 'affinity-normal';
    
    if (card.type === 'attack' && card.affinity) {
        affinityClass = `affinity-${card.affinity.toLowerCase()}`;
    } else if (card.type === 'action') {
        affinityClass = 'affinity-action';
    }
    
    cardElement.classList.add(affinityClass);
    
    // Avoid any potential undefined values in the HTML
    const cardName = card.name || 'Unknown Card';
    const cardDescription = card.description || 'No description';
    const focusCost = card.focus_cost || 0;
    
    // Build HTML content with the new design
    let htmlContent = `
        <div class="card-header">
            <div class="affinity-icon"></div>
            <div class="card-name">${cardName}</div>
        </div>
        
        <div class="card-separator"></div>
        
        <div class="focus-cost">
            ${generateFocusIcons(focusCost)}
        </div>
        
        <div class="card-separator"></div>
        
        <div class="card-description">${cardDescription}</div>
    `;
    
    // Only add damage section for attack cards
    if (card.type === 'attack') {
        const baseDamage = card.base_damage || 0;
        htmlContent += `
            <div class="card-separator"></div>
            
            <div class="card-footer">
                <div class="damage-container">
                    <div class="damage-icon"></div>
                    <div class="damage-value">${baseDamage}</div>
                </div>
            </div>
        `;
    } else {
        // For action cards, add some extra padding at the bottom to balance the layout
        htmlContent += `
            <div class="card-footer-action"></div>
        `;
    }
    
    cardElement.innerHTML = htmlContent;
    
    return cardElement;
}

function generateFocusIcons(cost) {
    const totalIcons = 5; // Always show 5 slots
    let icons = '';
    
    for (let i = 0; i < totalIcons; i++) {
        if (i < cost) {
            icons += '<div class="focus-icon focus-filled"></div>';
        } else {
            icons += '<div class="focus-icon focus-empty"></div>';
        }
    }
    
    return icons;
}

function displayCombatUI() {
    // Add the card number indicator styles
    addCardNumberIndicatorStyles();
    
    // Add the synergy chain styles
    addSynergyChainStyles();
    
    // Declare contentArea first before using it
    const contentArea = document.getElementById('content-area');
    if (!contentArea) {
        console.error("Content area element not found");
        return;
    }
    
    // Add the combat-active class to expand the content area
    contentArea.classList.add('combat-active');
    
    // Check if combat state is properly initialized
    if (!combatState.currentFight || !combatState.currentFight.enemy) {
        console.error("Combat state not properly initialized:", combatState);
        contentArea.innerHTML = `<div class="error-message">Error: Combat could not be initialized properly.</div>`;
        return;
    }
    
    // Create combat UI structure with the new layout
    contentArea.innerHTML = `
        <div id="combat-container">
            <div id="enemy-area">
                <div class="enemy-info">
                    <h2>${combatState.currentFight.enemy.name}</h2>
                    <div class="health-bar">
                        <div class="health-fill" style="width: ${(combatState.enemyHealth / combatState.enemyMaxHealth) * 100}%"></div>
                        <span>${Math.floor(combatState.enemyHealth)}/${combatState.enemyMaxHealth}</span>
                    </div>
                </div>
                <div id="enemy-cards-played" class="cards-played-area"></div>
            </div>
            
            <div id="combat-messages">
                <div class="combat-message">${combatState.currentFight.description || 'Combat started!'}</div>
            </div>
            
            <div id="combat-field"></div>
            
            <div id="player-area">
                <div class="player-controls-row">
                    <div class="left-controls" id="left-controls">
                        <!-- Shot styles will go here -->
                    </div>
                    
                    <div class="center-controls">
                        <button id="end-turn-btn" onclick="endPlayerTurn()">End Turn</button>
                        <div id="focus-cost-display">Total Focus Cost: ${combatState.totalFocusCost || 0}</div>
                    </div>
                    
                    <div class="right-controls" id="right-controls">
                        <!-- Passive indicators will go here -->
                    </div>
                </div>
                
                <div class="player-info">
                    <div class="health-bar">
                        <div class="health-fill" style="width: ${(combatState.playerHealth / combatState.playerMaxHealth) * 100}%"></div>
                        <span>${Math.floor(combatState.playerHealth)}/${combatState.playerMaxHealth}</span>
                    </div>
                    <div class="focus-bar">
                        <div class="focus-fill" style="width: ${(combatState.playerFocus / combatState.maxPlayerFocus) * 100}%"></div>
                        <span>Focus: ${combatState.playerFocus}/${combatState.maxPlayerFocus}</span>
                    </div>
                </div>
                
                <div id="player-hand" class="card-hand"></div>
                
                <!-- Ultimate bar will be added here by the class system -->
            </div>
        </div>
    `;
    
    // Display player's hand
    displayPlayerHand();
    
    // Set up the observer for card position changes
    setupCardPositionObserver();
    
    // Prevent context menu on the entire combat container
    const combatContainer = document.getElementById('combat-container');
    if (combatContainer) {
        combatContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }
    
    // Initialize the affinity chain display
    createAffinityChainDisplay();
    
    // Initialize class UI if a class is specified in the fight
    if (combatState.currentFight && 
        combatState.currentFight.player && 
        combatState.currentFight.player.class &&
        window.classSystem) {
        
        window.classSystem.initialize(combatState.currentFight.player.class);
    }
}




function setupCardPositionObserver() {
    const observer = new MutationObserver(function(mutations) {
        updateIndicatorPositions();
    });
    
    const playerHand = document.getElementById('player-hand');
    if (playerHand) {
        observer.observe(playerHand, { 
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
}

// Display player's hand
function displayPlayerHand() {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) {
        console.error("Player hand container not found");
        return;
    }
    
    handContainer.innerHTML = '';
    
    if (!Array.isArray(combatState.playerHand)) {
        console.error("Player hand is not an array:", combatState.playerHand);
        return;
    }
    
    // Check if card data is loaded
    if (!combatState.attackCards || !combatState.actionCards) {
        console.error("Card data not loaded yet, cannot display hand");
        handContainer.innerHTML = '<div class="loading-message">Loading cards...</div>';
        return;
    }
    
    // Separate attack and action cards
    const attackCards = [];
    const actionCards = [];
    
    for (const cardInstance of combatState.playerHand) {
        if (!cardInstance || !cardInstance.cardId) {
            console.error("Invalid card instance in player hand:", cardInstance);
            continue;
        }
        
        try {
            const card = getCardById(cardInstance.cardId);
            
            if (!card) {
                console.error("Failed to get card data for ID:", cardInstance.cardId);
                continue;
            }
            
            if (card.type === 'attack') {
                attackCards.push({instance: cardInstance, card: card});
            } else if (card.type === 'action') {
                actionCards.push({instance: cardInstance, card: card});
            } else {
                console.error("Unknown card type:", card.type, "for card:", cardInstance.cardId);
            }
        } catch (error) {
            console.error(`Error processing card ${cardInstance.cardId}:`, error);
        }
    }
    
    // Display attack cards
    attackCards.forEach(({instance, card}) => {
        try {
            const cardElement = createCardElement(card);
            cardElement.dataset.cardId = instance.cardId;
            cardElement.dataset.instanceId = instance.instanceId;
            cardElement.classList.add('attack-card');
            
            // Add click event for card selection
            cardElement.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCardSelection(instance.instanceId, cardElement);
            });
            
            // Add right-click event for card discard
            cardElement.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Prevent the default context menu
                e.stopPropagation(); // Stop the event from bubbling up
                toggleCardDiscard(instance.instanceId, cardElement);
                return false; // For older browsers
            });
            
            handContainer.appendChild(cardElement);
        } catch (error) {
            console.error("Error creating attack card element:", error);
        }
    });
    
    // Add a vertical divider between attack and action cards if both exist
    if (attackCards.length > 0 && actionCards.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'card-divider';
        handContainer.appendChild(divider);
    }
    
    // Display action cards
    actionCards.forEach(({instance, card}) => {
        try {
            const cardElement = createCardElement(card);
            cardElement.dataset.cardId = instance.cardId;
            cardElement.dataset.instanceId = instance.instanceId;
            cardElement.classList.add('action-card');
            
            // Add click event for card selection
            cardElement.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCardSelection(instance.instanceId, cardElement);
            });
            
            // Add right-click event for card discard
            cardElement.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Prevent the default context menu
                e.stopPropagation(); // Stop the event from bubbling up
                toggleCardDiscard(instance.instanceId, cardElement);
                return false; // For older browsers
            });
            
            handContainer.appendChild(cardElement);
        } catch (error) {
            console.error("Error creating action card element:", error);
        }
    });
    
    // Update indicator positions after rendering cards
    setTimeout(updateIndicatorPositions, 50);
}

function toggleCardSelection(instanceId, cardElement) {
    if (!instanceId || !cardElement) {
        console.error("Invalid card or element in toggleCardSelection:", instanceId, cardElement);
        return;
    }
    
    // Find the card instance in the player's hand
    const cardInstance = combatState.playerHand.find(instance => instance.instanceId === instanceId);
    if (!cardInstance) {
        console.error("Card instance not found in player hand:", instanceId);
        return;
    }
    
    const card = getCardById(cardInstance.cardId);
    if (!card) {
        console.error("Failed to get card data for selection:", cardInstance.cardId);
        return;
    }
    
    // Initialize selectedCards array if it doesn't exist
    if (!combatState.selectedCards) {
        combatState.selectedCards = [];
    }
    
    // Initialize totalFocusCost if it doesn't exist
    if (combatState.totalFocusCost === undefined) {
        combatState.totalFocusCost = 0;
    }
    
    // Check if card is already selected
    const isSelected = cardElement.classList.contains('selected');
    
    // If card is discarded, remove discard first
    if (cardElement.classList.contains('discard')) {
        toggleCardDiscard(instanceId, cardElement);
    }
    
    // Get the modified focus cost based on class abilities
    let focusCost = card.focus_cost || 0;
    if (window.classSystem && typeof window.classSystem.modifyFocusCost === 'function') {
        focusCost = window.classSystem.modifyFocusCost(card, focusCost);
    }
    
    // Toggle selection state
    if (isSelected) {
        // Remove card from selection
        cardElement.classList.remove('selected');
        
        // Find the index of the card in the selectedCards array
        const index = combatState.selectedCards.findIndex(instance => instance.instanceId === instanceId);
        if (index !== -1) {
            // Remove the card from the array
            combatState.selectedCards.splice(index, 1);
            
            // Remove the indicator
            const indicator = document.querySelector(`.card-number-indicator[data-instance-id="${instanceId}"]`);
            if (indicator) {
                indicator.parentNode.removeChild(indicator);
            }
            
            // Update numbers for all cards after this one
            updateCardNumbers();
        }
        
        combatState.totalFocusCost -= focusCost;
    } else {
        // Check if we have enough focus
        if (combatState.totalFocusCost + focusCost <= combatState.playerFocus) {
            // Add card to selection
            cardElement.classList.add('selected');
            combatState.selectedCards.push(cardInstance);
            
            // Add number indicator
            addCardNumberIndicator(cardElement, combatState.selectedCards.length);
            
            combatState.totalFocusCost += focusCost;
        } else {
            // Not enough focus - don't select the card and don't show a message
            return;
        }
    }
    
    // Update focus cost display
    updateFocusCostDisplay();
    
    // Update the affinity chain display
    updateAffinityChainDisplay();
    
    // Enable/disable play button based on selections
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) {
        endTurnBtn.disabled = combatState.selectedCards.length === 0;
    }
}

// Add a function to update indicator positions when cards move
function updateIndicatorPositions() {
    const selectedCardElements = document.querySelectorAll('.card.selected');
    selectedCardElements.forEach(element => {
        const instanceId = element.dataset.instanceId;
        const indicator = document.querySelector(`.card-number-indicator[data-instance-id="${instanceId}"]`);
        
        if (indicator) {
            const rect = element.getBoundingClientRect();
            indicator.style.left = `${rect.left + rect.width / 2}px`;
            indicator.style.top = `${rect.bottom + 5}px`;
        }
    });
}

// Add a window resize handler to update indicator positions
window.addEventListener('resize', function() {
    // Update all indicators when the window is resized
    updateCardNumbers();
});

// Add a number indicator to a card
function addCardNumberIndicator(cardElement, number) {
    const instanceId = cardElement.dataset.instanceId;
    
    // Remove existing indicator if there is one
    const existingIndicator = document.querySelector(`.card-number-indicator[data-instance-id="${instanceId}"]`);
    if (existingIndicator) {
        existingIndicator.parentNode.removeChild(existingIndicator);
    }
    
    // Create the indicator element
    const indicator = document.createElement('div');
    indicator.className = 'card-number-indicator';
    indicator.textContent = number;
    indicator.dataset.instanceId = instanceId;
    
    // Position the indicator relative to the card
    const rect = cardElement.getBoundingClientRect();
    indicator.style.position = 'absolute';
    indicator.style.left = `${rect.left + rect.width / 2}px`;
    indicator.style.top = `${rect.bottom + 5}px`; // 5px below the card
    
    // Add the indicator to the document body
    document.body.appendChild(indicator);
    
    // Store a reference to the indicator in the card element
    cardElement.indicator = indicator;
}

// Update all card numbers after a card is removed
function updateCardNumbers() {
    // Remove all existing indicators
    const existingIndicators = document.querySelectorAll('.card-number-indicator');
    existingIndicators.forEach(indicator => {
        indicator.parentNode.removeChild(indicator);
    });
    
    // Add new indicators for each selected card
    const selectedCardElements = document.querySelectorAll('.card.selected');
    selectedCardElements.forEach((element, index) => {
        const instanceId = element.dataset.instanceId;
        
        // Add a new indicator
        addCardNumberIndicator(element, index + 1);
    });
}

// Add CSS for the card number indicators
function addCardNumberIndicatorStyles() {
    // Check if the style already exists
    if (document.getElementById('card-number-indicator-styles')) {
        return;
    }
    
    // Create a style element
    const style = document.createElement('style');
    style.id = 'card-number-indicator-styles';
    
    // Add the CSS
    style.textContent = `
        .card-number-indicator {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: white;
            color: black;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid #333;
            z-index: 1000;
            transform: translate(-50%, -50%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
    `;
    
    // Add the style to the document head
    document.head.appendChild(style);
}

// Play selected cards
function playSelectedCards() {
    // Check if player has enough focus
    if (combatState.totalFocusCost > combatState.playerFocus) {
        displayCombatMessage("Not enough focus to play these cards!");
        return [];
    }
    
    console.log("=== PLAYING SELECTED CARDS ===");
    
    // First, add all selected cards to played cards to establish the full sequence
    // but don't apply effects yet
    const cardsToPlay = [];
    for (const cardInstance of combatState.selectedCards) {
        const card = getCardById(cardInstance.cardId);
        if (!card) {
            console.log(`Card ${cardInstance.cardId} not found, skipping`);
            continue;
        }
        
        // Remove this specific card instance from hand
        combatState.playerHand = combatState.playerHand.filter(instance => 
            instance.instanceId !== cardInstance.instanceId
        );
        
        // Add to played cards
        combatState.playedCards.push(cardInstance.cardId);
        
        // Store for processing
        cardsToPlay.push({
            id: cardInstance.cardId,
            instanceId: cardInstance.instanceId,
            card: card
        });
    }
    
    // Now that all cards are in the played sequence, calculate synergies and apply effects
    const damageLog = [];
    
    // Pre-calculate synergy map for all cards
    const playedCardObjects = combatState.playedCards.map(getCardById).filter(c => c && c.type === 'attack');
    const affinities = playedCardObjects.map(c => c.affinity ? c.affinity.toLowerCase() : 'normal');
    const synergyMap = findSynergies(affinities);
    
    console.log("Synergy map for this sequence:", synergyMap);
    
    // Now apply effects for each card with the pre-calculated synergy information
    for (const {id: cardId, card} of cardsToPlay) {
        console.log(`Playing card: ${card.name} (${cardId})`);
        
        // Apply card effects with the synergy map and collect detailed damage info
        const damageResult = applyCardEffectWithSynergy(card, 'player', synergyMap, true);
        if (card.type === 'attack' && damageResult && damageResult.totalDamage > 0) {
            damageLog.push({
                cardId: cardId,
                cardName: card.name,
                damage: damageResult.totalDamage,
                baseDamage: damageResult.baseDamage,
                synergyMultiplier: damageResult.synergyMultiplier,
                synergyType: damageResult.synergyType,
                damageBoost: damageResult.damageBoost,
                defenseMultiplier: damageResult.defenseMultiplier,
                vulnerabilityMultiplier: damageResult.vulnerabilityMultiplier,
                classEffects: damageResult.classEffects || false,
                isCrit: damageResult.isCrit || false,
                critMultiplier: damageResult.critMultiplier || 1.0,
                style: damageResult.style || null
            });
        }
    }
    
    // Discard selected cards
    for (const cardInstance of combatState.discardCards) {
        console.log(`Discarding card: ${cardInstance.cardId} (instance: ${cardInstance.instanceId})`);
        // Remove only this specific instance from hand
        combatState.playerHand = combatState.playerHand.filter(instance => 
            instance.instanceId !== cardInstance.instanceId
        );
    }
    
    // Deduct focus cost
    combatState.playerFocus -= combatState.totalFocusCost;
    console.log(`Focus cost: ${combatState.totalFocusCost}, Remaining focus: ${combatState.playerFocus}`);
    
    // Reset selections
    combatState.selectedCards = [];
    combatState.discardCards = [];
    combatState.totalFocusCost = 0;
    
    // Update UI
    displayPlayerHand();
    displayPlayedCards();
    updateFocusDisplay();
    updateFocusCostDisplay();
    
    // Process class-specific end of turn effects
    if (window.classSystem && typeof window.classSystem.processTurnEnd === 'function') {
        window.classSystem.processTurnEnd();
    }
    
    return damageLog;
}

// Get synergy bonus from the pre-calculated synergy map
function getSynergyBonusFromMap(card, synergyMap) {
    if (!card || card.type !== 'attack' || !card.affinity) {
        return { multiplier: 1.0, type: 'none' }; // No bonus for non-attack cards or cards without affinity
    }
    
    const cardAffinity = card.affinity.toLowerCase();
    
    // Initialize arrays if they don't exist
    if (!combatState.playedCards) {
        combatState.playedCards = [];
    }
    
    if (!combatState.enemyPlayedCards) {
        combatState.enemyPlayedCards = [];
    }
    
    // Determine which played cards array to use
    let cardIndex = -1;
    let isPlayerCard = false;
    
    // Safely check if the card is in the player's played cards
    if (Array.isArray(combatState.playedCards)) {
        isPlayerCard = combatState.playedCards.includes(card.id);
        if (isPlayerCard) {
            cardIndex = combatState.playedCards.indexOf(card.id);
        }
    }
    
    // If not found in player cards, check enemy cards
    if (cardIndex === -1 && Array.isArray(combatState.enemyPlayedCards)) {
        const isEnemyCard = combatState.enemyPlayedCards.includes(card.id);
        if (isEnemyCard) {
            cardIndex = combatState.enemyPlayedCards.indexOf(card.id);
        }
    }
    
    if (cardIndex === -1) {
        console.log(`Card ${card.name} (${card.id}) not found in any played cards array`);
        return { multiplier: 1.0, type: 'none' };
    }
    
    // Make sure synergyMap exists and has the cardIndex
    if (!synergyMap || synergyMap[cardIndex] === undefined) {
        console.log(`No synergy for ${card.name} at index ${cardIndex}`);
        return { multiplier: 1.0, type: 'none' };
    }
    
    const synergyType = synergyMap[cardIndex];
    
    // Apply multiplier based on synergy type
    if (synergyType === 'perfect') {
        console.log(`Perfect synergy multiplier applied to ${card.name}`);
        return { multiplier: 2.0, type: 'perfect' }; // 100% damage increase
    } else if (synergyType === 'unluck' && cardAffinity === 'normal') {
        console.log(`UNLUCK synergy penalty applied to ${card.name}`);
        return { multiplier: 0.5, type: 'unluck' }; // 50% damage reduction
    } else if (typeof synergyType === 'string' && synergyType.startsWith('monochromatic-')) {
        const element = synergyType.split('-')[1];
        if (cardAffinity === element) {
            console.log(`Monochromatic ${element} synergy multiplier applied to ${card.name}: x1.5`);
            return { multiplier: 1.5, type: `monochromatic-${element}` }; // 50% damage increase
        }
    } else if (typeof synergyType === 'number') {
        // Regular synergy
        console.log(`Regular synergy multiplier applied to ${card.name}`);
        return { multiplier: 1.2, type: 'regular' }; // 20% damage increase
    }
    
    return { multiplier: 1.0, type: 'none' };
}

// Apply card effect with pre-calculated synergy information
function applyCardEffectWithSynergy(card, source, synergyMap, collectDetails = false) {
    if (card.type === 'attack') {
        // Initialize damage details object if we're collecting details
        const damageDetails = collectDetails ? {
            baseDamage: card.base_damage,
            synergyMultiplier: 1.0,
            synergyType: 'none',
            damageBoost: 1.0,
            defenseMultiplier: 1.0,
            vulnerabilityMultiplier: 1.0,
            totalDamage: 0,
            isCrit: false,
            critMultiplier: 1.0,
            style: null
        } : null;
        
        // Apply damage
        let damage = card.base_damage;
        console.log(`Card ${card.name} base damage: ${damage}`);
        
        // Apply damage boost if active
        if (source === 'player' && combatState.playerDamageBoost > 1.0) {
            const boostedDamage = Math.floor(damage * combatState.playerDamageBoost);
            console.log(`Applying damage boost: ${damage} * ${combatState.playerDamageBoost} = ${boostedDamage}`);
            damage = boostedDamage;
            
            if (collectDetails) {
                damageDetails.damageBoost = combatState.playerDamageBoost;
            }
        }
        
        // Apply synergy multiplier based on the pre-calculated synergy map
        const synergyResult = getSynergyBonusFromMap(card, synergyMap);
        const synergyAdjustedDamage = Math.floor(damage * synergyResult.multiplier);
        console.log(`Applying synergy multiplier: ${damage} * ${synergyResult.multiplier} (${synergyResult.type}) = ${synergyAdjustedDamage}`);
        damage = synergyAdjustedDamage;
        
        if (collectDetails) {
            damageDetails.synergyMultiplier = synergyResult.multiplier;
            damageDetails.synergyType = synergyResult.type;
        }
        
        if (source === 'player') {
            // Apply enemy defense multiplier
            const defenseMultiplier = (2 - combatState.enemyDefenseMultiplier);
            const defenseAdjustedDamage = Math.floor(damage * defenseMultiplier);
            console.log(`After enemy defense: ${damage} * ${defenseMultiplier} = ${defenseAdjustedDamage}`);
            damage = defenseAdjustedDamage;
            
            if (collectDetails) {
                damageDetails.defenseMultiplier = defenseMultiplier;
            }
            
            // Apply enemy vulnerability multiplier
            const vulnerabilityMultiplier = combatState.enemyVulnerabilityMultiplier;
            const vulnerabilityAdjustedDamage = Math.floor(damage * vulnerabilityMultiplier);
            console.log(`After enemy vulnerability: ${damage} * ${vulnerabilityMultiplier} = ${vulnerabilityAdjustedDamage}`);
            damage = vulnerabilityAdjustedDamage;
            
            if (collectDetails) {
                damageDetails.vulnerabilityMultiplier = vulnerabilityMultiplier;
            }
            
            // Apply class-specific effects (if class system is available)
            if (window.classSystem && typeof window.classSystem.modifyCardEffect === 'function') {
                const originalDamage = damage;
                const classResult = window.classSystem.modifyCardEffect(card, damage);
                
                // THIS IS THE KEY CHANGE - Properly handle the result from modifyCardEffect
                if (typeof classResult === 'object' && classResult !== null) {
                    // If it's an object with damage and other properties
                    damage = classResult.damage || damage;
                    
                    // Store critical hit information if available
                    if (collectDetails) {
                        damageDetails.isCrit = classResult.isCrit || false;
                        damageDetails.critMultiplier = classResult.critMultiplier || 1.5;
                        damageDetails.style = classResult.style || null;
                        
                        // Log for debugging
                        console.log(`Critical hit info: isCrit=${damageDetails.isCrit}, multiplier=${damageDetails.critMultiplier}`);
                    }
                } else {
                    // If it's just a number, use that as the damage
                    damage = classResult || damage;
                }
                
                console.log(`After class effects: ${originalDamage} → ${damage}${damageDetails.isCrit ? ' (CRITICAL HIT!)' : ''}`);
            }
            
            if (collectDetails) {
                damageDetails.totalDamage = damage;
            }
            
            // Player attacking enemy
            combatState.enemyHealth -= damage;
            
            // Display appropriate message based on whether it was a critical hit
            if (damageDetails && damageDetails.isCrit) {
                displayCombatMessage(`CRITICAL HIT! You dealt ${damage} damage to ${combatState.currentFight.enemy.name}!`);
            } else {
                displayCombatMessage(`You dealt ${damage} damage to ${combatState.currentFight.enemy.name}!`);
            }
            
            console.log(`Final damage dealt to enemy: ${damage}`);
            
            // Apply reflect if active
            if (combatState.enemyReflectAmount > 0) {
                const reflectDamage = Math.floor(damage * combatState.enemyReflectAmount);
                combatState.playerHealth -= reflectDamage;
                displayCombatMessage(`${reflectDamage} damage was reflected back to you!`);
                console.log(`Damage reflected to player: ${reflectDamage}`);
                updatePlayerHealth();
            }
            
            updateEnemyHealth();
            
            // Check for secondary attack (for Bow's Spray shot style)
            if (window.classSystem && 
                typeof window.classSystem.shouldApplySecondaryAttack === 'function' && 
                window.classSystem.shouldApplySecondaryAttack()) {
                
                const secondaryMultiplier = window.classSystem.getSecondaryAttackMultiplier();
                const secondaryDamage = Math.floor(damage * secondaryMultiplier);
                
                if (secondaryDamage > 0) {
                    // Apply secondary attack after a short delay
                    setTimeout(() => {
                        combatState.enemyHealth -= secondaryDamage;
                        displayCombatMessage(`Spray effect: You dealt an additional ${secondaryDamage} damage!`);
                        updateEnemyHealth();
                        checkCombatEnd();
                    }, 500);
                }
            }
            
            return collectDetails ? damageDetails : damage;
        } else {
            // Apply player defense multiplier
            const defenseAdjustedDamage = Math.floor(damage * (2 - combatState.playerDefenseMultiplier));
            console.log(`After player defense: ${damage} * ${(2 - combatState.playerDefenseMultiplier)} = ${defenseAdjustedDamage}`);
            damage = defenseAdjustedDamage;
            
            // Apply player vulnerability multiplier
            const vulnerabilityAdjustedDamage = Math.floor(damage * combatState.playerVulnerabilityMultiplier);
            console.log(`After player vulnerability: ${damage} * ${combatState.playerVulnerabilityMultiplier} = ${vulnerabilityAdjustedDamage}`);
            damage = vulnerabilityAdjustedDamage;
            
            // Enemy attacking player
            combatState.playerHealth -= damage;
            displayCombatMessage(`${combatState.currentFight.enemy.name} dealt ${damage} damage to you!`);
            console.log(`Final damage dealt to player: ${damage}`);
            
            // Apply reflect if active
            if (combatState.playerReflectAmount > 0) {
                const reflectDamage = Math.floor(damage * combatState.playerReflectAmount);
                combatState.enemyHealth -= reflectDamage;
                displayCombatMessage(`${reflectDamage} damage was reflected back to the enemy!`);
                console.log(`Damage reflected to enemy: ${reflectDamage}`);
                updateEnemyHealth();
            }
            
            updatePlayerHealth();
            return damage; // Return the damage dealt for logging
        }
    } else if (card.type === 'action') {
        // Apply action effect based on card's effect property
        switch (card.effect_type) {
            case 'focus_gain':
                if (source === 'player') {
                    // For focus gain cards, we'll increase both the current focus AND the minimum focus
                    // This ensures the player gets full value from the card
                    const focusGain = Math.floor(card.effect_value);
                    
                    // Increase current focus
                    const newFocus = Math.min(combatState.playerFocus + focusGain, combatState.maxPlayerFocus);
                    const actualGain = newFocus - combatState.playerFocus;
                    combatState.playerFocus = newFocus;
                    
                    // Also temporarily increase minimum focus for the next turn
                    // Store this in a new property so it's only applied once
                    if (!combatState.nextTurnMinFocus || combatState.minPlayerFocus > combatState.nextTurnMinFocus) {
                        combatState.nextTurnMinFocus = combatState.minPlayerFocus + focusGain;
                    } else {
                        combatState.nextTurnMinFocus += focusGain;
                    }
                    
                    // Cap the next turn minimum focus at max focus
                    combatState.nextTurnMinFocus = Math.min(combatState.nextTurnMinFocus, combatState.maxPlayerFocus);
                    
                    displayCombatMessage(`You gained ${actualGain} focus now and will start with at least ${combatState.nextTurnMinFocus} focus next turn!`);
                    console.log(`Player gained ${actualGain} focus (from ${combatState.playerFocus - actualGain} to ${combatState.playerFocus})`);
                    console.log(`Next turn minimum focus set to ${combatState.nextTurnMinFocus}`);
                    updateFocusDisplay();
                }
                break;
            case 'heal':
                if (source === 'player') {
                    const healAmount = Math.floor(combatState.playerMaxHealth * card.effect_value);
                    combatState.playerHealth = Math.min(combatState.playerHealth + healAmount, combatState.playerMaxHealth);
                    displayCombatMessage(`You healed for ${healAmount} health!`);
                    console.log(`Player healed for ${healAmount} health`);
                    updatePlayerHealth();
                } else {
                    const healAmount = Math.floor(combatState.enemyMaxHealth * card.effect_value);
                    combatState.enemyHealth = Math.min(
                        combatState.enemyHealth + healAmount, 
                        combatState.enemyMaxHealth
                    );
                    displayCombatMessage(`${combatState.currentFight.enemy.name} healed for ${healAmount} health!`);
                    console.log(`Enemy healed for ${healAmount} health`);
                    updateEnemyHealth();
                }
                break;
            // Rest of the switch cases remain the same
        }
        return 0; // Action cards don't deal damage
    }
    
    // Check win/loss conditions
    checkCombatEnd();
    return 0; // Default return if no damage was dealt
}

// Select a card from hand
function selectCard(cardId) {
    const card = getCardById(cardId);
    if (!card) return;
    
    // Check if player has enough focus
    if (card.focus_cost > combatState.playerFocus) {
        displayCombatMessage("Not enough focus to play this card!");
        return;
    }
    
    // Remove card from hand and add to played cards
    combatState.playerHand = combatState.playerHand.filter(id => id !== cardId);
    combatState.playedCards.push(cardId);
    combatState.playerFocus -= card.focus_cost;
    
    // Update UI
    displayPlayerHand();
    displayPlayedCards();
    updateFocusDisplay();
    
    // Apply card effects immediately
    applyCardEffect(card, 'player');
}

// Display played cards
function displayPlayedCards() {
    const playedArea = document.getElementById('player-cards-played');
    if (!playedArea) {
        console.warn("Element 'player-cards-played' not found in the DOM");
        return; // Exit the function if the element doesn't exist
    }
    
    playedArea.innerHTML = '';
    
    combatState.playedCards.forEach(cardId => {
        const card = getCardById(cardId);
        if (!card) return;
        
        const cardElement = createCardElement(card);
        cardElement.classList.add('played');
        playedArea.appendChild(cardElement);
    });
}

// Update focus display
function updateFocusDisplay() {
    const focusFill = document.querySelector('.focus-fill');
    const focusText = document.querySelector('.focus-bar span');
    
    if (focusFill && focusText) {
        focusFill.style.width = `${(combatState.playerFocus / combatState.maxPlayerFocus) * 100}%`;
        focusText.textContent = `Focus: ${combatState.playerFocus}/${combatState.maxPlayerFocus} (Min: ${combatState.minPlayerFocus})`;
    }
}

// Apply card effect
function applyCardEffect(card, source) {
    if (card.type === 'attack') {
        // Apply damage
        let damage = card.base_damage;
        console.log(`Card ${card.name} base damage: ${damage}`);
        
        // Apply damage boost if active
        if (source === 'player' && combatState.playerDamageBoost > 1.0) {
            const boostedDamage = Math.floor(damage * combatState.playerDamageBoost);
            console.log(`Applying damage boost: ${damage} * ${combatState.playerDamageBoost} = ${boostedDamage}`);
            damage = boostedDamage;
        }
        
        // Apply synergy multiplier to this specific card
        const synergyMultiplier = calculateSynergyBonusForCard(card, source);
        console.log(`Synergy multiplier for ${card.name}: ${synergyMultiplier}`);
        damage = Math.floor(damage * synergyMultiplier);
        
        if (source === 'player') {
            // Apply enemy defense multiplier
            const defenseAdjustedDamage = Math.floor(damage * (2 - combatState.enemyDefenseMultiplier));
            console.log(`After enemy defense: ${damage} * ${(2 - combatState.enemyDefenseMultiplier)} = ${defenseAdjustedDamage}`);
            damage = defenseAdjustedDamage;
            
            // Apply enemy vulnerability multiplier
            const vulnerabilityAdjustedDamage = Math.floor(damage * combatState.enemyVulnerabilityMultiplier);
            console.log(`After enemy vulnerability: ${damage} * ${combatState.enemyVulnerabilityMultiplier} = ${vulnerabilityAdjustedDamage}`);
            damage = vulnerabilityAdjustedDamage;
            
            // Player attacking enemy
            combatState.enemyHealth -= damage;
            displayCombatMessage(`You dealt ${damage} damage to ${combatState.currentFight.enemy.name}!`);
            console.log(`Final damage dealt to enemy: ${damage}, enemy health now: ${combatState.enemyHealth}`);
            
            // Apply reflect if active
            if (combatState.enemyReflectAmount > 0) {
                const reflectDamage = Math.floor(damage * combatState.enemyReflectAmount);
                combatState.playerHealth -= reflectDamage;
                displayCombatMessage(`${reflectDamage} damage was reflected back to you!`);
                console.log(`Damage reflected to player: ${reflectDamage}`);
                updatePlayerHealth();
            }
            
            updateEnemyHealth();
            
            // Check if enemy is defeated immediately after taking damage
            if (combatState.enemyHealth <= 0) {
                console.log("Enemy health dropped to zero or below, checking combat end");
                return checkCombatEnd();
            }
            
            return damage; // Return the damage dealt for logging
        } else {
            // Apply player defense multiplier
            const defenseAdjustedDamage = Math.floor(damage * (2 - combatState.playerDefenseMultiplier));
            console.log(`After player defense: ${damage} * ${(2 - combatState.playerDefenseMultiplier)} = ${defenseAdjustedDamage}`);
            damage = defenseAdjustedDamage;
            
            // Apply player vulnerability multiplier
            const vulnerabilityAdjustedDamage = Math.floor(damage * combatState.playerVulnerabilityMultiplier);
            console.log(`After player vulnerability: ${damage} * ${combatState.playerVulnerabilityMultiplier} = ${vulnerabilityAdjustedDamage}`);
            damage = vulnerabilityAdjustedDamage;
            
            // Enemy attacking player
            combatState.playerHealth -= damage;
            displayCombatMessage(`${combatState.currentFight.enemy.name} dealt ${damage} damage to you!`);
            console.log(`Final damage dealt to player: ${damage}, player health now: ${combatState.playerHealth}`);
            
            // Apply reflect if active
            if (combatState.playerReflectAmount > 0) {
                const reflectDamage = Math.floor(damage * combatState.playerReflectAmount);
                combatState.enemyHealth -= reflectDamage;
                displayCombatMessage(`${reflectDamage} damage was reflected back to the enemy!`);
                console.log(`Damage reflected to enemy: ${reflectDamage}`);
                updateEnemyHealth();
                
                // Check if enemy is defeated by reflect damage
                if (combatState.enemyHealth <= 0) {
                    console.log("Enemy health dropped to zero or below from reflect damage, checking combat end");
                    return checkCombatEnd();
                }
            }
            
            updatePlayerHealth();
            
            // Check if player is defeated immediately after taking damage
            if (combatState.playerHealth <= 0) {
                console.log("Player health dropped to zero or below, checking combat end");
                return checkCombatEnd();
            }
            
            return damage; // Return the damage dealt for logging
        }
    } else if (card.type === 'action') {
        // Apply action effect based on card's effect property
        switch (card.effect_type) {
            case 'heal':
                if (source === 'player') {
                    const healAmount = Math.floor(combatState.playerMaxHealth * card.effect_value);
                    combatState.playerHealth = Math.min(combatState.playerHealth + healAmount, combatState.playerMaxHealth);
                    displayCombatMessage(`You healed for ${healAmount} health!`);
                    console.log(`Player healed for ${healAmount} health`);
                    updatePlayerHealth();
                } else {
                    const healAmount = Math.floor(combatState.enemyMaxHealth * card.effect_value);
                    combatState.enemyHealth = Math.min(
                        combatState.enemyHealth + healAmount, 
                        combatState.enemyMaxHealth
                    );
                    displayCombatMessage(`${combatState.currentFight.enemy.name} healed for ${healAmount} health!`);
                    console.log(`Enemy healed for ${healAmount} health`);
                    updateEnemyHealth();
                }
                break;
            // Rest of the switch cases remain the same
        }
        return 0; // Action cards don't deal damage
    }
    
    // Check win/loss conditions
    checkCombatEnd();
    return 0; // Default return if no damage was dealt
}

// Calculate synergy bonus for a specific card
function calculateSynergyBonusForCard(card, source) {
    if (!card || card.type !== 'attack' || !card.affinity) {
        return 1.0; // No multiplier for non-attack cards or cards without affinity
    }
    
    const cardAffinity = card.affinity.toLowerCase();
    const playedCards = source === 'player' ? combatState.playedCards : combatState.enemyPlayedCards;
    const cardObjects = playedCards.map(getCardById).filter(c => c && c.type === 'attack');
    
    // Get affinities of all played cards
    const affinities = cardObjects.map(c => c.affinity.toLowerCase());
    console.log(`All played affinities: ${affinities.join(', ')}`);
    
    // Find the index of the current card in the played cards
    const currentCardIndex = playedCards.indexOf(card.id);
    if (currentCardIndex === -1) {
        console.log(`Card ${card.name} not found in played cards`);
        return 1.0;
    }
    
    // Check for perfect synergy: all 5 elemental affinities
    const elementalAffinities = ['fire', 'water', 'thunder', 'light', 'dark'];
    const hasAllElements = elementalAffinities.every(aff => affinities.includes(aff));
    
    if (hasAllElements) {
        console.log(`Perfect synergy detected for ${card.name}`);
        return 2.0; // 100% damage increase
    }
    
    // Check for UNLUCK synergy: 5 normal cards
    if (cardAffinity === 'normal') {
        const normalCount = affinities.filter(aff => aff === 'normal').length;
        if (normalCount >= 5) {
            console.log(`UNLUCK synergy detected for ${card.name}`);
            return 2.2; // 120% damage increase
        }
    }
    
    // Check for monochromatic synergies: 3 cards of the same element
    if (elementalAffinities.includes(cardAffinity)) {
        const sameElementCount = affinities.filter(aff => aff === cardAffinity).length;
        if (sameElementCount >= 3) {
            console.log(`Monochromatic ${cardAffinity} synergy detected for ${card.name}`);
            return 1.5; // 50% damage increase
        }
    }
    
    // Check for regular synergies
    let multiplier = 1.0;
    for (const [elem1, elem2] of SYNERGIES.regular) {
        // Only apply multiplier if this card is part of the synergy pair
        if ((cardAffinity === elem1 && affinities.includes(elem2)) || 
            (cardAffinity === elem2 && affinities.includes(elem1))) {
            multiplier *= 1.2; // 20% damage increase per synergy
            console.log(`Regular synergy ${elem1}-${elem2} detected for ${card.name}`);
        }
    }
    
    return multiplier;
}

// Update enemy health display
function updateEnemyHealth() {
    const healthBar = document.querySelector('#enemy-area .health-fill');
    const healthText = document.querySelector('#enemy-area .health-bar span');
    
    if (healthBar && healthText) {
        const healthPercentage = (combatState.enemyHealth / combatState.enemyMaxHealth) * 100;
        healthBar.style.width = `${healthPercentage}%`;
        healthText.textContent = `${combatState.enemyHealth}/${combatState.enemyMaxHealth}`;
    }
}

// Update player health display
function updatePlayerHealth() {
    const healthBar = document.querySelector('#player-area .health-fill');
    const healthText = document.querySelector('#player-area .health-bar span');
    
    if (healthBar && healthText) {
        const healthPercentage = (combatState.playerHealth / combatState.playerMaxHealth) * 100;
        healthBar.style.width = `${healthPercentage}%`;
        healthText.textContent = `${combatState.playerHealth}/${combatState.playerMaxHealth}`;
    }
}

// Display combat message
function displayCombatMessage(message) {
    const messagesDiv = document.getElementById('combat-messages');
    if (messagesDiv) {
        // Replace the content instead of appending
        messagesDiv.innerHTML = `<div class="combat-message">${message}</div>`;
    }
}

// End player turn
function endPlayerTurn() {
    // Remove all indicators
    const indicators = document.querySelectorAll('.card-number-indicator');
    indicators.forEach(indicator => {
        indicator.parentNode.removeChild(indicator);
    });

    console.log("=== PLAYING SELECTED CARDS ===");
    const damageLog = playSelectedCards();
    
    // Log the final damage summary
    if (damageLog.length > 0) {
        const damageValues = damageLog.map(item => item.damage);
        const totalDamage = damageValues.reduce((sum, damage) => sum + damage, 0);
        const damageFormula = damageLog.map(item => item.damage).join(' + ');
        console.log(`%c=== DAMAGE SUMMARY ===`, 'color:rgb(224, 31, 31); font-weight: bold;');
        
        damageLog.forEach(item => {
            // Format the detailed damage log with different colors for each component
            const baseDamageText = `${item.baseDamage}`;
            
            // Format synergy text
            let synergyText = '';
            if (item.synergyMultiplier !== 1.0) {
                synergyText = ` x${item.synergyMultiplier.toFixed(1)} (${item.synergyType})`;
            }
            
            // Format critical hit text 
            let critText = '';
            if (item.isCrit) {
                critText = ` x${item.critMultiplier || 1.5} (critical hit)`;
            }
            
            // Format multiplier texts
            const damageBoostText = item.damageBoost > 1.0 ? ` x${item.damageBoost.toFixed(1)} boost` : '';
            const defenseText = item.defenseMultiplier !== 1.0 ? ` x${item.defenseMultiplier.toFixed(1)} def` : '';
            const vulnText = item.vulnerabilityMultiplier !== 1.0 ? ` x${item.vulnerabilityMultiplier.toFixed(1)} vuln` : '';
            
            // Style text if applicable
            const styleText = item.style ? ` (${item.style})` : '';
            
            // Combine all parts with different colors
            console.log(
                `%c${item.cardName}: %c${item.damage} damage %c[${baseDamageText}%c${synergyText}%c${critText}%c]%c${damageBoostText}%c${defenseText}%c${vulnText}${styleText}`, 
                'color:rgb(238, 53, 53); font-weight: bold;',   // Card name
                'color:rgb(255, 0, 0); font-weight: bold;',     // Total damage
                'color:rgb(0, 128, 0);',                        // Base damage
                'color:rgb(255, 165, 0);',                      // Synergy multiplier
                'color:rgb(255, 215, 0);',                      // Critical hit
                'color:rgb(0, 128, 0);',                        // Closing bracket
                'color:rgb(0, 0, 255);',                        // Damage boost
                'color:rgb(128, 0, 128);',                      // Defense multiplier
                'color:rgb(255, 0, 255);'                       // Vulnerability multiplier
            );
        });
        
        console.log(`%cTotal: ${damageFormula} = ${totalDamage} DMG`, 'color:rgb(236, 91, 91); font-weight: bold;');
    }
    
    // Clear played cards
    combatState.playedCards = [];
    displayPlayedCards();
    
    // Clear the affinity chain display
    const affinityChainDisplay = document.getElementById('affinity-chain-display');
    if (affinityChainDisplay) {
        affinityChainDisplay.innerHTML = '';
    }
    
    // Start enemy turn
    startEnemyTurn();
}

// Sacrifice turn for focus
function sacrificeForFocus() {
    displayCombatMessage("You sacrificed your turn to regain focus!");
    
    // Gain extra focus (more than regular regeneration)
    const focusGain = combatState.focusRegen + 2;
    combatState.playerFocus = Math.min(combatState.playerFocus + focusGain, combatState.maxPlayerFocus);
    updateFocusDisplay();
    
    // Clear played cards
    combatState.playedCards = [];
    displayPlayedCards();
    
    // Start enemy turn
    startEnemyTurn();
}

// Start player turn
function startPlayerTurn() {
    console.log("=== STARTING PLAYER TURN ===");
    
    combatState.turnCount++;
    displayCombatMessage(`--- Turn ${combatState.turnCount}: Your Turn ---`);
    
    // Reset defense multiplier each turn
    combatState.playerDefenseMultiplier = 1.0;
    
    // Reset vulnerability multiplier unless from tank_heal
    if (combatState.playerTankHealAmount === 0) {
        combatState.playerVulnerabilityMultiplier = 1.0;
    }
    
    // Reset reflect amount
    combatState.playerReflectAmount = 0;
    
    // Check if tank_heal should trigger
    if (combatState.playerTankHealAmount > 0) {
        const healAmount = Math.floor(combatState.playerMaxHealth * combatState.playerTankHealAmount);
        combatState.playerHealth = Math.min(combatState.playerHealth + healAmount, combatState.playerMaxHealth);
        displayCombatMessage(`Last Stand activated! You healed for ${healAmount} health!`);
        updatePlayerHealth();
        
        // Reset tank heal and vulnerability
        combatState.playerTankHealAmount = 0;
        combatState.playerVulnerabilityMultiplier = 1.0;
    }
    
    // Decrement damage boost duration
    if (combatState.playerDamageBoostDuration > 0) {
        combatState.playerDamageBoostDuration--;
        if (combatState.playerDamageBoostDuration === 0) {
            combatState.playerDamageBoost = 1.0;
            displayCombatMessage("Your damage boost has worn off.");
        } else {
            displayCombatMessage(`Damage boost active: ${Math.round((combatState.playerDamageBoost - 1.0) * 100)}% for ${combatState.playerDamageBoostDuration} more turns.`);
        }
    }
    
    // Check if we have a boosted minimum focus from focus gain cards
    if (combatState.nextTurnMinFocus && combatState.nextTurnMinFocus > combatState.minPlayerFocus) {
        const boostedMin = combatState.nextTurnMinFocus;
        console.log(`Using boosted minimum focus: ${boostedMin} (base: ${combatState.minPlayerFocus})`);
        
        // If focus is below the boosted minimum, restore to the boosted minimum
        if (combatState.playerFocus < boostedMin) {
            const focusGain = boostedMin - combatState.playerFocus;
            combatState.playerFocus = boostedMin;
            displayCombatMessage(`Focus boosted by ${focusGain} from previous focus card!`);
        }
        
        // Reset the next turn minimum focus
        combatState.nextTurnMinFocus = null;
    }
    // Regular minimum focus check
    else if (combatState.playerFocus < combatState.minPlayerFocus) {
        console.log(`Focus below minimum (${combatState.playerFocus}/${combatState.minPlayerFocus}), restoring to minimum`);
        combatState.playerFocus = combatState.minPlayerFocus;
        displayCombatMessage(`Focus restored to minimum: ${combatState.minPlayerFocus}`);
    }
    
    // No automatic focus regeneration beyond minimum
    updateFocusDisplay();
    
    // Enable player controls
    const endTurnBtn = document.getElementById('end-turn-btn');     
    if (endTurnBtn) {
        console.log("Enabling end turn button");
        endTurnBtn.disabled = false;
    }
    
    const focusBtn = document.getElementById('focus-btn');
    if (focusBtn) {
        console.log("Enabling focus button");
        focusBtn.disabled = false;
    }
    
    // Count current attack and action cards
    const attackCards = combatState.playerHand.filter(cardInstance => {
        const card = getCardById(cardInstance.cardId);
        return card && card.type === 'attack';
    });

    const actionCards = combatState.playerHand.filter(cardInstance => {
        const card = getCardById(cardInstance.cardId);
        return card && card.type === 'action';
    });
    
    console.log(`Current hand: ${attackCards.length} attack cards, ${actionCards.length} action cards`);
    
    // Fill up missing attack cards
    const attackCardsToDraw = 7 - attackCards.length;
    console.log(`Drawing ${attackCardsToDraw} attack cards`);
    for (let i = 0; i < attackCardsToDraw; i++) {
        if (combatState.playerAttackPool.length > 0) {
            const cardIndex = Math.floor(Math.random() * combatState.playerAttackPool.length);
            const drawnCardId = combatState.playerAttackPool[cardIndex];
            // Add a unique instance ID to the card
            const cardInstance = {
                cardId: drawnCardId,
                instanceId: `${drawnCardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            combatState.playerHand.push(cardInstance);
        }
    }
    
    // Fill up missing action cards
    const actionCardsToDraw = 3 - actionCards.length;
    console.log(`Drawing ${actionCardsToDraw} action cards`);
    for (let i = 0; i < actionCardsToDraw; i++) {
        if (combatState.playerActionPool.length > 0) {
            const cardIndex = Math.floor(Math.random() * combatState.playerActionPool.length);
            const drawnCardId = combatState.playerActionPool[cardIndex];
            // Add a unique instance ID to the card
            const cardInstance = {
                cardId: drawnCardId,
                instanceId: `${drawnCardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            combatState.playerHand.push(cardInstance);
        }
    }
    
    // Update the display
    displayPlayerHand();
    
    // Reset selections
    combatState.selectedCards = [];
    combatState.discardCards = [];
    combatState.totalFocusCost = 0;
    updateFocusCostDisplay();
    
    console.log("Player turn started successfully");
}

// Start enemy turn
function startEnemyTurn() {
    console.log("=== STARTING ENEMY TURN ===");
    displayCombatMessage(`--- ${combatState.currentFight.enemy.name}'s Turn ---`);
    
    // Disable player controls - safely check if elements exist first
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) {
        console.log("Disabling end turn button");
        endTurnBtn.disabled = true;
    } else {
        console.warn("End turn button not found in the DOM");
    }
    
    const focusBtn = document.getElementById('focus-btn');
    if (focusBtn) {
        console.log("Disabling focus button");
        focusBtn.disabled = true;
    } else {
        console.warn("Focus button not found in the DOM");
    }
    
    // Log current combat state
    console.log("Current combat state:", {
        enemyName: combatState.currentFight?.enemy?.name,
        enemyHealth: combatState.enemyHealth,
        enemyMaxHealth: combatState.enemyMaxHealth,
        difficulty: combatState.currentFight?.enemy?.difficulty,
        enemyAttackPool: combatState.enemyAttackPool,
        enemyActionPool: combatState.enemyActionPool
    });
    
    // Enemy AI selects and plays cards
    console.log("Scheduling enemy turn execution in 1 second");
    setTimeout(() => {
        executeEnemyTurn();
    }, 1000);
}

// Execute enemy turn
function executeEnemyTurn() {
    console.log("=== EXECUTING ENEMY TURN ===");
    
    // Clear enemy played cards
    combatState.enemyPlayedCards = [];
    
    // Get enemy difficulty
    const difficulty = combatState.currentFight?.enemy?.difficulty || "easy";
    console.log(`Enemy difficulty: ${difficulty}`);
    
    // For "easy" difficulty, just pick 2 random cards from the attack deck
    if (difficulty === "easy") {
        console.log("Using easy difficulty logic");
        playEasyEnemyTurn();
    } else {
        console.log(`Unhandled difficulty: ${difficulty}, defaulting to easy`);
        playEasyEnemyTurn();
    }
}

// Play enemy turn with "easy" difficulty
function playEasyEnemyTurn() {
    console.log("=== PLAYING EASY ENEMY TURN ===");
    
    const attackDeck = combatState.enemyAttackPool;
    console.log("Enemy attack deck:", attackDeck);
    
    // Check if there are cards in the attack deck
    if (!attackDeck || attackDeck.length === 0) {
        console.error("Enemy attack deck is empty or not defined");
        console.log("Skipping to player turn due to empty deck");
        startPlayerTurn(); // Skip to player turn
        return;
    }
    
    // Select 2 random cards (or fewer if deck is smaller)
    const cardsToPlay = Math.min(2, attackDeck.length);
    console.log(`Will play ${cardsToPlay} cards from attack deck of size ${attackDeck.length}`);
    
    // Clear enemy played cards
    combatState.enemyPlayedCards = [];
    
    // Select all cards first
    const selectedCardIds = [];
    const selectedCards = [];
    
    for (let i = 0; i < cardsToPlay; i++) {
        // Pick a random card from the attack deck
        const randomIndex = Math.floor(Math.random() * attackDeck.length);
        const cardId = attackDeck[randomIndex];
        
        if (!cardId) {
            console.error(`Invalid card at index ${randomIndex} in enemy attack deck`);
            continue;
        }
        
        const card = getCardById(cardId);
        if (!card) {
            console.error(`Failed to get card data for ID: ${cardId}`);
            continue;
        }
        
        selectedCardIds.push(cardId);
        selectedCards.push(card);
        
        // Add to played cards sequence
        combatState.enemyPlayedCards.push(cardId);
    }
    
    console.log("Enemy selected cards:", selectedCardIds);
    
    // If no valid cards were selected, skip to player turn
    if (selectedCardIds.length === 0) {
        console.log("No valid cards selected, skipping to player turn");
        startPlayerTurn();
        return;
    }
    
    // Pre-calculate synergy map for all cards
    const playedCardObjects = combatState.enemyPlayedCards.map(getCardById).filter(c => c && c.type === 'attack');
    const affinities = playedCardObjects.map(c => c.affinity ? c.affinity.toLowerCase() : 'normal');
    const synergyMap = findSynergies(affinities);
    
    console.log("Enemy synergy map for this sequence:", synergyMap);
    
    const enemyDamageLog = []; // Track enemy damage
    
    // Function to play the selected cards with delay
    function playSelectedCards(index) {
        if (index >= selectedCardIds.length) {
            // All cards played, log the damage summary
            if (enemyDamageLog.length > 0) {
                const damageValues = enemyDamageLog.map(item => item.damage);
                const totalDamage = damageValues.reduce((sum, damage) => sum + damage, 0);
                const damageFormula = enemyDamageLog.map(item => item.damage).join(' + ');
                
                console.log(`%c=== ENEMY DAMAGE SUMMARY ===`, 'color:rgb(31, 31, 224); font-weight: bold;');
                
                enemyDamageLog.forEach(item => {
                    // Format the detailed damage log with different colors for each component
                    const baseDamageText = `${item.baseDamage}`;
                    
                    // Format synergy text
                    let synergyText = '';
                    if (item.synergyMultiplier !== 1.0) {
                        synergyText = ` x${item.synergyMultiplier.toFixed(1)} (${item.synergyType})`;
                    }
                    
                    // Format multiplier texts
                    const defenseText = item.defenseMultiplier !== 1.0 ? ` x${item.defenseMultiplier.toFixed(1)} def` : '';
                    const vulnText = item.vulnerabilityMultiplier !== 1.0 ? ` x${item.vulnerabilityMultiplier.toFixed(1)} vuln` : '';
                    
                    // Combine all parts with different colors
                    console.log(
                        `%c${item.cardName}: %c${item.damage} damage %c[${baseDamageText}%c${synergyText}%c]%c${defenseText}%c${vulnText}`, 
                        'color:rgb(53, 53, 238); font-weight: bold;', // Card name
                        'color:rgb(0, 0, 255); font-weight: bold;',   // Total damage
                        'color:rgb(0, 128, 0);',                      // Base damage
                        'color:rgb(255, 165, 0);',                    // Synergy multiplier
                        'color:rgb(0, 128, 0);',                      // Closing bracket
                        'color:rgb(128, 0, 128);',                    // Defense multiplier
                        'color:rgb(255, 0, 255);'                     // Vulnerability multiplier
                    );
                });
                
                console.log(`%cTotal: ${damageFormula} = ${totalDamage} DMG`, 'color:rgb(91, 91, 236); font-weight: bold;');
            }
            
            // Move to player turn if combat is still ongoing
            if (!checkCombatEnd()) {
                setTimeout(startPlayerTurn, 1000);
            }
            return;
        }
        
        // Check if combat has already ended
        if (checkCombatEnd()) {
            console.log("Combat has ended, stopping enemy turn");
            return;
        }
        
        const cardId = selectedCardIds[index];
        const card = selectedCards[index];
        
        console.log(`Playing enemy card ${index + 1}/${selectedCardIds.length}: ${card.name} (${cardId})`);
        
        // Display enemy playing card
        displayCombatMessage(`${combatState.currentFight.enemy.name} plays ${card.name}!`);
        
        // Apply card effect with synergy
        if (card.type === 'attack') {
            // Get synergy details from the pre-calculated map
            const synergyResult = getSynergyBonusFromMap(card, synergyMap);
            const synergyMultiplier = synergyResult.multiplier;
            const synergyType = synergyResult.type;
            
            // Apply damage calculation
            let damage = card.base_damage;
            
            // Apply synergy multiplier
            damage = Math.floor(damage * synergyMultiplier);
            
            // Apply player defense multiplier
            const defenseMultiplier = (2 - combatState.playerDefenseMultiplier);
            damage = Math.floor(damage * defenseMultiplier);
            
            // Apply player vulnerability multiplier
            const vulnerabilityMultiplier = combatState.playerVulnerabilityMultiplier;
            damage = Math.floor(damage * vulnerabilityMultiplier);
            
            // Apply damage to player
            combatState.playerHealth -= damage;
            displayCombatMessage(`${combatState.currentFight.enemy.name} dealt ${damage} damage to you!`);
            
            // Apply reflect if active
            if (combatState.playerReflectAmount > 0) {
                const reflectDamage = Math.floor(damage * combatState.playerReflectAmount);
                combatState.enemyHealth -= reflectDamage;
                displayCombatMessage(`${reflectDamage} damage was reflected back to the enemy!`);
                updateEnemyHealth();
            }
            
            updatePlayerHealth();
            
            // Log the damage details
            enemyDamageLog.push({
                cardId: cardId,
                cardName: card.name,
                damage: damage,
                baseDamage: card.base_damage,
                synergyMultiplier: synergyMultiplier,
                synergyType: synergyType,
                defenseMultiplier: defenseMultiplier,
                vulnerabilityMultiplier: vulnerabilityMultiplier
            });
        } else if (card.type === 'action') {
            // For action cards, apply the effect
            applyCardEffect(card, 'enemy');
        }
        
        // Check if combat has ended after playing this card
        if (checkCombatEnd()) {
            console.log("Combat ended after enemy played a card");
            return;
        }
        
        // Play next card after delay
        console.log(`Scheduling next card in 800ms`);
        setTimeout(() => playSelectedCards(index + 1), 800);
    }
    
    // Start playing the selected cards
    console.log("Starting to play enemy cards");
    playSelectedCards(0);
}

function getSynergyTypeForCard(card, source) {
    if (!card || card.type !== 'attack' || !card.affinity) {
        return 'none';
    }
    
    const cardAffinity = card.affinity.toLowerCase();
    const playedCards = source === 'player' ? combatState.playedCards : combatState.enemyPlayedCards;
    const cardObjects = playedCards.map(getCardById).filter(c => c && c.type === 'attack');
    
    // Get affinities of all played cards
    const affinities = cardObjects.map(c => c.affinity ? c.affinity.toLowerCase() : 'normal');
    
    // Check for perfect synergy
    const elementalAffinities = ['fire', 'water', 'thunder', 'light', 'dark'];
    const hasAllElements = elementalAffinities.every(aff => affinities.includes(aff));
    
    if (hasAllElements) {
        return 'perfect';
    }
    
    // Check for UNLUCK synergy
    if (cardAffinity === 'normal') {
        const normalCount = affinities.filter(aff => aff === 'normal').length;
        if (normalCount >= 5) {
            return 'unluck';
        }
    }
    
    // Check for monochromatic synergies
    if (elementalAffinities.includes(cardAffinity)) {
        const sameElementCount = affinities.filter(aff => aff === cardAffinity).length;
        if (sameElementCount >= 3) {
            return `monochromatic-${cardAffinity}`;
        }
    }
    
    // Check for regular synergies
    for (const [elem1, elem2] of SYNERGIES.regular) {
        if ((cardAffinity === elem1 && affinities.includes(elem2)) || 
            (cardAffinity === elem2 && affinities.includes(elem1))) {
            return 'regular';
        }
    }
    
    return 'none';
}

// Check if combat has ended
function checkCombatEnd() {
    // Check if enemy is defeated
    if (combatState.enemyHealth <= 0) {
        combatState.inCombat = false;
        displayCombatMessage(`You defeated ${combatState.currentFight.enemy.name}!`);
        
        setTimeout(() => {
            endCombat('victory');
        }, 2000);
        return true;
    }
    
    // Check if player is defeated
    if (combatState.playerHealth <= 0) {
        combatState.inCombat = false;
        displayCombatMessage("You have been defeated!");
        
        setTimeout(() => {
            endCombat('defeat');
        }, 2000);
        return true;
    }
    
    return false;
}

// Apply card effect
function applyCardEffect(card, source) {
    if (card.type === 'attack') {
        // Apply damage
        let baseDamage = card.base_damage;
        console.log(`Card ${card.name} base damage: ${baseDamage}`);
        
        // Apply damage boost if active
        if (source === 'player' && combatState.playerDamageBoost > 1.0) {
           
            const boostedDamage = Math.floor(baseDamage * combatState.playerDamageBoost);
            console.log(`Applying damage boost: ${baseDamage} * ${combatState.playerDamageBoost} = ${boostedDamage}`);
            baseDamage = boostedDamage;
        }
        
        // Apply synergy bonuses only to this specific card
        const synergyBonus = calculateSynergyBonusForCard(card, source);
        console.log(`Synergy bonus for ${card.name}: ${synergyBonus}`);
        let damage = baseDamage + synergyBonus;
        
        if (source === 'player') {
            // Apply enemy defense multiplier
            const defenseAdjustedDamage = Math.floor(damage * (2 - combatState.enemyDefenseMultiplier));
            console.log(`After enemy defense: ${damage} * ${(2 - combatState.enemyDefenseMultiplier)} = ${defenseAdjustedDamage}`);
            damage = defenseAdjustedDamage;
            
            // Apply enemy vulnerability multiplier
            const vulnerabilityAdjustedDamage = Math.floor(damage * combatState.enemyVulnerabilityMultiplier);
            console.log(`After enemy vulnerability: ${damage} * ${combatState.enemyVulnerabilityMultiplier} = ${vulnerabilityAdjustedDamage}`);
            damage = vulnerabilityAdjustedDamage;
            
            // Player attacking enemy
            combatState.enemyHealth -= damage;
            displayCombatMessage(`You dealt ${damage} damage to ${combatState.currentFight.enemy.name}!`);
            console.log(`Final damage dealt to enemy: ${damage}, enemy health now: ${combatState.enemyHealth}`);
            
            // Apply reflect if active
            if (combatState.enemyReflectAmount > 0) {
                const reflectDamage = Math.floor(damage * combatState.enemyReflectAmount);
                combatState.playerHealth -= reflectDamage;
                displayCombatMessage(`${reflectDamage} damage was reflected back to you!`);
                console.log(`Damage reflected to player: ${reflectDamage}`);
                updatePlayerHealth();
            }
            
            updateEnemyHealth();
            
            // Check if enemy is defeated immediately after taking damage
            if (combatState.enemyHealth <= 0) {
                console.log("Enemy health dropped to zero or below, checking combat end");
                return checkCombatEnd();
            }
            
            return damage; // Return the damage dealt for logging
        } else {
            // Apply player defense multiplier
            const defenseAdjustedDamage = Math.floor(damage * (2 - combatState.playerDefenseMultiplier));
            console.log(`After player defense: ${damage} * ${(2 - combatState.playerDefenseMultiplier)} = ${defenseAdjustedDamage}`);
            damage = defenseAdjustedDamage;
            
            // Apply player vulnerability multiplier
            const vulnerabilityAdjustedDamage = Math.floor(damage * combatState.playerVulnerabilityMultiplier);
            console.log(`After player vulnerability: ${damage} * ${combatState.playerVulnerabilityMultiplier} = ${vulnerabilityAdjustedDamage}`);
            damage = vulnerabilityAdjustedDamage;
            
            // Enemy attacking player
            combatState.playerHealth -= damage;
            displayCombatMessage(`${combatState.currentFight.enemy.name} dealt ${damage} damage to you!`);
            console.log(`Final damage dealt to player: ${damage}, player health now: ${combatState.playerHealth}`);
            
            // Apply reflect if active
            if (combatState.playerReflectAmount > 0) {
                const reflectDamage = Math.floor(damage * combatState.playerReflectAmount);
                combatState.enemyHealth -= reflectDamage;
                displayCombatMessage(`${reflectDamage} damage was reflected back to the enemy!`);
                console.log(`Damage reflected to enemy: ${reflectDamage}`);
                updateEnemyHealth();
                
                // Check if enemy is defeated by reflect damage
                if (combatState.enemyHealth <= 0) {
                    console.log("Enemy health dropped to zero or below from reflect damage, checking combat end");
                    return checkCombatEnd();
                }
            }
            
            updatePlayerHealth();
            
            // Check if player is defeated immediately after taking damage
            if (combatState.playerHealth <= 0) {
                console.log("Player health dropped to zero or below, checking combat end");
                return checkCombatEnd();
            }
            
            return damage; // Return the damage dealt for logging
        }
    } else if (card.type === 'action') {
        // Apply action effect based on card's effect property
        switch (card.effect_type) {
            case 'heal':
                if (source === 'player') {
                    const healAmount = Math.floor(combatState.playerMaxHealth * card.effect_value);
                    combatState.playerHealth = Math.min(combatState.playerHealth + healAmount, combatState.playerMaxHealth);
                    displayCombatMessage(`You healed for ${healAmount} health!`);
                    console.log(`Player healed for ${healAmount} health`);
                    updatePlayerHealth();
                } else {
                    const healAmount = Math.floor(combatState.enemyMaxHealth * card.effect_value);
                    combatState.enemyHealth = Math.min(
                        combatState.enemyHealth + healAmount, 
                        combatState.enemyMaxHealth
                    );
                    displayCombatMessage(`${combatState.currentFight.enemy.name} healed for ${healAmount} health!`);
                    console.log(`Enemy healed for ${healAmount} health`);
                    updateEnemyHealth();
                }
                break;
            // Rest of the switch cases remain the same
        }
        return 0; // Action cards don't deal damage
    }
    
    // Check win/loss conditions
    checkCombatEnd();
    return 0; // Default return if no damage was dealt
}

function toggleCardDiscard(instanceId, cardElement) {
    if (!instanceId || !cardElement) {
        console.error("Invalid card or element in toggleCardDiscard:", instanceId, cardElement);
        return;
    }
    
    console.log("Toggling discard for card instance:", instanceId);
    
    // Find the card instance in the player's hand
    const cardInstance = combatState.playerHand.find(instance => instance.instanceId === instanceId);
    if (!cardInstance) {
        console.error("Card instance not found in player hand:", instanceId);
        return;
    }
    
    const card = getCardById(cardInstance.cardId);
    if (!card) {
        console.error("Failed to get card data for discard:", cardInstance.cardId);
        return;
    }
    
    // Initialize discardCards array if it doesn't exist
    if (!combatState.discardCards) {
        combatState.discardCards = [];
    }
    
    // Check if card is already discarded
    const isDiscarded = cardElement.classList.contains('discard');
    
    // If card is selected, deselect it first
    if (cardElement.classList.contains('selected')) {
        toggleCardSelection(instanceId, cardElement);
    }
    
    // Toggle discard state
    if (isDiscarded) {
        cardElement.classList.remove('discard');
        combatState.discardCards = combatState.discardCards.filter(instance => instance.instanceId !== instanceId);
        console.log("Card removed from discard list:", instanceId);
    } else {
        cardElement.classList.add('discard');
        if (!combatState.discardCards.some(instance => instance.instanceId === instanceId)) {
            combatState.discardCards.push(cardInstance);
        }
        console.log("Card added to discard list:", instanceId);
    }
    
    // Update focus cost display (in case we deselected a card)
    updateFocusCostDisplay();
}

// End combat and return to story
function endCombat(result) {
    const contentArea = document.getElementById('content-area');
    contentArea.classList.remove('combat-active');
    // Apply post-combat effects
    if (result === 'victory') {
        // Award experience, items, etc.
        if (combatState.currentFight.rewards) {
            // Handle rewards
            displayCombatMessage("You received rewards!");
        }
        
        // Proceed to next scene
        const nextSceneId = combatState.currentFight.nextSceneId;
        if (nextSceneId) {
            displayScene(nextSceneId);
        } else {
            displayScene(combatState.returnScene);
        }
    } else {
        // Handle defeat
        displayScene(combatState.returnScene || 'game_over');
    }
    
    // Reset combat state
    combatState.inCombat = false;
    combatState.currentFight = null;
    combatState.playerHand = [];
}

// Update focus cost display
function updateFocusCostDisplay() {
    const focusCostDisplay = document.getElementById('focus-cost-display');
    if (focusCostDisplay) {
        focusCostDisplay.textContent = `Total Focus Cost: ${combatState.totalFocusCost || 0}`;
    }
}

// Show restart options for combat
function restartCombat() {
    if (!combatState.currentFight) return;
    
    // Reset health and focus
    gameState.playerStats.health = gameState.playerStats.maxHealth;
    combatState.playerFocus = combatState.maxPlayerFocus;
    
    // Reinitialize the same fight
    initiateCombat(combatState.currentFight.id, combatState.returnScene);
}

function logPlayerHand() {
    console.log("Current player hand:", combatState.playerHand);
    
    if (Array.isArray(combatState.playerHand)) {
        combatState.playerHand.forEach(cardId => {
            const card = getCardById(cardId);
            console.log(`Card ${cardId}:`, card);
        });
    }
}

// Start a fight with the given ID
function startFight(fightId) {
    // First load the fight data
    loadFight(fightId).then(() => {
        // Combat will be initiated by the loadFight function after data is loaded
        console.log("Fight started:", fightId);
    }).catch(error => {
        console.error("Error starting fight:", error);
    });
}

// Preload all card data for a specific fight
async function preloadCardData(fight) {
    // Collect all card IDs used in this fight
    const cardIds = [];
    
    // Add player cards
    if (fight.player) {
        if (Array.isArray(fight.player.attackDeck)) {
            cardIds.push(...fight.player.attackDeck);
        }
        if (Array.isArray(fight.player.actionDeck)) {
            cardIds.push(...fight.player.actionDeck);
        }
    }
    
    // Add enemy cards
    if (fight.enemy) {
        if (Array.isArray(fight.enemy.attackDeck)) {
            cardIds.push(...fight.enemy.attackDeck);
        }
        if (Array.isArray(fight.enemy.actionDeck)) {
            cardIds.push(...fight.enemy.actionDeck);
        }
    }
    
    console.log("Preloading card data for:", cardIds);
    
    // Verify each card is loaded
    for (const cardId of cardIds) {
        const card = getCardById(cardId);
        if (!card || card.name === "Loading..." || card.name === "Unknown Card") {
            console.warn(`Card ${cardId} not properly loaded, retrying...`);
            
            // Try to find the card in the loaded data
            let found = false;
            
            // Check attack cards
            for (const weaponType in combatState.attackCards) {
                if (Array.isArray(combatState.attackCards[weaponType])) {
                    const foundCard = combatState.attackCards[weaponType].find(c => c.id === cardId);
                    if (foundCard) {
                        found = true;
                        break;
                    }
                }
            }
            
            // Check action cards if not found
            if (!found && Array.isArray(combatState.actionCards)) {
                const foundCard = combatState.actionCards.find(c => c.id === cardId);
                if (foundCard) {
                    found = true;
                }
            }
            
            if (!found) {
                console.error(`Card ${cardId} not found in loaded data`);
            }
        }
    }
    
    // Return a promise that resolves when all cards are verified
    return Promise.resolve();
}

function createAffinityChainDisplay() {
    // Check if it already exists
    if (document.getElementById('affinity-chain-display')) {
        return;
    }
    
    // Create the display container
    const combatField = document.getElementById('combat-field');
    if (!combatField) {
        console.error("Combat field not found");
        return;
    }
    
    // Clear the combat field and add the affinity chain display
    combatField.innerHTML = '<div id="affinity-chain-display" class="affinity-chain-display"></div>';
}

// Update the affinity chain display based on selected cards
function updateAffinityChainDisplay() {
    // Create the display if it doesn't exist
    createAffinityChainDisplay();
    
    const affinityChainDisplay = document.getElementById('affinity-chain-display');
    if (!affinityChainDisplay) return;
    
    // Clear the current display
    affinityChainDisplay.innerHTML = '';
    
    // If no cards selected, leave empty
    if (!combatState.selectedCards || combatState.selectedCards.length === 0) {
        return;
    }
    
    // Get the affinities of selected cards in order
    const selectedAffinities = [];
    const selectedCards = [];
    
    for (const cardInstance of combatState.selectedCards) {
        const card = getCardById(cardInstance.cardId);
        if (!card) continue;
        
        // Only include attack cards with affinities
        if (card.type === 'attack' && card.affinity) {
            selectedAffinities.push(card.affinity.toLowerCase());
            selectedCards.push(card);
        } else {
            // For non-attack cards, add a placeholder
            selectedAffinities.push(card.type === 'action' ? 'action' : 'normal');
            selectedCards.push(card);
        }
    }
    
    // Check for synergies and mark which cards are part of synergies
    const synergyMap = findSynergies(selectedAffinities);
    
    // Create a container for the icons
    const iconContainer = document.createElement('div');
    iconContainer.className = 'affinity-icon-container';
    
    // Add affinity icons for each selected card in order
    selectedCards.forEach((card, index) => {
        // If not the first card, add a chain link before the icon
        if (index > 0) {
            const chainLink = document.createElement('div');
            
            // Determine chain type based on synergy
            if (synergyMap[index - 1] === 'perfect' && synergyMap[index] === 'perfect') {
                chainLink.className = 'chain-link perfect-chain';
            } else if (synergyMap[index - 1] && synergyMap[index] && 
                      synergyMap[index - 1] === synergyMap[index]) {
                // Check for monochromatic synergies
                if (typeof synergyMap[index] === 'string' && synergyMap[index].startsWith('monochromatic-')) {
                    const element = synergyMap[index].split('-')[1];
                    chainLink.className = `chain-link ${element}-chain`;
                } else if (synergyMap[index] === 'unluck') {
                    chainLink.className = 'chain-link unluck-chain';
                } else {
                    chainLink.className = 'chain-link synergy-chain';
                }
            } else {
                chainLink.className = 'chain-link';
            }
            
            iconContainer.appendChild(chainLink);
        }
        
        // Create the affinity icon
        const affinityIcon = document.createElement('div');
        affinityIcon.className = 'affinity-chain-icon';
        
        // Add synergy highlight if part of a synergy
        if (synergyMap[index]) {
            if (synergyMap[index] === 'perfect') {
                affinityIcon.classList.add('perfect-synergy');
            } else if (typeof synergyMap[index] === 'string' && synergyMap[index].startsWith('monochromatic-')) {
                affinityIcon.classList.add('monochromatic-synergy');
                // Add element-specific class
                const element = synergyMap[index].split('-')[1];
                affinityIcon.classList.add(`monochromatic-${element}`);
            } else if (synergyMap[index] === 'unluck') {
                affinityIcon.classList.add('unluck-synergy');
            } else {
                affinityIcon.classList.add('regular-synergy');
            }
        }
        
        // Set the appropriate affinity class
        if (card.type === 'attack' && card.affinity) {
            affinityIcon.classList.add(`chain-icon-${card.affinity.toLowerCase()}`);
        } else if (card.type === 'action') {
            affinityIcon.classList.add('chain-icon-action');
        } else {
            affinityIcon.classList.add('chain-icon-normal');
        }
        
        iconContainer.appendChild(affinityIcon);
    });
    
    affinityChainDisplay.appendChild(iconContainer);
}

// Find all synergies in the selected cards
function findSynergies(affinities) {
    // This map will track which positions are part of which synergies
    // The value will be 'perfect', 'monochromatic-fire', 'unluck', a synergy group number, or undefined
    const synergyMap = {};
    
    // First check for perfect synergies (sliding window of 5 cards)
    if (affinities.length >= 5) {
        for (let i = 0; i <= affinities.length - 5; i++) {
            const window = affinities.slice(i, i + 5);
            
            // Check if this window contains all elements of a perfect synergy
            // Order doesn't matter
            const hasPerfectSynergy = SYNERGIES.perfect.every(element => 
                window.includes(element)
            );
            
            if (hasPerfectSynergy) {
                // Mark all positions in this window as part of a perfect synergy
                for (let j = i; j < i + 5; j++) {
                    synergyMap[j] = 'perfect';
                }
                
                // Skip checking these positions for other synergies
                i += 4;
            }
        }
    }
    
    // Check for UNLUCK synergy (5 normal cards)
    if (affinities.length >= 5) {
        for (let i = 0; i <= affinities.length - 5; i++) {
            // Skip if any position in this window is already part of a synergy
            if (synergyMap[i] || synergyMap[i+1] || synergyMap[i+2] || synergyMap[i+3] || synergyMap[i+4]) {
                continue;
            }
            
            const window = affinities.slice(i, i + 5);
            
            // Check if all cards are normal
            const hasUnluckSynergy = window.every(affinity => affinity === 'normal');
            
            if (hasUnluckSynergy) {
                // Mark all positions in this window as part of the unluck synergy
                for (let j = i; j < i + 5; j++) {
                    synergyMap[j] = 'unluck';
                }
                
                // Skip checking these positions for other synergies
                i += 4;
            }
        }
    }
    
    // Check for monochromatic synergies (3 cards of the same element)
    if (affinities.length >= 3) {
        for (let i = 0; i <= affinities.length - 3; i++) {
            // Skip if any position in this window is already part of a synergy
            if (synergyMap[i] || synergyMap[i+1] || synergyMap[i+2]) {
                continue;
            }
            
            const window = affinities.slice(i, i + 3);
            
            // Check each monochromatic synergy type
            for (const element in SYNERGIES.monochromatic) {
                // Check if all cards match this element
                const hasMonochromaticSynergy = window.every(affinity => affinity === element);
                
                if (hasMonochromaticSynergy) {
                    // Mark all positions in this window as part of this monochromatic synergy
                    for (let j = i; j < i + 3; j++) {
                        synergyMap[j] = `monochromatic-${element}`;
                    }
                    
                    // Skip checking these positions for other synergies
                    i += 2;
                    break; // Break out of the element loop
                }
            }
        }
    }
    
    // Then check for regular synergies (pairs)
    let synergyGroupId = 1;
    
    for (let i = 0; i < affinities.length - 1; i++) {
        // Skip if this position is already part of a synergy
        if (synergyMap[i]) continue;
        
        const currentAffinity = affinities[i];
        const nextAffinity = affinities[i + 1];
        
        // Skip if next position is already part of a synergy
        if (synergyMap[i + 1]) continue;
        
        // Check if this pair matches any regular synergy
        const hasSynergy = SYNERGIES.regular.some(pair => 
            (pair[0] === currentAffinity && pair[1] === nextAffinity) ||
            (pair[1] === currentAffinity && pair[0] === nextAffinity)
        );
        
        if (hasSynergy) {
            // Mark both positions as part of this synergy group
            synergyMap[i] = synergyGroupId;
            synergyMap[i + 1] = synergyGroupId;
            synergyGroupId++;
        }
    }
    
    return synergyMap;
}

function addSynergyChainStyles() {
    // Check if styles already exist
    if (document.getElementById('synergy-chain-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'synergy-chain-styles';
    
    style.textContent = `
        .synergy-chain {
            background-image: url('./assets/synergy-chain.png') !important;
        }
        
        .perfect-chain {
            background-image: url('./assets/perfect-chain.png') !important;
        }
        
        .fire-chain {
            background-image: url('./assets/fire-chain.png') !important;
        }
        
        .water-chain {
            background-image: url('./assets/water-chain.png') !important;
        }
        
        .thunder-chain {
            background-image: url('./assets/thunder-chain.png') !important;
        }
        
        .light-chain {
            background-image: url('./assets/light-chain.png') !important;
        }
        
        .dark-chain {
            background-image: url('./assets/dark-chain.png') !important;
        }
        
        .unluck-chain {
            background-image: url('./assets/unluck-chain.png') !important;
        }
        
        .regular-synergy {
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
            border-radius: 50%;
            transform: scale(1.1);
            z-index: 5;
        }
        
        .perfect-synergy {
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.7);
            border-radius: 50%;
            transform: scale(1.15);
            z-index: 10;
        }
        
        .monochromatic-synergy {
            border-radius: 50%;
            transform: scale(1.12);
            z-index: 7;
        }
        
        .monochromatic-fire {
            box-shadow: 0 0 18px rgba(231, 76, 60, 0.8);
        }
        
        .monochromatic-water {
            box-shadow: 0 0 18px rgba(52, 152, 219, 0.8);
        }
        
        .monochromatic-thunder {
            box-shadow: 0 0 18px rgba(241, 196, 15, 0.8);
        }
        
        .monochromatic-light {
            box-shadow: 0 0 18px rgba(236, 240, 241, 0.8);
        }
        
        .monochromatic-dark {
            box-shadow: 0 0 18px rgba(52, 73, 94, 0.8);
        }
        
        .unluck-synergy {
            box-shadow: 0 0 15px rgba(149, 165, 166, 0.7);
            border-radius: 50%;
            transform: scale(1.05);
            z-index: 3;
            opacity: 0.8;
        }
    `;
    
    document.head.appendChild(style);
}