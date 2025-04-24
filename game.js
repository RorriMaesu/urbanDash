// Game configuration
const config = {
  type: Phaser.CANVAS, // Force CANVAS renderer to avoid WebGL warnings
  parent: 'game',
  width: 480,
  height: 640,
  backgroundColor: '#141414',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: {
    key: 'GameScene',
    preload: preload,
    create: create,
    update: update
  },
  // Add pixelArt setting to improve rendering of our pixel art assets
  pixelArt: true,
  // Add responsive scaling
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // Add banner to console
  title: 'Urban Dash',
  version: '1.0',
  // Disable right-click context menu
  disableContextMenu: true,
  // Renderer options
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  }
};

// Game variables
const game = new Phaser.Game(config);
let player, cursors, obstacles, orbs, powerups, terminals;
let score = 0, tokens = 0, distance = 0, orbsCollected = 0;
let scoreText, distanceText, gameSpeed = 200;
let isGameOver = false, hasShield = false, hasMagnet = false, hasDoubleJump = false;
let canDoubleJump = false, isJumping = false;
let ground, buildings, cityBackground;
let jumpSound, collectSound, hitSound, powerupSound;
let userId = 'player_' + Date.now(); // Temporary user ID until auth is implemented
let selectedCharacter = 'default'; // Default character

