let subjectsCache = null;

export async function loadSubjects() {
  if (subjectsCache) return subjectsCache;

  const response = await fetch('data/subjects.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load subjects catalog.');
  }

  subjectsCache = await response.json();
  return subjectsCache;
}

export async function getSubtestById(id) {
  const { subtests } = await loadSubjects();
  return subtests.find((s) => s.id === id) || null;
}

export function validateQuestion(question, index) {
  const required = ['id', 'number', 'type', 'prompt', 'choices', 'correctChoiceId', 'explanation'];
  for (const field of required) {
    if (question[field] === undefined || question[field] === null) {
      throw new Error(`Question ${index + 1} is missing required field: ${field}`);
    }
  }

  if (!Array.isArray(question.choices) || question.choices.length < 4) {
    throw new Error(`Question ${question.id} must have at least 4 choices.`);
  }

  const choiceIds = question.choices.map((c) => c.id);
  if (!choiceIds.includes(question.correctChoiceId)) {
    throw new Error(`Question ${question.id} has invalid correctChoiceId.`);
  }
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function loadQuestions(subtestId, shouldShuffle = false) {
  const subtest = await getSubtestById(subtestId);
  if (!subtest) {
    throw new Error(`Unknown subtest: ${subtestId}`);
  }

  const response = await fetch(subtest.questionFile, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load questions for ${subtest.name}.`);
  }

  const data = await response.json();

  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error(`Invalid question file for ${subtest.name}: missing questions array.`);
  }

  data.questions.forEach((q, i) => validateQuestion(q, i));

  const orderedQuestions = data.questions.sort((a, b) => a.number - b.number);
  const questions = shouldShuffle ? shuffleQuestions(orderedQuestions) : orderedQuestions;

  return {
    meta: data.meta || {},
    questions,
    subtest,
  };
}
