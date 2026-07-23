import { el } from '../utils/dom.js';
import { MODES } from '../config.js';

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

export function renderPalette(questions, session, onJump) {
  const palette = el('div', { className: 'palette', role: 'navigation', 'aria-label': 'Question palette' });
  const showAnswerFeedback = session.mode !== MODES.EXAM;

  questions.forEach((question, index) => {
    const selectedId = session.answers?.[question.id] ?? null;
    const isCorrect = showAnswerFeedback && !!selectedId && selectedId === question.correctChoiceId;
    const isIncorrect = showAnswerFeedback && !!selectedId && selectedId !== question.correctChoiceId;

    palette.appendChild(
      buildPaletteButton(index, question.id, {
        isCurrent: session.currentIndex === index,
        isAnswered: !!selectedId,
        isCorrect,
        isIncorrect,
        isFlagged: session.flagged.includes(question.id),
        onJump,
      })
    );
  });

  return palette;
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
    renderPalette(questions, session, (index) => {
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
