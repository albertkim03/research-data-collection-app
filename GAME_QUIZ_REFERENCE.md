# Café Русский — Complete Quiz & Game Reference

This document catalogues every quiz question, answer option, correct answer, and audio asset used in the Café Русский language-learning game. It is intended for use by an AI agent building a VR equivalent of this game.

---

## Vocabulary Reference

All game content is built from three vocabulary sets defined in `data/vocabItems.ts`.

### Café Items (12 nouns)

| ID | Russian | Transliteration | English | Audio Asset | Image Asset |
|----|---------|----------------|---------|-------------|-------------|
| coffee | кофе | kofe | coffee | `game-mp3/game-1/audio_coffee_001.mp3` | `pixel-arts/cofee.png` |
| tea | чай | chay | tea | `game-mp3/game-1/audio_tea_002.mp3` | `pixel-arts/tea.png` |
| bread | хлеб | khleb | bread | `game-mp3/game-1/audio_bread_003.mp3` | `pixel-arts/bread.png` |
| soup | суп | sup | soup | `game-mp3/game-1/audio_soup_004.mp3` | `pixel-arts/soup.png` |
| water | вода | voda | water | `game-mp3/game-1/audio_water_005.mp3` | `pixel-arts/water.png` |
| juice | сок | sok | juice | `game-mp3/game-1/audio_juice_006.mp3` | `pixel-arts/juice.png` |
| cake | торт | tort | cake | `game-mp3/game-1/audio_cake_007.mp3` | `pixel-arts/cake.png` |
| milk | молоко | moloko | milk | `game-mp3/game-1/audio_milk_008.mp3` | `pixel-arts/milk.png` |
| menu | меню | menyu | menu | `game-mp3/game-1/audio_menu_009.mp3` | `pixel-arts/menu.png` |
| bill | счёт | schyot | bill | `game-mp3/game-1/audio_bill_010.mp3` | `pixel-arts/receipt.png` |
| sugar | сахар | sakhar | sugar | `game-mp3/game-1/audio_sugar_011.mp3` | `pixel-arts/sugar.png` |
| spoon | ложка | lozhka | spoon | `game-mp3/game-1/audio_spoon_012.mp3` | `pixel-arts/spoon.png` |

### Numbers (5)

| ID | Russian | Transliteration | English | Audio Asset |
|----|---------|----------------|---------|-------------|
| one | один | odin | 1 | `game-mp3/game-2/audio_one_020.mp3` |
| two | два | dva | 2 | `game-mp3/game-2/audio_two_021.mp3` |
| three | три | tri | 3 | `game-mp3/game-2/audio_three_022.mp3` |
| four | четыре | chetyre | 4 | `game-mp3/game-2/audio_four_023.mp3` |
| five | пять | pyat | 5 | `game-mp3/game-2/audio_five_024.mp3` |

### Phrases (6)

| ID | Russian | Transliteration | English | Audio Asset |
|----|---------|----------------|---------|-------------|
| hello | Здравствуйте | Zdravstvuyte | Hello (formal) | `game-mp3/game-3/audio_hello_030.mp3` |
| thank_you | Спасибо | Spasibo | Thank you | `game-mp3/game-3/audio_thank_you_031.mp3` |
| please | Пожалуйста | Pozhaluysta | Please / You're welcome | `game-mp3/game-3/audio_youre_welcome_032.mp3` |
| yes | Да | Da | Yes | `game-mp3/game-3/audio_yes_033.mp3` |
| no | Нет | Net | No | `game-mp3/game-3/audio_no_034.mp3` |
| goodbye | До свидания | Do svidaniya | Goodbye | `game-mp3/game-3/audio_goodbye_035.mp3` |

---

## Game Phases Overview

The game has 7 sequential phases plus a results screen. Phases 1, 2, and 4 are learning/exploration phases with no quiz questions. Phases 3, 5, 6, and 7 contain quizzes.

| Phase | Name | Type | Has Quiz |
|-------|------|------|----------|
| 1 | Tutorial | Guided interaction | No — controls walkthrough only |
| 2 | Explore | Free exploration | No — click items to discover |
| 3 | Memory Recall | Study + MCQ quiz | **Yes** |
| 4 | Vocabulary Learn | Flashcard study | No |
| 5 | Phrase Fever | Fast-paced MCQ | **Yes** |
| 6 | Café Role-play | Drag-and-drop orders | **Yes** (order fulfillment) |
| 7 | Final Recap | Review + MCQ quiz | **Yes** |

