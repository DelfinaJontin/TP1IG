
// =========================================================
// cartas.js - Blackjack (vos vs. el dealer)
// Apostás fichas, recibís 2 cartas y podés pedir más o plantarte.
// El objetivo es acercarte a 21 sin pasarte y superar al dealer.
// Los ases valen 1 u 11: el jugador lo elige tocando la carta.
// =========================================================
 
// Los 4 palos: el símbolo que se dibuja y si la carta es roja o negra
const SUITS = [
  { simbolo: '♠', rojo: false },
  { simbolo: '♥', rojo: true },
  { simbolo: '♦', rojo: true },
  { simbolo: '♣', rojo: false },
];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
 
// Estado del juego
const state = {
  chips: 100,          // fichas disponibles
  bet: 0,              // apuesta de la mano actual
  deck: [],            // mazo
  playerHand: [],      // cartas del jugador
  dealerHand: [],      // cartas del dealer
  phase: 'betting',    // 'betting' (apostando) | 'playing' (jugando) | 'dealer' | 'done'
  handNumber: 0,       // número de mano
  partidaId: Math.random(), // identifica la partida para la tabla de récords
  maxChips: 100,       // máximo de fichas alcanzado en la partida
};
 
// Elementos del HTML que usa el juego
const els = {
  chipsValue: document.querySelector('#chipsValue'),
  betValue: document.querySelector('#betValue'),
  dealerHand: document.querySelector('#dealerHand'),
  dealerTotal: document.querySelector('#dealerTotal'),
  playerHand: document.querySelector('#playerHand'),
  playerTotal: document.querySelector('#playerTotal'),
  aceHint: document.querySelector('#aceHint'),
  msg: document.querySelector('#msg'),
  betRow: document.querySelector('#betRow'),
  betInput: document.querySelector('#betInput'),
  btnApostar: document.querySelector('#btnApostar'),
  playActions: document.querySelector('#playActions'),
  btnHit: document.querySelector('#btnHit'),
  btnStand: document.querySelector('#btnStand'),
  history: document.querySelector('#history'),
};
 
// Botón "Reiniciar fichas": se crea una sola vez y aparece cuando te quedás sin fichas
const btnReset = document.createElement('button');
btnReset.type = 'button';
btnReset.classList.add('primary');
btnReset.classList.add('btn-grow');
btnReset.classList.add('is-hidden');
btnReset.innerText = 'Reiniciar fichas (100)';
els.betRow.appendChild(btnReset);
 
// Mostrar y ocultar elementos con la clase is-hidden
function show(el) {
  el.classList.remove('is-hidden');
}
 
function hide(el) {
  el.classList.add('is-hidden');
}
 
 
/* ---------- Mazo y valores ---------- */
 
// Arma un mazo de 52 cartas y lo mezcla
function buildDeck() {
  const deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ rank: rank, suit: suit.simbolo, rojo: suit.rojo, aceValue: 11 });
    });
  });
 
  // Mezcla: recorre el mazo desde el final e intercambia cada carta con otra al azar
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const aux = deck[i];
    deck[i] = deck[j];
    deck[j] = aux;
  }
  return deck;
}
 
// Saca la última carta del mazo
function drawCard() {
  if (state.deck.length === 0) {
    state.deck = buildDeck();
  }
  return state.deck.pop();
}
 
// Valor de una carta: As 11, figuras 10, el resto su número
function baseCardValue(card) {
  if (card.rank === 'A') return 11;
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return 10;
  return Number(card.rank);
}
 
// Total del jugador, usando el valor que eligió para cada As
function manualTotal(hand) {
  let total = 0;
  hand.forEach(card => {
    if (card.rank === 'A') {
      total += card.aceValue;
    } else {
      total += baseCardValue(card);
    }
  });
  return total;
}
 
// Total mínimo posible (todos los ases valiendo 1), para saber si ya no hay forma de no pasarse
function minTotal(hand) {
  let total = 0;
  hand.forEach(card => {
    if (card.rank === 'A') {
      total += 1;
    } else {
      total += baseCardValue(card);
    }
  });
  return total;
}
 
