
// =========================================================
// dados.js - Juego 10000 (vos vs. la computadora)
// Se tiran hasta 6 dados. Se apartan los que puntúan y se puede
// volver a tirar con los que quedan, o plantarse y sumar lo acumulado.
// Si en una tirada ningún dado puntúa (Farkle), se pierde lo del turno.
// Gana el primero que llega a 10.000 puntos.
// =========================================================
 
// Estado del juego: todos los datos que cambian durante la partida
const state = {
  playerScore: 0,          // puntos guardados del jugador
  computerScore: 0,        // puntos guardados de la computadora
  currentPlayer: 'player', // a quién le toca: 'player' o 'computer'
  diceAvailable: 6,        // cuántos dados quedan para tirar en este turno
  currentRoll: [],         // valores de la última tirada, ej: [3, 1, 5, 5, 2, 6]
  turnScore: 0,            // puntos acumulados en el turno actual
  selected: [],            // posiciones de los dados elegidos, ej: [1, 2]
  gameOver: false,
  turnNumber: 0,
};
 
// Elementos del HTML que usa el juego
const els = {
  playerScore: document.querySelector('#playerScore'),
  computerScore: document.querySelector('#computerScore'),
  cardPlayer: document.querySelector('#cardPlayer'),
  cardComputer: document.querySelector('#cardComputer'),
  turnLabel: document.querySelector('#turnLabel'),
  turnScoreLabel: document.querySelector('#turnScoreLabel'),
  diceRow: document.querySelector('#diceRow'),
  msg: document.querySelector('#msg'),
  btnRoll: document.querySelector('#btnRoll'),
  btnBank: document.querySelector('#btnBank'),
  btnRestart: document.querySelector('#btnRestart'),
  history: document.querySelector('#history'),
  rulesLink: document.querySelector('#rulesLink'),
  rulesBox: document.querySelector('#rulesBox'),
};
 
 
/* ---------- Mensajes e historial ---------- */
 
// Muestra un mensaje. tipo puede ser 'farkle' (rojo), 'win' (amarillo) o nada
function setMsg(texto, tipo) {
  els.msg.innerText = texto;
  els.msg.classList.remove('farkle');
  els.msg.classList.remove('win');
  if (tipo) {
    els.msg.classList.add(tipo);
  }
}
 
// Agrega un renglón al historial. type es 'farkle' o 'bank' (se plantó)
function addHistoryEntry(player, type, points, totalAfter) {
  const row = document.createElement('div');
  row.classList.add('hist-row');
  row.classList.add(type);
 
  const who = player === 'player' ? 'Vos' : 'Computadora';
  let text;
  if (type === 'farkle') {
    text = `Turno ${state.turnNumber} - ${who}: Farkle, pierde ${points}`;
  } else {
    text = `Turno ${state.turnNumber} - ${who}: se planta con +${points}`;
  }
 
  row.innerHTML = `<span class="who">${text}</span><span>Total: ${totalAfter}</span>`;
  els.history.appendChild(row);
}
 
// Mostrar u ocultar la tabla de valores
els.rulesLink.addEventListener('click', () => {
  els.rulesBox.classList.toggle('show');
});
 
 
/* ---------- Cálculo de puntos ---------- */
 
// Tira "cantidad" dados y devuelve un array con los valores (del 1 al 6)
function rollDice(cantidad) {
  const tirada = [];
  for (let i = 0; i < cantidad; i++) {
    tirada.push(1 + Math.floor(Math.random() * 6));
  }
  return tirada;
}
 
// Cuenta cuántas veces salió cada número.
// Ej: [5, 1, 5] devuelve counts[1] = 1 y counts[5] = 2. La posición 0 no se usa.
function contarValores(values) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  values.forEach(v => {
    counts[v]++;
  });
  return counts;
}
 
// Escalera: salió un dado de cada número (1-2-3-4-5-6)
function esEscalera(counts) {
  for (let v = 1; v <= 6; v++) {
    if (counts[v] !== 1) {
      return false;
    }
  }
  return true;
}
 