---

## Phase 1 — Tutorial

**Component:** `Phase1Tutorial.tsx`  
**Purpose:** Teach controls. No quiz. The player clicks three tutorial items in order: **coffee → bread → menu**. Each click plays the item's audio and awards +5 points.

**VR equivalent:** Player points at / reaches for highlighted objects in sequence. Play audio on interaction.

---

## Phase 2 — Explore the Café

**Component:** `Phase2Explore.tsx`  
**Purpose:** Free discovery of all 12 café items placed in a café scene. No quiz.  
**Timer:** 5 minutes  
**Scoring:** +10 pts per new item discovered. +50 pt bonus for finding all 12.

Each item plays its audio when clicked. Positions are pixel-based in the 2D web version and would need to be mapped to 3D positions in VR.

**All 12 items are present:** coffee, tea, bread, soup, water, juice, cake, milk, menu, bill, sugar, spoon.

**VR equivalent:** A 3D café environment where players physically look around and interact with objects. Each object plays its corresponding audio when touched/selected.

---

## Phase 3 — Memory Recall Quiz

**Component:** `Phase3Recall.tsx`  
**Study sub-phase:** Flip-cards for all 12 café items. Timer: 5 minutes (can end early). Each card shows Russian + transliteration on front, English on back.

### Quiz Structure

3 rounds, 4 questions each = **12 MCQ trials total**.  
Prompt is always an audio clip (hear the Russian word). Answer options are **images** of the items.  
Questions are shuffled from a fixed pool but the rounds are progressive (4 → 6 → 8 answer options).

---

### Round 1 — 4 Answer Options (Easy)

**Scoring:** +20 pts per correct answer

**Question 1**
- Prompt audio: `game-mp3/game-1/audio_coffee_001.mp3` (кофе)
- Prompt text: "Which item did you hear?"
- **Correct answer:** coffee
- Options (images): coffee, bread, cake, juice

**Question 2**
- Prompt audio: `game-mp3/game-1/audio_bread_003.mp3` (хлеб)
- Prompt text: "Which item did you hear?"
- **Correct answer:** bread
- Options (images): bread, tea, water, spoon

**Question 3**
- Prompt audio: `game-mp3/game-1/audio_soup_004.mp3` (суп)
- Prompt text: "Which item did you hear?"
- **Correct answer:** soup
- Options (images): soup, milk, sugar, menu

**Question 4**
- Prompt audio: `game-mp3/game-1/audio_water_005.mp3` (вода)
- Prompt text: "Which item did you hear?"
- **Correct answer:** water
- Options (images): water, bill, coffee, cake

---

### Round 2 — 6 Answer Options (Medium)

**Scoring:** +25 pts per correct answer

**Question 5**
- Prompt audio: `game-mp3/game-1/audio_cake_007.mp3` (торт)
- Prompt text: "Which item did you hear?"
- **Correct answer:** cake
- Options (images): cake, soup, juice, sugar, spoon, coffee

**Question 6**
- Prompt audio: `game-mp3/game-1/audio_milk_008.mp3` (молоко)
- Prompt text: "Which item did you hear?"
- **Correct answer:** milk
- Options (images): milk, tea, water, bread, bill, menu

**Question 7**
- Prompt audio: `game-mp3/game-1/audio_sugar_011.mp3` (сахар)
- Prompt text: "Which item did you hear?"
- **Correct answer:** sugar
- Options (images): sugar, cake, spoon, juice, soup, milk

**Question 8**
- Prompt audio: `game-mp3/game-1/audio_menu_009.mp3` (меню)
- Prompt text: "Which item did you hear?"
- **Correct answer:** menu
- Options (images): menu, bill, coffee, bread, water, tea

---

### Round 3 — 8 Answer Options (Hard)

**Scoring:** +30 pts per correct answer. +10 pt speed bonus if answered in under 3 seconds.

