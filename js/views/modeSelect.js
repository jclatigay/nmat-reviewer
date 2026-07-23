import { el } from '../utils/dom.js';
import { navigate } from '../router.js';
import { MODES } from '../config.js';
import { getSubtestById, loadQuestions } from '../services/questionLoader.js';
import { createSession, clearSession } from '../services/sessionStore.js';

function renderModeCard({ title, icon, description, features, onClick }) {
  return el('button', {
    type: 'button',
    className: 'card card--clickable mode-card',
    onClick,
  }, [
    el('div', { className: 'mode-card__icon', textContent: icon }),
    el('div', { className: 'card__title', textContent: title }),
    el('p', { className: 'card__desc', textContent: description }),
    el('ul', { className: 'mode-card__features' }, features.map((f) => el('li', { textContent: f }))),
  ]);
}

async function startSession(subtest, mode) {
  clearSession();
  const { questions } = await loadQuestions(subtest.id, true);
  const questionCount = Array.isArray(questions) ? questions.length : 0;
  createSession(subtest, mode, questionCount, questions.map((question) => question.id));
  navigate('session');
}

export async function renderModeSelect(container, params) {
  const subtestId = params.subtest;
  if (!subtestId) {
    navigate('subject');
    return;
  }

  container.innerHTML = '<p>Loading…</p>';

  try {
    const subtest = await getSubtestById(subtestId);
    if (!subtest) {
      navigate('subject');
      return;
    }

    const page = el('div', { className: 'page' }, [
      el('h1', { className: 'page__title', textContent: subtest.name }),
      el('p', {
        className: 'page__subtitle',
        textContent: 'Choose how you want to practice this subtest.',
      }),
      el('div', { className: 'mode-cards' }, [
        renderModeCard({
          title: 'Study Mode',
          icon: '📖',
          description: 'Untimed practice with hints available.',
          features: [
            'No timer pressure',
            'Optional hint button',
            'Free navigation',
            'Explanations after finishing',
          ],
          onClick: () => startSession(subtest, MODES.STUDY),
        }),
        renderModeCard({
          title: 'Exam Mode',
          icon: '⏱️',
          description: `${subtest.timeLimitMinutes}-minute section timer, just like the real NMAT.`,
          features: [
            'Section countdown timer',
            'Flag questions for review',
            'Submit for score',
            'No hints during exam',
          ],
          onClick: () => startSession(subtest, MODES.EXAM),
        }),
      ]),
      el('div', { className: 'page__actions' }, [
        el('button', {
          type: 'button',
          className: 'btn btn--secondary',
          textContent: '← Choose Another Subject',
          onClick: () => navigate('subject'),
        }),
      ]),
    ]);

    container.replaceChildren(page);
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <h2 class="error-state__title">Failed to load subtest</h2>
        <p class="error-state__message">${err.message}</p>
        <a href="#/subject" class="btn btn--primary">Choose Subject</a>
      </div>
    `;
  }
}
