// This is a JavaScript file that generates a jump sound using the Web Audio API
// We're using this approach since we can't directly create audio files

function createJumpSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
  oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Export the function
window.createJumpSound = createJumpSound;