**Question 9**
- Prompt audio: `game-mp3/game-1/audio_bill_010.mp3` (счёт)
- Prompt text: "Which item did you hear?"
- **Correct answer:** bill
- Options (images): bill, coffee, tea, bread, soup, water, juice, cake

**Question 10**
- Prompt audio: `game-mp3/game-1/audio_spoon_012.mp3` (ложка)
- Prompt text: "Which item did you hear?"
- **Correct answer:** spoon
- Options (images): spoon, milk, menu, sugar, coffee, tea, bread, water

**Question 11**
- Prompt audio: `game-mp3/game-1/audio_tea_002.mp3` (чай)
- Prompt text: "Which item did you hear?"
- **Correct answer:** tea
- Options (images): tea, juice, cake, milk, soup, sugar, spoon, bill

**Question 12**
- Prompt audio: `game-mp3/game-1/audio_juice_006.mp3` (сок)
- Prompt text: "Which item did you hear?"
- **Correct answer:** juice
- Options (images): juice, coffee, bread, menu, water, cake, sugar, spoon

---

## Phase 4 — Vocabulary Learn

**Component:** `Phase4VocabLearn.tsx`  
**Purpose:** Introduce numbers and phrases via flip-cards. No quiz. Self-paced, no timer.

**Content taught:**
- Numbers: один, два, три, четыре, пять (1–5)
- Phrases: Здравствуйте, Спасибо, Пожалуйста, Да, Нет, До свидания

**VR equivalent:** Player picks up and flips physical flashcards in a study area.

---

## Phase 5 — Phrase Fever

**Component:** `Phase4PhraseGame.tsx`  
**Purpose:** Fast-paced MCQ quiz on numbers and phrases.  
**Timer:** 8 seconds per question  
**Combo multiplier:** ×1 → ×1.5 → ×2 → ×2.5 → ×3 (increases with consecutive correct answers)  
**Scoring:** 10 pts base + 5 pt speed bonus (if answered in under 1.5 seconds), multiplied by combo

All 12 questions are hardcoded and played in a fixed shuffled order. Options are always displayed as text labels.

---

### Number Questions (Q1–Q5)

All prompt: "What number did you hear?" — player hears Russian audio and picks English number.

**Question 1**
- Prompt audio: `game-mp3/game-2/audio_one_020.mp3` (один)
- **Correct answer:** `one` — displayed as "1 · один"
- Options: "1 · один", "2 · два", "3 · три", "4 · четыре"

**Question 2**
- Prompt audio: `game-mp3/game-2/audio_two_021.mp3` (два)
- **Correct answer:** `two` — displayed as "2 · два"
- Options: "1 · один", "2 · два", "4 · четыре", "5 · пять"

**Question 3**
- Prompt audio: `game-mp3/game-2/audio_three_022.mp3` (три)
- **Correct answer:** `three` — displayed as "3 · три"
- Options: "2 · два", "3 · три", "4 · четыре", "5 · пять"

**Question 4**
- Prompt audio: `game-mp3/game-2/audio_four_023.mp3` (четыре)
- **Correct answer:** `four` — displayed as "4 · четыре"
- Options: "1 · один", "2 · два", "3 · три", "4 · четыре"

**Question 5**
- Prompt audio: `game-mp3/game-2/audio_five_024.mp3` (пять)
- **Correct answer:** `five` — displayed as "5 · пять"
- Options: "2 · два", "3 · три", "4 · четыре", "5 · пять"

---

### Phrase Questions (Q6–Q11)

All prompt: "What does this phrase mean?" — player hears Russian audio and picks English meaning.

**Question 6**
- Prompt audio: `game-mp3/game-3/audio_hello_030.mp3` (Здравствуйте)
- **Correct answer:** `hello` — displayed as "Hello"
- Options: "Hello", "Goodbye", "Thank you", "Please"

**Question 7**
- Prompt audio: `game-mp3/game-3/audio_thank_you_031.mp3` (Спасибо)
- **Correct answer:** `thank_you` — displayed as "Thank you"
- Options: "Thank you", "Hello", "Yes", "Goodbye"

**Question 8**
- Prompt audio: `game-mp3/game-3/audio_youre_welcome_032.mp3` (Пожалуйста)
- **Correct answer:** `please` — displayed as "Please"
- Options: "Please", "No", "Thank you", "Yes"

