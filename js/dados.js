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