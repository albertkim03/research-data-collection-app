import type { VocabItem } from "@/types/game";

export const CAFE_ITEMS: VocabItem[] = [
  { id: "coffee", russian: "кофе",   transliteration: "kofe",   english: "coffee", audioPath: "/game-mp3/game-1/audio_coffee_001.mp3", category: "noun", emoji: "☕", imagePath: "/pixel-arts/cofee.png" },
  { id: "tea",    russian: "чай",    transliteration: "chay",   english: "tea",    audioPath: "/game-mp3/game-1/audio_tea_002.mp3",    category: "noun", emoji: "🍵", imagePath: "/pixel-arts/tea.png" },
  { id: "bread",  russian: "хлеб",   transliteration: "khleb",  english: "bread",  audioPath: "/game-mp3/game-1/audio_bread_003.mp3",  category: "noun", emoji: "🍞", imagePath: "/pixel-arts/bread.png" },
  { id: "soup",   russian: "суп",    transliteration: "sup",    english: "soup",   audioPath: "/game-mp3/game-1/audio_soup_004.mp3",   category: "noun", emoji: "🍲", imagePath: "/pixel-arts/soup.png" },
  { id: "water",  russian: "вода",   transliteration: "voda",   english: "water",  audioPath: "/game-mp3/game-1/audio_water_005.mp3",  category: "noun", emoji: "💧", imagePath: "/pixel-arts/water.png" },
  { id: "juice",  russian: "сок",    transliteration: "sok",    english: "juice",  audioPath: "/game-mp3/game-1/audio_juice_006.mp3",  category: "noun", emoji: "🧃", imagePath: "/pixel-arts/juice.png" },
  { id: "cake",   russian: "торт",   transliteration: "tort",   english: "cake",   audioPath: "/game-mp3/game-1/audio_cake_007.mp3",   category: "noun", emoji: "🍰", imagePath: "/pixel-arts/cake.png" },
  { id: "milk",   russian: "молоко", transliteration: "moloko", english: "milk",   audioPath: "/game-mp3/game-1/audio_milk_008.mp3",   category: "noun", emoji: "🥛", imagePath: "/pixel-arts/milk.png" },
  { id: "menu",   russian: "меню",   transliteration: "menyu",  english: "menu",   audioPath: "/game-mp3/game-1/audio_menu_009.mp3",   category: "noun", emoji: "📋", imagePath: "/pixel-arts/menu.png" },
  { id: "bill",   russian: "счёт",   transliteration: "schyot", english: "bill",   audioPath: "/game-mp3/game-1/audio_bill_010.mp3",   category: "noun", emoji: "🧾", imagePath: "/pixel-arts/receipt.png" },
  { id: "sugar",  russian: "сахар",  transliteration: "sakhar", english: "sugar",  audioPath: "/game-mp3/game-1/audio_sugar_011.mp3",  category: "noun", emoji: "🧂", imagePath: "/pixel-arts/sugar.png" },
  { id: "spoon",  russian: "ложка",  transliteration: "lozhka", english: "spoon",  audioPath: "/game-mp3/game-1/audio_spoon_012.mp3",  category: "noun", emoji: "🥄", imagePath: "/pixel-arts/spoon.png" },
];

export const NUMBERS: VocabItem[] = [
  { id: "one",   russian: "один",   transliteration: "odin",   english: "1", audioPath: "/game-mp3/game-2/audio_one_020.mp3",   category: "number", emoji: "1️⃣" },
  { id: "two",   russian: "два",    transliteration: "dva",    english: "2", audioPath: "/game-mp3/game-2/audio_two_021.mp3",   category: "number", emoji: "2️⃣" },
  { id: "three", russian: "три",    transliteration: "tri",    english: "3", audioPath: "/game-mp3/game-2/audio_three_022.mp3", category: "number", emoji: "3️⃣" },
  { id: "four",  russian: "четыре", transliteration: "chetyre",english: "4", audioPath: "/game-mp3/game-2/audio_four_023.mp3",  category: "number", emoji: "4️⃣" },
  { id: "five",  russian: "пять",   transliteration: "pyat",   english: "5", audioPath: "/game-mp3/game-2/audio_five_024.mp3",  category: "number", emoji: "5️⃣" },
];

export const PHRASES: VocabItem[] = [
  { id: "hello",      russian: "Здравствуйте",  transliteration: "Zdravstvuyte",  english: "Hello",             audioPath: "/game-mp3/game-3/audio_hello_030.mp3",         category: "phrase", emoji: "👋" },
  { id: "thank_you",  russian: "Спасибо",       transliteration: "Spasibo",       english: "Thank you",         audioPath: "/game-mp3/game-3/audio_thank_you_031.mp3",     category: "phrase", emoji: "🙏" },
  { id: "please",     russian: "Пожалуйста",    transliteration: "Pozhaluysta",   english: "Please/You're welcome", audioPath: "/game-mp3/game-3/audio_youre_welcome_032.mp3", category: "phrase", emoji: "✨" },
  { id: "yes",        russian: "Да",            transliteration: "Da",            english: "Yes",               audioPath: "/game-mp3/game-3/audio_yes_033.mp3",           category: "phrase", emoji: "✅" },
  { id: "no",         russian: "Нет",           transliteration: "Net",           english: "No",                audioPath: "/game-mp3/game-3/audio_no_034.mp3",            category: "phrase", emoji: "❌" },
  { id: "goodbye",    russian: "До свидания",   transliteration: "Do svidaniya",  english: "Goodbye",           audioPath: "/game-mp3/game-3/audio_goodbye_035.mp3",       category: "phrase", emoji: "👋" },
];

export const ALL_ITEMS = [...CAFE_ITEMS, ...NUMBERS, ...PHRASES];

export function getItemById(id: string): VocabItem | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}