**Question 9**
- Prompt audio: `game-mp3/game-3/audio_yes_033.mp3` (Да)
- **Correct answer:** `yes` — displayed as "Yes"
- Options: "Yes", "No", "Hello", "Please"

**Question 10**
- Prompt audio: `game-mp3/game-3/audio_no_034.mp3` (Нет)
- **Correct answer:** `no` — displayed as "No"
- Options: "No", "Yes", "Goodbye", "Thank you"

**Question 11**
- Prompt audio: `game-mp3/game-3/audio_goodbye_035.mp3` (До свидания)
- **Correct answer:** `goodbye` — displayed as "Goodbye"
- Options: "Goodbye", "Hello", "Thank you", "Please"

---

### Contextual Question (Q12)

**Question 12**
- Prompt audio: `game-mp3/game-2/audio_three_022.mp3` (три)
- Prompt text: "The customer says 'три' — how many items?"
- **Correct answer:** `three` — displayed as "3 · три"
- Options: "1 · один", "2 · два", "3 · три", "4 · четыре"

---

## Phase 6 — Café Role-play (Order Fulfillment)

**Component:** `Phase4Roleplay.tsx`  
**Purpose:** Player fulfills customer orders by dragging the correct items and quantities onto a tray. The customer speaks in Russian — player must understand what was ordered.

**Scoring per order:**
- +15 pts for each correct item type present
- +15 pts for each item with correct quantity
- +20 pt bonus for perfect first attempt

All 8 orders are hardcoded in sequence:

---

**Order 1**
- Customer says: "Кофе, пожалуйста" (One coffee, please)
- Audio sequence: `audio_coffee_001.mp3`, `audio_youre_welcome_032.mp3`
- Expected tray: **coffee ×1**

**Order 2**
- Customer says: "Чай, пожалуйста" (One tea, please)
- Audio sequence: `audio_tea_002.mp3`, `audio_youre_welcome_032.mp3`
- Expected tray: **tea ×1**

**Order 3**
- Customer says: "Два кофе, пожалуйста" (Two coffees, please)
- Audio sequence: `audio_two_021.mp3`, `audio_coffee_001.mp3`, `audio_youre_welcome_032.mp3`
- Expected tray: **coffee ×2**

**Order 4**
- Customer says: "Три хлеб, пожалуйста" (Three breads, please)
- Audio sequence: `audio_three_022.mp3`, `audio_bread_003.mp3`, `audio_youre_welcome_032.mp3`
- Expected tray: **bread ×3**

**Order 5**
- Customer says: "Один суп и один хлеб" (One soup and one bread)
- Audio sequence: `audio_one_020.mp3`, `audio_soup_004.mp3`, `audio_one_020.mp3`, `audio_bread_003.mp3`
- Expected tray: **soup ×1, bread ×1**

**Order 6**
- Customer says: "Два чай и один торт" (Two teas and one cake)
- Audio sequence: `audio_two_021.mp3`, `audio_tea_002.mp3`, `audio_one_020.mp3`, `audio_cake_007.mp3`
- Expected tray: **tea ×2, cake ×1**

**Order 7**
- Customer says: "Один кофе, один сок, и один торт" (One coffee, one juice, and one cake)
- Audio sequence: `audio_one_020.mp3`, `audio_coffee_001.mp3`, `audio_one_020.mp3`, `audio_juice_006.mp3`, `audio_one_020.mp3`, `audio_cake_007.mp3`
- Expected tray: **coffee ×1, juice ×1, cake ×1**

**Order 8**
- Customer says: "Здравствуйте! Два кофе, один суп, и один хлеб. И счёт, пожалуйста." (Hello! Two coffees, one soup, and one bread. And the bill, please.)
- Audio sequence: `audio_hello_030.mp3`, `audio_two_021.mp3`, `audio_coffee_001.mp3`, `audio_one_020.mp3`, `audio_soup_004.mp3`, `audio_one_020.mp3`, `audio_bread_003.mp3`, `audio_bill_010.mp3`, `audio_youre_welcome_032.mp3`
- Expected tray: **coffee ×2, soup ×1, bread ×1, bill ×1**

---

## Phase 7 — Final Recap Quiz

