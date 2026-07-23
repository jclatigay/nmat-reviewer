import { el } from '../utils/dom.js';
import { navigate } from '../router.js';
import { MODES } from '../config.js';
import { loadQuestions } from '../services/questionLoader.js';
import {
  getSession,
  initQuestionIds,
  setAnswer,
  toggleFlag,
  revealHint,
  setCurrentIndex,
  submitSession,
  getUnansweredCount,
  saveResults,
} from '../services/sessionStore.js';
import { computeScore } from '../services/scoring.js';
import { createTimer } from '../services/timer.js';
import { renderExamHeader } from '../components/examHeader.js';
import { renderProgressBar } from '../components/progressBar.js';
import { renderChoiceList } from '../components/choiceList.js';
import { renderPaletteDrawer, renderPaletteSidebar } from '../components/questionPalette.js';
import { showConfirmModal } from '../components/confirmModal.js';

let paletteOverlay = null;

function removePaletteOverlay() {
  if (paletteOverlay) {
    paletteOverlay.backdrop?.remove();
    paletteOverlay.drawer?.remove();
    paletteOverlay = null;
  }
}

function finishSession(questions, session) {
  submitSession(session);
  const results = computeScore(questions, getSession());
  saveResults(results);
  navigate('results');
}

export async function renderSession(container) {
  removePaletteOverlay();

  let session = getSession();
  if (!session || session.submitted) {
    navigate('home');
    return;
  }

  container.innerHTML = '<p>Loading questions…</p>';

  let questions;
  try {
    const data = await loadQuestions(session.subtestId);
    const loadedQuestions = data.questions;
    initQuestionIds(session, loadedQuestions);

    if (session.questionIds?.length) {
      const questionMap = new Map(loadedQuestions.map((question) => [question.id, question]));
      const orderedQuestions = session.questionIds
        .map((questionId) => questionMap.get(questionId))
        .filter(Boolean);

      if (orderedQuestions.length === loadedQuestions.length) {
        questions = orderedQuestions;
      } else {
        questions = loadedQuestions;
      }
    } else {
      questions = loadedQuestions;
    }

    session = getSession();
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <h2 class="error-state__title">Failed to load questions</h2>
        <p class="error-state__message">${err.message}</p>
        <button class="btn btn--primary" onclick="location.hash='#/subject'">Choose Subject</button>
      </div>
    `;
    return;
  }

  if (questions.length === 0) {
    container.innerHTML = `
      <div class="error-state">
        <h2 class="error-state__title">No questions available</h2>
        <p class="error-state__message">This subtest has no questions yet. Add some in the JSON file.</p>
        <a href="#/subject" class="btn btn--primary">Choose Subject</a>
      </div>
    `;
    return;
  }

  const isExam = session.mode === MODES.EXAM;
  const layout = el('div', { className: 'exam-layout page' });
  container.replaceChildren(layout);

  const headerComponent = renderExamHeader({
    subtestName: session.subtestName,
    mode: session.mode,
    remainingSeconds: session.remainingSeconds,
  });
  layout.appendChild(headerComponent.element);

  const progressContainer = el('div');
  layout.appendChild(progressContainer);

  const examBody = el('div', { className: 'exam-body' });
  layout.appendChild(examBody);

  const contentArea = el('div', { className: 'exam-content' });
  const questionContainer = el('div');
  const navArea = el('div', { className: 'exam-nav' });
  contentArea.appendChild(questionContainer);
  contentArea.appendChild(navArea);
  examBody.appendChild(contentArea);

  const sidebarContainer = el('div');
  examBody.appendChild(sidebarContainer);

  let timer = null;

  function jumpTo(index) {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(getSession(), index);
    renderQuestion();
  }

  function renderQuestion() {
    session = getSession();
    const index = session.currentIndex;
    const question = questions[index];
    const selectedId = session.answers?.[question.id] ?? null;
    const isFlagged = session.flagged.includes(question.id);
    const hintShown = session.hintsRevealed.includes(question.id);

    progressContainer.replaceChildren(renderProgressBar(index, questions.length));
    sidebarContainer.replaceChildren(renderPaletteSidebar(questions, session, jumpTo));

    const parts = [];

    if (question.passage) {
      parts.push(el('div', { className: 'passage-box', html: question.passage }));
    }

    if (question.image) {
      parts.push(el('img', {
        className: 'question-image',
        src: question.image,
        alt: `Figure for question ${question.number}`,
        loading: 'lazy',
      }));
    }

    parts.push(el('p', { className: 'question-prompt', html: question.prompt }));
    const showFeedback = !isExam && !!selectedId;
    parts.push(renderChoiceList(question.choices, selectedId, (choiceId) => {
      if (!isExam && selectedId) return;
      const currentSession = getSession();
      setAnswer(currentSession, question.id, choiceId);
      session = currentSession;
      renderQuestion();
    }, {
      showFeedback,
      correctChoiceId: question.correctChoiceId,
      isStudyMode: !isExam,
    }));

    if (!isExam && selectedId) {
      const isCorrect = selectedId === question.correctChoiceId;
      const feedbackBox = el('div', {
        className: `feedback-box${isCorrect ? ' feedback-box--correct' : ' feedback-box--incorrect'}`,
      }, [
        el('div', {
          className: 'feedback-box__label',
          textContent: isCorrect ? 'Correct!' : 'Not quite.',
        }),
        el('p', {
          className: 'feedback-box__message',
          textContent: isCorrect
            ? `Great job. ${question.explanation || 'You selected the right answer.'}`
            : `${question.explanation || 'That answer is not correct.'} The correct answer is ${question.correctChoiceId}.`,
        }),
      ]);
      parts.push(feedbackBox);
    }

    if (!isExam && question.hint) {
      if (hintShown) {
        parts.push(el('div', { className: 'hint-box' }, [
          el('div', { className: 'hint-box__label', textContent: 'Hint' }),
          el('p', { textContent: question.hint }),
        ]));
      }
    }

    questionContainer.replaceChildren(el('div', { className: 'card question-card' }, parts));

    const navItems = [
      el('button', {
        type: 'button',
        className: 'btn btn--secondary',
        textContent: '← Previous',
        disabled: index === 0,
        onClick: () => jumpTo(index - 1),
      }),
      el('button', {
        type: 'button',
        className: 'btn btn--ghost',
        textContent: 'Palette',
        onClick: openPaletteDrawer,
      }),
      el('button', {
        type: 'button',
        className: 'btn btn--secondary',
        textContent: 'Next →',
        disabled: index === questions.length - 1,
        onClick: () => jumpTo(index + 1),
      }),
      el('button', {
        type: 'button',
        className: `btn btn--ghost exam-nav__flag${isFlagged ? ' exam-nav__flag--active' : ''}`,
        textContent: isFlagged ? '🚩 Flagged' : '🏳 Flag',
        onClick: () => {
          toggleFlag(getSession(), question.id);
          renderQuestion();
        },
      }),
      !isExam && question.hint
        ? el('button', {
            type: 'button',
            className: 'btn btn--accent',
            textContent: hintShown ? 'Hint Shown' : 'Show Hint',
            disabled: hintShown,
            onClick: () => {
              revealHint(getSession(), question.id);
              renderQuestion();
            },
          })
        : undefined,
      el('button', {
        type: 'button',
        className: `btn ${isExam ? 'btn--danger' : 'btn--primary'} exam-nav__submit`,
        textContent: isExam ? 'Submit Exam' : 'Finish Study',
        onClick: () => handleSubmit(),
      }),
    ];

    navArea.replaceChildren(...navItems.filter(Boolean));
  }

  function openPaletteDrawer() {
    removePaletteOverlay();
    session = getSession();
    const { backdrop, drawer } = renderPaletteDrawer(questions, session, jumpTo, removePaletteOverlay);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    paletteOverlay = { backdrop, drawer };
  }

  function handleSubmit() {
    session = getSession();
    const unanswered = getUnansweredCount(session);
    const flagged = session.flagged.length;
    const isExam = session.mode === MODES.EXAM;

    let message = `<p>You are about to ${isExam ? 'submit your exam' : 'finish this study session'}.</p>`;
    if (unanswered > 0) {
      message += `<p><strong>${unanswered}</strong> question(s) unanswered.</p>`;
    }
    if (flagged > 0) {
      message += `<p><strong>${flagged}</strong> question(s) flagged.</p>`;
    }
    if (unanswered === 0 && flagged === 0) {
      message += '<p>All questions answered.</p>';
    }

    showConfirmModal({
      title: isExam ? 'Submit Exam?' : 'Finish Study Session?',
      message,
      confirmLabel: isExam ? 'Submit' : 'Finish',
      cancelLabel: 'Continue',
      danger: isExam,
      onConfirm: () => {
        if (timer) timer.stop();
        finishSession(questions, getSession());
      },
    });
  }

  function handleTimeExpired() {
    showConfirmModal({
      title: 'Time is up!',
      message: '<p>The section timer has reached zero. Your exam will be submitted automatically.</p>',
      confirmLabel: 'View Results',
      cancelLabel: null,
      onConfirm: () => finishSession(questions, getSession()),
    });
    const cancelBtn = document.querySelector('.modal__actions .btn--secondary');
    if (cancelBtn) cancelBtn.style.display = 'none';
  }

  if (isExam && session.remainingSeconds !== null) {
    timer = createTimer(
      session.remainingSeconds,
      (remaining) => {
        headerComponent.updateTimer(remaining, remaining <= 300 && remaining > 0);
      },
      handleTimeExpired
    );
    timer.start(session);
  }

  renderQuestion();

  return () => {
    if (timer) timer.stop();
    removePaletteOverlay();
  };
}
