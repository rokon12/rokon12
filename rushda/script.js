// Learn with Fun - Clean JavaScript
// No particle effects, no oval animations, mobile-friendly

// ===== Global State =====
let globalSoundEnabled = true;
let currentSection = 'alphabet';

// ===== Sound Toggle =====
function toggleGlobalSound() {
    globalSoundEnabled = !globalSoundEnabled;
    const icon = document.getElementById('soundIcon');
    if (icon) {
        icon.textContent = globalSoundEnabled ? 'Sound ON' : 'Sound OFF';
    }
    localStorage.setItem('rushda-sound-enabled', globalSoundEnabled);
}

function initSoundPreference() {
    const saved = localStorage.getItem('rushda-sound-enabled');
    if (saved !== null) {
        globalSoundEnabled = saved === 'true';
        const icon = document.getElementById('soundIcon');
        if (icon) {
            icon.textContent = globalSoundEnabled ? 'Sound ON' : 'Sound OFF';
        }
    }
}

// ===== Text-to-Speech =====
function speak(text, lang = 'en-US') {
    if (!globalSoundEnabled) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}

// ===== Category Tab Navigation =====
function showCategory(category) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`.tab[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const activePanel = document.getElementById(`${category}-panel`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
}

// ===== Section Navigation =====
function showSection(section) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    currentSection = section;

    // Initialize section-specific content
    if (section === 'alphabet') initializeAlphabet();
    if (section === 'lowercase') initializeLowercase();
    if (section === 'phonics') initializePhonics();
    if (section === 'bangla') initializeBangla();
    if (section === 'arabic') initializeArabic();
    if (section === 'spelling') initializeSpelling();
    if (section === 'counting') initializeCounting();
    if (section === 'quiz') initializeQuiz();
    if (section === 'memory') startNewMemoryGame();
    if (section === 'rhymes') initializeNurseryRhymes();
    if (section === 'drawing') initializeDrawing();
}

// ===== Alphabet Data =====
const alphabetData = {
    'A': 'Apple', 'B': 'Ball', 'C': 'Cat', 'D': 'Dog', 'E': 'Elephant',
    'F': 'Fish', 'G': 'Grapes', 'H': 'Hat', 'I': 'Ice cream', 'J': 'Jelly',
    'K': 'Kite', 'L': 'Lion', 'M': 'Moon', 'N': 'Nest', 'O': 'Orange',
    'P': 'Penguin', 'Q': 'Queen', 'R': 'Rainbow', 'S': 'Sun', 'T': 'Tree',
    'U': 'Umbrella', 'V': 'Violin', 'W': 'Watermelon', 'X': 'Xylophone',
    'Y': 'Yacht', 'Z': 'Zebra'
};

// ===== Uppercase Alphabet =====
function initializeAlphabet() {
    const grid = document.getElementById('alphabetGrid');
    if (!grid || grid.children.length > 0) return;

    for (let letter in alphabetData) {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        btn.onclick = () => showLetter(letter);
        grid.appendChild(btn);
    }
}

function showLetter(letter) {
    document.getElementById('bigLetter').textContent = letter;
    document.getElementById('letterWord').textContent = `${letter} is for ${alphabetData[letter]}`;
    document.getElementById('alphabetImage').src = `images/${letter.toLowerCase()}.svg`;
    document.getElementById('alphabetImage').alt = alphabetData[letter];
    speak(`${letter}. ${letter} is for ${alphabetData[letter]}`);
}

// ===== Lowercase Alphabet =====
function initializeLowercase() {
    const grid = document.getElementById('lowercaseGrid');
    if (!grid || grid.children.length > 0) return;

    for (let letter in alphabetData) {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter.toLowerCase();
        btn.onclick = () => showLowercaseLetter(letter.toLowerCase());
        grid.appendChild(btn);
    }
}

function showLowercaseLetter(letter) {
    const upper = letter.toUpperCase();
    document.getElementById('lowercaseBigLetter').textContent = letter;
    document.getElementById('lowercaseLetterWord').textContent = `${letter} is for ${alphabetData[upper].toLowerCase()}`;
    document.getElementById('lowercaseAlphabetImage').src = `images/${letter}.svg`;
    document.getElementById('lowercaseAlphabetImage').alt = alphabetData[upper];
    speak(`${letter}. ${letter} is for ${alphabetData[upper]}`);
}

// ===== Phonics =====
const phonicsData = {
    consonants: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Z'],
    vowels: {
        'a': { sound: 'ah' },
        'e': { sound: 'eh' },
        'i': { sound: 'ih' },
        'o': { sound: 'oh' },
        'u': { sound: 'uh' }
    }
};

let currentVowel = 'a';
let currentConsonant = 'B';

function initializePhonics() {
    const grid = document.getElementById('consonantGrid');
    if (!grid || grid.children.length > 0) return;

    phonicsData.consonants.forEach(consonant => {
        const btn = document.createElement('button');
        btn.className = 'consonant-btn';
        btn.textContent = consonant;
        btn.onclick = () => selectConsonant(consonant);
        grid.appendChild(btn);
    });
    updatePhonicsDisplay();
}

function selectVowel(vowel) {
    currentVowel = vowel;
    document.querySelectorAll('.vowel-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.vowel-btn[data-vowel="${vowel}"]`).classList.add('active');
    updatePhonicsDisplay();
}

