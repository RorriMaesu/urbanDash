// This file creates a fallback player sprite using Phaser graphics
// It will be used if the SVG/atlas approach fails

function createFallbackPlayer(scene, x, y) {
  // Create a graphics object
  const graphics = scene.add.graphics();
  
  // Draw player body (blue rectangle)
  graphics.fillStyle(0x3498db, 1);
  graphics.fillRect(-20, -24, 40, 48);
  
  // Draw player face (dark rectangle)
  graphics.fillStyle(0x2c3e50, 1);
  graphics.fillRect(-12, -16, 24, 12);
  
  // Draw player feet (dark rectangles)
  graphics.fillStyle(0x2c3e50, 1);
  graphics.fillRect(-16, 24, 8, 8);
  graphics.fillRect(8, 24, 8, 8);
  
  // Draw player mouth (red rectangle)
  graphics.fillStyle(0xe74c3c, 1);
  graphics.fillRect(-8, 4, 16, 4);
  
  // Generate a texture from the graphics
  graphics.generateTexture('fallback_player', 64, 64);
  
  // Destroy the original graphics object
  graphics.destroy();
  
  // Create a sprite using the generated texture
  const player = scene.physics.add.sprite(x, y, 'fallback_player');
  
  // Set the origin to the center
  player.setOrigin(0.5, 0.5);
  
  return player;
}
