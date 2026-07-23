import { SESSION_KEY, RESULTS_KEY, MODES } from '../config.js';

function read(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

export function getSession() {
  return read(SESSION_KEY);
}

export function saveSession(session) {
  write(SESSION_KEY, session);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getResults() {
  return read(RESULTS_KEY);
}

export function saveResults(results) {
  write(RESULTS_KEY, results);
}

export function clearResults() {
  sessionStorage.removeItem(RESULTS_KEY);
}

export function createSession(subtest, mode, questionCount, questionOrder = []) {
  clearResults();
  const timeLimitSeconds = mode === MODES.EXAM ? subtest.timeLimitMinutes * 60 : null;

  const session = {
    subtestId: subtest.id,
    subtestName: subtest.name,
    part: subtest.part,
    mode,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    currentIndex: 0,
    answers: {},
    flagged: [],
    hintsRevealed: [],
    timeLimitSeconds,
    remainingSeconds: timeLimitSeconds,
    elapsedSeconds: 0,
    submitted: false,
    questionCount,
    questionIds: questionOrder,
  };

  saveSession(session);
  return session;
}

export function initQuestionIds(session, questions) {
  if (!session.questionIds || session.questionIds.length !== questions.length) {
    session.questionIds = questions.map((q) => q.id);
  }

  questions.forEach((q) => {
    if (!(q.id in session.answers)) {
      session.answers[q.id] = null;
    }
  });
  saveSession(session);
}

export function setAnswer(session, questionId, choiceId) {
  session.answers[questionId] = choiceId;
  saveSession(session);
}

export function toggleFlag(session, questionId) {
  const idx = session.flagged.indexOf(questionId);
  if (idx >= 0) {
    session.flagged.splice(idx, 1);
  } else {
    session.flagged.push(questionId);
  }
  saveSession(session);
  return session.flagged.includes(questionId);
}

export function revealHint(session, questionId) {
  if (!session.hintsRevealed.includes(questionId)) {
    session.hintsRevealed.push(questionId);
    saveSession(session);
  }
}

export function setCurrentIndex(session, index) {
  session.currentIndex = index;
  saveSession(session);
}

export function updateTimer(remainingSeconds) {
  const session = getSession();
  if (!session) return;
  session.remainingSeconds = remainingSeconds;
  if (session.timeLimitSeconds !== null) {
    session.elapsedSeconds = session.timeLimitSeconds - remainingSeconds;
  }
  saveSession(session);
}

export function submitSession(session) {
  session.submitted = true;
  session.submittedAt = new Date().toISOString();
  saveSession(session);
  return session;
}

export function hasActiveSession() {
  const session = getSession();
  return session && !session.submitted;
}

export function getUnansweredCount(session) {
  return session.questionIds.filter((id) => !session.answers[id]).length;
}
