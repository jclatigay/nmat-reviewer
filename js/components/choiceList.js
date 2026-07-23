import { el } from '../utils/dom.js';

export function renderChoiceList(choices, selectedId, onSelect, options = {}) {
  const {
    showFeedback = false,
    correctChoiceId = null,
    isStudyMode = false,
  } = options;
  const isLocked = isStudyMode && selectedId !== null && selectedId !== undefined;

  const list = el('div', { className: 'choice-list', role: 'radiogroup' });

  choices.forEach((choice) => {
    const isSelected = selectedId === choice.id;
    const isCorrectChoice = showFeedback && isStudyMode && correctChoiceId && choice.id === correctChoiceId;
    const isWrongSelected = showFeedback && isStudyMode && isSelected && correctChoiceId && choice.id !== correctChoiceId;

    let className = 'choice-item';
    if (isSelected) className += ' choice-item--selected';
    if (isCorrectChoice) className += ' choice-item--correct';
    if (isWrongSelected) className += ' choice-item--incorrect';

    const item = el('button', {
      type: 'button',
      className,
      role: 'radio',
      'aria-checked': isSelected ? 'true' : 'false',
      disabled: isLocked,
      onClick: () => {
        if (isLocked) return;
        onSelect(choice.id);
      },
    }, [
      el('span', { className: 'choice-item__label', textContent: choice.id }),
      el('span', { className: 'choice-item__text', textContent: choice.text }),
    ]);
    list.appendChild(item);
  });

  return list;
}

export function updateChoiceList(container, choices, selectedId, onSelect, options = {}) {
  const newList = renderChoiceList(choices, selectedId, onSelect, options);
  container.replaceWith(newList);
  return newList;
}
