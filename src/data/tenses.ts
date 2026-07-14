export interface TenseTheory {
  id: string
  nameRu: string
  nameEn: string
  formula: string
  uses: string[]
  examples: {
    affirmative: string
    negative: string
    question: string
  }
  markers: string[]
}

export const TENSES: TenseTheory[] = [
  {
    id: 'present_simple',
    nameRu: 'Настоящее простое',
    nameEn: 'Present Simple',
    formula: 'V1 / V1+s(es) · do/does + V1',
    uses: [
      'Регулярные действия и привычки',
      'Факты и общие истины',
      'Расписания и программы',
      'Состояния и чувства',
    ],
    examples: {
      affirmative: 'She works in a bank.',
      negative: 'She does not (doesn’t) work on Sundays.',
      question: 'Does she work remotely?',
    },
    markers: ['always', 'usually', 'often', 'every day', 'sometimes'],
  },
  {
    id: 'present_continuous',
    nameRu: 'Настоящее длительное',
    nameEn: 'Present Continuous',
    formula: 'am/is/are + V-ing',
    uses: [
      'Действие происходит прямо сейчас',
      'Временные ситуации',
      'Планы на ближайшее будущее',
      'Меняющиеся тенденции',
    ],
    examples: {
      affirmative: 'I am reading a book right now.',
      negative: 'They are not watching TV.',
      question: 'Are you working today?',
    },
    markers: ['now', 'at the moment', 'currently', 'these days'],
  },
  {
    id: 'present_perfect',
    nameRu: 'Настоящее совершенное',
    nameEn: 'Present Perfect',
    formula: 'have/has + V3 (Past Participle)',
    uses: [
      'Опыт за жизнь (без указания когда)',
      'Результат в настоящем',
      'Действие началось в прошлом и продолжается',
      'Недавние события с just/already/yet',
    ],
    examples: {
      affirmative: 'I have visited London twice.',
      negative: 'She has not finished her homework yet.',
      question: 'Have you ever tried sushi?',
    },
    markers: ['already', 'yet', 'just', 'ever', 'never', 'since', 'for'],
  },
  {
    id: 'present_perfect_continuous',
    nameRu: 'Настоящее совершенное длительное',
    nameEn: 'Present Perfect Continuous',
    formula: 'have/has + been + V-ing',
    uses: [
      'Действие длится с прошлого до сейчас',
      'Акцент на продолжительности',
      'Недавняя деятельность с видимым результатом',
    ],
    examples: {
      affirmative: 'I have been studying English for three years.',
      negative: 'It has not been raining long.',
      question: 'How long have you been waiting?',
    },
    markers: ['for', 'since', 'all day', 'lately', 'recently'],
  },
  {
    id: 'past_simple',
    nameRu: 'Прошедшее простое',
    nameEn: 'Past Simple',
    formula: 'V2 · did + V1',
    uses: [
      'Завершённые действия в прошлом',
      'Последовательность событий',
      'Привычки в прошлом',
    ],
    examples: {
      affirmative: 'We visited Paris last summer.',
      negative: 'He did not call me yesterday.',
      question: 'Did you see that movie?',
    },
    markers: ['yesterday', 'last week', 'ago', 'in 2019', 'then'],
  },
  {
    id: 'past_continuous',
    nameRu: 'Прошедшее длительное',
    nameEn: 'Past Continuous',
    formula: 'was/were + V-ing',
    uses: [
      'Действие в определённый момент в прошлом',
      'Фон для другого короткого действия',
      'Два параллельных длительных действия',
    ],
    examples: {
      affirmative: 'I was cooking when she arrived.',
      negative: 'They were not sleeping at midnight.',
      question: 'What were you doing at 5 pm?',
    },
    markers: ['while', 'when', 'at 5 pm', 'all evening'],
  },
  {
    id: 'past_perfect',
    nameRu: 'Прошедшее совершенное',
    nameEn: 'Past Perfect',
    formula: 'had + V3',
    uses: [
      'Действие произошло раньше другого в прошлом',
      'К определённому моменту в прошлом уже завершено',
    ],
    examples: {
      affirmative: 'She had left before I arrived.',
      negative: 'I had not seen him before that day.',
      question: 'Had you finished by 8 o’clock?',
    },
    markers: ['before', 'after', 'by the time', 'already'],
  },
  {
    id: 'past_perfect_continuous',
    nameRu: 'Прошедшее совершенное длительное',
    nameEn: 'Past Perfect Continuous',
    formula: 'had + been + V-ing',
    uses: [
      'Длительное действие до другого момента в прошлом',
      'Акцент на продолжительности до прошлого события',
    ],
    examples: {
      affirmative: 'He had been working for hours before the break.',
      negative: 'We had not been waiting long.',
      question: 'How long had she been studying?',
    },
    markers: ['for', 'since', 'before', 'until'],
  },
  {
    id: 'future_simple',
    nameRu: 'Будущее простое',
    nameEn: 'Future Simple',
    formula: 'will + V1 · be going to + V1',
    uses: [
      'Спонтанные решения (will)',
      'Прогнозы и обещания',
      'Планы и намерения (going to)',
    ],
    examples: {
      affirmative: 'I will help you with that.',
      negative: 'It will not rain tomorrow.',
      question: 'Will you join us later?',
    },
    markers: ['tomorrow', 'next week', 'soon', 'in the future'],
  },
  {
    id: 'future_continuous',
    nameRu: 'Будущее длительное',
    nameEn: 'Future Continuous',
    formula: 'will be + V-ing',
    uses: [
      'Действие будет длиться в определённый момент будущего',
      'Вежливые вопросы о планах',
    ],
    examples: {
      affirmative: 'This time tomorrow I will be flying to Rome.',
      negative: 'She will not be working on Sunday.',
      question: 'Will you be using the car tonight?',
    },
    markers: ['this time tomorrow', 'at 8 pm', 'all day tomorrow'],
  },
  {
    id: 'future_perfect',
    nameRu: 'Будущее совершенное',
    nameEn: 'Future Perfect',
    formula: 'will have + V3',
    uses: [
      'Действие завершится к определённому моменту в будущем',
    ],
    examples: {
      affirmative: 'By next year I will have graduated.',
      negative: 'They will not have finished by Friday.',
      question: 'Will you have completed the report by then?',
    },
    markers: ['by', 'by the time', 'before'],
  },
  {
    id: 'future_perfect_continuous',
    nameRu: 'Будущее совершенное длительное',
    nameEn: 'Future Perfect Continuous',
    formula: 'will have been + V-ing',
    uses: [
      'К моменту в будущем действие будет длиться уже N времени',
    ],
    examples: {
      affirmative: 'By June I will have been living here for 10 years.',
      negative: 'She will not have been working long by then.',
      question: 'How long will you have been studying by graduation?',
    },
    markers: ['by', 'for', 'by the time'],
  },
]

export function getTense(id: string): TenseTheory | undefined {
  return TENSES.find((t) => t.id === id)
}

export function tenseBaseTheoryText(tense: TenseTheory): string {
  return [
    `${tense.nameEn} (${tense.nameRu})`,
    `Formula: ${tense.formula}`,
    `Uses: ${tense.uses.join('; ')}`,
    `Examples: + ${tense.examples.affirmative}; − ${tense.examples.negative}; ? ${tense.examples.question}`,
    `Markers: ${tense.markers.join(', ')}`,
  ].join('\n')
}
