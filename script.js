const gridElement = document.getElementById('grid');
const multiplierElement = document.getElementById('multiplier');
const winningsElement = document.getElementById('winnings');
const cashoutButton = document.getElementById('cashout');
const betButton = document.getElementById('bet-button');
const betInput = document.getElementById('bet-amount');
const mineCountSelector = document.getElementById('mine-count');
const notificationElement = document.getElementById('notification');

const explosionSound = new Audio('explosion.mp3');
const dingSound = new Audio('ding.mp3');
const cashoutSound = new Audio('cashout.mp3');

const gridSize = 5;
let grid = [];
let bombs = [];
let multiplier = 1.0;
let revealedTiles = 0;
let gameOver = false;
let betAmount = 10;
let bombCount = 3;

function calculateMultiplier(mines) {
  const baseMultiplier = 1.0; // Base multiplier for 3 mines
  const scalingFactor = 0.5; // Multiplier increase per mine
  if (mines === 24) return 50.0; // Special case for 24 mines
  return baseMultiplier + (mines - 3) * scalingFactor;
}

function calculateTileReward(mines) {
  const baseReward = 0.3; // Base increment for 3 mines
  const rewardScaling = 0.2; // Incremental reward for 4-10 mines
  const highRiskScaling = 0.5; // Incremental reward for mines above 10

  if (mines <= 10) {
    return baseReward + (mines - 3) * rewardScaling;
  } else {
    return baseReward + (10 - 3) * rewardScaling + (mines - 10) * highRiskScaling;
  }
}

function initializeGame() {
  grid = Array(gridSize * gridSize).fill('gem');
  bombs = [];
  multiplier = calculateMultiplier(bombCount); // Adjust starting multiplier
  revealedTiles = 0;
  gameOver = false;

  notificationElement.style.display = 'none';
  multiplierElement.textContent = `${multiplier.toFixed(1)}x`;
  winningsElement.textContent = '0';
  cashoutButton.disabled = true;

  while (bombs.length < bombCount) {
    const index = Math.floor(Math.random() * grid.length);
    if (!bombs.includes(index)) bombs.push(index);
  }

  grid = grid.map((_, index) => (bombs.includes(index) ? 'bomb' : 'gem'));

  renderGrid();
}

function renderGrid() {
  gridElement.innerHTML = '';
  grid.forEach((_, index) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.dataset.index = index;
    tile.addEventListener('click', revealTile);
    gridElement.appendChild(tile);
  });

  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  gridElement.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
}

function revealAllTiles() {
  grid.forEach((content, index) => {
    const tile = document.querySelector(`.tile[data-index="${index}"]`);
    if (!tile.classList.contains('revealed')) {
      tile.classList.add('revealed');
      tile.textContent = content === 'bomb' ? '💣' : '💎';
    }
  });
}

function revealTile(event) {
  if (gameOver) return;

  const index = event.target.dataset.index;
  if (!index || event.target.classList.contains('revealed')) return;

  event.target.classList.add('revealed');
  const content = grid[index];

  if (content === 'bomb') {
    event.target.textContent = '💣';
    explosionSound.play();
    gameOver = true;
    revealAllTiles(); // Reveal the entire grid
    notificationElement.textContent = 'You have blown up!';
    notificationElement.style.display = 'block';
    betButton.style.display = 'block';
    setTimeout(() => {
      notificationElement.style.display = 'none'; // Hide notification after 5 seconds
    }, 5000);
    return;
  }

  event.target.textContent = '💎';
  dingSound.play();
  revealedTiles++;

  multiplier += calculateTileReward(bombCount);

  multiplierElement.textContent = `${multiplier.toFixed(1)}x`;
  winningsElement.textContent = (betAmount * multiplier).toFixed(2);
  cashoutButton.disabled = false;

  if (revealedTiles === grid.length - bombCount) {
    gameOver = true;
    const totalWinnings = (betAmount * multiplier).toFixed(2); // Calculate total winnings
    notificationElement.textContent = `You have cleared all the diamonds! 🎉 Final Multiplier: ${multiplier.toFixed(1)}x. You won $${totalWinnings}!`;
    notificationElement.style.display = 'block';
    betButton.style.display = 'block';
    setTimeout(() => {
      notificationElement.style.display = 'none'; // Hide notification after 10 seconds
    }, 30000);
  }
}

cashoutButton.addEventListener('click', () => {
  if (!gameOver && revealedTiles > 0) {
    const cashoutAmount = (betAmount * multiplier).toFixed(2);
    cashoutSound.play();
    notificationElement.textContent = `You cashed out $${cashoutAmount}!`;
    notificationElement.style.display = 'block';
    gameOver = true;
    betButton.style.display = 'block';
    setTimeout(() => {
      notificationElement.style.display = 'none'; // Hide notification after 5 seconds
    }, 5000);
  }
});

betButton.addEventListener('click', () => {
  betAmount = parseFloat(betInput.value) || 10;
  bombCount = parseInt(mineCountSelector.value) || 3;
  initializeGame();
  betButton.style.display = 'none';
});

initializeGame();