function selectConsonant(consonant) {
    currentConsonant = consonant;
    updatePhonicsDisplay();
}

function updatePhonicsDisplay() {
    const sound = currentConsonant.toLowerCase() + currentVowel;
    document.getElementById('currentSound').textContent = sound.charAt(0).toUpperCase() + sound.slice(1);
    document.getElementById('soundDescription').textContent = `${currentConsonant} + ${currentVowel.toUpperCase()} = "${sound}"`;
}

function playCurrentSound() {
    const sound = currentConsonant.toLowerCase() + currentVowel;
    speak(sound);
}

// ===== Bangla Alphabet =====
const banglaAlphabet = {
    vowels: {
        'অ': { pronunciation: 'o', word: 'অজগর', meaning: 'Ojgor (Python)' },
        'আ': { pronunciation: 'aa', word: 'আম', meaning: 'Aam (Mango)' },
        'ই': { pronunciation: 'i', word: 'ইঁদুর', meaning: 'Indur (Mouse)' },
        'ঈ': { pronunciation: 'ii', word: 'ঈগল', meaning: 'Igol (Eagle)' },
        'উ': { pronunciation: 'u', word: 'উট', meaning: 'Ut (Camel)' },
        'ঊ': { pronunciation: 'uu', word: 'ঊর্ণা', meaning: 'Urna (Wool)' },
        'এ': { pronunciation: 'e', word: 'এলাচ', meaning: 'Elach (Cardamom)' },
        'ঐ': { pronunciation: 'oi', word: 'ঐরাবত', meaning: 'Oirabat' },
        'ও': { pronunciation: 'o', word: 'ওল', meaning: 'Ol (Yam)' },
        'ঔ': { pronunciation: 'ou', word: 'ঔষধ', meaning: 'Oushod (Medicine)' }
    },
    consonants: {
        'ক': { pronunciation: 'ko', word: 'কলা', meaning: 'Kola (Banana)' },
        'খ': { pronunciation: 'kho', word: 'খরগোশ', meaning: 'Khorgosh (Rabbit)' },
        'গ': { pronunciation: 'go', word: 'গরু', meaning: 'Goru (Cow)' },
        'ঘ': { pronunciation: 'gho', word: 'ঘর', meaning: 'Ghor (House)' },
        'চ': { pronunciation: 'cho', word: 'চাঁদ', meaning: 'Chand (Moon)' },
        'ছ': { pronunciation: 'chho', word: 'ছাগল', meaning: 'Chagol (Goat)' },
        'জ': { pronunciation: 'jo', word: 'জল', meaning: 'Jol (Water)' },
        'ঝ': { pronunciation: 'jho', word: 'ঝরনা', meaning: 'Jhorna (Waterfall)' },
        'ট': { pronunciation: 'to', word: 'টমেটো', meaning: 'Tomato' },
        'ঠ': { pronunciation: 'tho', word: 'ঠেলা', meaning: 'Thela (Cart)' },
        'ড': { pronunciation: 'do', word: 'ডিম', meaning: 'Dim (Egg)' },
        'ঢ': { pronunciation: 'dho', word: 'ঢাক', meaning: 'Dhak (Drum)' },
        'ণ': { pronunciation: 'no', word: 'বাণী', meaning: 'Bani (Speech)' },
        'ত': { pronunciation: 'to', word: 'তারা', meaning: 'Tara (Star)' },
        'থ': { pronunciation: 'tho', word: 'থালা', meaning: 'Thala (Plate)' },
        'দ': { pronunciation: 'do', word: 'দাঁত', meaning: 'Dant (Teeth)' },
        'ধ': { pronunciation: 'dho', word: 'ধান', meaning: 'Dhan (Rice)' },
        'ন': { pronunciation: 'no', word: 'নৌকা', meaning: 'Nouka (Boat)' },
        'প': { pronunciation: 'po', word: 'পাখি', meaning: 'Pakhi (Bird)' },
        'ফ': { pronunciation: 'pho', word: 'ফুল', meaning: 'Phul (Flower)' },
        'ব': { pronunciation: 'bo', word: 'বই', meaning: 'Boi (Book)' },
        'ভ': { pronunciation: 'bho', word: 'ভালুক', meaning: 'Bhaluk (Bear)' },
        'ম': { pronunciation: 'mo', word: 'মাছ', meaning: 'Mach (Fish)' },
        'য': { pronunciation: 'jo', word: 'যন্ত্র', meaning: 'Jontro (Machine)' },
        'র': { pronunciation: 'ro', word: 'রাজা', meaning: 'Raja (King)' },
        'ল': { pronunciation: 'lo', word: 'লাল', meaning: 'Lal (Red)' },
        'শ': { pronunciation: 'sho', word: 'শিশু', meaning: 'Shishu (Baby)' },
        'ষ': { pronunciation: 'sho', word: 'ষাঁড়', meaning: 'Shar (Bull)' },
        'স': { pronunciation: 'so', word: 'সূর্য', meaning: 'Surjo (Sun)' },
        'হ': { pronunciation: 'ho', word: 'হাতি', meaning: 'Hati (Elephant)' }
    }
};

