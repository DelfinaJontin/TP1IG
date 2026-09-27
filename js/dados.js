const state = {
  playerScore: 0,
  computerScore: 0,
  currentPlayer: 'player',
  diceAvailable: 6,
  currentRoll: [],
  keptThisRoll: [],
  turnScore: 0,
  selected: [],
  gameOver: false,
  turnNumber: 0,
};

const els = {
  playerScore: document.getElementById('playerScore'),
  computerScore: document.getElementById('computerScore'),
  cardPlayer: document.getElementById('cardPlayer'),
  cardComputer: document.getElementById('cardComputer'),
  turnLabel: document.getElementById('turnLabel'),
  turnScoreLabel: document.getElementById('turnScoreLabel'),
  diceRow: document.getElementById('diceRow'),
  msg: document.getElementById('msg'),
  btnRoll: document.getElementById('btnRoll'),
  btnBank: document.getElementById('btnBank'),
  history: document.getElementById('history'),
};
function addHistoryEntry(player, type, points, totalAfter) {
  const row = document.createElement('div');
  row.className = 'hist-row ' + (type === 'farkle' ? 'farkle' : 'bank');
  const who = player === 'player' ? 'Vos' : 'Computadora';
  const text = type === 'farkle'
    ? `Turno ${state.turnNumber} - ${who}: Farkle, pierde ${points}`
    : `Turno ${state.turnNumber} - ${who}: se planta con +${points}`;
  row.innerHTML = `<span class="who">${text}</span><span>Total: ${totalAfter}</span>`;
  els.history.appendChild(row);
  els.history.scrollTop = els.history.scrollHeight;
}

document.getElementById('rulesLink').addEventListener('click', () => {
  document.getElementById('rulesBox').classList.toggle('show');
});

function rollDice(n) {
  const r = [];
  for (let i = 0; i < n; i++) r.push(1 + Math.floor(Math.random() * 6));
  return r;
}
function pipPositions(value) {
  const positions = {
    1: [[2,2]],
    2: [[1,1],[3,3]],
    3: [[1,1],[2,2],[3,3]],
    4: [[1,1],[1,3],[3,1],[3,3]],
    5: [[1,1],[1,3],[2,2],[3,1],[3,3]],
    6: [[1,1],[1,3],[2,1],[2,3],[3,1],[3,3]],
  };
  return positions[value] || [];
}