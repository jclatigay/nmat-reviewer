import { el } from '../utils/dom.js';

export function renderProgressBar(current, total) {
  const percent = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return el('div', { className: 'progress-bar' }, [
    el('div', {
      className: 'progress-bar__text',
      textContent: `Question ${current + 1} of ${total}`,
    }),
    el('div', { className: 'progress-bar__track' }, [
      el('div', {
        className: 'progress-bar__fill',
        style: `width: ${percent}%`,
      }),
    ]),
  ]);
}