**Component:** `Phase5Recap.tsx`  
**Review sub-phase:** All 12 café items displayed as clickable cards. Clicking plays the audio.

### Quiz Structure

6 questions, 3 types. **Scoring:** +25 pts per correct answer. +10 pt speed bonus if answered in under 3 seconds.

---

**Question 1 — Audio-to-Image (identify item from audio)**
- Prompt audio: `game-mp3/game-1/audio_milk_008.mp3` (молоко)
- Prompt text: "Hear the word, then click the correct item"
- **Correct answer:** milk
- Options (images): milk, bread, soup, water, sugar, spoon

**Question 2 — Audio-to-Meaning (identify English phrase meaning)**
- Prompt audio: `game-mp3/game-3/audio_thank_you_031.mp3` (Спасибо)
- Prompt text: "Listen to this Russian phrase — what does it mean?"
- **Correct answer:** "Thank you"
- Options (text): "Thank you", "Hello", "Goodbye", "Please"

**Question 3 — Order Reconstruction (identify correct tray from order audio)**
- Prompt audio sequence (played one-by-one): `audio_one_020.mp3` (один) → `audio_coffee_001.mp3` (кофе) → `audio_two_021.mp3` (два) → `audio_bread_003.mp3` (хлеб)
- Prompt text: "Listen to the order, then select the correct tray"
- **Correct answer:** 1 coffee + 2 bread (displayed as emoji combo, e.g. "☕×1 🍞×2")
- Distractor trays:
  - 2 coffee + 1 bread
  - 1 soup + 2 bread
  - 1 coffee + 1 bread

**Question 4 — Audio-to-Image (identify item from audio)**
- Prompt audio: `game-mp3/game-1/audio_spoon_012.mp3` (ложка)
- Prompt text: "Hear the word, then click the correct item"
- **Correct answer:** spoon
- Options (images): spoon, menu, bill, sugar, milk, cake

**Question 5 — Audio-to-Meaning (identify English phrase meaning)**
- Prompt audio: `game-mp3/game-3/audio_goodbye_035.mp3` (До свидания)
- Prompt text: "Listen to this Russian phrase — what does it mean?"
- **Correct answer:** "Goodbye"
- Options (text): "Goodbye", "Hello", "Thank you", "Yes"

**Question 6 — Audio-to-English (translate a café item)**
- Prompt audio: `game-mp3/game-1/audio_cake_007.mp3` (торт)
- Prompt text: "Listen to this Russian word — what does it mean in English?"
- **Correct answer:** "Cake"
- Options (text): "Cake", "Bread", "Soup", "Milk"

---

## Pre/Post Questionnaire (Research Forms)

The research app also has a pre-game and post-game questionnaire stored in the Supabase `forms` database table (not hardcoded in the source). These forms use MCQ questions with audio prompts and/or audio answer options. The audio files live in `public/mp3/`.

### MCQ Audio Assets in `public/mp3/`

These are used as audio options or prompts for the questionnaire's MCQ fields:

| File | Content |
|------|---------|
| `q1_hello-formal__zdravstvuyte__здравствуйте.mp3` | "Здравствуйте" — Hello (formal) |
| `q2_thank-you__spasibo__спасибо.mp3` | "Спасибо" — Thank you |
| `q3_please-youre-welcome__pozhaluysta__пожалуйста.mp3` | "Пожалуйста" — Please / You're welcome |
| `q4_coffee__kofe__кофе.mp3` | "Кофе" — Coffee |
| `q5_potato-fries__kartofel-fri__картофель-фри.mp3` | "Картофель-фри" — Potato fries |
| `q6_pasta__pasta__паста.mp3` | "Паста" — Pasta |
| `q7_three__tri__три.mp3` | "Три" — Three |
| `q8A_the-bill-please__schyot-pozhaluysta__счёт-пожалуйста.mp3` | "Счёт, пожалуйста" — The bill, please |
| `q8B_can-i-have-coffee-please__mozhno-kofe-pozhaluysta__можно-кофе-пожалуйста.mp3` | "Можно кофе, пожалуйста" — Can I have coffee, please |
| `q8C_how-much-does-this-cost__skolko-eto-stoit__сколько-это-стоит.mp3` | "Сколько это стоит?" — How much does this cost? |
| `q8D_thank-you__spasibo__спасибо.mp3` | "Спасибо" — Thank you |
| `q9A_how-much-does-this-cost__skolko-eto-stoit__сколько-это-стоит.mp3` | "Сколько это стоит?" — How much does this cost? |
| `q9B_the-bill-please__schyot-pozhaluysta__счёт-пожалуйста.mp3` | "Счёт, пожалуйста" — The bill, please |
| `q9C_hello-formal__zdravstvuyte__здравствуйте.mp3` | "Здравствуйте" — Hello (formal) |
| `q9D_please-youre-welcome__pozhaluysta__пожалуйста.mp3` | "Пожалуйста" — Please / You're welcome |
| `q10A_can-i-have-coffee-please__mozhno-kofe-pozhaluysta__можно-кофе-пожалуйста.mp3` | "Можно кофе, пожалуйста" — Can I have coffee, please |
| `q10B_coffee__kofe__кофе.mp3` | "Кофе" — Coffee |
| `q10C_three__tri__три.mp3` | "Три" — Three |
| `q10D_potato-fries__kartofel-fri__картофель-фри.mp3` | "Картофель-фри" — Potato fries |

