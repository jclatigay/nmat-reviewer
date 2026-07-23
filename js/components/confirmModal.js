import { el } from '../utils/dom.js';

export function showConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger = false }) {
  const overlay = el('div', { className: 'modal-overlay', role: 'dialog', 'aria-modal': 'true' });

  const close = () => overlay.remove();

  overlay.appendChild(
    el('div', { className: 'modal' }, [
      el('h2', { className: 'modal__title', textContent: title }),
      el('div', { className: 'modal__body', html: message }),
      el('div', { className: 'modal__actions' }, [
        el('button', {
          type: 'button',
          className: 'btn btn--secondary',
          textContent: cancelLabel || 'Cancel',
          onClick: () => {
            close();
            onCancel?.();
          },
        }),
        el('button', {
          type: 'button',
          className: `btn ${danger ? 'btn--danger' : 'btn--primary'}`,
          textContent: confirmLabel || 'Confirm',
          onClick: () => {
            close();
            onConfirm();
          },
        }),
      ]),
    ])
  );

  document.body.appendChild(overlay);
  return close;
}