let currentBanglaCategory = 'vowels';
let currentBanglaLetter = 'অ';

function initializeBangla() {
    renderBanglaGrid();
}

function selectBanglaCategory(category) {
    currentBanglaCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.category-btn[onclick="selectBanglaCategory('${category}')"]`).classList.add('active');
    renderBanglaGrid();
}

function renderBanglaGrid() {
    const grid = document.getElementById('banglaGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const letters = banglaAlphabet[currentBanglaCategory];
    for (let letter in letters) {
        const btn = document.createElement('button');
        btn.className = 'bangla-letter-btn';
        btn.textContent = letter;
        btn.onclick = () => showBanglaLetter(letter);
        grid.appendChild(btn);
    }
}

function showBanglaLetter(letter) {
    currentBanglaLetter = letter;
    const data = banglaAlphabet[currentBanglaCategory][letter];
    document.getElementById('banglaBigLetter').textContent = letter;
    document.getElementById('banglaPronunciation').textContent = `${letter} (${data.pronunciation})`;
    document.getElementById('banglaWord').textContent = data.word;
    document.getElementById('banglaWordMeaning').textContent = data.meaning;

    // Try to load image
    const img = document.getElementById('banglaAlphabetImage');
    img.src = `images/bangla/${letter}.svg`;
    img.alt = data.word;
    img.onerror = () => { img.style.display = 'none'; };
    img.onload = () => { img.style.display = 'block'; };
}

function playBanglaLetter() {
    const data = banglaAlphabet[currentBanglaCategory][currentBanglaLetter];
    speak(data.word, 'bn-BD');
}

// ===== Arabic Alphabet =====
const arabicAlphabet = {
    'أ': { pronunciation: 'alif', word: 'أسد', meaning: 'Asad (Lion)' },
    'ب': { pronunciation: 'ba', word: 'بطة', meaning: 'Batta (Duck)' },
    'ت': { pronunciation: 'ta', word: 'تفاحة', meaning: 'Tuffaha (Apple)' },
    'ث': { pronunciation: 'tha', word: 'ثعلب', meaning: 'Thalab (Fox)' },
    'ج': { pronunciation: 'jim', word: 'جمل', meaning: 'Jamal (Camel)' },
    'ح': { pronunciation: 'ha', word: 'حصان', meaning: 'Hisan (Horse)' },
    'خ': { pronunciation: 'kha', word: 'خروف', meaning: 'Kharuf (Sheep)' },
    'د': { pronunciation: 'dal', word: 'دجاجة', meaning: 'Dajaja (Chicken)' },
    'ذ': { pronunciation: 'dhal', word: 'ذئب', meaning: 'Dhib (Wolf)' },
    'ر': { pronunciation: 'ra', word: 'رمان', meaning: 'Rumman (Pomegranate)' },
    'ز': { pronunciation: 'zay', word: 'زرافة', meaning: 'Zarafa (Giraffe)' },
    'س': { pronunciation: 'sin', word: 'سمكة', meaning: 'Samaka (Fish)' },
    'ش': { pronunciation: 'shin', word: 'شمس', meaning: 'Shams (Sun)' },
    'ص': { pronunciation: 'sad', word: 'صقر', meaning: 'Saqr (Falcon)' },
    'ض': { pronunciation: 'dad', word: 'ضفدع', meaning: 'Difda (Frog)' },
    'ط': { pronunciation: 'ta', word: 'طائر', meaning: 'Tair (Bird)' },
    'ظ': { pronunciation: 'za', word: 'ظبي', meaning: 'Zabi (Gazelle)' },
    'ع': { pronunciation: 'ayn', word: 'عنب', meaning: 'Inab (Grapes)' },
    'غ': { pronunciation: 'ghayn', word: 'غزال', meaning: 'Ghazal (Deer)' },
    'ف': { pronunciation: 'fa', word: 'فيل', meaning: 'Fil (Elephant)' },
    'ق': { pronunciation: 'qaf', word: 'قمر', meaning: 'Qamar (Moon)' },
    'ك': { pronunciation: 'kaf', word: 'كلب', meaning: 'Kalb (Dog)' },
    'ل': { pronunciation: 'lam', word: 'ليمون', meaning: 'Laymun (Lemon)' },
    'م': { pronunciation: 'mim', word: 'موز', meaning: 'Mawz (Banana)' },
    'ن': { pronunciation: 'nun', word: 'نجمة', meaning: 'Najma (Star)' },
    'ه': { pronunciation: 'ha', word: 'هدهد', meaning: 'Hudhud (Hoopoe)' },
    'و': { pronunciation: 'waw', word: 'وردة', meaning: 'Warda (Rose)' },
    'ي': { pronunciation: 'ya', word: 'يد', meaning: 'Yad (Hand)' }
};

let currentArabicLetter = 'أ';

function initializeArabic() {
    const grid = document.getElementById('arabicGrid');
    if (!grid || grid.children.length > 0) return;

    for (let letter in arabicAlphabet) {
        const btn = document.createElement('button');
        btn.className = 'arabic-letter-btn';
        btn.textContent = letter;
        btn.onclick = () => showArabicLetter(letter);
        grid.appendChild(btn);
    }
}

function showArabicLetter(letter) {
    currentArabicLetter = letter;
    const data = arabicAlphabet[letter];
    document.getElementById('arabicBigLetter').textContent = letter;
    document.getElementById('arabicPronunciation').textContent = `${letter} (${data.pronunciation})`;
    document.getElementById('arabicWord').textContent = data.word;
    document.getElementById('arabicWordMeaning').textContent = data.meaning;

    // Try to load image
    const img = document.getElementById('arabicAlphabetImage');
    img.src = `images/arabic/${letter}.svg`;
    img.alt = data.word;
    img.onerror = () => { img.style.display = 'none'; };
    img.onload = () => { img.style.display = 'block'; };
}

function playArabicLetter() {
    const data = arabicAlphabet[currentArabicLetter];
    speak(data.word, 'ar-SA');
}

// ===== Spelling Game =====
const spellingWords = [
    { word: 'CAT', image: 'cat' },
    { word: 'DOG', image: 'dog' },
    { word: 'SUN', image: 'sun' },
    { word: 'HAT', image: 'hat' },
    { word: 'BAT', image: 'ball' },
    { word: 'BEE', image: 'elephant' },
    { word: 'PIG', image: 'penguin' },
    { word: 'COW', image: 'cat' },
    { word: 'HEN', image: 'hat' }
];

let currentSpellingWord = 0;
let spellingProgress = [];

function initializeSpelling() {
    loadSpellingWord();
}

function loadSpellingWord() {
    const wordData = spellingWords[currentSpellingWord];
    spellingProgress = [];

    document.getElementById('wordLabel').textContent = wordData.word;
    document.getElementById('spellingImage').src = `images/${wordData.image.charAt(0)}.svg`;

    // Create blank spaces
    const wordDisplay = document.getElementById('wordToSpell');
    wordDisplay.innerHTML = '';
    for (let i = 0; i < wordData.word.length; i++) {
        const span = document.createElement('span');
        span.className = 'letter-slot';
        span.textContent = '_';
        span.dataset.index = i;
        wordDisplay.appendChild(span);
    }

    // Create letter choices
    const choices = document.getElementById('letterChoices');
    choices.innerHTML = '';
    const letters = wordData.word.split('').sort(() => Math.random() - 0.5);
    // Add some extra random letters
    const extraLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => !letters.includes(l));
    const allLetters = [...letters, ...extraLetters.slice(0, 3)].sort(() => Math.random() - 0.5);

    allLetters.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = letter;
        btn.onclick = () => selectSpellingLetter(letter, btn);
        choices.appendChild(btn);
    });
}

function selectSpellingLetter(letter, btn) {
    const wordData = spellingWords[currentSpellingWord];
    const nextIndex = spellingProgress.length;

    if (nextIndex >= wordData.word.length) return;

    if (wordData.word[nextIndex] === letter) {
        spellingProgress.push(letter);
        document.querySelectorAll('.letter-slot')[nextIndex].textContent = letter;
        btn.disabled = true;
        btn.classList.add('used');
        speak(letter);

        if (spellingProgress.length === wordData.word.length) {
            setTimeout(() => {
                showCelebration();
                speak(`Great job! You spelled ${wordData.word}!`);
            }, 500);
        }
    } else {
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 300);
    }
}

function clearSpelling() {
    loadSpellingWord();
}

function showHint() {
    const wordData = spellingWords[currentSpellingWord];
    const nextIndex = spellingProgress.length;
    if (nextIndex < wordData.word.length) {
        speak(wordData.word[nextIndex]);
    }
}

function nextWord() {
    currentSpellingWord = (currentSpellingWord + 1) % spellingWords.length;
    loadSpellingWord();
}

// ===== Counting =====
let currentNumber = 1;

function initializeCounting() {
    const buttons = document.getElementById('numberButtons');
    if (!buttons || buttons.children.length > 0) return;

    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = i;
        btn.onclick = () => showNumber(i);
        buttons.appendChild(btn);
    }
    showNumber(1);
}

function showNumber(num) {
    currentNumber = num;
    document.getElementById('numberDisplay').textContent = num;

    const container = document.getElementById('objectsContainer');
    container.innerHTML = '';

    for (let i = 0; i < num; i++) {
        const star = document.createElement('span');
        star.className = 'count-object';
        star.textContent = '⭐';
        container.appendChild(star);
    }

    speak(num.toString());
}

// ===== Quiz =====
let quizScore = 0;

function initializeQuiz() {
    generateQuizQuestion();
}

function generateQuizQuestion() {
    const types = ['letter', 'number', 'word'];
    const type = types[Math.floor(Math.random() * types.length)];

    const questionText = document.getElementById('questionText');
    const questionContent = document.getElementById('questionContent');
    const answersDiv = document.getElementById('quizAnswers');
    answersDiv.innerHTML = '';

    let correctAnswer;
    let options = [];

    if (type === 'letter') {
        const letters = Object.keys(alphabetData);
        correctAnswer = letters[Math.floor(Math.random() * letters.length)];
        questionText.textContent = 'What letter is this?';
        questionContent.textContent = correctAnswer;
        options = [correctAnswer];
        while (options.length < 4) {
            const opt = letters[Math.floor(Math.random() * letters.length)];
            if (!options.includes(opt)) options.push(opt);
        }
    } else if (type === 'number') {
        correctAnswer = Math.floor(Math.random() * 10) + 1;
        questionText.textContent = 'What number is this?';
        questionContent.textContent = correctAnswer;
        options = [correctAnswer];
        while (options.length < 4) {
            const opt = Math.floor(Math.random() * 10) + 1;
            if (!options.includes(opt)) options.push(opt);
        }
    } else {
        const letter = Object.keys(alphabetData)[Math.floor(Math.random() * 26)];
        correctAnswer = alphabetData[letter];
        questionText.textContent = `What word starts with ${letter}?`;
        questionContent.textContent = letter;
        options = [correctAnswer];
        const otherWords = Object.values(alphabetData).filter(w => w !== correctAnswer);
        while (options.length < 4 && otherWords.length > 0) {
            const idx = Math.floor(Math.random() * otherWords.length);
            options.push(otherWords.splice(idx, 1)[0]);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-answer-btn';
        btn.textContent = opt;
        btn.onclick = () => checkQuizAnswer(opt, correctAnswer, btn);
        answersDiv.appendChild(btn);
    });
}

function checkQuizAnswer(selected, correct, btn) {
    const buttons = document.querySelectorAll('.quiz-answer-btn');
    buttons.forEach(b => b.disabled = true);

    if (selected === correct) {
        btn.classList.add('correct');
        quizScore++;
        document.getElementById('quizScore').textContent = quizScore;
        speak('Correct!');
    } else {
        btn.classList.add('wrong');
        buttons.forEach(b => {
            if (b.textContent == correct) b.classList.add('correct');
        });
        speak('Try again!');
    }

    setTimeout(generateQuizQuestion, 1500);
}

// ===== Memory Game =====
let memoryDifficulty = 'easy';
let memoryCards = [];
let flippedCards = [];
let matchedCards = [];
let memoryMoves = 0;
let memoryMatches = 0;
let canFlipCards = true;

const memoryEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

function setMemoryDifficulty(diff) {
    memoryDifficulty = diff;
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.difficulty-btn[onclick="setMemoryDifficulty('${diff}')"]`).classList.add('active');
    startNewMemoryGame();
}