The naming pattern (`q8A/B/C/D`, `q9A/B/C/D`, `q10A/B/C/D`) indicates these are the four audio options for MCQ questions 8, 9, and 10. Questions 1–7 have a single audio file each (the prompt), with text-only answer options.

**Inferred questionnaire question topics (from filenames):**
- Q1: Recognise "Здравствуйте" — identify it as "Hello"
- Q2: Recognise "Спасибо" — identify it as "Thank you"
- Q3: Recognise "Пожалуйста" — identify it as "Please / You're welcome"
- Q4: Recognise "Кофе" — identify it as "Coffee"
- Q5: Recognise "Картофель-фри" — identify it as "Potato fries"
- Q6: Recognise "Паста" — identify it as "Pasta"
- Q7: Recognise "Три" — identify it as "3 / Three"
- Q8: Listen to 4 audio clips (A–D) and identify which one means "The bill, please"  
  - A: "Счёт, пожалуйста" ✓ (correct)
  - B: "Можно кофе, пожалуйста"
  - C: "Сколько это стоит?"
  - D: "Спасибо"
- Q9: Listen to 4 audio clips (A–D) and identify which one means "How much does this cost?"  
  - A: "Сколько это стоит?" ✓ (correct)
  - B: "Счёт, пожалуйста"
  - C: "Здравствуйте"
  - D: "Пожалуйста"
- Q10: Listen to 4 audio clips (A–D) and identify which one means "Can I have coffee, please"  
  - A: "Можно кофе, пожалуйста" ✓ (correct)
  - B: "Кофе"
  - C: "Три"
  - D: "Картофель-фри"

> **Note:** The actual form schemas (exact question text, field types, answer keys) for the questionnaire are stored in the Supabase `forms` database table — they are not hardcoded in the source. The above is inferred from audio filenames. Retrieve the live `forms` table from Supabase if exact question text is needed.

---

## Complete Answer Key Summary

| Phase | # | Prompt (audio) | Correct Answer |
|-------|---|----------------|----------------|
| Phase 3 Recall R1 | 1 | кофе | coffee |
| Phase 3 Recall R1 | 2 | хлеб | bread |
| Phase 3 Recall R1 | 3 | суп | soup |
| Phase 3 Recall R1 | 4 | вода | water |
| Phase 3 Recall R2 | 5 | торт | cake |
| Phase 3 Recall R2 | 6 | молоко | milk |
| Phase 3 Recall R2 | 7 | сахар | sugar |
| Phase 3 Recall R2 | 8 | меню | menu |
| Phase 3 Recall R3 | 9 | счёт | bill |
| Phase 3 Recall R3 | 10 | ложка | spoon |
| Phase 3 Recall R3 | 11 | чай | tea |
| Phase 3 Recall R3 | 12 | сок | juice |
| Phase 5 Fever | 1 | один | one (1) |
| Phase 5 Fever | 2 | два | two (2) |
| Phase 5 Fever | 3 | три | three (3) |
| Phase 5 Fever | 4 | четыре | four (4) |
| Phase 5 Fever | 5 | пять | five (5) |
| Phase 5 Fever | 6 | Здравствуйте | Hello |
| Phase 5 Fever | 7 | Спасибо | Thank you |
| Phase 5 Fever | 8 | Пожалуйста | Please |
| Phase 5 Fever | 9 | Да | Yes |
| Phase 5 Fever | 10 | Нет | No |
| Phase 5 Fever | 11 | До свидания | Goodbye |
| Phase 5 Fever | 12 | три (contextual) | three (3) |
| Phase 7 Recap | 1 | молоко | milk |
| Phase 7 Recap | 2 | Спасибо | Thank you |
| Phase 7 Recap | 3 | один + кофе + два + хлеб | coffee ×1, bread ×2 |
| Phase 7 Recap | 4 | ложка | spoon |
| Phase 7 Recap | 5 | До свидания | Goodbye |
| Phase 7 Recap | 6 | торт | Cake |