// Preload game assets
function preload() {
  // Show loading progress
  const progressBar = this.add.graphics();
  const progressBox = this.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(240 - 160, 320 - 25, 320, 50);

  const width = this.cameras.main.width;
  const height = this.cameras.main.height;
  const loadingText = this.make.text({
    x: width / 2,
    y: height / 2 - 50,
    text: 'Loading...',
    style: {
      font: '20px monospace',
      fill: '#ffffff'
    }
  });
  loadingText.setOrigin(0.5, 0.5);

  const percentText = this.make.text({
    x: width / 2,
    y: height / 2,
    text: '0%',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  percentText.setOrigin(0.5, 0.5);

  const assetText = this.make.text({
    x: width / 2,
    y: height / 2 + 50,
    text: '',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  assetText.setOrigin(0.5, 0.5);

  // Update the progress bar
  this.load.on('progress', function (value) {
    percentText.setText(parseInt(value * 100) + '%');
    progressBar.clear();
    progressBar.fillStyle(0x3498db, 1);
    progressBar.fillRect(240 - 160 + 10, 320 - 25 + 10, 300 * value, 30);
  });

  // Update the file being loaded
  this.load.on('fileprogress', function (file) {
    assetText.setText('Loading asset: ' + file.key);
  });

  // Remove progress bar when complete
  this.load.on('complete', function () {
    progressBar.destroy();
    progressBox.destroy();
    loadingText.destroy();
    percentText.destroy();
    assetText.destroy();

    // Hide the loading message in the HTML
    if (document.getElementById('loading-message')) {
      document.getElementById('loading-message').style.display = 'none';
    }
  });

  // Load player sprite atlas
  this.load.atlas('player', 'assets/images/player.svg', 'assets/sprites/player.json');

  // Load obstacle sprite atlas
  this.load.atlas('obstacles', 'assets/images/obstacles.svg', 'assets/sprites/obstacles.json');

  // Load collectibles sprite atlas
  this.load.atlas('collectibles', 'assets/images/collectibles.svg', 'assets/sprites/collectibles.json');

  // Load ground and background
  this.load.image('ground', 'assets/images/ground.svg');
  this.load.image('buildings', 'assets/images/buildings.svg');
  this.load.image('background', 'assets/images/background.svg');

  // Add a small delay to show the loading progress
  this.load.on('complete', function() {
    console.log('All assets loaded successfully');
  });
}

// Create game objects
function create() {
  console.log("Create function called");

  // Don't start the game if the start screen is active
  if (typeof gameStarted !== 'undefined' && !gameStarted) {
    console.log("Game not started yet, pausing scene");
    this.scene.pause();
    return;
  }

  console.log("Game started, initializing game objects");

  // Reset game variables
  score = 0;
  tokens = 0;
  distance = 0;
  orbsCollected = 0;
  gameSpeed = 200;
  isGameOver = false;
  hasShield = false;
  hasMagnet = false;
  hasDoubleJump = false;
  canDoubleJump = false;
  isJumping = false;

  // Create parallax background
  cityBackground = this.add.tileSprite(240, 320, 480, 640, 'background');
  buildings = this.add.tileSprite(240, 500, 480, 280, 'buildings');

  // Create ground
  ground = this.physics.add.staticImage(240, 620, 'ground');

  // Create player
  player = this.physics.add.sprite(80, 560, 'player', 'player_idle');
  player.setSize(40, 48).setOffset(12, 8);
  player.setCollideWorldBounds(true);

  // Create player animations
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'player', frame: 'player_run1' },
      { key: 'player', frame: 'player_run2' },
      { key: 'player', frame: 'player_run3' },
      { key: 'player', frame: 'player_run2' }
    ],
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'jump',
    frames: [{ key: 'player', frame: 'player_jump' }],
    frameRate: 10
  });

  this.anims.create({
    key: 'fall',
    frames: [{ key: 'player', frame: 'player_fall' }],
    frameRate: 10
  });

  this.anims.create({
    key: 'hit',
    frames: [{ key: 'player', frame: 'player_hit' }],
    frameRate: 10
  });

  // Start running animation
  player.anims.play('run', true);

  // Add collision with ground
  this.physics.add.collider(player, ground);

  // Set up controls
  cursors = this.input.keyboard.createCursorKeys();

  // Add touch input for mobile
  this.input.on('pointerdown', function() {
    handleJump();
  });

  // Create obstacle group
  obstacles = this.physics.add.group();
  this.time.addEvent({
    delay: 1500,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });
  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, obstacles, hitObstacle, null, this);

  // Create orb group
  orbs = this.physics.add.group();
  this.time.addEvent({
    delay: 3000,
    callback: spawnOrb,
    callbackScope: this,
    loop: true
  });
  this.physics.add.overlap(player, orbs, collectOrb, null, this);

  // Create powerup group
  powerups = this.physics.add.group();
  this.time.addEvent({
    delay: 15000,
    callback: spawnPowerup,
    callbackScope: this,
    loop: true
  });
  this.physics.add.overlap(player, powerups, collectPowerup, null, this);

  // Create terminal group (for missions)
  terminals = this.physics.add.group();
  this.time.addEvent({
    delay: 20000,
    callback: spawnTerminal,
    callbackScope: this,
    loop: true
  });
  this.physics.add.overlap(player, terminals, hackTerminal, null, this);

  // Create score text
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '20px',
    fill: '#fff',
    stroke: '#000',
    strokeThickness: 3
  }).setScrollFactor(0);

  distanceText = this.add.text(16, 48, 'Distance: 0m', {
    fontSize: '16px',
    fill: '#fff',
    stroke: '#000',
    strokeThickness: 2
  }).setScrollFactor(0);

  // Create shield indicator
  shieldIndicator = this.add.text(400, 16, '🛡️', {
    fontSize: '24px'
  }).setScrollFactor(0).setVisible(false);

  magnetIndicator = this.add.text(370, 16, '🧲', {
    fontSize: '24px'
  }).setScrollFactor(0).setVisible(false);

  doubleJumpIndicator = this.add.text(340, 16, '⬆️', {
    fontSize: '24px'
  }).setScrollFactor(0).setVisible(false);

  // Set up sounds using our custom sound generators
  jumpSound = {
    play: function() {
      if (typeof createJumpSound === 'function') {
        createJumpSound();
      }
    }
  };

  collectSound = {
    play: function() {
      if (typeof createCollectSound === 'function') {
        createCollectSound();
      }
    }
  };

  hitSound = {
    play: function() {
      if (typeof createHitSound === 'function') {
        createHitSound();
      }
    }
  };

  powerupSound = {
    play: function() {
      if (typeof createPowerupSound === 'function') {
        createPowerupSound();
      }
    }
  };

  // Increase difficulty over time
  this.time.addEvent({
    delay: 10000, // 10 seconds
    callback: increaseDifficulty,
    callbackScope: this,
    loop: true
  });

  // Initialize UI
  updateScoreDisplay();
}

