// =========================================================
// trivia.js - Trivia (vos vs. la computadora)
// Las preguntas se piden a la API pública Open Trivia Database.
// Son 10 preguntas de opción múltiple y tenés 10 segundos para
// responder cada una (timer). La computadora también responde:
// acierta 7 de cada 10 veces, al azar. Gana el que más acierta.
// =========================================================

// Dirección de la API: 10 preguntas (amount=10), categoría películas (category=11),
// dificultad media y de opción múltiple
const API_URL = 'https://opentdb.com/api.php?amount=10&category=11&difficulty=medium&type=multiple';
const TIME_PER_QUESTION = 10; // segundos por pregunta

// Estado del juego
const state = {
  questions: [],      // preguntas ya procesadas
  currentIndex: 0,    // número de la pregunta actual (empieza en 0)
  playerScore: 0,     // aciertos del jugador
  computerScore: 0,   // aciertos de la computadora
  answered: false,    // si ya se respondió la pregunta actual
  gameOver: false,
  timeLeft: TIME_PER_QUESTION,
  timerId: null,      // identificador del setInterval, para poder detenerlo
};

// Elementos del HTML que usa el juego
const els = {
  playerScore: document.querySelector('#playerScore'),
  computerScore: document.querySelector('#computerScore'),
  questionMeta: document.querySelector('#questionMeta'),
  questionText: document.querySelector('#questionText'),
  answers: document.querySelector('#answers'),
  feedback: document.querySelector('#feedback'),
  history: document.querySelector('#history'),
};

// Mezcla un array: recorre desde el final e intercambia cada elemento con otro al azar
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const aux = arr[i];
    arr[i] = arr[j];
    arr[j] = aux;
  }
  return arr;
}


/* ---------- Pedido a la API ---------- */

// Pide las preguntas a la API, espera la respuesta y la procesa.
// La API responde un JSON con:
//   response_code: 0 si salió bien, 5 si se hicieron demasiados pedidos seguidos
//   results: array de preguntas, cada una con category, question,
//            correct_answer (texto) e incorrect_answers (array de 3 textos)
// Los textos vienen con caracteres especiales codificados (por ejemplo &quot; en vez de ")
// por eso se muestran con innerHTML, que los convierte al carácter real.
async function loadQuestions() {
  try {
    const res = await fetch(API_URL);   // hace el pedido y espera la respuesta
    const data = await res.json();      // convierte la respuesta (JSON) en un objeto

    if (data.response_code === 5) {
      els.questionMeta.innerText = 'Demasiados pedidos seguidos. Esperá unos segundos y recargá la página.';
      return;
    }
    if (data.response_code !== 0 || data.results.length === 0) {
      els.questionMeta.innerText = 'No se pudieron cargar las preguntas.';
      return;
    }

    // Se arma una pregunta propia por cada resultado de la API,
    // con la respuesta correcta mezclada entre las incorrectas
    data.results.forEach(q => {
      const opciones = [q.correct_answer].concat(q.incorrect_answers);
      state.questions.push({
        category: q.category,
        question: q.question,
        correctAnswer: q.correct_answer,
        incorrectAnswers: q.incorrect_answers,
        options: shuffle(opciones),
      });
    });

    showQuestion();
  } catch (error) {
    // Se llega acá si no hay conexión o la API no responde
    els.questionMeta.innerText = 'Error al conectar con la API de trivia.';
  }
}


/* ---------- Pantalla ---------- */

function updateScores() {
  els.playerScore.innerText = state.playerScore;
  els.computerScore.innerText = state.computerScore;
}

// Agrega un renglón al historial: azul si acertaste, rojo si fallaste
function addHistoryEntry(index, playerCorrect, computerCorrect) {
  const row = document.createElement('div');
  row.classList.add('hist-row');
  row.classList.add(playerCorrect ? 'correct' : 'wrong');

  const playerText = playerCorrect ? 'acierta' : 'falla';
  const computerText = computerCorrect ? 'acierta' : 'falla';
  row.innerHTML = `<span class="who">Pregunta ${index + 1}</span><span>Vos ${playerText} - Computadora ${computerText}</span>`;
  els.history.appendChild(row);
}

// Muestra el número de pregunta, la categoría y el tiempo que queda
function renderMeta() {
  const q = state.questions[state.currentIndex];
  els.questionMeta.innerHTML = `Pregunta ${state.currentIndex + 1} de ${state.questions.length} - ${q.category} - Tiempo: ${state.timeLeft}s`;
}


