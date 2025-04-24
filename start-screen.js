// Start screen functionality
let gameStarted = false;

// Initialize start screen
function initStartScreen() {
  const startScreen = document.createElement('div');
  startScreen.id = 'start-screen';
  startScreen.innerHTML = `
    <div class="start-content">
      <h1>URBAN DASH</h1>
      <p>Run through the cyberpunk city, avoid obstacles, and collect orbs!</p>
      <div class="character-select">
        <h3>Select Character</h3>
        <div class="character-options">
          <div class="character-option selected" data-character="default">
            <div class="character-preview">
              <img src="assets/images/player.svg" alt="Runner" class="character-img">
            </div>
            <span>Runner</span>
          </div>
          <div class="character-option" data-character="hacker">
            <div class="character-preview">
              <img src="assets/images/player.svg" alt="Hacker" class="character-img hacker-filter">
            </div>
            <span>Hacker</span>
          </div>
          <div class="character-option" data-character="punk">
            <div class="character-preview">
              <img src="assets/images/player.svg" alt="Punk" class="character-img punk-filter">
            </div>
            <span>Punk</span>
          </div>
        </div>
      </div>
      <button id="start-btn">START GAME</button>
      <div class="controls-info">
        <p>Controls: Press SPACE or UP ARROW to jump</p>
        <p>Or tap/click the screen on mobile devices</p>
        <a href="instructions.html" class="instructions-link">View Full Instructions</a>
      </div>
    </div>
  `;

  // Fix the insertBefore error by appending to body if game-container is not found
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    document.body.insertBefore(startScreen, gameContainer);
  } else {
    console.log("Game container not found, appending to body");
    document.body.appendChild(startScreen);
  }

  // Add event listeners
  document.querySelectorAll('.character-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.character-option').forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      selectedCharacter = this.getAttribute('data-character');
      console.log("Selected character: " + selectedCharacter);
    });
  });

  document.getElementById('start-btn').addEventListener('click', startGame);
}

// Start the game
function startGame() {
  gameStarted = true;
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('loading-message').style.display = 'none';

  // Track game start in analytics
  if (typeof analytics !== 'undefined') {
    analytics.logEvent('game_start', {
      character: selectedCharacter
    });
  }

  console.log("Starting game with character: " + selectedCharacter);

  // Initialize the game
  if (typeof game !== 'undefined') {
    // Resume the scene if it was paused
    if (game.scene.isPaused('GameScene')) {
      game.scene.resume('GameScene');
    } else {
      // Start the scene if it hasn't been started yet
      game.scene.start('GameScene');
    }
  } else {
    console.error("Game object is not defined!");
  }
}

// Add start screen styles
function addStartScreenStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #start-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, #1a1a2e, #16213e);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
    }

    .start-content {
      width: 90%;
      max-width: 500px;
      background: rgba(0, 0, 0, 0.8);
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }

    #start-screen h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #3498db;
      text-shadow: 0 0 10px rgba(52, 152, 219, 0.7);
    }

    #start-screen p {
      margin-bottom: 15px;
      color: #ecf0f1;
    }

    .character-select {
      margin: 20px 0;
    }

    .character-options {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .character-option {
      cursor: pointer;
      padding: 10px;
      border-radius: 5px;
      transition: all 0.3s;
      width: 80px;
    }

    .character-option.selected {
      background: rgba(52, 152, 219, 0.3);
      box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
    }

    .character-preview {
      width: 60px;
      height: 60px;
      margin: 0 auto 10px;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      background-color: #222;
    }

    .character-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .hacker-filter {
      filter: hue-rotate(120deg);
    }

    .punk-filter {
      filter: hue-rotate(300deg);
    }

    #start-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 1.2rem;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
      margin: 20px 0;
    }

    #start-btn:hover {
      background: #2980b9;
      transform: scale(1.05);
    }

    .controls-info {
      margin-top: 20px;
      font-size: 0.9rem;
      color: #bdc3c7;
    }

    .instructions-link {
      display: inline-block;
      color: #3498db;
      text-decoration: none;
      margin-top: 10px;
      font-weight: bold;
    }

    .instructions-link:hover {
      text-decoration: underline;
    }
  `;

  document.head.appendChild(style);
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initializing start screen");

  // Add styles first
  addStartScreenStyles();

  // Short timeout to ensure DOM is fully ready
  setTimeout(function() {
    // Initialize start screen
    initStartScreen();

    // Hide game until start
    const gameElement = document.getElementById('game');
    if (gameElement) {
      gameElement.style.display = 'none';
    }

    console.log("Start screen initialized");
  }, 100);
});