// Cuenta cuántos pares hay (números que salieron exactamente 2 veces)
function contarPares(counts) {
  let pares = 0;
  for (let v = 1; v <= 6; v++) {
    if (counts[v] === 2) {
      pares++;
    }
  }
  return pares;
}
 
// Calcula cuánto vale un grupo de dados.
// Devuelve { valid: true/false, score: puntos }.
// valid es false si algún dado del grupo no suma puntos.
function scoreSubset(values) {
  const counts = contarValores(values);
 
  // Combinaciones especiales con los 6 dados
  if (values.length === 6) {
    if (esEscalera(counts)) return { valid: true, score: 1500 };
    if (contarPares(counts) === 3) return { valid: true, score: 750 };
  }
 
  let score = 0;
 
  // Tríos (o más): el trío de 1 vale 1000, el resto vale número x 100.
  // Cada dado extra igual al trío duplica el valor.
  for (let v = 1; v <= 6; v++) {
    if (counts[v] >= 3) {
      let valorTrio = v === 1 ? 1000 : v * 100;
      for (let extra = 3; extra < counts[v]; extra++) {
        valorTrio = valorTrio * 2;
      }
      score += valorTrio;
      counts[v] = 0; // estos dados ya se contaron
    }
  }
 
  // 1 y 5 sueltos
  score += counts[1] * 100;
  score += counts[5] * 50;
  counts[1] = 0;
  counts[5] = 0;
 
  // Si quedó algún dado sin contar, la selección no es válida
  const sobrantes = counts[2] + counts[3] + counts[4] + counts[6];
  if (sobrantes > 0) {
    return { valid: false, score: 0 };
  }
  return { valid: true, score: score };
}
 
// ¿Hay al menos un dado que puntúe en la tirada? Si no, es Farkle.
function hasAnyScore(values) {
  const counts = contarValores(values);
 
  if (counts[1] > 0 || counts[5] > 0) return true;
 
  for (let v = 1; v <= 6; v++) {
    if (counts[v] >= 3) return true;
  }
 
  if (values.length === 6 && (esEscalera(counts) || contarPares(counts) === 3)) return true;
 
  return false;
}
 
// La computadora elige todos los dados que puntúan.
// Devuelve las posiciones de esos dados.
function autoSelectAll(values) {
  const counts = contarValores(values);
  const posiciones = [];
 
  // Escalera o tres pares: se lleva los 6 dados
  if (values.length === 6 && (esEscalera(counts) || contarPares(counts) === 3)) {
    for (let i = 0; i < values.length; i++) {
      posiciones.push(i);
    }
    return posiciones;
  }
 
  // Si no: todos los dados de un trío, y los 1 y 5 sueltos
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (counts[v] >= 3 || v === 1 || v === 5) {
      posiciones.push(i);
    }
  }
  return posiciones;
}
 
// Devuelve los valores de los dados elegidos por el jugador
function valoresSeleccionados() {
  const valores = [];
  state.selected.forEach(posicion => {
    valores.push(state.currentRoll[posicion]);
  });
  return valores;
}
 
// ¿El dado de la posición i está elegido?
function estaSeleccionado(i) {
  for (let k = 0; k < state.selected.length; k++) {
    if (state.selected[k] === i) {
      return true;
    }
  }
  return false;
}
 
 
/* ---------- Pantalla ---------- */
 
// Actualiza los puntajes y resalta a quién le toca
function updateScoreCards() {
  els.playerScore.innerText = state.playerScore;
  els.computerScore.innerText = state.computerScore;
 
  if (state.currentPlayer === 'player') {
    els.cardPlayer.classList.add('active');
    els.cardComputer.classList.remove('active');
  } else {
    els.cardComputer.classList.add('active');
    els.cardPlayer.classList.remove('active');
  }
}
 
// Dónde va cada punto en la grilla de 3x3 del dado, según el número.
// Cada punto es [fila, columna]. Ej: el 1 tiene un solo punto en el centro [2, 2].
const pipPositions = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]],
};
 
