// Mission tracking variables
let currentMissions = [];
let missionProgress = {};

// Load missions from daily.json
async function loadMissions() {
  try {
    const response = await fetch('daily.json');
    const data = await response.json();
    currentMissions = data.missions;
    
    // Initialize progress for each mission
    currentMissions.forEach(mission => {
      missionProgress[mission.id] = 0;
    });
    
    displayMissions();
  } catch (error) {
    console.error('Error loading missions:', error);
  }
}

// Display missions in UI
function displayMissions() {
  const missionsList = document.getElementById('missions-list');
  missionsList.innerHTML = '';
  
  currentMissions.forEach(mission => {
    const progress = missionProgress[mission.id];
    const percentage = Math.min(100, Math.floor((progress / mission.target) * 100));
    
    const li = document.createElement('li');
    li.className = 'mission-item';
    li.innerHTML = `
      <div>
        <h4>${mission.title}</h4>
        <p>${mission.description}</p>
        <div class="mission-progress">
          <div class="mission-progress-bar" style="width: ${percentage}%"></div>
        </div>
        <p>${progress}/${mission.target} - Reward: ${mission.reward} tokens</p>
      </div>
      ${percentage === 100 ? '<button class="claim-btn" data-id="' + mission.id + '">Claim</button>' : ''}
    `;
    missionsList.appendChild(li);
  });
  
  // Add event listeners to claim buttons
  document.querySelectorAll('.claim-btn').forEach(button => {
    button.addEventListener('click', function() {
      const missionId = this.getAttribute('data-id');
      claimMissionReward(missionId);
    });
  });
}

// Update mission progress
function updateMissionProgress(type, amount) {
  currentMissions.forEach(mission => {
    if (mission.type === type) {
      missionProgress[mission.id] += amount;
    }
  });
  
  displayMissions();
}

// Claim mission reward
function claimMissionReward(missionId) {
  const mission = currentMissions.find(m => m.id === missionId);
  if (!mission) return;
  
  // Check if mission is completed
  if (missionProgress[missionId] >= mission.target) {
    // Add tokens
    tokens += mission.reward;
    document.getElementById('current-tokens').textContent = tokens;
    
    // Mark mission as claimed
    missionProgress[missionId] = -1;
    
    // Remove mission from list
    currentMissions = currentMissions.filter(m => m.id !== missionId);
    
    // Update UI
    displayMissions();
    
    alert(`You claimed ${mission.reward} tokens!`);
  }
}

// Initialize missions on page load
window.addEventListener('load', loadMissions);