// Game update loop
function update() {
  // Safety checks to prevent errors
  if (isGameOver || !cursors || !player || !player.body) return;

  // Handle player jump
  if ((cursors.space && cursors.space.isDown) || (cursors.up && cursors.up.isDown)) {
    handleJump();
  }

  // Update player animation based on state
  if (!player.body.touching.down) {
    if (player.body.velocity.y < 0) {
      player.anims.play('jump', true);
    } else {
      player.anims.play('fall', true);
    }
  } else {
    player.anims.play('run', true);
    canDoubleJump = hasDoubleJump; // Reset double jump when touching ground
    isJumping = false;
  }

  // Update parallax background
  if (cityBackground) cityBackground.tilePositionX += 0.5;
  if (buildings) buildings.tilePositionX += 1;

  // Remove obstacles that have gone off screen
  if (obstacles && obstacles.children) {
    obstacles.children.iterate(function(obstacle) {
      if (obstacle.x < -50) {
        obstacle.destroy();
      }
    });
  }

  // Remove orbs that have gone off screen
  if (orbs && orbs.children) {
    orbs.children.iterate(function(orb) {
      if (orb.x < -50) {
        orb.destroy();
      }
    });
  }

  // Remove powerups that have gone off screen
  if (powerups && powerups.children) {
    powerups.children.iterate(function(powerup) {
      if (powerup.x < -50) {
        powerup.destroy();
      }
    });
  }

  // Remove terminals that have gone off screen
  if (terminals && terminals.children) {
    terminals.children.iterate(function(terminal) {
      if (terminal.x < -50) {
        terminal.destroy();
      }
    });
  }

  // Magnet effect for orbs
  if (hasMagnet && orbs && orbs.children && player) {
    orbs.children.iterate(function(orb) {
      if (orb && Phaser.Math.Distance.Between(player.x, player.y, orb.x, orb.y) < 150) {
        // Calculate direction to player
        const dx = player.x - orb.x;
        const dy = player.y - orb.y;
        const angle = Math.atan2(dy, dx);

        // Set velocity towards player
        orb.setVelocityX(Math.cos(angle) * 200);
        orb.setVelocityY(Math.sin(angle) * 200);
      }
    });
  }

  // Update score and distance
  score += 0.02;
  distance += 0.05;
  updateScoreDisplay();

  // Update mission progress
  if (typeof updateMissionProgress === 'function') {
    updateMissionProgress('distance', 0.05);
  }
}

// Handle player jump
function handleJump() {
  if (player.body.touching.down) {
    player.setVelocityY(-480);
    jumpSound.play();
    isJumping = true;
  } else if (canDoubleJump && isJumping) {
    player.setVelocityY(-400);
    jumpSound.play();
    canDoubleJump = false; // Use up the double jump
  }
}

// Spawn obstacle
function spawnObstacle() {
  if (isGameOver) return;

  // Random obstacle type
  const obstacleTypes = ['obstacle1', 'obstacle2', 'obstacle3'];
  const type = obstacleTypes[Phaser.Math.Between(0, obstacleTypes.length - 1)];

  const obstacle = obstacles.create(500, 560, 'obstacles', type);
  obstacle.setVelocityX(-gameSpeed);
  obstacle.body.immovable = true;

  // Add some variation to obstacle placement
  if (Phaser.Math.Between(0, 10) > 8) {
    // Sometimes spawn two obstacles close together
    const secondObstacle = obstacles.create(580, 560, 'obstacles', obstacleTypes[Phaser.Math.Between(0, obstacleTypes.length - 1)]);
    secondObstacle.setVelocityX(-gameSpeed);
    secondObstacle.body.immovable = true;
  }
}