// Dibuja los dados de la tirada actual: cada dado es un <div> con un <span> por punto
function renderDice() {
  els.diceRow.innerHTML = '';
 
  state.currentRoll.forEach((valor, i) => {
    const dado = document.createElement('div');
    dado.classList.add('die');
 
    pipPositions[valor].forEach(pos => {
      const pip = document.createElement('span');
      pip.classList.add('pip');
      pip.style.gridRow = pos[0];
      pip.style.gridColumn = pos[1];
      dado.appendChild(pip);
    });
 
    if (estaSeleccionado(i)) {
      dado.classList.add('selected');
    }
 
    // El jugador solo puede tocar los dados en su turno
    if (state.currentPlayer === 'player' && !state.gameOver) {
      dado.addEventListener('click', () => toggleSelect(i));
    } else {
      dado.classList.add('locked');
    }
 
    els.diceRow.appendChild(dado);
  });
}
 
// Elige o deja de elegir el dado de la posición i
function toggleSelect(i) {
  let posicion = -1;
  for (let k = 0; k < state.selected.length; k++) {
    if (state.selected[k] === i) {
      posicion = k;
    }
  }
 
  if (posicion >= 0) {
    state.selected.splice(posicion, 1); // ya estaba: se saca
  } else {
    state.selected.push(i);             // no estaba: se agrega
  }
 
  renderDice();
  updateButtonsForSelection();
}
 
// Habilita los botones solo si la selección del jugador puntúa
function updateButtonsForSelection() {
  if (state.selected.length === 0) {
    setMsg('Elegí uno o más dados que puntúen para apartarlos.');
    els.btnRoll.disabled = true;
    els.btnBank.disabled = true;
    return;
  }
 
  const result = scoreSubset(valoresSeleccionados());
 
  if (!result.valid) {
    setMsg('Esa combinación no puntúa. Elegí otra selección.', 'farkle');
    els.btnRoll.disabled = true;
    els.btnBank.disabled = true;
  } else {
    setMsg(`Esa selección suma ${result.score} puntos. Confirmá tirando de nuevo o plantándote.`);
    els.btnRoll.disabled = false;
    els.btnBank.disabled = false;
  }
}
 
 
/* ---------- Turnos ---------- */
 
// Suma los dados elegidos al acumulado del turno
function confirmSelection() {
  const result = scoreSubset(valoresSeleccionados());
  state.turnScore += result.score;
  state.diceAvailable -= state.selected.length;
 
  // Si se usaron los 6 dados, se vuelve a tirar con los 6
  if (state.diceAvailable === 0) {
    state.diceAvailable = 6;
  }
 
  state.selected = [];
  state.currentRoll = [];
  els.turnScoreLabel.innerText = state.turnScore;
}
 
// Empieza el turno de 'player' o 'computer'
function startTurnUI(player) {
  state.turnNumber++;
  state.currentPlayer = player;
  state.diceAvailable = 6;
  state.turnScore = 0;
  state.currentRoll = [];
  state.selected = [];
 
  els.turnScoreLabel.innerText = 0;
  els.turnLabel.innerText = player === 'player' ? 'Vos' : 'Computadora';
  els.diceRow.innerHTML = '';
  els.btnBank.disabled = true;
  updateScoreCards();
 
  if (player === 'player') {
    setMsg('Presioná "Tirar dados" para empezar tu turno.');
    els.btnRoll.disabled = false;
  } else {
    setMsg('Turno de la computadora...');
    els.btnRoll.disabled = true;
    setTimeout(computerTurnStep, 700);
  }
}
 
// Farkle: se pierde lo acumulado y pasa el turno
function endTurnFarkle(player) {
  setMsg('¡Farkle! Se perdieron los puntos de este turno.', 'farkle');
  els.btnRoll.disabled = true;
  els.btnBank.disabled = true;
 
  const totalAfter = player === 'player' ? state.playerScore : state.computerScore;
  addHistoryEntry(player, 'farkle', state.turnScore, totalAfter);
 
  setTimeout(() => {
    checkWinOrNext(player === 'player' ? 'computer' : 'player');
  }, 1400);
}
 
