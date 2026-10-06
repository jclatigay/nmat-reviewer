import { el } from '../utils/dom.js';
import { MODES } from '../config.js';
import { groupQuestionsByTag, usesGroupedPalette } from '../utils/grouping.js';

function buildPaletteButton(index, questionId, { isCurrent, isAnswered, isCorrect, isIncorrect, isFlagged, onJump }) {
  const classes = ['palette__btn'];
  if (isCurrent) classes.push('palette__btn--current');
  if (isAnswered) {
    if (isCorrect) classes.push('palette__btn--correct');
    else if (isIncorrect) classes.push('palette__btn--incorrect');
    else classes.push('palette__btn--answered');
  }
  if (isFlagged) classes.push('palette__btn--flagged');

  return el('button', {
    type: 'button',
    className: classes.join(' '),
    textContent: String(index + 1),
    'aria-label': `Go to question ${index + 1}${isFlagged ? ', flagged' : ''}`,
    onClick: () => onJump(index),
  });
}

function renderQuestionButton(question, index, session, onJump) {
  const selectedId = session.answers?.[question.id] ?? null;
  const showAnswerFeedback = session.mode !== MODES.EXAM;

  return buildPaletteButton(index, question.id, {
    isCurrent: session.currentIndex === index,
    isAnswered: !!selectedId,
    isCorrect: showAnswerFeedback && !!selectedId && selectedId === question.correctChoiceId,
    isIncorrect: showAnswerFeedback && !!selectedId && selectedId !== question.correctChoiceId,
    isFlagged: session.flagged.includes(question.id),
    onJump,
  });
}

function renderQuestionButtons(questions, session, onJump) {
  const items = [];
  let index = 0;

  while (index < questions.length) {
    const question = questions[index];
    if (!question.passageGroupId) {
      items.push(renderQuestionButton(question, question.__index ?? index, session, onJump));
      index += 1;
      continue;
    }

    let end = index + 1;
    while (
      end < questions.length
      && questions[end].passageGroupId === question.passageGroupId
    ) {
      end += 1;
    }

    const passageQuestions = questions.slice(index, end);
    items.push(el('div', {
      className: 'palette-passage-group',
      role: 'group',
      'aria-label': 'Questions based on the same passage',
    }, [
      el('div', { className: 'palette palette-passage-group__items' }, passageQuestions.map((item, offset) =>
        renderQuestionButton(item, item.__index ?? index + offset, session, onJump)
      )),
    ]));
    index = end;
  }

  return items;
}

export function renderPalette(questions, session, onJump) {
  const palette = el('div', { className: 'palette', role: 'navigation', 'aria-label': 'Question palette' });
  palette.append(...renderQuestionButtons(questions, session, onJump));

  return palette;
}

export function renderGroupedPalette(questions, session, onJump) {
  const wrapper = el('div', { className: 'palette-groups' });
  const groups = groupQuestionsByTag(questions.map((question, index) => ({ ...question, __index: index })));

  groups.forEach((group) => {
    const groupSection = el('section', { className: 'palette-group' }, [
      el('strong', { className: 'palette-group__title', textContent: group.label }),
      el('div', { className: 'palette' }, renderQuestionButtons(group.questions, session, onJump)),
    ]);
    wrapper.appendChild(groupSection);
  });

  return wrapper;
}

export function renderPaletteDrawer(questions, session, onJump, onClose) {
  const backdrop = el('div', {
    className: 'overlay-backdrop overlay-backdrop--visible',
    onClick: onClose,
  });

  const drawer = el('div', { className: 'palette-drawer palette-drawer--open' }, [
    el('div', { className: 'palette-drawer__header' }, [
      el('strong', { textContent: 'Question Palette' }),
      el('button', {
        type: 'button',
        className: 'btn btn--ghost',
        textContent: 'Close',
        onClick: onClose,
      }),
    ]),
    usesGroupedPalette(session)
      ? renderGroupedPalette(questions, session, (index) => {
          onJump(index);
          onClose();
        })
      : renderPalette(questions, session, (index) => {
          onJump(index);
          onClose();
        }),
  ]);

  return { backdrop, drawer };
}

export function renderPaletteSidebar(questions, session, onJump) {
  const sidebar = el('aside', { className: 'palette-sidebar card' }, [
    el('strong', { textContent: 'Questions', style: 'display:block;margin-bottom:0.75rem;' }),
    renderPalette(questions, session, onJump),
  ]);
  return sidebar;
}

export function renderGroupedPaletteSidebar(questions, session, onJump) {
  const sidebar = el('aside', { className: 'palette-sidebar card' }, [
    el('strong', { textContent: 'Questions', style: 'display:block;margin-bottom:0.75rem;' }),
    renderGroupedPalette(questions, session, onJump),
  ]);
  return sidebar;
}