// Spawn collectible orb
function spawnOrb() {
  if (isGameOver) return;

  // Random height between 400 and 550
  const height = Phaser.Math.Between(400, 550);

  // Random orb type
  const orbTypes = ['orb1', 'orb2', 'orb3', 'orb4'];
  const type = orbTypes[Phaser.Math.Between(0, orbTypes.length - 1)];

  const orb = orbs.create(500, height, 'collectibles', type);
  orb.setVelocityX(-gameSpeed);

  // Add a small animation
  this.tweens.add({
    targets: orb,
    y: height + 20,
    duration: 1000,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });

  // Sometimes spawn orbs in patterns
  if (Phaser.Math.Between(0, 10) > 7) {
    // Create a line of orbs
    for (let i = 1; i <= 3; i++) {
      const patternOrb = orbs.create(500 + (i * 40), height, 'collectibles', type);
      patternOrb.setVelocityX(-gameSpeed);

      this.tweens.add({
        targets: patternOrb,
        y: height + 20,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
  }
}

// Spawn powerup
function spawnPowerup() {
  if (isGameOver) return;

  // Random height between 400 and 500
  const height = Phaser.Math.Between(400, 500);

  // Random powerup type
  const powerupTypes = ['powerup_shield', 'powerup_magnet', 'powerup_doublejump', 'powerup_slowtime'];
  const type = powerupTypes[Phaser.Math.Between(0, powerupTypes.length - 1)];

  const powerup = powerups.create(500, height, 'collectibles', type);
  powerup.setVelocityX(-gameSpeed);
  powerup.powerupType = type;

  // Add a pulsing animation
  this.tweens.add({
    targets: powerup,
    scale: 1.2,
    duration: 500,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
}

// Spawn terminal (for hacking mission)
function spawnTerminal() {
  if (isGameOver) return;

  const terminal = terminals.create(500, 560, 'obstacles', 'terminal');
  terminal.setVelocityX(-gameSpeed);
  terminal.body.immovable = true;
}

// Handle collision with obstacle
function hitObstacle(player, obstacle) {
  if (hasShield) {
    // Shield protects from one hit
    hasShield = false;
    shieldIndicator.setVisible(false);

    // Destroy the obstacle
    obstacle.destroy();

    // Play shield break sound
    powerupSound.play();

    // Track shield use in analytics
    if (typeof analytics !== 'undefined') {
      analytics.logEvent('shield_used', {
        obstacle_type: obstacle.texture.key
      });
    }

    return;
  }

  hitSound.play();
  this.physics.pause();
  player.anims.play('hit');
  isGameOver = true;

  // Show game over UI
  document.getElementById('game-over').style.display = 'block';
  document.getElementById('final-score').textContent = Math.floor(score);

  // Update mission progress for final stats
  if (typeof updateMissionProgress === 'function') {
    updateMissionProgress('distance', 0); // Just to trigger UI update
    updateMissionProgress('collect', 0); // Just to trigger UI update
  }

  // Track game over in analytics
  if (typeof analytics !== 'undefined') {
    analytics.logEvent('game_over', {
      score: Math.floor(score),
      distance: Math.floor(distance),
      orbs_collected: orbsCollected
    });
  }
}

// Handle collecting orb
function collectOrb(player, orb) {
  collectSound.play();
  orb.destroy();
  score += 10;
  tokens += 1;
  orbsCollected += 1;
  updateScoreDisplay();

  // Update mission progress
  if (typeof updateMissionProgress === 'function') {
    updateMissionProgress('collect', 1);
  }

  // Create a score popup
  const scorePopup = this.add.text(orb.x, orb.y, '+10', {
    fontSize: '16px',
    fill: '#fff',
    stroke: '#000',
    strokeThickness: 2
  });

  this.tweens.add({
    targets: scorePopup,
    y: orb.y - 50,
    alpha: 0,
    duration: 1000,
    onComplete: function() {
      scorePopup.destroy();
    }
  });
}

// Handle collecting powerup
function collectPowerup(player, powerup) {
  powerupSound.play();

  // Track powerup collection in analytics
  if (typeof analytics !== 'undefined') {
    analytics.logEvent('powerup_collected', {
      powerup_type: powerup.powerupType
    });
  }

  // Apply powerup effect based on type
  switch (powerup.powerupType) {
    case 'powerup_shield':
      hasShield = true;
      shieldIndicator.setVisible(true);

      // Shield lasts for 20 seconds
      this.time.delayedCall(20000, function() {
        hasShield = false;
        shieldIndicator.setVisible(false);
      }, [], this);
      break;

    case 'powerup_magnet':
      hasMagnet = true;
      magnetIndicator.setVisible(true);

      // Magnet lasts for 15 seconds
      this.time.delayedCall(15000, function() {
        hasMagnet = false;
        magnetIndicator.setVisible(false);
      }, [], this);
      break;

    case 'powerup_doublejump':
      hasDoubleJump = true;
      canDoubleJump = true;
      doubleJumpIndicator.setVisible(true);

      // Double jump lasts for 30 seconds
      this.time.delayedCall(30000, function() {
        hasDoubleJump = false;
        canDoubleJump = false;
        doubleJumpIndicator.setVisible(false);
      }, [], this);
      break;

    case 'powerup_slowtime':
      // Slow down game speed temporarily
      const originalSpeed = gameSpeed;
      gameSpeed = gameSpeed * 0.5;

      // Update all existing obstacles and orbs
      obstacles.children.iterate(function(obstacle) {
        obstacle.setVelocityX(-gameSpeed);
      });

      orbs.children.iterate(function(orb) {
        orb.setVelocityX(-gameSpeed);
      });

      powerups.children.iterate(function(p) {
        p.setVelocityX(-gameSpeed);
      });

      terminals.children.iterate(function(terminal) {
        terminal.setVelocityX(-gameSpeed);
      });

      // Add slow motion effect
      this.cameras.main.setTint(0x0000ff, 0x0000ff, 0x0000ff, 0x0000ff);

      // Effect lasts for 5 seconds
      this.time.delayedCall(5000, function() {
        gameSpeed = originalSpeed;

        // Update all existing obstacles and orbs
        obstacles.children.iterate(function(obstacle) {
          obstacle.setVelocityX(-gameSpeed);
        });

        orbs.children.iterate(function(orb) {
          orb.setVelocityX(-gameSpeed);
        });

        powerups.children.iterate(function(p) {
          p.setVelocityX(-gameSpeed);
        });

        terminals.children.iterate(function(terminal) {
          terminal.setVelocityX(-gameSpeed);
        });

        // Remove tint effect
        this.cameras.main.clearTint();
      }, [], this);
      break;
  }

  powerup.destroy();
}

// Handle hacking terminal
function hackTerminal(player, terminal) {
  powerupSound.play();
  terminal.destroy();

  // Add hacking effect
  const hackEffect = this.add.text(player.x, player.y - 50, 'HACKED!', {
    fontSize: '20px',
    fill: '#2ecc71',
    stroke: '#000',
    strokeThickness: 3
  });

  this.tweens.add({
    targets: hackEffect,
    y: player.y - 100,
    alpha: 0,
    duration: 1500,
    onComplete: function() {
      hackEffect.destroy();
    }
  });

  // Update mission progress
  if (typeof updateMissionProgress === 'function') {
    updateMissionProgress('hack', 1);
  }

  // Bonus tokens for hacking
  tokens += 5;
  updateScoreDisplay();
}

// Increase game difficulty
function increaseDifficulty() {
  if (isGameOver) return;

  gameSpeed += 20;

  // Update all existing obstacles and orbs
  obstacles.children.iterate(function(obstacle) {
    obstacle.setVelocityX(-gameSpeed);
  });

  orbs.children.iterate(function(orb) {
    orb.setVelocityX(-gameSpeed);
  });

  powerups.children.iterate(function(powerup) {
    powerup.setVelocityX(-gameSpeed);
  });

  terminals.children.iterate(function(terminal) {
    terminal.setVelocityX(-gameSpeed);
  });
}

// Update score display
function updateScoreDisplay() {
  scoreText.setText('Score: ' + Math.floor(score));
  distanceText.setText('Distance: ' + Math.floor(distance) + 'm');

  document.getElementById('current-score').textContent = Math.floor(score);
  document.getElementById('current-tokens').textContent = tokens;
}

// Save score to leaderboard
async function saveScore() {
  const name = document.getElementById('playerName').value || 'Anon';
  const finalScore = Math.floor(score);

  await postScore(name, finalScore);
  loadLeaderboard();

  // Track score saved in analytics
  if (typeof analytics !== 'undefined') {
    analytics.logEvent('score_saved', {
      player_name: name,
      score: finalScore,
      distance: Math.floor(distance)
    });
  }
}

// Load leaderboard data
async function loadLeaderboard() {
  const list = document.getElementById('leaderboard');
  list.innerHTML = '';

  const scores = await getTopScores();
  scores.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.name}: ${s.score}`;
    list.appendChild(li);
  });
}

// Restart game
function restartGame() {
  window.location.reload();
}

// Event listeners
window.addEventListener('load', function() {
  loadLeaderboard();
  document.getElementById('saveScoreBtn').addEventListener('click', saveScore);
  document.getElementById('restartBtn').addEventListener('click', restartGame);
});
