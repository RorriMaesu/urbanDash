// Shop items data
const shopItems = [
  {
    id: 'hoverboard_blue',
    name: 'Blue Hoverboard',
    description: 'A sleek blue hoverboard',
    price: 100,
    type: 'skin',
    image: 'https://i.imgur.com/JdKOHzx.png'
  },
  {
    id: 'hoverboard_red',
    name: 'Red Hoverboard',
    description: 'A blazing red hoverboard',
    price: 150,
    type: 'skin',
    image: 'https://i.imgur.com/K8sHLJm.png'
  },
  {
    id: 'double_jump',
    name: 'Double Jump',
    description: 'Jump twice before landing',
    price: 200,
    type: 'perk',
    cooldown: 30,
    image: 'https://i.imgur.com/L5NQrZz.png'
  },
  {
    id: 'magnet',
    name: 'Orb Magnet',
    description: 'Attracts nearby orbs',
    price: 250,
    type: 'perk',
    cooldown: 45,
    image: 'https://i.imgur.com/9XdBPgj.png'
  }
];

// Initialize shop
function initShop() {
  const shopContainer = document.getElementById('shop-items');
  shopContainer.innerHTML = '';
  
  shopItems.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'shop-item';
    itemElement.innerHTML = `
      <div class="item-info">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${item.description}</p>
          <p>${item.type === 'perk' ? `Cooldown: ${item.cooldown}s` : ''}</p>
        </div>
      </div>
      <div class="item-price">
        <span>${item.price} Tokens</span>
        <button class="buy-btn" data-id="${item.id}">Buy</button>
      </div>
    `;
    shopContainer.appendChild(itemElement);
  });
  
  // Add event listeners to buy buttons
  document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function() {
      const itemId = this.getAttribute('data-id');
      buyItem(itemId);
    });
  });
}

// Buy an item
async function buyItem(itemId) {
  const item = shopItems.find(i => i.id === itemId);
  if (!item) return;
  
  // Check if user has enough tokens
  if (tokens < item.price) {
    alert('Not enough tokens!');
    return;
  }
  
  // Update tokens
  tokens -= item.price;
  document.getElementById('current-tokens').textContent = tokens;
  
  // Add item to user inventory
  const userData = await getUserData(userId);
  if (!userData) return;
  
  userData.inventory.push(item.id);
  userData.tokens = tokens;
  
  await updateUserData(userId, userData);
  
  alert(`You purchased ${item.name}!`);
}

// Toggle shop visibility
function toggleShop() {
  const shopContainer = document.getElementById('shop-container');
  if (shopContainer.style.display === 'none') {
    shopContainer.style.display = 'block';
    initShop();
  } else {
    shopContainer.style.display = 'none';
  }
}

// Add shop button to UI
window.addEventListener('load', function() {
  const ui = document.getElementById('ui');
  const shopButton = document.createElement('button');
  shopButton.id = 'shop-btn';
  shopButton.textContent = 'Shop';
  shopButton.addEventListener('click', toggleShop);
  
  ui.insertBefore(shopButton, document.getElementById('leaderboard-container'));
});