// Plantarse: se guarda lo acumulado y pasa el turno
function bankAndEndTurn(player) {
  if (player === 'player') {
    state.playerScore += state.turnScore;
  } else {
    state.computerScore += state.turnScore;
  }
  updateScoreCards();
 
  const totalAfter = player === 'player' ? state.playerScore : state.computerScore;
  addHistoryEntry(player, 'bank', state.turnScore, totalAfter);
 
  checkWinOrNext(player === 'player' ? 'computer' : 'player');
}
 
// Revisa si alguien llegó a 10.000. Si no, empieza el turno siguiente
function checkWinOrNext(nextPlayer) {
  if (state.playerScore >= 10000 || state.computerScore >= 10000) {
    state.gameOver = true;
    const ganaste = state.playerScore >= 10000;
 
    if (ganaste) {
      setMsg(`Vos ganaste con ${state.playerScore} puntos.`, 'win');
    } else {
      setMsg(`Ganó la computadora con ${state.computerScore} puntos.`, 'win');
    }
 
    els.btnRoll.disabled = true;
    els.btnBank.disabled = true;
    els.diceRow.innerHTML = '';
    els.btnRestart.style.display = 'inline-block';
 
    // Guarda la partida en la tabla de récords (records.js)
    guardarPuntaje('dados', {
      id: Math.random(),
      puntaje: state.playerScore,
      detalle: ganaste ? `Ganaste en ${state.turnNumber} turnos` : 'Ganó la computadora',
    });
    return;
  }
 
  startTurnUI(nextPlayer);
}
 
// Botón "Tirar dados"
els.btnRoll.addEventListener('click', () => {
  if (state.selected.length > 0) {
    confirmSelection();
  }
 
  state.currentRoll = rollDice(state.diceAvailable);
  state.selected = [];
  renderDice();
  els.btnBank.disabled = true;
  els.btnRoll.disabled = true;
 
  if (!hasAnyScore(state.currentRoll)) {
    endTurnFarkle('player');
    return;
  }
  setMsg('Elegí uno o más dados que puntúen para apartarlos.');
});
 
// Botón "Plantarse"
els.btnBank.addEventListener('click', () => {
  if (state.selected.length > 0) {
    confirmSelection();
  }
  bankAndEndTurn('player');
});
 
// Turno de la computadora: tira, elige lo que puntúa y decide si sigue.
// Sigue tirando mientras tenga menos de 300 puntos en el turno.
function computerTurnStep() {
  state.currentRoll = rollDice(state.diceAvailable);
  renderDice();
 
  if (!hasAnyScore(state.currentRoll)) {
    endTurnFarkle('computer');
    return;
  }
 
  state.selected = autoSelectAll(state.currentRoll);
  renderDice();
  const result = scoreSubset(valoresSeleccionados());
 
  setTimeout(() => {
    state.turnScore += result.score;
    state.diceAvailable -= state.selected.length;
    if (state.diceAvailable === 0) {
      state.diceAvailable = 6;
    }
    els.turnScoreLabel.innerText = state.turnScore;
    state.selected = [];
    state.currentRoll = [];
    renderDice();
 
    if (state.turnScore < 300) {
      setMsg(`Computadora suma ${result.score}, sigue tirando...`);
      setTimeout(computerTurnStep, 900);
    } else {
      setMsg(`Computadora suma ${result.score} y se planta.`);
      setTimeout(() => bankAndEndTurn('computer'), 900);
    }
  }, 700);
}
 
// Botón "Jugar de nuevo": reinicia todo
els.btnRestart.addEventListener('click', () => {
  state.playerScore = 0;
  state.computerScore = 0;
  state.gameOver = false;
  state.turnNumber = 0;
 
  els.history.innerHTML = '';
  els.btnRestart.style.display = 'none';
  startTurnUI('player');
});
 
// Inicio: empieza el primer turno del jugador
startTurnUI('player');