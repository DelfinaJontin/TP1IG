const API_URL = 'https://opentdb.com/api.php?amount=10&category=11&difficulty=medium&type=multiple&encode=url3986';
const TIME_PER_QUESTION = 10; // segundos

const state = {
  questions: [],
  currentIndex: 0,
  playerScore: 0,
  computerScore: 0,
  answered: false,
  gameOver: false,
  timeLeft: TIME_PER_QUESTION,
  timerId: null,
};

const els = {
  playerScore: document.getElementById('playerScore'),
  computerScore: document.getElementById('computerScore'),
  questionMeta: document.getElementById('questionMeta'),
  questionText: document.getElementById('questionText'),
  answers: document.getElementById('answers'),
  feedback: document.getElementById('feedback'),
  history: document.getElementById('history'),
};

function decode(str) {
  return decodeURIComponent(str);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadQuestions() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.response_code === 5) {
      els.questionMeta.textContent = 'Demasiadas peticiones seguidas. Esperá unos segundos y recargá.';
      return;
    }
    if (data.response_code !== 0 || !data.results.length) {
      els.questionMeta.textContent = 'No se pudieron cargar las preguntas.';
      return;
    }

    state.questions = data.results.map(q => {
      const correctAnswer = decode(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decode);
      return {
        category: decode(q.category),
        question: decode(q.question),
        correctAnswer,
        incorrectAnswers,
        options: shuffle([correctAnswer, ...incorrectAnswers]),
      };
    });

    showQuestion();
  } catch (err) {
    els.questionMeta.textContent = 'Error al conectar con la API de trivia.';
  }
}

function updateScores() {
  els.playerScore.textContent = state.playerScore;
  els.computerScore.textContent = state.computerScore;
}

function addHistoryEntry(index, playerCorrect, computerCorrect) {
  const row = document.createElement('div');
  row.className = 'hist-row ' + (playerCorrect ? 'correct' : 'wrong');
  const playerText = playerCorrect ? 'acierta' : 'falla';
  const computerText = computerCorrect ? 'acierta' : 'falla';
  row.innerHTML = `<span class="who">Pregunta ${index + 1}</span><span>Vos ${playerText} - Computadora ${computerText}</span>`;
  els.history.appendChild(row); // el historial usa column-reverse: lo último queda arriba
}

/* ---------- Temporizador ---------- */
function renderMeta() {
  const q = state.questions[state.currentIndex];
  if (!q) return;
  els.questionMeta.textContent =
    `Pregunta ${state.currentIndex + 1} de ${state.questions.length} - ${q.category} - Tiempo: ${state.timeLeft}s`;
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  state.timeLeft = TIME_PER_QUESTION;
  renderMeta();
  state.timerId = setInterval(() => {
    state.timeLeft--;
    renderMeta();
    if (state.timeLeft <= 0) handleAnswer(null); // null = se acabó el tiempo
  }, 1000);
}

/* ---------- Flujo de preguntas ---------- */
function showQuestion() {
  if (state.currentIndex >= state.questions.length) {
    endGame();
    return;
  }

  state.answered = false;
  const q = state.questions[state.currentIndex];
  els.questionText.textContent = q.question;
  els.feedback.textContent = '';
  els.feedback.className = 'feedback';

  els.answers.innerHTML = '';
  q.options.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswer(option));
    els.answers.appendChild(btn);
  }); 
  startTimer();
}

function computerAnswer(q) {
  if (Math.random() < 0.7) return q.correctAnswer;
  const wrong = q.incorrectAnswers;
  return wrong[Math.floor(Math.random() * wrong.length)];
}

function handleAnswer(playerAnswer) {
  if (state.answered || state.gameOver) return;
  state.answered = true;
  stopTimer();

  const q = state.questions[state.currentIndex];
  const timedOut = playerAnswer === null;
  const playerCorrect = !timedOut && playerAnswer === q.correctAnswer;
  const computerCorrect = computerAnswer(q) === q.correctAnswer;

  els.answers.querySelectorAll('button').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.correctAnswer) btn.classList.add('correct');
    else if (btn.textContent === playerAnswer) btn.classList.add('wrong');
  });

  if (playerCorrect) state.playerScore++;
  if (computerCorrect) state.computerScore++;
  updateScores();

  if (timedOut) {
    els.feedback.textContent = `Se acabó el tiempo. La respuesta era: ${q.correctAnswer}.`;
  } else if (playerCorrect) {
    els.feedback.textContent = 'Correcto!';
  } else {
    els.feedback.textContent = `Incorrecto. La respuesta era: ${q.correctAnswer}.`;
  }
  els.feedback.className = 'feedback ' + (playerCorrect ? 'ok' : 'fail');

  addHistoryEntry(state.currentIndex, playerCorrect, computerCorrect);

  state.currentIndex++;
  setTimeout(showQuestion, 1800);
}

function endGame() {
  state.gameOver = true;
  stopTimer();
  els.answers.innerHTML = '';

  let resultText;
  if (state.playerScore > state.computerScore) resultText = `Ganaste vos con ${state.playerScore} aciertos.`;
  else if (state.computerScore > state.playerScore) resultText = `Gano la computadora con ${state.computerScore} aciertos.`;
  else resultText = `Empate con ${state.playerScore} aciertos cada uno.`;

  els.questionMeta.textContent = 'Juego terminado';
  els.questionText.textContent = resultText;
  els.feedback.textContent = '';
}

updateScores();
loadQuestions();