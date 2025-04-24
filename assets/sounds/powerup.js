// This is a JavaScript file that generates a powerup sound using the Web Audio API
// We're using this approach since we can't directly create audio files

function createPowerupSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.type = 'sine';
  oscillator1.frequency.setValueAtTime(300, audioContext.currentTime);
  oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
  
  oscillator2.type = 'sine';
  oscillator2.frequency.setValueAtTime(400, audioContext.currentTime);
  oscillator2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator1.start();
  oscillator2.start();
  oscillator1.stop(audioContext.currentTime + 0.3);
  oscillator2.stop(audioContext.currentTime + 0.3);
}

// Export the function
window.createPowerupSound = createPowerupSound;
