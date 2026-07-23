import { el } from '../utils/dom.js';
import { formatTime } from '../utils/format.js';
import { MODES } from '../config.js';

export function renderExamHeader({ subtestName, mode, remainingSeconds, onTimerExpire }) {
  const isExam = mode === MODES.EXAM;

  const timerEl = el('div', {
    className: 'exam-header__timer',
    id: 'exam-timer',
    textContent: isExam ? formatTime(remainingSeconds ?? 0) : 'Study Mode',
  });

  const header = el('div', { className: 'exam-header' }, [
    el('div', {}, [
      el('div', { className: 'exam-header__subtest', textContent: subtestName }),
      el('div', {
        className: 'exam-header__mode',
        textContent: isExam ? 'Exam Mode — Section Timer' : 'Study Mode — Untimed',
      }),
    ]),
    timerEl,
  ]);

  return {
    element: header,
    updateTimer(seconds, isWarning) {
      if (!isExam) return;
      timerEl.textContent = formatTime(Math.max(0, seconds));
      timerEl.classList.toggle('exam-header__timer--warning', isWarning);
    },
  };
}
