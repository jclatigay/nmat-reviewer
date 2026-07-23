import { el } from '../utils/dom.js';
import { navigate } from '../router.js';
import { hasActiveSession, getSession, clearSession } from '../services/sessionStore.js';
import { showConfirmModal } from '../components/confirmModal.js';

export function renderHome(container) {
  const page = el('div', { className: 'page' }, [
    el('h1', { className: 'page__title', textContent: 'NMAT Reviewer' }),
    el('p', {
      className: 'page__subtitle',
      textContent: 'Prepare for the Philippine NMAT with Study Mode and timed Exam Mode. Practice one subtest at a time with explanations after each session.',
    }),
    el('div', { className: 'card' }, [
      el('h2', { className: 'card__title', textContent: 'How it works' }),
      el('ul', { className: 'mode-card__features' }, [
        el('li', { textContent: 'Choose from 8 official NMAT subtests (Part 1 & Part 2)' }),
        el('li', { textContent: 'Study Mode: untimed practice with optional hints' }),
        el('li', { textContent: 'Exam Mode: 30-minute section timer, flag questions, submit for score' }),
        el('li', { textContent: 'Review all answers with explanations after finishing' }),
      ]),
    ]),
    el('div', { className: 'page__actions' }, [
      el('button', {
        type: 'button',
        className: 'btn btn--primary btn--block',
        textContent: 'Start Review',
        onClick: () => {
          if (hasActiveSession()) {
            const session = getSession();
            showConfirmModal({
              title: 'Resume session?',
              message: `You have an unfinished <strong>${session.subtestName}</strong> session in ${session.mode} mode. Resume or start fresh?`,
              confirmLabel: 'Resume',
              cancelLabel: 'Start Fresh',
              onConfirm: () => navigate('session'),
              onCancel: () => {
                clearSession();
                navigate('subject');
              },
            });
          } else {
            navigate('subject');
          }
        },
      }),
      el('a', {
        href: 'docs/question-format.md',
        className: 'btn btn--secondary btn--block',
        target: '_blank',
        textContent: 'Question Format Guide',
      }),
    ]),
  ]);

  container.replaceChildren(page);
}