/* ---------- Temporizador ---------- */

function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

// Cuenta 10 segundos hacia atrás. Si llega a 0, la pregunta cuenta como no respondida
function startTimer() {
  stopTimer();
  state.timeLeft = TIME_PER_QUESTION;
  renderMeta();

  state.timerId = setInterval(() => {
    state.timeLeft--;
    renderMeta();
    if (state.timeLeft <= 0) {
      handleAnswer(null); // null = se acabó el tiempo
    }
  }, 1000);
}


/* ---------- Preguntas y respuestas ---------- */

// Muestra la pregunta actual con un botón por cada opción
function showQuestion() {
  if (state.currentIndex >= state.questions.length) {
    endGame();
    return;
  }

  state.answered = false;
  const q = state.questions[state.currentIndex];

  els.questionText.innerHTML = q.question;
  els.feedback.innerText = '';
  els.feedback.classList.remove('ok');
  els.feedback.classList.remove('fail');

  els.answers.innerHTML = '';
  q.options.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('answer-btn');
    btn.innerHTML = option;
    btn.addEventListener('click', () => handleAnswer(option));
    els.answers.appendChild(btn);
  });

  startTimer();
}

// La computadora acierta 7 de cada 10 veces. Si falla, elige una incorrecta al azar
function computerAnswer(q) {
  if (Math.random() < 0.7) {
    return q.correctAnswer;
  }
  const posicion = Math.floor(Math.random() * q.incorrectAnswers.length);
  return q.incorrectAnswers[posicion];
}

// Se ejecuta cuando el jugador elige una opción, o cuando se acaba el tiempo (playerAnswer = null)
function handleAnswer(playerAnswer) {
  if (state.answered || state.gameOver) return;
  state.answered = true;
  stopTimer();

  const q = state.questions[state.currentIndex];
  const timedOut = playerAnswer === null;
  const playerCorrect = !timedOut && playerAnswer === q.correctAnswer;
  const computerCorrect = computerAnswer(q) === q.correctAnswer;

  // Desactiva los botones y marca la correcta (amarillo) y la elegida mal (rojo)
  const botones = els.answers.querySelectorAll('button');
  botones.forEach((btn, i) => {
    btn.disabled = true;
    const opcion = q.options[i];
    if (opcion === q.correctAnswer) {
      btn.classList.add('correct');
    } else if (opcion === playerAnswer) {
      btn.classList.add('wrong');
    }
  });

  if (playerCorrect) state.playerScore++;
  if (computerCorrect) state.computerScore++;
  updateScores();

  if (timedOut) {
    els.feedback.innerHTML = `Se acabó el tiempo. La respuesta era: ${q.correctAnswer}.`;
  } else if (playerCorrect) {
    els.feedback.innerHTML = '¡Correcto!';
  } else {
    els.feedback.innerHTML = `Incorrecto. La respuesta era: ${q.correctAnswer}.`;
  }
  els.feedback.classList.add(playerCorrect ? 'ok' : 'fail');

  addHistoryEntry(state.currentIndex, playerCorrect, computerCorrect);

  state.currentIndex++;
  setTimeout(showQuestion, 1800);
}

// Fin del juego: muestra el resultado y guarda el récord
function endGame() {
  state.gameOver = true;
  stopTimer();
  els.answers.innerHTML = '';

  let resultText;
  if (state.playerScore > state.computerScore) {
    resultText = `¡Ganaste vos con ${state.playerScore} aciertos!`;
  } else if (state.computerScore > state.playerScore) {
    resultText = `Ganó la computadora con ${state.computerScore} aciertos.`;
  } else {
    resultText = `Empate con ${state.playerScore} aciertos cada uno.`;
  }

  els.questionMeta.innerText = 'Juego terminado';
  els.questionText.innerText = resultText;
  els.feedback.innerText = '';

  // Guarda la partida en la tabla de récords (records.js)
  guardarPuntaje('trivia', {
    id: Math.random(),
    puntaje: state.playerScore,
    detalle: `${state.playerScore} de ${state.questions.length}`,
  });

  // Botón para jugar otra partida: recarga la página y se piden preguntas nuevas a la API
  const btnOtra = document.createElement('button');
  btnOtra.type = 'button';
  btnOtra.classList.add('primary');
  btnOtra.innerText = 'Jugar de nuevo';
  btnOtra.addEventListener('click', () => {
    location.reload();
  });
  els.answers.appendChild(btnOtra);
}

// Inicio
updateScores();
loadQuestions();