// Total del dealer: los ases valen 11, salvo que eso lo haga pasarse de 21
function autoTotal(hand) {
  let total = 0;
  let ases = 0;
  hand.forEach(card => {
    total += baseCardValue(card);
    if (card.rank === 'A') {
      ases++;
    }
  });
 
  while (total > 21 && ases > 0) {
    total -= 10; // un As pasa de valer 11 a valer 1
    ases--;
  }
  return total;
}
 
 
/* ---------- Pantalla ---------- */
 
// Crea una carta dibujada: un <div> con el número en las esquinas y el palo en el centro.
// oculta: true si es la carta tapada del dealer
// interactiva: true si el jugador puede tocar el As para cambiar su valor
function renderCard(card, oculta, interactiva) {
  const div = document.createElement('div');
  div.classList.add('card');
 
  if (oculta) {
    div.classList.add('hidden');
    return div;
  }
 
  div.classList.add(card.rojo ? 'red' : 'black');
 
  // Los ases muestran su valor actual: A(11) o A(1)
  const label = card.rank === 'A' ? `A(${card.aceValue})` : card.rank;
  div.innerHTML = `<span class="rank-top">${label}</span><span class="suit">${card.suit}</span><span class="rank-bottom">${label}</span>`;
 
  // Si es un As del jugador mientras juega, al tocarlo cambia entre 11 y 1
  if (card.rank === 'A' && interactiva) {
    div.classList.add('ace');
    div.addEventListener('click', () => {
      card.aceValue = card.aceValue === 11 ? 1 : 11;
      renderHands();
    });
  }
 
  return div;
}
 
// Dibuja las dos manos, los totales y las fichas
function renderHands() {
  // Mano del jugador
  els.playerHand.innerHTML = '';
  state.playerHand.forEach(card => {
    els.playerHand.appendChild(renderCard(card, false, state.phase === 'playing'));
  });
  els.playerTotal.innerText = manualTotal(state.playerHand);
 
  // Mano del dealer: mientras jugás, su segunda carta está tapada
  els.dealerHand.innerHTML = '';
  state.dealerHand.forEach((card, i) => {
    const oculta = state.phase === 'playing' && i === 1;
    els.dealerHand.appendChild(renderCard(card, oculta, false));
  });
  els.dealerTotal.innerText = state.phase === 'playing' ? '?' : autoTotal(state.dealerHand);
 
  // La ayuda del As aparece solo si tenés un As y estás jugando
  let tieneAs = false;
  state.playerHand.forEach(card => {
    if (card.rank === 'A') {
      tieneAs = true;
    }
  });
  if (tieneAs && state.phase === 'playing') {
    show(els.aceHint);
  } else {
    hide(els.aceHint);
  }
 
  els.chipsValue.innerText = state.chips;
  els.betValue.innerText = state.bet;
}
 
// Agrega un renglón al historial de manos
function addHistoryEntry(text, chipsAfter) {
  const row = document.createElement('div');
  row.classList.add('hist-row');
  row.innerHTML = `<span class="who">Mano ${state.handNumber}: ${text}</span><span>Fichas: ${chipsAfter}</span>`;
  els.history.appendChild(row);
}
 
 
/* ---------- Desarrollo de la mano ---------- */
 
// Prepara la pantalla para apostar
function startBettingPhase() {
  state.phase = 'betting';
  state.playerHand = [];
  state.dealerHand = [];
  state.bet = 0;
 
  els.playerTotal.innerText = '-';
  els.dealerTotal.innerText = '-';
  els.playerHand.innerHTML = '';
  els.dealerHand.innerHTML = '';
  hide(els.aceHint);
  hide(els.playActions);
  show(els.betRow);
 
  if (state.chips <= 0) {
    els.msg.innerText = 'Te quedaste sin fichas.';
    hide(els.betInput);
    hide(els.btnApostar);
    show(btnReset);
  } else {
    els.msg.innerText = 'Ingresá tu apuesta para empezar la mano.';
    show(els.betInput);
    show(els.btnApostar);
    hide(btnReset);
    // La apuesta sugerida no puede ser mayor que las fichas que tenés
    els.betInput.value = Math.min(Number(els.betInput.value) || 10, state.chips);
  }
 
  els.chipsValue.innerText = state.chips;
  els.betValue.innerText = 0;
}
 