---

## Audio Asset Index (All Files)

### Game Audio (`public/game-mp3/`)

```
game-mp3/
├── game-1/          # Café item nouns
│   ├── audio_coffee_001.mp3   — кофе (coffee)
│   ├── audio_tea_002.mp3      — чай (tea)
│   ├── audio_bread_003.mp3    — хлеб (bread)
│   ├── audio_soup_004.mp3     — суп (soup)
│   ├── audio_water_005.mp3    — вода (water)
│   ├── audio_juice_006.mp3    — сок (juice)
│   ├── audio_cake_007.mp3     — торт (cake)
│   ├── audio_milk_008.mp3     — молоко (milk)
│   ├── audio_menu_009.mp3     — меню (menu)
│   ├── audio_bill_010.mp3     — счёт (bill)
│   ├── audio_sugar_011.mp3    — сахар (sugar)
│   └── audio_spoon_012.mp3    — ложка (spoon)
├── game-2/          # Numbers
│   ├── audio_one_020.mp3      — один (1)
│   ├── audio_two_021.mp3      — два (2)
│   ├── audio_three_022.mp3    — три (3)
│   ├── audio_four_023.mp3     — четыре (4)
│   └── audio_five_024.mp3     — пять (5)
└── game-3/          # Phrases
    ├── audio_hello_030.mp3           — Здравствуйте (Hello)
    ├── audio_thank_you_031.mp3       — Спасибо (Thank you)
    ├── audio_youre_welcome_032.mp3   — Пожалуйста (Please/You're welcome)
    ├── audio_yes_033.mp3             — Да (Yes)
    ├── audio_no_034.mp3              — Нет (No)
    └── audio_goodbye_035.mp3         — До свидания (Goodbye)
```

### Questionnaire Audio (`public/mp3/`)

```
mp3/
├── q1_hello-formal__zdravstvuyte__здравствуйте.mp3
├── q2_thank-you__spasibo__спасибо.mp3
├── q3_please-youre-welcome__pozhaluysta__пожалуйста.mp3
├── q4_coffee__kofe__кофе.mp3
├── q5_potato-fries__kartofel-fri__картофель-фри.mp3
├── q6_pasta__pasta__паста.mp3
├── q7_three__tri__три.mp3
├── q8A_the-bill-please__schyot-pozhaluysta__счёт-пожалуйста.mp3
├── q8B_can-i-have-coffee-please__mozhno-kofe-pozhaluysta__можно-кофе-пожалуйста.mp3
├── q8C_how-much-does-this-cost__skolko-eto-stoit__сколько-это-стоит.mp3
├── q8D_thank-you__spasibo__спасибо.mp3
├── q9A_how-much-does-this-cost__skolko-eto-stoit__сколько-это-стоит.mp3
├── q9B_the-bill-please__schyot-pozhaluysta__счёт-пожалуйста.mp3
├── q9C_hello-formal__zdravstvuyte__здравствуйте.mp3
├── q9D_please-youre-welcome__pozhaluysta__пожалуйста.mp3
├── q10A_can-i-have-coffee-please__mozhno-kofe-pozhaluysta__можно-кофе-пожалуйста.mp3
├── q10B_coffee__kofe__кофе.mp3
├── q10C_three__tri__три.mp3
└── q10D_potato-fries__kartofel-fri__картофель-фри.mp3
```
