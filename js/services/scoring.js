export function computeScore(questions, session) {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  const details = questions.map((question) => {
    const userAnswer = session.answers[question.id] ?? null;
    const isCorrect = userAnswer === question.correctChoiceId;
    const isUnanswered = !userAnswer;
    const isFlagged = session.flagged.includes(question.id);

    if (isUnanswered) {
      unanswered += 1;
    } else if (isCorrect) {
      correct += 1;
    } else {
      incorrect += 1;
    }

    return {
      question,
      userAnswer,
      isCorrect,
      isUnanswered,
      isFlagged,
      hintRevealed: session.hintsRevealed.includes(question.id),
    };
  });

  const total = questions.length;

  return {
    correct,
    incorrect,
    unanswered,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    flaggedCount: session.flagged.length,
    elapsedSeconds: session.elapsedSeconds || 0,
    mode: session.mode,
    subtestId: session.subtestId,
    subtestName: session.subtestName,
    details,
  };
}

export function filterDetails(details, filter) {
  switch (filter) {
    case 'incorrect':
      return details.filter((d) => !d.isCorrect && !d.isUnanswered);
    case 'unanswered':
      return details.filter((d) => d.isUnanswered);
    case 'flagged':
      return details.filter((d) => d.isFlagged);
    default:
      return details;
  }
}
