export type IpaKind = 'vowel' | 'consonant' | 'diphthong'

export interface IpaSymbol {
  symbol: string
  kind: IpaKind
  tipRu: string
  examples: { word: string; ipa: string }[]
}

export const IPA_SYMBOLS: IpaSymbol[] = [
  // Vowels
  { symbol: 'iː', kind: 'vowel', tipRu: 'Долгий «и», как в see', examples: [
    { word: 'see', ipa: 'siː' }, { word: 'tree', ipa: 'triː' }, { word: 'feel', ipa: 'fiːl' },
  ]},
  { symbol: 'ɪ', kind: 'vowel', tipRu: 'Краткий «и», как в sit', examples: [
    { word: 'sit', ipa: 'sɪt' }, { word: 'fish', ipa: 'fɪʃ' }, { word: 'busy', ipa: 'ˈbɪzi' },
  ]},
  { symbol: 'e', kind: 'vowel', tipRu: 'Как в bed / red', examples: [
    { word: 'bed', ipa: 'bed' }, { word: 'red', ipa: 'red' }, { word: 'head', ipa: 'hed' },
  ]},
  { symbol: 'æ', kind: 'vowel', tipRu: 'Открытый звук как в cat', examples: [
    { word: 'cat', ipa: 'kæt' }, { word: 'map', ipa: 'mæp' }, { word: 'happy', ipa: 'ˈhæpi' },
  ]},
  { symbol: 'ɑː', kind: 'vowel', tipRu: 'Долгий «а», как в car (BrE)', examples: [
    { word: 'car', ipa: 'kɑː' }, { word: 'father', ipa: 'ˈfɑːðə' }, { word: 'park', ipa: 'pɑːk' },
  ]},
  { symbol: 'ɒ', kind: 'vowel', tipRu: 'Краткий «о», как в hot (BrE)', examples: [
    { word: 'hot', ipa: 'hɒt' }, { word: 'not', ipa: 'nɒt' }, { word: 'want', ipa: 'wɒnt' },
  ]},
  { symbol: 'ɔː', kind: 'vowel', tipRu: 'Долгий «о», как в law', examples: [
    { word: 'law', ipa: 'lɔː' }, { word: 'door', ipa: 'dɔː' }, { word: 'thought', ipa: 'θɔːt' },
  ]},
  { symbol: 'ʊ', kind: 'vowel', tipRu: 'Краткий «у», как в put', examples: [
    { word: 'put', ipa: 'pʊt' }, { word: 'book', ipa: 'bʊk' }, { word: 'good', ipa: 'ɡʊd' },
  ]},
  { symbol: 'uː', kind: 'vowel', tipRu: 'Долгий «у», как в food', examples: [
    { word: 'food', ipa: 'fuːd' }, { word: 'blue', ipa: 'bluː' }, { word: 'true', ipa: 'truː' },
  ]},
  { symbol: 'ʌ', kind: 'vowel', tipRu: 'Как в cup / love', examples: [
    { word: 'cup', ipa: 'kʌp' }, { word: 'love', ipa: 'lʌv' }, { word: 'sun', ipa: 'sʌn' },
  ]},
  { symbol: 'ɜː', kind: 'vowel', tipRu: 'Как в bird / learn (BrE)', examples: [
    { word: 'bird', ipa: 'bɜːd' }, { word: 'learn', ipa: 'lɜːn' }, { word: 'word', ipa: 'wɜːd' },
  ]},
  { symbol: 'ə', kind: 'vowel', tipRu: 'Шва — нейтральный безударный звук', examples: [
    { word: 'about', ipa: 'əˈbaʊt' }, { word: 'teacher', ipa: 'ˈtiːtʃə' }, { word: 'banana', ipa: 'bəˈnɑːnə' },
  ]},
  // Diphthongs
  { symbol: 'eɪ', kind: 'diphthong', tipRu: 'Как в day / make', examples: [
    { word: 'day', ipa: 'deɪ' }, { word: 'make', ipa: 'meɪk' }, { word: 'say', ipa: 'seɪ' },
  ]},
  { symbol: 'aɪ', kind: 'diphthong', tipRu: 'Как в my / time', examples: [
    { word: 'my', ipa: 'maɪ' }, { word: 'time', ipa: 'taɪm' }, { word: 'light', ipa: 'laɪt' },
  ]},
  { symbol: 'ɔɪ', kind: 'diphthong', tipRu: 'Как в boy / coin', examples: [
    { word: 'boy', ipa: 'bɔɪ' }, { word: 'coin', ipa: 'kɔɪn' }, { word: 'noise', ipa: 'nɔɪz' },
  ]},
  { symbol: 'aʊ', kind: 'diphthong', tipRu: 'Как в now / house', examples: [
    { word: 'now', ipa: 'naʊ' }, { word: 'house', ipa: 'haʊs' }, { word: 'out', ipa: 'aʊt' },
  ]},
  { symbol: 'əʊ', kind: 'diphthong', tipRu: 'Как в go / home (BrE)', examples: [
    { word: 'go', ipa: 'ɡəʊ' }, { word: 'home', ipa: 'həʊm' }, { word: 'no', ipa: 'nəʊ' },
  ]},
  { symbol: 'ɪə', kind: 'diphthong', tipRu: 'Как в near / here (BrE)', examples: [
    { word: 'near', ipa: 'nɪə' }, { word: 'here', ipa: 'hɪə' }, { word: 'ear', ipa: 'ɪə' },
  ]},
  { symbol: 'eə', kind: 'diphthong', tipRu: 'Как в hair / where (BrE)', examples: [
    { word: 'hair', ipa: 'heə' }, { word: 'where', ipa: 'weə' }, { word: 'care', ipa: 'keə' },
  ]},
  { symbol: 'ʊə', kind: 'diphthong', tipRu: 'Как в pure / tour (BrE)', examples: [
    { word: 'pure', ipa: 'pjʊə' }, { word: 'tour', ipa: 'tʊə' }, { word: 'sure', ipa: 'ʃʊə' },
  ]},
  // Consonants
  { symbol: 'θ', kind: 'consonant', tipRu: 'Глухой th — think, three', examples: [
    { word: 'think', ipa: 'θɪŋk' }, { word: 'three', ipa: 'θriː' }, { word: 'mouth', ipa: 'maʊθ' },
  ]},
  { symbol: 'ð', kind: 'consonant', tipRu: 'Звонкий th — this, mother', examples: [
    { word: 'this', ipa: 'ðɪs' }, { word: 'mother', ipa: 'ˈmʌðə' }, { word: 'the', ipa: 'ðə' },
  ]},
  { symbol: 'ʃ', kind: 'consonant', tipRu: 'Как «ш» — she, fish', examples: [
    { word: 'she', ipa: 'ʃiː' }, { word: 'fish', ipa: 'fɪʃ' }, { word: 'nation', ipa: 'ˈneɪʃn' },
  ]},
  { symbol: 'ʒ', kind: 'consonant', tipRu: 'Как в vision, measure', examples: [
    { word: 'vision', ipa: 'ˈvɪʒn' }, { word: 'measure', ipa: 'ˈmeʒə' }, { word: 'usual', ipa: 'ˈjuːʒuəl' },
  ]},
  { symbol: 'tʃ', kind: 'consonant', tipRu: 'Как «ч» — chair, watch', examples: [
    { word: 'chair', ipa: 'tʃeə' }, { word: 'watch', ipa: 'wɒtʃ' }, { word: 'church', ipa: 'tʃɜːtʃ' },
  ]},
  { symbol: 'dʒ', kind: 'consonant', tipRu: 'Как в job, bridge', examples: [
    { word: 'job', ipa: 'dʒɒb' }, { word: 'bridge', ipa: 'brɪdʒ' }, { word: 'judge', ipa: 'dʒʌdʒ' },
  ]},
  { symbol: 'ŋ', kind: 'consonant', tipRu: 'Носовой ng — sing, think', examples: [
    { word: 'sing', ipa: 'sɪŋ' }, { word: 'think', ipa: 'θɪŋk' }, { word: 'long', ipa: 'lɒŋ' },
  ]},
  { symbol: 'w', kind: 'consonant', tipRu: 'Губно-велярный — we, water', examples: [
    { word: 'we', ipa: 'wiː' }, { word: 'water', ipa: 'ˈwɔːtə' }, { word: 'queen', ipa: 'kwiːn' },
  ]},
  { symbol: 'j', kind: 'consonant', tipRu: 'Как «й» — yes, you', examples: [
    { word: 'yes', ipa: 'jes' }, { word: 'you', ipa: 'juː' }, { word: 'yellow', ipa: 'ˈjeləʊ' },
  ]},
  { symbol: 'h', kind: 'consonant', tipRu: 'Придыхание — house, hello', examples: [
    { word: 'house', ipa: 'haʊs' }, { word: 'hello', ipa: 'həˈləʊ' }, { word: 'happy', ipa: 'ˈhæpi' },
  ]},
  { symbol: 'r', kind: 'consonant', tipRu: 'Английский r — red, right', examples: [
    { word: 'red', ipa: 'red' }, { word: 'right', ipa: 'raɪt' }, { word: 'very', ipa: 'ˈveri' },
  ]},
  { symbol: 'v', kind: 'consonant', tipRu: 'Звонкий v — very, love', examples: [
    { word: 'very', ipa: 'ˈveri' }, { word: 'love', ipa: 'lʌv' }, { word: 'voice', ipa: 'vɔɪs' },
  ]},
]

export const IPA_KEYBOARD = [
  'iː', 'ɪ', 'e', 'æ', 'ɑː', 'ɒ', 'ɔː', 'ʊ', 'uː', 'ʌ', 'ɜː', 'ə',
  'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə',
  'θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'ŋ', 'ˈ', 'ˌ', 'ː',
]
