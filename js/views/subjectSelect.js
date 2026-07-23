import { el } from '../utils/dom.js';
import { navigate } from '../router.js';
import { loadSubjects } from '../services/questionLoader.js';

function renderSubtestCard(subtest) {
  return el('button', {
    type: 'button',
    className: 'card card--clickable',
    onClick: () => navigate('mode', { subtest: subtest.id }),
  }, [
    el('div', { className: 'card__title', textContent: subtest.name }),
    el('div', {
      className: 'card__meta',
      textContent: `${subtest.targetItemCount} items · ${subtest.timeLimitMinutes} min (exam)`,
    }),
    el('p', { className: 'card__desc', textContent: subtest.description }),
  ]);
}

export async function renderSubjectSelect(container) {
  container.innerHTML = '<p>Loading subjects…</p>';

  try {
    const { subtests } = await loadSubjects();
    const part1 = subtests.filter((s) => s.part === 1);
    const part2 = subtests.filter((s) => s.part === 2);

    const page = el('div', { className: 'page' }, [
      el('h1', { className: 'page__title', textContent: 'Choose Subject' }),
      el('p', {
        className: 'page__subtitle',
        textContent: 'Select a subtest to practice. Each subtest mimics the official NMAT format.',
      }),
      el('h2', { className: 'section-title', textContent: 'Part 1 — Mental Ability' }),
      el('div', { className: 'card-grid' }, part1.map(renderSubtestCard)),
      el('h2', { className: 'section-title', textContent: 'Part 2 — Academic Proficiency' }),
      el('div', { className: 'card-grid' }, part2.map(renderSubtestCard)),
      el('div', { className: 'page__actions' }, [
        el('button', {
          type: 'button',
          className: 'btn btn--secondary',
          textContent: '← Back to Home',
          onClick: () => navigate('home'),
        }),
      ]),
    ]);

    container.replaceChildren(page);
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <h2 class="error-state__title">Failed to load subjects</h2>
        <p class="error-state__message">${err.message}</p>
        <a href="#/home" class="btn btn--primary">Go Home</a>
      </div>
    `;
  }
}
