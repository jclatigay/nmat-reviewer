import { el } from '../utils/dom.js';
import { navigate } from '../router.js';
import { getResults, clearSession } from '../services/sessionStore.js';
import { formatDuration, formatPercent } from '../utils/format.js';
import { MODES } from '../config.js';

export function renderResults(container) {
  const results = getResults();

  if (!results) {
    navigate('home');
    return;
  }

  const isExam = results.mode === MODES.EXAM;

  const page = el('div', { className: 'page' }, [
    el('h1', { className: 'page__title', textContent: 'Results' }),
    el('p', {
      className: 'page__subtitle',
      textContent: `${results.subtestName} — ${isExam ? 'Exam Mode' : 'Study Mode'}`,
    }),
    el('div', { className: 'results-summary' }, [
      el('div', { className: 'card stat-card' }, [
        el('div', { className: 'stat-card__value', textContent: `${results.correct}/${results.total}` }),
        el('div', { className: 'stat-card__label', textContent: 'Correct' }),
      ]),
      el('div', { className: 'card stat-card' }, [
        el('div', { className: 'stat-card__value', textContent: formatPercent(results.correct, results.total) }),
        el('div', { className: 'stat-card__label', textContent: 'Score' }),
      ]),
      el('div', { className: 'card stat-card' }, [
        el('div', {
          className: 'stat-card__value',
          textContent: isExam ? formatDuration(results.elapsedSeconds) : '—',
        }),
        el('div', { className: 'stat-card__label', textContent: isExam ? 'Time Used' : 'Untimed' }),
      ]),
    ]),
    el('div', { className: 'card', style: 'margin-bottom: 1.5rem;' }, [
      el('p', { html: `<strong>Incorrect:</strong> ${results.incorrect} &nbsp;·&nbsp; <strong>Unanswered:</strong> ${results.unanswered} &nbsp;·&nbsp; <strong>Flagged:</strong> ${results.flaggedCount}` }),
    ]),
    el('div', { className: 'page__actions' }, [
      el('button', {
        type: 'button',
        className: 'btn btn--primary btn--block',
        textContent: 'Review Answers',
        onClick: () => navigate('review'),
      }),
      el('button', {
        type: 'button',
        className: 'btn btn--secondary btn--block',
        textContent: 'Try Another Subject',
        onClick: () => {
          clearSession();
          navigate('subject');
        },
      }),
      el('button', {
        type: 'button',
        className: 'btn btn--ghost btn--block',
        textContent: 'Back to Home',
        onClick: () => navigate('home'),
      }),
    ]),
  ]);

  container.replaceChildren(page);
}
