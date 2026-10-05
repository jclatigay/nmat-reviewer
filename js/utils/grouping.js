const LABELS = {
  number_series: 'Number Series',
  letter_series: 'Letter Series',
  figural_series: 'Figural Series',
  figure_grouping: 'Figure Grouping',
  classification: 'Figure Grouping',
  hidden_figure: 'Hidden Figure',
  mirror_image: 'Mirror Image',
  identical_information: 'Identical Information',
};

const CATEGORY_TYPES = new Set([
  'word_analogy',
  'reading_comprehension',
  'number_series',
  'letter_series',
  'figural_series',
  'figure_grouping',
  'hidden_figure',
  'mirror_image',
  'identical_information',
]);

export function getQuestionGroupKey(question) {
  if (CATEGORY_TYPES.has(question?.type)) {
    return question.type;
  }

  return question?.tags?.[0] || question?.type || 'other';
}

export function getQuestionGroupLabel(groupKey) {
  return LABELS[groupKey] || groupKey.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export function usesGroupedPalette(session) {
  if (session?.useGroupedPalette !== undefined) {
    return session.useGroupedPalette;
  }

  return session?.subtestId === 'inductive-reasoning'
    || session?.subtestId === 'perceptual-acuity'
    || session?.subtestId === 'verbal';
}

export function groupQuestionsByTag(questions) {
  const groups = [];
  const indexByKey = new Map();

  questions.forEach((question) => {
    const key = getQuestionGroupKey(question);
    let groupIndex = indexByKey.get(key);

    if (groupIndex === undefined) {
      groupIndex = groups.length;
      indexByKey.set(key, groupIndex);
      groups.push({
        key,
        label: getQuestionGroupLabel(key),
        questions: [],
      });
    }

    groups[groupIndex].questions.push(question);
  });

  return groups;
}