function startNewMemoryGame() {
    const board = document.getElementById('memoryBoard');
    if (!board) return;

    board.innerHTML = '';
    flippedCards = [];
    matchedCards = [];
    memoryMoves = 0;
    memoryMatches = 0;
    canFlipCards = true;

    document.getElementById('memoryMoves').textContent = '0';
    document.getElementById('memoryMatches').textContent = '0';

    const pairs = memoryDifficulty === 'easy' ? 4 : memoryDifficulty === 'medium' ? 6 : 8;
    const selectedEmojis = memoryEmojis.slice(0, pairs);
    memoryCards = [...selectedEmojis, ...selectedEmojis].sort(() => Math.random() - 0.5);

    board.className = `memory-board ${memoryDifficulty}`;

    memoryCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${emoji}</div>
            </div>
        `;
        card.onclick = () => flipCard(card);
        board.appendChild(card);
    });
}

function flipCard(card) {
    if (!canFlipCards || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        canFlipCards = false;
        memoryMoves++;
        document.getElementById('memoryMoves').textContent = memoryMoves;

        const [card1, card2] = flippedCards;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedCards.push(card1, card2);
            memoryMatches++;
            document.getElementById('memoryMatches').textContent = memoryMatches;
            flippedCards = [];
            canFlipCards = true;

            if (matchedCards.length === memoryCards.length) {
                setTimeout(() => {
                    showCelebration();
                    speak('Congratulations! You won!');
                }, 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                canFlipCards = true;
            }, 1000);
        }
    }
}

// ===== Nursery Rhymes =====
const songs = [
    {
        title: 'ABC Song',
        lyrics: [
            'A B C D E F G',
            'H I J K L M N O P',
            'Q R S T U V',
            'W X Y and Z',
            'Now I know my ABCs',
            'Next time won\'t you sing with me?'
        ]
    },
    {
        title: 'Twinkle Twinkle',
        lyrics: [
            'Twinkle, twinkle, little star',
            'How I wonder what you are',
            'Up above the world so high',
            'Like a diamond in the sky',
            'Twinkle, twinkle, little star',
            'How I wonder what you are'
        ]
    },
    {
        title: 'Row Your Boat',
        lyrics: [
            'Row, row, row your boat',
            'Gently down the stream',
            'Merrily, merrily, merrily, merrily',
            'Life is but a dream'
        ]
    }
];

let currentSong = 0;
let currentLyricLine = 0;
let isPlaying = false;
let songTimer = null;

function initializeNurseryRhymes() {
    const buttons = document.getElementById('songButtons');
    if (!buttons || buttons.children.length > 0) return;

    songs.forEach((song, index) => {
        const btn = document.createElement('button');
        btn.className = 'song-btn';
        btn.textContent = song.title;
        btn.onclick = () => selectSong(index);
        buttons.appendChild(btn);
    });
}

function selectSong(index) {
    currentSong = index;
    currentLyricLine = 0;
    isPlaying = false;
    if (songTimer) clearInterval(songTimer);

    document.getElementById('songTitle').textContent = songs[index].title;
    document.getElementById('lyricsLine').textContent = songs[index].lyrics[0];
    document.getElementById('playBtn').textContent = 'Play';
}

function togglePlay() {
    isPlaying = !isPlaying;
    document.getElementById('playBtn').textContent = isPlaying ? 'Pause' : 'Play';

    if (isPlaying) {
        playLyrics();
    } else {
        if (songTimer) clearInterval(songTimer);
    }
}

function playLyrics() {
    const song = songs[currentSong];

    const showLine = () => {
        if (currentLyricLine < song.lyrics.length) {
            const line = song.lyrics[currentLyricLine];
            document.getElementById('lyricsLine').textContent = line;
            speak(line);
            currentLyricLine++;
        } else {
            currentLyricLine = 0;
            isPlaying = false;
            document.getElementById('playBtn').textContent = 'Play';
            clearInterval(songTimer);
        }
    };

    showLine();
    songTimer = setInterval(showLine, 3000);
}

function restartSong() {
    currentLyricLine = 0;
    if (songTimer) clearInterval(songTimer);
    isPlaying = false;
    document.getElementById('playBtn').textContent = 'Play';
    document.getElementById('lyricsLine').textContent = songs[currentSong].lyrics[0];
}

// ===== Drawing =====
let canvas = null;
let ctx = null;
let isDrawing = false;
let currentColor = '#ff6b6b';
let brushSize = 16;
let lastX = 0;
let lastY = 0;

const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#e74c3c', '#1abc9c', '#f39c12', '#2c3e50', '#ffffff'];

function initializeDrawing() {
    canvas = document.getElementById('drawingCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create color palette
    const palette = document.getElementById('colorPalette');
    if (palette && palette.children.length === 0) {
        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'color-btn';
            btn.style.backgroundColor = color;
            if (color === currentColor) btn.classList.add('active');
            btn.onclick = () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentColor = color;
            };
            palette.appendChild(btn);
        });
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

function resizeCanvas() {
    if (!canvas) return;
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight || 400;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastX = x;
    lastY = y;
}

function setBrushSize(size) {
    brushSize = size;
    document.querySelectorAll('.brush-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.brush-btn[onclick="setBrushSize(${size})"]`).classList.add('active');
}

function clearCanvas() {
    if (ctx && canvas) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// ===== Celebration Modal =====
function showCelebration() {
    const celebration = document.getElementById('celebration');
    if (celebration) {
        celebration.classList.add('show');
    }
}

function closeCelebration() {
    const celebration = document.getElementById('celebration');
    if (celebration) {
        celebration.classList.remove('show');
    }
}

// ===== Loading Screen =====
function hideLoading() {
    const loading = document.getElementById('loadingScreen');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initSoundPreference();

    // Simulate loading
    const loadingBar = document.getElementById('loadingBar');
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += 20;
        if (loadingBar) loadingBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                hideLoading();
                initializeAlphabet();
                showSection('alphabet');
            }, 300);
        }
    }, 200);
});
