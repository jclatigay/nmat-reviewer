import { el } from '../utils/dom.js';
import { navigate } from '../router.js';
import { getResults } from '../services/sessionStore.js';
import { filterDetails } from '../services/scoring.js';
import { groupQuestionsByTag } from '../utils/grouping.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'incorrect', label: 'Incorrect' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'flagged', label: 'Flagged' },
];

function getChoiceText(question, choiceId) {
  if (!choiceId) return '—';
  const choice = question.choices.find((c) => c.id === choiceId);
  return choice ? `${choice.id}. ${choice.text}` : choiceId;
}

function renderReviewItem(detail) {
  const { question, userAnswer, isCorrect, isUnanswered, isFlagged } = detail;

  let badgeClass = 'review-item__badge--incorrect';
  let badgeText = 'Incorrect';

  if (isUnanswered) {
    badgeClass = 'review-item__badge--unanswered';
    badgeText = 'Unanswered';
  } else if (isCorrect) {
    badgeClass = 'review-item__badge--correct';
    badgeText = 'Correct';
  }

  return el('div', { className: 'card review-item' }, [
    el('div', { className: 'review-item__header' }, [
      el('span', { className: 'review-item__number', textContent: `Question ${question.number}` }),
      el('span', { className: `review-item__badge ${badgeClass}`, textContent: badgeText }),
    ]),
    question.passage ? el('div', { className: 'passage-box', html: question.passage }) : null,
    question.image
      ? el('img', { className: 'question-image', src: question.image, alt: `Figure for question ${question.number}` })
      : null,
    el('p', { className: 'question-prompt', html: question.prompt }),
    el('div', { className: 'review-item__answers' }, [
      el('p', { html: `<strong>Your answer:</strong> ${getChoiceText(question, userAnswer)}${isFlagged ? ' 🚩' : ''}` }),
      el('p', { html: `<strong>Correct answer:</strong> ${getChoiceText(question, question.correctChoiceId)}` }),
    ]),
    el('div', { className: 'review-item__explanation' }, [
      el('strong', { textContent: 'Explanation: ' }),
      el('span', { textContent: question.explanation }),
    ]),
  ]);
}

function renderGroupedReview(details) {
  const questions = details.map((detail) => detail.question);
  const groups = groupQuestionsByTag(questions);
  const detailById = new Map(details.map((detail) => [detail.question.id, detail]));

  return groups.map((group) =>
    el('section', { className: 'review-group' }, [
      el('h2', { className: 'review-group__title', textContent: group.label }),
      ...group.questions.map((question) => renderReviewItem(detailById.get(question.id))),
    ])
  );
}

export function renderReview(container) {
  const results = getResults();

  if (!results) {
    navigate('home');
    return;
  }

  let activeFilter = 'all';

  const page = el('div', { className: 'page' });
  const filterContainer = el('div', { className: 'filter-tabs' });
  const listContainer = el('div');

  function renderList() {
    const filtered = filterDetails(results.details, activeFilter);
    const grouped = results.subtestId === 'inductive-reasoning' && filtered.length > 0;
    let items;

    if (filtered.length === 0) {
      items = [el('div', { className: 'card empty-state' }, [
        el('h2', { className: 'empty-state__title', textContent: 'No questions in this view' }),
        el('p', { className: 'empty-state__message', textContent: 'Try a different filter to review your answers.' }),
      ])];
    } else if (grouped) {
      items = renderGroupedReview(filtered);
    } else {
      items = filtered.map(renderReviewItem);
    }

    listContainer.replaceChildren(...items);
  }

  function renderFilters() {
    const filters = FILTERS.map((f) =>
      el('button', {
        type: 'button',
        className: `filter-tab${activeFilter === f.id ? ' filter-tab--active' : ''}`,
        textContent: f.label,
        onClick: () => {
          activeFilter = f.id;
          renderFilters();
          renderList();
        },
      })
    );

    filterContainer.replaceChildren(...filters);
  }

  page.appendChild(el('h1', { className: 'page__title', textContent: 'Review Answers' }));
  page.appendChild(el('p', {
    className: 'page__subtitle',
    textContent: `${results.subtestName} — review explanations and compare your choices with the correct answers.`,
  }));
  page.appendChild(filterContainer);
  page.appendChild(listContainer);
  page.appendChild(
    el('div', { className: 'page__actions' }, [
      el('button', {
        type: 'button',
        className: 'btn btn--secondary',
        textContent: '← Back to Results',
        onClick: () => navigate('results'),
      }),
      el('button', {
        type: 'button',
        className: 'btn btn--primary',
        textContent: 'Home',
        onClick: () => navigate('home'),
      }),
    ])
  );

  container.replaceChildren(page);
  renderFilters();
  renderList();
}