// Botón "Apostar": valida la apuesta y reparte las cartas
function startHand() {
  if (state.phase !== 'betting') return;
 
  const bet = Number(els.betInput.value);
  if (isNaN(bet) || bet < 1 || bet > state.chips || bet !== Math.floor(bet)) {
    els.msg.innerText = 'Ingresá una apuesta válida: un número entero entre 1 y tus fichas.';
    return;
  }
 
  state.bet = bet;
  state.chips -= bet;
  state.handNumber++;
  state.deck = buildDeck();
  state.playerHand = [drawCard(), drawCard()];
  state.dealerHand = [drawCard(), drawCard()];
  state.phase = 'playing';
 
  hide(els.betRow);
  show(els.playActions);
  els.msg.innerText = 'Pedí carta o plantate.';
  renderHands();
}
 
// Termina la mano: suma las fichas ganadas, guarda el récord y vuelve a apostar
function endHand(resultText, chipsDelta) {
  state.chips += chipsDelta;
  state.phase = 'done';
 
  // Guarda el máximo de fichas de esta partida en la tabla de récords (records.js)
  state.maxChips = Math.max(state.maxChips, state.chips);
  guardarPuntaje('cartas', {
    id: state.partidaId,
    puntaje: state.maxChips,
    detalle: `${state.handNumber} manos jugadas`,
  });
 
  renderHands();
  addHistoryEntry(resultText, state.chips);
  hide(els.playActions);
  setTimeout(startBettingPhase, 1800);
}
 
// El dealer pide cartas hasta llegar a 17 o más, de a una por vez
function dealerPlay() {
  els.msg.innerText = 'El dealer juega...';
  const step = () => {
    if (autoTotal(state.dealerHand) < 17) {
      state.dealerHand.push(drawCard());
      renderHands();
      setTimeout(step, 700);
    } else {
      resolveHand();
    }
  };
  setTimeout(step, 700);
}
 
// Compara los totales y decide quién gana
function resolveHand() {
  const player = manualTotal(state.playerHand);
  const dealer = autoTotal(state.dealerHand);
 
  if (player > 21) {
    els.msg.innerText = `Te pasaste con ${player}. Perdiste tu apuesta.`;
    endHand(`Te pasaste (${player}) - perdiste ${state.bet}`, 0);
  } else if (dealer > 21) {
    els.msg.innerText = `El dealer se pasó con ${dealer}. ¡Ganaste!`;
    endHand(`Ganaste, el dealer se pasó (${dealer})`, state.bet * 2);
  } else if (player > dealer) {
    els.msg.innerText = `Vos ${player}, dealer ${dealer}. ¡Ganaste!`;
    endHand(`Ganaste ${player} a ${dealer}`, state.bet * 2);
  } else if (player < dealer) {
    els.msg.innerText = `Vos ${player}, dealer ${dealer}. Perdiste.`;
    endHand(`Perdiste ${player} a ${dealer}`, 0);
  } else {
    els.msg.innerText = `Empate en ${player}. Se devuelve tu apuesta.`;
    endHand(`Empate en ${player}`, state.bet);
  }
}
 
 
/* ---------- Botones ---------- */
 
els.btnApostar.addEventListener('click', startHand);
 
// Reiniciar fichas: empieza una partida nueva
btnReset.addEventListener('click', () => {
  state.chips = 100;
  state.partidaId = Math.random();
  state.maxChips = 100;
  state.handNumber = 0;
  startBettingPhase();
});
 
// Pedir carta
els.btnHit.addEventListener('click', () => {
  if (state.phase !== 'playing') return;
 
  state.playerHand.push(drawCard());
  renderHands();
 
  if (minTotal(state.playerHand) > 21) {
    els.msg.innerText = 'Te pasaste, no hay forma de salvar la mano.';
    endHand(`Te pasaste (${manualTotal(state.playerHand)}) - perdiste ${state.bet}`, 0);
  } else {
    els.msg.innerText = 'Pedí otra carta o plantate.';
  }
});
 
// Plantarse: le toca al dealer
els.btnStand.addEventListener('click', () => {
  if (state.phase !== 'playing') return;
  state.phase = 'dealer';
  hide(els.playActions);
  renderHands();
  dealerPlay();
});
 
// Inicio
startBettingPhase();