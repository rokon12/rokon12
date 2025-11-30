// Global variables
let currentSection = 'alphabet';
let currentSpellingWord = 0;
let currentNumber = 1;
let spellingProgress = [];
let completedWords = 0;
let hintCount = 0;
let selectedLetters = [];
let globalSoundEnabled = true;

// Global sound toggle function
function toggleGlobalSound() {
    globalSoundEnabled = !globalSoundEnabled;
    const toggleBtn = document.getElementById('soundToggle');
    const soundOn = toggleBtn.querySelector('.sound-on');
    const soundOff = toggleBtn.querySelector('.sound-off');

    if (globalSoundEnabled) {
        toggleBtn.classList.remove('muted');
        soundOn.style.display = 'inline';
        soundOff.style.display = 'none';
    } else {
        toggleBtn.classList.add('muted');
        soundOn.style.display = 'none';
        soundOff.style.display = 'inline';
        // Stop any currently playing sounds
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    // Save preference
    localStorage.setItem('rushda-sound-enabled', globalSoundEnabled);
}

// Initialize sound preference from localStorage
function initSoundPreference() {
    const saved = localStorage.getItem('rushda-sound-enabled');
    if (saved !== null) {
        globalSoundEnabled = saved === 'true';
        if (!globalSoundEnabled) {
            toggleGlobalSound(); // This will toggle it back to match saved state
            toggleGlobalSound();
        }
    }
}

// Category tab navigation
function showCategory(category) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    const activeTab = document.querySelector(`.tab-btn[onclick="showCategory('${category}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
    }

    // Update panels
    document.querySelectorAll('.category-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`${category}-panel`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
}

// Quiz variables
let currentQuizCategory = 'all';
let currentQuizQuestion = 0;
let quizScore = 0;
let quizStreak = 0;
let answeredQuestions = 0;

// Memory game variables
let memoryDifficulty = 'easy';
let memoryCards = [];
let flippedCards = [];
let matchedCards = [];
let memoryMoves = 0;
let memoryMatches = 0;
let memoryStartTime = 0;
let memoryTimer = null;
let canFlipCards = true;

// Nursery rhymes variables
let currentSong = 0;
let isPlaying = false;
let songTimer = null;
let currentWordIndex = 0;
let playbackSpeed = 1; // 1 = normal, 0.7 = slow
let songStartTime = 0;
let songDuration = 0;

// Musical enhancement variables
let musicContext = null;
let backgroundMusicGain = null;
let drumGain = null;
let melodyGain = null;
let currentChordIndex = 0;
let beatInterval = null;

// Drawing variables
let drawingMode = 'free'; // 'free', 'trace', 'color', 'mix'
let currentColor = '#ff6b6b';
let brushSize = 20;
let isDrawing = false;
let canvas = null;
let ctx = null;
let templateCanvas = null;
let templateCtx = null;
let lastX = 0;
let lastY = 0;

// Color mixing variables
let selectedColors = [];
let mixedColor = null;
let mixingMode = 'simple'; // 'simple' or 'advanced'
let maxColors = 2;

// Arabic letters variables
let currentArabicLetter = 'أ';
let arabicGameScore = 0;
let arabicGameActive = false;

// Interactive Storybooks variables
let currentStory = null;
let currentPage = 0;
let isAutoReading = false;
let storyAutoTimer = null;
let colorMixingData = {
    // Primary + Primary combinations
    'red+blue': { color: '#8b4bff', name: 'Magical Purple' },
    'blue+red': { color: '#8b4bff', name: 'Magical Purple' },
    'red+yellow': { color: '#ff8c42', name: 'Sunset Orange' },
    'yellow+red': { color: '#ff8c42', name: 'Sunset Orange' },
    'blue+yellow': { color: '#4caf50', name: 'Forest Green' },
    'yellow+blue': { color: '#4caf50', name: 'Forest Green' },

    // Adding White (tints - lighter colors)
    'red+white': { color: '#ffb3ba', name: 'Cotton Candy Pink' },
    'white+red': { color: '#ffb3ba', name: 'Cotton Candy Pink' },
    'blue+white': { color: '#bae1ff', name: 'Sky Blue' },
    'white+blue': { color: '#bae1ff', name: 'Sky Blue' },
    'yellow+white': { color: '#ffffba', name: 'Sunshine Yellow' },
    'white+yellow': { color: '#ffffba', name: 'Sunshine Yellow' },
    'purple+white': { color: '#ddbeff', name: 'Fairy Lavender' },
    'white+purple': { color: '#ddbeff', name: 'Fairy Lavender' },
    'orange+white': { color: '#ffdab9', name: 'Peach Cream' },
    'white+orange': { color: '#ffdab9', name: 'Peach Cream' },
    'green+white': { color: '#bffcc6', name: 'Mint Fresh' },
    'white+green': { color: '#bffcc6', name: 'Mint Fresh' },

    // Adding Black (shades - darker colors)
    'red+black': { color: '#8b0000', name: 'Dragon Red' },
    'black+red': { color: '#8b0000', name: 'Dragon Red' },
    'blue+black': { color: '#191970', name: 'Midnight Blue' },
    'black+blue': { color: '#191970', name: 'Midnight Blue' },
    'yellow+black': { color: '#9acd32', name: 'Army Green' },
    'black+yellow': { color: '#9acd32', name: 'Army Green' },
    'purple+black': { color: '#4b0082', name: 'Royal Purple' },
    'black+purple': { color: '#4b0082', name: 'Royal Purple' },
    'orange+black': { color: '#ff4500', name: 'Tiger Orange' },
    'black+orange': { color: '#ff4500', name: 'Tiger Orange' },
    'green+black': { color: '#006400', name: 'Jungle Green' },
    'black+green': { color: '#006400', name: 'Jungle Green' },

    // Secondary + Primary combinations (more advanced)
    'purple+yellow': { color: '#8b4513', name: 'Chocolate Brown' },
    'yellow+purple': { color: '#8b4513', name: 'Chocolate Brown' },
    'orange+blue': { color: '#708090', name: 'Storm Gray' },
    'blue+orange': { color: '#708090', name: 'Storm Gray' },
    'green+red': { color: '#a0522d', name: 'Earth Brown' },
    'red+green': { color: '#a0522d', name: 'Earth Brown' },

    // Special combinations
    'pink+blue': { color: '#dda0dd', name: 'Princess Lilac' },
    'blue+pink': { color: '#dda0dd', name: 'Princess Lilac' },
    'pink+yellow': { color: '#f0e68c', name: 'Banana Cream' },
    'yellow+pink': { color: '#f0e68c', name: 'Banana Cream' },
    'light blue+yellow': { color: '#98fb98', name: 'Ocean Mint' },
    'yellow+light blue': { color: '#98fb98', name: 'Ocean Mint' },
    'orange+pink': { color: '#ff69b4', name: 'Bubblegum Pink' },
    'pink+orange': { color: '#ff69b4', name: 'Bubblegum Pink' },
    'green+blue': { color: '#008b8b', name: 'Mermaid Teal' },
    'blue+green': { color: '#008b8b', name: 'Mermaid Teal' },
    'purple+pink': { color: '#da70d6', name: 'Unicorn Magenta' },
    'pink+purple': { color: '#da70d6', name: 'Unicorn Magenta' },

    // Black + White
    'black+white': { color: '#808080', name: 'Elephant Gray' },
    'white+black': { color: '#808080', name: 'Elephant Gray' }
};

// Alphabet data
const alphabetData = {
    'A': 'Apple', 'B': 'Ball', 'C': 'Cat', 'D': 'Dog', 'E': 'Elephant',
    'F': 'Fish', 'G': 'Grapes', 'H': 'Hat', 'I': 'Ice cream', 'J': 'Jelly',
    'K': 'Kite', 'L': 'Lion', 'M': 'Moon', 'N': 'Nest', 'O': 'Orange',
    'P': 'Penguin', 'Q': 'Queen', 'R': 'Rainbow', 'S': 'Sun', 'T': 'Tree',
    'U': 'Umbrella', 'V': 'Violin', 'W': 'Watermelon', 'X': 'Xylophone', 
    'Y': 'Yacht', 'Z': 'Zebra'
};

// Phonics data
const phonicsData = {
    consonants: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'],
    vowels: {
        'a': { sound: 'ah', description: 'makes "ah" sound' },
        'e': { sound: 'eh', description: 'makes "eh" sound' },
        'i': { sound: 'ih', description: 'makes "ih" sound' },
        'o': { sound: 'oh', description: 'makes "oh" sound' },
        'u': { sound: 'uh', description: 'makes "uh" sound' }
    },
    consonantSounds: {
        'B': 'buh', 'C': 'kuh', 'D': 'duh', 'F': 'fuh', 'G': 'guh', 'H': 'huh',
        'J': 'juh', 'K': 'kuh', 'L': 'luh', 'M': 'muh', 'N': 'nuh', 'P': 'puh',
        'Q': 'kwuh', 'R': 'ruh', 'S': 'suh', 'T': 'tuh', 'V': 'vuh', 'W': 'wuh',
        'X': 'ksuh', 'Y': 'yuh', 'Z': 'zuh'
    }
};

// Phonics game variables
let currentVowel = 'a';
let currentConsonant = 'B';
let phonicsScore = 0;
let phonicsGameActive = false;

// Bangla alphabet data with proper Bengali letter names
const banglaAlphabet = {
    vowels: {
        'অ': { 
            pronunciation: 'o', 
            letterName: 'অ', 
            word: 'অজগর', 
            meaning: 'Ojgor (Python)', 
            english: 'A' 
        },
        'আ': { 
            pronunciation: 'aa', 
            letterName: 'আ', 
            word: 'আম', 
            meaning: 'Aam (Mango)', 
            english: 'Aa' 
        },
        'ই': { 
            pronunciation: 'i', 
            letterName: 'ই', 
            word: 'ইঁদুর', 
            meaning: 'Indur (Mouse)', 
            english: 'I' 
        },
        'ঈ': { 
            pronunciation: 'ii', 
            letterName: 'ঈ', 
            word: 'ঈগল', 
            meaning: 'Igol (Eagle)', 
            english: 'Ee' 
        },
        'উ': { 
            pronunciation: 'u', 
            letterName: 'উ', 
            word: 'উট', 
            meaning: 'Ut (Camel)', 
            english: 'U' 
        },
        'ঊ': { 
            pronunciation: 'uu', 
            letterName: 'ঊ', 
            word: 'ঊর্ণা', 
            meaning: 'Urna (Wool)', 
            english: 'Oo' 
        },
        'ঋ': { 
            pronunciation: 'ri', 
            letterName: 'ঋ', 
            word: 'ঋতু', 
            meaning: 'Ritu (Season)', 
            english: 'Ri' 
        },
        'এ': { 
            pronunciation: 'e', 
            letterName: 'এ', 
            word: 'এলাচ', 
            meaning: 'Elach (Cardamom)', 
            english: 'E' 
        },
        'ঐ': { 
            pronunciation: 'oi', 
            letterName: 'ঐ', 
            word: 'ঐরাবত', 
            meaning: 'Oirabat (Airavata)', 
            english: 'Oi' 
        },
        'ও': { 
            pronunciation: 'o', 
            letterName: 'ও', 
            word: 'ওল', 
            meaning: 'Ol (Yam)', 
            english: 'O' 
        },
        'ঔ': { 
            pronunciation: 'ou', 
            letterName: 'ঔ', 
            word: 'ঔষধ', 
            meaning: 'Oushod (Medicine)', 
            english: 'Ou' 
        }
    },
    consonants: {
        'ক': { 
            pronunciation: 'ko', 
            letterName: 'ক', 
            word: 'কলা', 
            meaning: 'Kola (Banana)', 
            english: 'K' 
        },
        'খ': { 
            pronunciation: 'kho', 
            letterName: 'খ', 
            word: 'খরগোশ', 
            meaning: 'Khorgosh (Rabbit)', 
            english: 'Kh' 
        },
        'গ': { 
            pronunciation: 'go', 
            letterName: 'গ', 
            word: 'গরু', 
            meaning: 'Goru (Cow)', 
            english: 'G' 
        },
        'ঘ': { 
            pronunciation: 'gho', 
            letterName: 'ঘ', 
            word: 'ঘর', 
            meaning: 'Ghor (House)', 
            english: 'Gh' 
        },
        'ঙ': { 
            pronunciation: 'umo', 
            letterName: 'ঙ', 
            word: 'আঙ্গুর',
            meaning: 'Angur (Grapes)',
            english: 'Ng' 
        },
        'চ': { 
            pronunciation: 'cho', 
            letterName: 'চ', 
            word: 'চাঁদ', 
            meaning: 'Chand (Moon)', 
            english: 'Ch' 
        },
        'ছ': { 
            pronunciation: 'chho', 
            letterName: 'ছ', 
            word: 'ছাগল', 
            meaning: 'Chagol (Goat)', 
            english: 'Chh' 
        },
        'জ': { 
            pronunciation: 'jo', 
            letterName: 'জ', 
            word: 'জল', 
            meaning: 'Jol (Water)', 
            english: 'J' 
        },
        'ঝ': { 
            pronunciation: 'jho', 
            letterName: 'ঝ', 
            word: 'ঝরনা', 
            meaning: 'Jhorna (Waterfall)', 
            english: 'Jh' 
        },
        'ঞ': { 
            pronunciation: 'ino', 
            letterName: 'ঞ', 
            word: 'গঞ্জ', 
            meaning: 'Gonj (Market)', 
            english: 'Ny' 
        },
        'ট': { 
            pronunciation: 'to', 
            letterName: 'ট', 
            word: 'টমেটো', 
            meaning: 'Tomato', 
            english: 'T' 
        },
        'ঠ': { 
            pronunciation: 'tho', 
            letterName: 'ঠ', 
            word: 'ঠেলা', 
            meaning: 'Thela', 
            english: 'Th' 
        },
        'ড': { 
            pronunciation: 'do', 
            letterName: 'ড', 
            word: 'ডিম', 
            meaning: 'Dim (Egg)', 
            english: 'D' 
        },
        'ঢ': { 
            pronunciation: 'dho', 
            letterName: 'ঢ', 
            word: 'ঢাক', 
            meaning: 'Dhak (Drum)', 
            english: 'Dh' 
        },
        'ণ': { 
            pronunciation: 'no', 
            letterName: 'ণ', 
            word: 'বাণী', 
            meaning: 'Bani (Speech)', 
            english: 'N' 
        },
        'ত': { 
            pronunciation: 'to', 
            letterName: 'ত', 
            word: 'তারা', 
            meaning: 'Tara (Star)', 
            english: 'T' 
        },
        'থ': { 
            pronunciation: 'tho', 
            letterName: 'থ', 
            word: 'থালা', 
            meaning: 'Thala (Plate)', 
            english: 'Th' 
        },
        'দ': { 
            pronunciation: 'do', 
            letterName: 'দ', 
            word: 'দাঁত', 
            meaning: 'Dant (Teeth)', 
            english: 'D' 
        },
        'ধ': { 
            pronunciation: 'dho', 
            letterName: 'ধ', 
            word: 'ধান', 
            meaning: 'Dhan (Rice)', 
            english: 'Dh' 
        },
        'ন': { 
            pronunciation: 'no', 
            letterName: 'ন', 
            word: 'নৌকা', 
            meaning: 'Nouka (Boat)', 
            english: 'N' 
        },
        'প': { 
            pronunciation: 'po', 
            letterName: 'প', 
            word: 'পাখি', 
            meaning: 'Pakhi (Bird)', 
            english: 'P' 
        },
        'ফ': { 
            pronunciation: 'pho', 
            letterName: 'ফ', 
            word: 'ফুল', 
            meaning: 'Phul (Flower)', 
            english: 'Ph' 
        },
        'ব': { 
            pronunciation: 'bo', 
            letterName: 'ব', 
            word: 'বই', 
            meaning: 'Boi (Book)', 
            english: 'B' 
        },
        'ভ': { 
            pronunciation: 'bho', 
            letterName: 'ভ', 
            word: 'ভালুক', 
            meaning: 'Bhaluk (Bear)', 
            english: 'Bh' 
        },
        'ম': { 
            pronunciation: 'mo', 
            letterName: 'ম', 
            word: 'মাছ', 
            meaning: 'Mach (Fish)', 
            english: 'M' 
        },
        'য': { 
            pronunciation: 'jo', 
            letterName: 'য', 
            word: 'যন্ত্র', 
            meaning: 'Jontro (Machine)', 
            english: 'Y' 
        },
        'র': { 
            pronunciation: 'ro', 
            letterName: 'র', 
            word: 'রং', 
            meaning: 'Rong (Color)', 
            english: 'R' 
        },
        'ল': { 
            pronunciation: 'lo', 
            letterName: 'ল', 
            word: 'লাল', 
            meaning: 'Lal (Red)', 
            english: 'L' 
        },
        'শ': { 
            pronunciation: 'sho', 
            letterName: 'শ', 
            word: 'শাক', 
            meaning: 'Shak (Vegetables)', 
            english: 'Sh' 
        },
        'ষ': { 
            pronunciation: 'sho', 
            letterName: 'ষ', 
            word: 'ষাঁড়', 
            meaning: 'Shar (Bull)', 
            english: 'Sh' 
        },
        'স': { 
            pronunciation: 'so', 
            letterName: 'স', 
            word: 'সূর্য', 
            meaning: 'Surjo (Sun)', 
            english: 'S' 
        },
        'হ': { 
            pronunciation: 'ho', 
            letterName: 'হ', 
            word: 'হাতি', 
            meaning: 'Hathi (Elephant)', 
            english: 'H' 
        }
    }
};

// Arabic alphabet data
const arabicAlphabet = {
    'أ': { pronunciation: 'alif', letterName: 'أ', word: 'أسد', meaning: 'Asad (Lion)', english: 'A' },
    'ب': { pronunciation: 'ba', letterName: 'ب', word: 'بطة', meaning: 'Batta (Duck)', english: 'B' },
    'ت': { pronunciation: 'ta', letterName: 'ت', word: 'تفاحة', meaning: 'Tuffaha (Apple)', english: 'T' },
    'ث': { pronunciation: 'tha', letterName: 'ث', word: 'ثعلب', meaning: 'Thalab (Fox)', english: 'Th' },
    'ج': { pronunciation: 'jeem', letterName: 'ج', word: 'جمل', meaning: 'Jamal (Camel)', english: 'J' },
    'ح': { pronunciation: 'ha', letterName: 'ح', word: 'حصان', meaning: 'Hisan (Horse)', english: 'H' },
    'خ': { pronunciation: 'kha', letterName: 'خ', word: 'خروف', meaning: 'Kharuf (Sheep)', english: 'Kh' },
    'د': { pronunciation: 'dal', letterName: 'د', word: 'دجاجة', meaning: 'Dajaja (Chicken)', english: 'D' },
    'ذ': { pronunciation: 'thal', letterName: 'ذ', word: 'ذئب', meaning: 'Thib (Wolf)', english: 'Th' },
    'ر': { pronunciation: 'ra', letterName: 'ر', word: 'رمان', meaning: 'Rumman (Pomegranate)', english: 'R' },
    'ز': { pronunciation: 'zay', letterName: 'ز', word: 'زرافة', meaning: 'Zarafa (Giraffe)', english: 'Z' },
    'س': { pronunciation: 'seen', letterName: 'س', word: 'سمك', meaning: 'Samak (Fish)', english: 'S' },
    'ش': { pronunciation: 'sheen', letterName: 'ش', word: 'شمس', meaning: 'Shams (Sun)', english: 'Sh' },
    'ص': { pronunciation: 'sad', letterName: 'ص', word: 'صقر', meaning: 'Saqr (Falcon)', english: 'S' },
    'ض': { pronunciation: 'dad', letterName: 'ض', word: 'ضفدع', meaning: 'Difda (Frog)', english: 'D' },
    'ط': { pronunciation: 'ta', letterName: 'ط', word: 'طائر', meaning: 'Tair (Bird)', english: 'T' },
    'ظ': { pronunciation: 'za', letterName: 'ظ', word: 'ظبي', meaning: 'Zabi (Deer)', english: 'Z' },
    'ع': { pronunciation: 'ain', letterName: 'ع', word: 'عنب', meaning: 'Inab (Grapes)', english: 'A' },
    'غ': { pronunciation: 'ghain', letterName: 'غ', word: 'غراب', meaning: 'Ghurab (Crow)', english: 'Gh' },
    'ف': { pronunciation: 'fa', letterName: 'ف', word: 'فيل', meaning: 'Feel (Elephant)', english: 'F' },
    'ق': { pronunciation: 'qaf', letterName: 'ق', word: 'قطة', meaning: 'Qitta (Cat)', english: 'Q' },
    'ك': { pronunciation: 'kaf', letterName: 'ك', word: 'كلب', meaning: 'Kalb (Dog)', english: 'K' },
    'ل': { pronunciation: 'lam', letterName: 'ل', word: 'ليمون', meaning: 'Limun (Lemon)', english: 'L' },
    'م': { pronunciation: 'meem', letterName: 'م', word: 'موز', meaning: 'Muz (Banana)', english: 'M' },
    'ن': { pronunciation: 'nun', letterName: 'ن', word: 'نجمة', meaning: 'Najma (Star)', english: 'N' },
    'ه': { pronunciation: 'ha', letterName: 'ه', word: 'هدهد', meaning: 'Hudhud (Hoopoe)', english: 'H' },
    'و': { pronunciation: 'waw', letterName: 'و', word: 'وردة', meaning: 'Warda (Rose)', english: 'W' },
    'ي': { pronunciation: 'ya', letterName: 'ي', word: 'يد', meaning: 'Yad (Hand)', english: 'Y' }
};

// Bangla game variables
let currentBanglaCategory = 'vowels';
let currentBanglaLetter = 'অ';
let banglaScore = 0;
let banglaGameActive = false;

// Spelling words organized by difficulty
const spellingWordsByDifficulty = {
    easy: [
        { word: 'CAT', image: 'cat.svg' },
        { word: 'DOG', image: 'dog.svg' },
        { word: 'SUN', image: 'sun.svg' },
        { word: 'HAT', image: 'h.svg' }
    ],
    medium: [
        { word: 'BALL', image: 'ball.svg' },
        { word: 'BOOK', image: 'book.svg' },
        { word: 'TREE', image: 'tree.svg' },
        { word: 'STAR', image: 'star.svg' },
        { word: 'FISH', image: 'fish.svg' },
        { word: 'BIRD', image: 'bird.svg' }
    ],
    hard: [
        { word: 'CAKE', image: 'cake.svg' },
        { word: 'MOON', image: 'm.svg' },
        { word: 'KITE', image: 'k.svg' },
        { word: 'LION', image: 'l.svg' }
    ]
};

// Start with easy words
let currentDifficulty = 'easy';
let spellingWords = spellingWordsByDifficulty.easy;

// Quiz questions data
const quizQuestions = {
    letters: [
        { question: "What letter is this?", content: "A", answers: ["A", "B", "C", "D"], correct: 0 },
        { question: "What letter is this?", content: "B", answers: ["A", "B", "C", "D"], correct: 1 },
        { question: "What letter is this?", content: "C", answers: ["A", "B", "C", "D"], correct: 2 },
        { question: "What letter comes after B?", content: "B ➡️ ?", answers: ["A", "C", "D", "E"], correct: 1 },
        { question: "What letter is this?", content: "🍎 = ?", answers: ["A", "B", "C", "D"], correct: 0 },
        { question: "What letter is this?", content: "🐱 = ?", answers: ["A", "B", "C", "D"], correct: 2 }
    ],
    numbers: [
        { question: "What number is this?", content: "1", answers: ["1", "2", "3", "4"], correct: 0 },
        { question: "What number is this?", content: "2", answers: ["1", "2", "3", "4"], correct: 1 },
        { question: "What number is this?", content: "3", answers: ["1", "2", "3", "4"], correct: 2 },
        { question: "What comes after 2?", content: "2 ➡️ ?", answers: ["1", "3", "4", "5"], correct: 1 },
        { question: "Count the stars", content: "⭐⭐⭐", answers: ["2", "3", "4", "5"], correct: 1 },
        { question: "Count the hearts", content: "❤️❤️", answers: ["1", "2", "3", "4"], correct: 1 }
    ],
    colors: [
        { question: "What color is this?", content: "🔴", answers: ["Red", "Blue", "Green", "Yellow"], correct: 0 },
        { question: "What color is this?", content: "🔵", answers: ["Red", "Blue", "Green", "Yellow"], correct: 1 },
        { question: "What color is this?", content: "🟢", answers: ["Red", "Blue", "Green", "Yellow"], correct: 2 },
        { question: "What color is this?", content: "🟡", answers: ["Red", "Blue", "Green", "Yellow"], correct: 3 },
        { question: "What color is the sun?", content: "☀️", answers: ["Red", "Blue", "Green", "Yellow"], correct: 3 },
        { question: "What color is grass?", content: "🌱", answers: ["Red", "Blue", "Green", "Yellow"], correct: 2 }
    ],
    shapes: [
        { question: "What shape is this?", content: "⭕", answers: ["Circle", "Square", "Triangle", "Star"], correct: 0 },
        { question: "What shape is this?", content: "⬜", answers: ["Circle", "Square", "Triangle", "Star"], correct: 1 },
        { question: "What shape is this?", content: "🔺", answers: ["Circle", "Square", "Triangle", "Star"], correct: 2 },
        { question: "What shape is this?", content: "⭐", answers: ["Circle", "Square", "Triangle", "Star"], correct: 3 },
        { question: "What shape is a ball?", content: "⚽", answers: ["Circle", "Square", "Triangle", "Star"], correct: 0 },
        { question: "What shape is a box?", content: "📦", answers: ["Circle", "Square", "Triangle", "Star"], correct: 1 }
    ]
};

// Memory game card sets
const memoryCardSets = {
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    emojis: ['🍎', '🐱', '🐕', '⭐', '🌙', '🌸', '🦋', '🌈', '🎵', '🎨', '🏀', '🚗'],
    shapes: ['⭕', '⬜', '🔺', '💎', '❤️', '⭐', '🌙', '☀️', '🔥', '💧', '🌿', '🎈']
};

// Nursery rhymes data
const nurseryRhymes = [
    {
        title: "ABC Song",
        icon: "🔤",
        lyrics: [
            { text: "A", timing: 0 }, { text: "B", timing: 0.5 }, { text: "C", timing: 1 }, { text: "D", timing: 1.5 },
            { text: "E", timing: 2 }, { text: "F", timing: 2.5 }, { text: "G", timing: 3 },
            { text: "H", timing: 4 }, { text: "I", timing: 4.5 }, { text: "J", timing: 5 }, { text: "K", timing: 5.5 },
            { text: "L", timing: 6 }, { text: "M", timing: 6.5 }, { text: "N", timing: 7 }, { text: "O", timing: 7.5 }, { text: "P", timing: 8 },
            { text: "Q", timing: 9 }, { text: "R", timing: 9.5 }, { text: "S", timing: 10 }, { text: "T", timing: 10.5 }, { text: "U", timing: 11 }, { text: "V", timing: 11.5 },
            { text: "W", timing: 12.5 }, { text: "X", timing: 13 }, { text: "Y", timing: 13.5 }, { text: "and", timing: 14 }, { text: "Z", timing: 14.5 },
            { text: "Now", timing: 16 }, { text: "I", timing: 16.5 }, { text: "know", timing: 17 }, { text: "my", timing: 17.5 }, { text: "ABC's", timing: 18 },
            { text: "Next", timing: 19.5 }, { text: "time", timing: 20 }, { text: "won't", timing: 20.5 }, { text: "you", timing: 21 }, { text: "sing", timing: 21.5 }, { text: "with", timing: 22 }, { text: "me?", timing: 22.5 }
        ],
        animations: ["🔤", "📚", "✏️", "🎵"],
        duration: 24,
        key: "C",
        tempo: 120,
        chords: [
            { chord: [261.63, 329.63, 392.00], timing: 0, duration: 4 }, // C major
            { chord: [293.66, 369.99, 440.00], timing: 4, duration: 4 }, // D minor
            { chord: [329.63, 415.30, 493.88], timing: 8, duration: 4 }, // E minor
            { chord: [261.63, 329.63, 392.00], timing: 12, duration: 4 }, // C major
            { chord: [349.23, 440.00, 523.25], timing: 16, duration: 4 }, // F major
            { chord: [261.63, 329.63, 392.00], timing: 20, duration: 4 }  // C major
        ],
        melody: [
            { note: 261.63, timing: 0, duration: 0.4 }, // C
            { note: 261.63, timing: 0.5, duration: 0.4 }, // C
            { note: 392.00, timing: 1, duration: 0.4 }, // G
            { note: 392.00, timing: 1.5, duration: 0.4 }, // G
            { note: 440.00, timing: 2, duration: 0.4 }, // A
            { note: 440.00, timing: 2.5, duration: 0.4 }, // A
            { note: 392.00, timing: 3, duration: 0.8 }   // G
        ]
    },
    {
        title: "Twinkle Twinkle",
        icon: "⭐",
        lyrics: [
            { text: "Twinkle", timing: 0 }, { text: "twinkle", timing: 0.8 }, { text: "little", timing: 1.6 }, { text: "star", timing: 2.4 },
            { text: "How", timing: 3.5 }, { text: "I", timing: 4 }, { text: "wonder", timing: 4.5 }, { text: "what", timing: 5.2 }, { text: "you", timing: 5.8 }, { text: "are", timing: 6.4 },
            { text: "Up", timing: 7.5 }, { text: "above", timing: 8 }, { text: "the", timing: 8.6 }, { text: "world", timing: 9.2 }, { text: "so", timing: 9.8 }, { text: "high", timing: 10.4 },
            { text: "Like", timing: 11.5 }, { text: "a", timing: 12 }, { text: "diamond", timing: 12.5 }, { text: "in", timing: 13.2 }, { text: "the", timing: 13.7 }, { text: "sky", timing: 14.3 },
            { text: "Twinkle", timing: 15.5 }, { text: "twinkle", timing: 16.3 }, { text: "little", timing: 17.1 }, { text: "star", timing: 17.9 },
            { text: "How", timing: 19 }, { text: "I", timing: 19.5 }, { text: "wonder", timing: 20 }, { text: "what", timing: 20.7 }, { text: "you", timing: 21.3 }, { text: "are", timing: 21.9 }
        ],
        animations: ["⭐", "🌙", "✨", "🌟"],
        duration: 23,
        key: "C",
        tempo: 100,
        chords: [
            { chord: [261.63, 329.63, 392.00], timing: 0, duration: 4 }, // C major
            { chord: [349.23, 440.00, 523.25], timing: 4, duration: 4 }, // F major
            { chord: [261.63, 329.63, 392.00], timing: 8, duration: 4 }, // C major
            { chord: [392.00, 493.88, 587.33], timing: 12, duration: 4 }, // G major
            { chord: [261.63, 329.63, 392.00], timing: 16, duration: 4 }, // C major
            { chord: [349.23, 440.00, 523.25], timing: 20, duration: 3 }  // F major
        ],
        melody: [
            { note: 261.63, timing: 0, duration: 0.7 },    // Twinkle
            { note: 261.63, timing: 0.8, duration: 0.7 },  // twinkle
            { note: 392.00, timing: 1.6, duration: 0.7 },  // little
            { note: 392.00, timing: 2.4, duration: 1.0 }   // star
        ]
    },
    {
        title: "Old MacDonald",
        icon: "🚜",
        lyrics: [
            { text: "Old", timing: 0 }, { text: "MacDonald", timing: 0.6 }, { text: "had", timing: 1.4 }, { text: "a", timing: 1.8 }, { text: "farm", timing: 2.2 },
            { text: "E-I-E-I-O", timing: 3.5 },
            { text: "And", timing: 5 }, { text: "on", timing: 5.4 }, { text: "his", timing: 5.8 }, { text: "farm", timing: 6.2 }, { text: "he", timing: 6.8 }, { text: "had", timing: 7.2 }, { text: "a", timing: 7.6 }, { text: "cow", timing: 8 },
            { text: "E-I-E-I-O", timing: 9.5 },
            { text: "With", timing: 11 }, { text: "a", timing: 11.4 }, { text: "moo", timing: 11.8 }, { text: "moo", timing: 12.4 }, { text: "here", timing: 13 },
            { text: "And", timing: 13.8 }, { text: "a", timing: 14.2 }, { text: "moo", timing: 14.6 }, { text: "moo", timing: 15.2 }, { text: "there", timing: 15.8 },
            { text: "Here", timing: 16.8 }, { text: "a", timing: 17.2 }, { text: "moo", timing: 17.5 }, { text: "there", timing: 18 }, { text: "a", timing: 18.4 }, { text: "moo", timing: 18.7 },
            { text: "Everywhere", timing: 19.2 }, { text: "a", timing: 20 }, { text: "moo", timing: 20.3 }, { text: "moo", timing: 20.8 },
            { text: "Old", timing: 21.8 }, { text: "MacDonald", timing: 22.4 }, { text: "had", timing: 23.2 }, { text: "a", timing: 23.6 }, { text: "farm", timing: 24 },
            { text: "E-I-E-I-O", timing: 25.5 }
        ],
        animations: ["🚜", "🐄", "🐷", "🐔"],
        duration: 27
    },
    {
        title: "Baa Baa Black Sheep",
        icon: "🐑",
        lyrics: [
            { text: "Baa", timing: 0 }, { text: "baa", timing: 0.6 }, { text: "black", timing: 1.2 }, { text: "sheep", timing: 1.8 },
            { text: "Have", timing: 2.8 }, { text: "you", timing: 3.2 }, { text: "any", timing: 3.6 }, { text: "wool?", timing: 4.2 },
            { text: "Yes", timing: 5.5 }, { text: "sir", timing: 6 }, { text: "yes", timing: 6.5 }, { text: "sir", timing: 7 },
            { text: "Three", timing: 7.8 }, { text: "bags", timing: 8.4 }, { text: "full", timing: 9 },
            { text: "One", timing: 10.5 }, { text: "for", timing: 11 }, { text: "my", timing: 11.4 }, { text: "master", timing: 11.8 },
            { text: "One", timing: 13 }, { text: "for", timing: 13.4 }, { text: "my", timing: 13.8 }, { text: "dame", timing: 14.2 },
            { text: "And", timing: 15.5 }, { text: "one", timing: 16 }, { text: "for", timing: 16.4 }, { text: "the", timing: 16.8 }, { text: "little", timing: 17.2 }, { text: "boy", timing: 17.8 },
            { text: "Who", timing: 18.8 }, { text: "lives", timing: 19.2 }, { text: "down", timing: 19.6 }, { text: "the", timing: 20 }, { text: "lane", timing: 20.4 }
        ],
        animations: ["🐑", "🧶", "👨‍🌾", "🏠"],
        duration: 22
    },
    {
        title: "If You're Happy",
        icon: "😊",
        lyrics: [
            { text: "If", timing: 0 }, { text: "you're", timing: 0.4 }, { text: "happy", timing: 0.8 }, { text: "and", timing: 1.4 }, { text: "you", timing: 1.7 }, { text: "know", timing: 2 }, { text: "it", timing: 2.4 },
            { text: "clap", timing: 2.8 }, { text: "your", timing: 3.2 }, { text: "hands", timing: 3.6 },
            { text: "👏", timing: 4.2 }, { text: "👏", timing: 4.6 },
            { text: "If", timing: 5.5 }, { text: "you're", timing: 5.9 }, { text: "happy", timing: 6.3 }, { text: "and", timing: 6.9 }, { text: "you", timing: 7.2 }, { text: "know", timing: 7.5 }, { text: "it", timing: 7.9 },
            { text: "clap", timing: 8.3 }, { text: "your", timing: 8.7 }, { text: "hands", timing: 9.1 },
            { text: "👏", timing: 9.7 }, { text: "👏", timing: 10.1 },
            { text: "If", timing: 11 }, { text: "you're", timing: 11.4 }, { text: "happy", timing: 11.8 }, { text: "and", timing: 12.4 }, { text: "you", timing: 12.7 }, { text: "know", timing: 13 }, { text: "it", timing: 13.4 },
            { text: "then", timing: 14 }, { text: "your", timing: 14.4 }, { text: "face", timing: 14.8 }, { text: "will", timing: 15.4 }, { text: "surely", timing: 15.8 }, { text: "show", timing: 16.4 }, { text: "it", timing: 16.9 },
            { text: "If", timing: 17.8 }, { text: "you're", timing: 18.2 }, { text: "happy", timing: 18.6 }, { text: "and", timing: 19.2 }, { text: "you", timing: 19.5 }, { text: "know", timing: 19.8 }, { text: "it", timing: 20.2 },
            { text: "clap", timing: 20.6 }, { text: "your", timing: 21 }, { text: "hands", timing: 21.4 },
            { text: "👏", timing: 22 }, { text: "👏", timing: 22.4 }
        ],
        animations: ["😊", "👏", "🎉", "😄"],
        duration: 24
    },
    {
        title: "Row Row Row Your Boat",
        icon: "🚣",
        lyrics: [
            { text: "Row", timing: 0 }, { text: "row", timing: 0.6 }, { text: "row", timing: 1.2 }, { text: "your", timing: 1.8 }, { text: "boat", timing: 2.4 },
            { text: "Gently", timing: 3.5 }, { text: "down", timing: 4.1 }, { text: "the", timing: 4.7 }, { text: "stream", timing: 5.3 },
            { text: "Merrily", timing: 6.8 }, { text: "merrily", timing: 7.6 }, { text: "merrily", timing: 8.4 }, { text: "merrily", timing: 9.2 },
            { text: "Life", timing: 10.2 }, { text: "is", timing: 10.6 }, { text: "but", timing: 11 }, { text: "a", timing: 11.4 }, { text: "dream", timing: 11.8 },
            { text: "Row", timing: 13.5 }, { text: "row", timing: 14.1 }, { text: "row", timing: 14.7 }, { text: "your", timing: 15.3 }, { text: "boat", timing: 15.9 },
            { text: "Gently", timing: 17 }, { text: "down", timing: 17.6 }, { text: "the", timing: 18.2 }, { text: "stream", timing: 18.8 },
            { text: "Merrily", timing: 20.3 }, { text: "merrily", timing: 21.1 }, { text: "merrily", timing: 21.9 }, { text: "merrily", timing: 22.7 },
            { text: "Life", timing: 23.7 }, { text: "is", timing: 24.1 }, { text: "but", timing: 24.5 }, { text: "a", timing: 24.9 }, { text: "dream", timing: 25.3 }
        ],
        animations: ["🚣", "🌊", "⛵", "🌈"],
        duration: 27,
        key: "C",
        tempo: 90,
        chords: [
            { chord: [261.63, 329.63, 392.00], timing: 0, duration: 6 }, // C major
            { chord: [392.00, 493.88, 587.33], timing: 6, duration: 6 }, // G major
            { chord: [261.63, 329.63, 392.00], timing: 12, duration: 6 }, // C major
            { chord: [349.23, 440.00, 523.25], timing: 18, duration: 4 }, // F major
            { chord: [261.63, 329.63, 392.00], timing: 22, duration: 5 }  // C major
        ],
        melody: [
            { note: 261.63, timing: 0, duration: 0.5 },    // Row
            { note: 293.66, timing: 0.6, duration: 0.5 },  // row
            { note: 329.63, timing: 1.2, duration: 0.5 },  // row
            { note: 349.23, timing: 1.8, duration: 0.5 },  // your
            { note: 392.00, timing: 2.4, duration: 1.0 },  // boat
            { note: 392.00, timing: 3.5, duration: 0.5 },  // Gently
            { note: 349.23, timing: 4.1, duration: 0.5 },  // down
            { note: 329.63, timing: 4.7, duration: 0.5 },  // the
            { note: 293.66, timing: 5.3, duration: 1.4 }   // stream
        ]
    }
];

// Drawing templates and coloring pages data
const drawingTemplates = {
    letters: [
        { name: 'Letter A', data: 'A' },
        { name: 'Letter B', data: 'B' },
        { name: 'Letter C', data: 'C' },
        { name: 'Letter D', data: 'D' },
        { name: 'Letter E', data: 'E' }
    ],
    numbers: [
        { name: 'Number 1', data: '1' },
        { name: 'Number 2', data: '2' },
        { name: 'Number 3', data: '3' },
        { name: 'Number 4', data: '4' },
        { name: 'Number 5', data: '5' }
    ],
    shapes: [
        { name: 'Circle', shape: 'circle' },
        { name: 'Square', shape: 'square' },
        { name: 'Triangle', shape: 'triangle' },
        { name: 'Star', shape: 'star' },
        { name: 'Heart', shape: 'heart' }
    ]
};

const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a6f',
    '#2c2c54', '#40407a', '#706fd3', '#f0932b', '#eb4d4b', '#6ab04c'
];

const stickers = ['🌟', '⭐', '🎈', '🎉', '❤️', '💙', '💚', '💛', '🦋', '🌈', '☀️', '🌙', '⚽', '🎨', '🎵', '🍎'];

// Interactive Storybooks data
const interactiveStories = [
    {
        id: 'three-bears',
        title: 'Goldilocks and the Three Bears',
        cover: '🐻',
        description: 'A curious little girl discovers a house in the woods',
        pages: [
            {
                text: "Once upon a time, there was a little girl named Goldilocks. She had beautiful golden hair and loved to explore.",
                scene: {
                    background: '#87CEEB',
                    elements: [
                        { type: 'emoji', content: '👧', x: 40, y: 60, size: 60, clickable: true, sound: 'Hello! I\'m Goldilocks!' },
                        { type: 'emoji', content: '🌳', x: 20, y: 70, size: 40, clickable: true, sound: 'What a beautiful forest!' },
                        { type: 'emoji', content: '🌳', x: 80, y: 65, size: 45, clickable: true, sound: 'So many trees to explore!' },
                        { type: 'emoji', content: '🌸', x: 60, y: 80, size: 25, clickable: true, sound: 'Pretty flowers!' }
                    ]
                }
            },
            {
                text: "While walking through the forest, Goldilocks found a cozy little house. She knocked on the door, but nobody answered.",
                scene: {
                    background: '#90EE90',
                    elements: [
                        { type: 'emoji', content: '🏠', x: 50, y: 45, size: 80, clickable: true, sound: 'What a lovely house!' },
                        { type: 'emoji', content: '👧', x: 25, y: 65, size: 50, clickable: true, sound: 'Hello? Is anyone home?' },
                        { type: 'emoji', content: '🚪', x: 50, y: 60, size: 30, clickable: true, sound: 'Knock knock!' },
                        { type: 'emoji', content: '🌲', x: 15, y: 75, size: 35, clickable: true, sound: 'Tall pine trees!' },
                        { type: 'emoji', content: '🌲', x: 85, y: 70, size: 40, clickable: true, sound: 'Forest sounds!' }
                    ]
                }
            },
            {
                text: "Inside, Goldilocks saw three bowls of porridge on the table. One big bowl, one medium bowl, and one small bowl.",
                scene: {
                    background: '#F5DEB3',
                    elements: [
                        { type: 'emoji', content: '🥣', x: 25, y: 50, size: 60, clickable: true, sound: 'Papa Bear\'s big bowl!' },
                        { type: 'emoji', content: '🥣', x: 50, y: 50, size: 45, clickable: true, sound: 'Mama Bear\'s medium bowl!' },
                        { type: 'emoji', content: '🥣', x: 75, y: 50, size: 30, clickable: true, sound: 'Baby Bear\'s small bowl!' },
                        { type: 'emoji', content: '👧', x: 50, y: 75, size: 50, clickable: true, sound: 'Mmm, this porridge smells good!' },
                        { type: 'emoji', content: '🪑', x: 25, y: 70, size: 35, clickable: true, sound: 'A big chair!' },
                        { type: 'emoji', content: '🪑', x: 75, y: 70, size: 25, clickable: true, sound: 'A small chair!' }
                    ]
                }
            },
            {
                text: "After eating, Goldilocks felt sleepy. She found three beds upstairs. The small bed was just right!",
                scene: {
                    background: '#E6E6FA',
                    elements: [
                        { type: 'emoji', content: '🛏️', x: 25, y: 40, size: 60, clickable: true, sound: 'Papa Bear\'s big bed!' },
                        { type: 'emoji', content: '🛏️', x: 50, y: 45, size: 45, clickable: true, sound: 'Mama Bear\'s medium bed!' },
                        { type: 'emoji', content: '🛏️', x: 75, y: 50, size: 30, clickable: true, sound: 'Baby Bear\'s cozy bed!' },
                        { type: 'emoji', content: '👧', x: 75, y: 65, size: 40, clickable: true, sound: 'Zzz... so comfortable!' },
                        { type: 'emoji', content: '🌙', x: 15, y: 20, size: 35, clickable: true, sound: 'Sleepy time!' },
                        { type: 'emoji', content: '⭐', x: 85, y: 25, size: 25, clickable: true, sound: 'Twinkle twinkle!' }
                    ]
                }
            },
            {
                text: "Suddenly, the three bears came home! Goldilocks woke up and saw them. She jumped out of bed and ran home safely. The end!",
                scene: {
                    background: '#FFB6C1',
                    elements: [
                        { type: 'emoji', content: '🐻', x: 20, y: 60, size: 60, clickable: true, sound: 'Papa Bear says: Someone\'s been here!' },
                        { type: 'emoji', content: '🐻', x: 50, y: 65, size: 45, clickable: true, sound: 'Mama Bear says: Who ate our porridge?' },
                        { type: 'emoji', content: '🐻', x: 80, y: 70, size: 30, clickable: true, sound: 'Baby Bear says: Someone slept in my bed!' },
                        { type: 'emoji', content: '👧', x: 15, y: 40, size: 40, clickable: true, sound: 'Oh my! I better go home!' },
                        { type: 'emoji', content: '🏃‍♀️', x: 85, y: 40, size: 35, clickable: true, sound: 'Running home safely!' },
                        { type: 'emoji', content: '🏠', x: 85, y: 15, size: 30, clickable: true, sound: 'Home sweet home!' }
                    ]
                }
            }
        ]
    },
    {
        id: 'little-duck',
        title: 'The Little Yellow Duck',
        cover: '🦆',
        description: 'A little duck goes on an adventure at the pond',
        pages: [
            {
                text: "Once there was a little yellow duck who lived by a beautiful blue pond with her family.",
                scene: {
                    background: '#ADD8E6',
                    elements: [
                        { type: 'emoji', content: '🦆', x: 50, y: 60, size: 50, clickable: true, sound: 'Quack quack! I\'m a little duck!' },
                        { type: 'emoji', content: '🦆', x: 30, y: 65, size: 40, clickable: true, sound: 'Mama Duck says hello!' },
                        { type: 'emoji', content: '🦆', x: 70, y: 65, size: 40, clickable: true, sound: 'Papa Duck says quack!' },
                        { type: 'emoji', content: '💧', x: 25, y: 80, size: 25, clickable: true, sound: 'Splash splash!' },
                        { type: 'emoji', content: '💧', x: 75, y: 80, size: 25, clickable: true, sound: 'Water drops!' },
                        { type: 'emoji', content: '🌊', x: 50, y: 85, size: 60, clickable: true, sound: 'Gentle waves!' }
                    ]
                }
            },
            {
                text: "The little duck loved to swim and play in the water. She splashed and paddled all around the pond.",
                scene: {
                    background: '#87CEEB',
                    elements: [
                        { type: 'emoji', content: '🦆', x: 45, y: 50, size: 55, clickable: true, sound: 'Swimming is so much fun!' },
                        { type: 'emoji', content: '💦', x: 30, y: 60, size: 30, clickable: true, sound: 'Splash!' },
                        { type: 'emoji', content: '💦', x: 70, y: 60, size: 30, clickable: true, sound: 'Splish!' },
                        { type: 'emoji', content: '🐸', x: 20, y: 70, size: 35, clickable: true, sound: 'Ribbit! Hello duck!' },
                        { type: 'emoji', content: '🐟', x: 80, y: 75, size: 30, clickable: true, sound: 'Blub blub! I\'m a fish!' },
                        { type: 'emoji', content: '🌸', x: 15, y: 40, size: 25, clickable: true, sound: 'Pretty pond flowers!' }
                    ]
                }
            },
            {
                text: "One day, the little duck saw a beautiful butterfly. She followed it around the garden, curious and excited.",
                scene: {
                    background: '#98FB98',
                    elements: [
                        { type: 'emoji', content: '🦆', x: 40, y: 65, size: 50, clickable: true, sound: 'Where is that butterfly going?' },
                        { type: 'emoji', content: '🦋', x: 65, y: 35, size: 40, clickable: true, sound: 'Flutter flutter! Follow me!' },
                        { type: 'emoji', content: '🌷', x: 25, y: 75, size: 35, clickable: true, sound: 'Beautiful tulips!' },
                        { type: 'emoji', content: '🌼', x: 75, y: 70, size: 30, clickable: true, sound: 'Daisy flowers!' },
                        { type: 'emoji', content: '🌿', x: 15, y: 60, size: 25, clickable: true, sound: 'Green grass!' },
                        { type: 'emoji', content: '🐛', x: 85, y: 80, size: 20, clickable: true, sound: 'A little caterpillar!' }
                    ]
                }
            },
            {
                text: "The duck made new friends! She met a friendly frog, a colorful fish, and a busy bee. They all played together.",
                scene: {
                    background: '#F0E68C',
                    elements: [
                        { type: 'emoji', content: '🦆', x: 50, y: 50, size: 50, clickable: true, sound: 'I love having friends!' },
                        { type: 'emoji', content: '🐸', x: 30, y: 65, size: 40, clickable: true, sound: 'Ribbit! Let\'s be friends!' },
                        { type: 'emoji', content: '🐟', x: 70, y: 70, size: 35, clickable: true, sound: 'Swimming is fun together!' },
                        { type: 'emoji', content: '🐝', x: 60, y: 30, size: 30, clickable: true, sound: 'Buzz buzz! Happy bee!' },
                        { type: 'emoji', content: '🌻', x: 20, y: 40, size: 40, clickable: true, sound: 'Sunny sunflower!' },
                        { type: 'emoji', content: '🎵', x: 80, y: 45, size: 25, clickable: true, sound: 'Music and fun!' }
                    ]
                }
            },
            {
                text: "When the sun began to set, the little duck swam back to her family. She was happy and tired after her big adventure!",
                scene: {
                    background: '#FFA07A',
                    elements: [
                        { type: 'emoji', content: '🦆', x: 45, y: 60, size: 50, clickable: true, sound: 'Home with my family!' },
                        { type: 'emoji', content: '🦆', x: 25, y: 65, size: 40, clickable: true, sound: 'Welcome home, little one!' },
                        { type: 'emoji', content: '🦆', x: 65, y: 65, size: 40, clickable: true, sound: 'We missed you!' },
                        { type: 'emoji', content: '🌅', x: 50, y: 25, size: 60, clickable: true, sound: 'Beautiful sunset!' },
                        { type: 'emoji', content: '💤', x: 70, y: 40, size: 30, clickable: true, sound: 'Time for sleepy duck!' },
                        { type: 'emoji', content: '❤️', x: 30, y: 40, size: 25, clickable: true, sound: 'Love and family!' }
                    ]
                }
            }
        ]
    },
    {
        id: 'rainbow-day',
        title: 'The Rainbow Day',
        cover: '🌈',
        description: 'A magical day when colors come to life',
        pages: [
            {
                text: "It was a rainy morning, but then something magical happened! A beautiful rainbow appeared in the sky.",
                scene: {
                    background: '#E0E0E0',
                    elements: [
                        { type: 'emoji', content: '🌈', x: 50, y: 30, size: 80, clickable: true, sound: 'Look at all the beautiful colors!' },
                        { type: 'emoji', content: '🌧️', x: 20, y: 60, size: 40, clickable: true, sound: 'Pitter patter rain!' },
                        { type: 'emoji', content: '☀️', x: 80, y: 60, size: 45, clickable: true, sound: 'Sunshine after rain!' },
                        { type: 'emoji', content: '👧', x: 45, y: 75, size: 40, clickable: true, sound: 'Wow! A rainbow!' },
                        { type: 'emoji', content: '💧', x: 15, y: 80, size: 20, clickable: true, sound: 'Drip drop!' },
                        { type: 'emoji', content: '🌤️', x: 30, y: 45, size: 35, clickable: true, sound: 'Partly cloudy!' }
                    ]
                }
            },
            {
                text: "The red color jumped down from the rainbow and became a shiny red apple and a fire truck!",
                scene: {
                    background: '#FFE4E1',
                    elements: [
                        { type: 'emoji', content: '🍎', x: 35, y: 50, size: 50, clickable: true, sound: 'I\'m a red apple! Crunch crunch!' },
                        { type: 'emoji', content: '🚒', x: 65, y: 60, size: 45, clickable: true, sound: 'Fire truck coming through!' },
                        { type: 'emoji', content: '❤️', x: 50, y: 30, size: 40, clickable: true, sound: 'Red is the color of love!' },
                        { type: 'emoji', content: '🌹', x: 20, y: 70, size: 35, clickable: true, sound: 'Beautiful red rose!' },
                        { type: 'emoji', content: '🎈', x: 80, y: 35, size: 30, clickable: true, sound: 'Red balloon floating!' },
                        { type: 'emoji', content: '🍓', x: 15, y: 45, size: 25, clickable: true, sound: 'Sweet strawberry!' }
                    ]
                }
            },
            {
                text: "Then the blue color came down and turned into the ocean, blueberries, and a beautiful blue bird!",
                scene: {
                    background: '#E6F3FF',
                    elements: [
                        { type: 'emoji', content: '🌊', x: 50, y: 70, size: 70, clickable: true, sound: 'Blue ocean waves!' },
                        { type: 'emoji', content: '🫐', x: 30, y: 45, size: 40, clickable: true, sound: 'Tasty blueberries!' },
                        { type: 'emoji', content: '🐦', x: 70, y: 40, size: 45, clickable: true, sound: 'Tweet tweet! Blue bird singing!' },
                        { type: 'emoji', content: '💎', x: 25, y: 25, size: 35, clickable: true, sound: 'Sparkling blue gem!' },
                        { type: 'emoji', content: '🦋', x: 75, y: 25, size: 30, clickable: true, sound: 'Blue butterfly dancing!' },
                        { type: 'emoji', content: '🐋', x: 45, y: 60, size: 40, clickable: true, sound: 'Blue whale swimming!' }
                    ]
                }
            },
            {
                text: "The yellow color bounced down and became the bright sun, a happy banana, and golden stars!",
                scene: {
                    background: '#FFFACD',
                    elements: [
                        { type: 'emoji', content: '☀️', x: 50, y: 30, size: 60, clickable: true, sound: 'Bright yellow sunshine!' },
                        { type: 'emoji', content: '🍌', x: 30, y: 60, size: 45, clickable: true, sound: 'Yummy yellow banana!' },
                        { type: 'emoji', content: '⭐', x: 70, y: 50, size: 40, clickable: true, sound: 'Twinkling yellow star!' },
                        { type: 'emoji', content: '🌻', x: 20, y: 40, size: 50, clickable: true, sound: 'Happy sunflower!' },
                        { type: 'emoji', content: '🐤', x: 75, y: 70, size: 35, clickable: true, sound: 'Little yellow chick!' },
                        { type: 'emoji', content: '🧀', x: 15, y: 75, size: 30, clickable: true, sound: 'Yellow cheese!' }
                    ]
                }
            },
            {
                text: "All the colors danced together and created the most beautiful day ever! The little girl smiled and played with all the colorful friends.",
                scene: {
                    background: '#F0F8FF',
                    elements: [
                        { type: 'emoji', content: '👧', x: 50, y: 60, size: 50, clickable: true, sound: 'This is the best day ever!' },
                        { type: 'emoji', content: '🌈', x: 50, y: 25, size: 70, clickable: true, sound: 'Rainbow magic everywhere!' },
                        { type: 'emoji', content: '🎨', x: 25, y: 50, size: 40, clickable: true, sound: 'Colors are amazing!' },
                        { type: 'emoji', content: '🦋', x: 75, y: 45, size: 35, clickable: true, sound: 'Dancing with colors!' },
                        { type: 'emoji', content: '🌸', x: 30, y: 75, size: 30, clickable: true, sound: 'Colorful flowers blooming!' },
                        { type: 'emoji', content: '✨', x: 70, y: 75, size: 25, clickable: true, sound: 'Magical sparkles!' }
                    ]
                }
            }
        ]
    }
];

// Achievement System
let achievements = {
    'first_letter': { icon: '🔤', title: 'First Letter!', description: 'Clicked your first letter', unlocked: false },
    'alphabet_explorer': { icon: '🗺️', title: 'Alphabet Explorer', description: 'Visited all letter sections', unlocked: false },
    'clicking_spree': { icon: '⚡', title: 'Clicking Spree', description: 'Clicked 20 letters', unlocked: false },
    'language_learner': { icon: '🌍', title: 'Language Learner', description: 'Tried Bengali and Arabic', unlocked: false },
    'artist': { icon: '🎨', title: 'Artist', description: 'Used the drawing section', unlocked: false },
    'singer': { icon: '🎵', title: 'Singer', description: 'Played a nursery rhyme', unlocked: false },
    'color_mixer': { icon: '🌈', title: 'Color Mixer', description: 'Mixed your first color', unlocked: false },
    'persistent': { icon: '💪', title: 'Persistent', description: '10 minutes of learning', unlocked: false },
    'speed_demon': { icon: '🏃', title: 'Speed Demon', description: 'Clicked 10 letters in 30 seconds', unlocked: false },
    'completionist': { icon: '🏆', title: 'Completionist', description: 'Unlocked all achievements', unlocked: false }
};

let userStats = {
    lettersClicked: 0,
    sectionsVisited: new Set(),
    startTime: Date.now(),
    lastClickTime: 0,
    fastClicks: 0,
    colorsLearned: new Set()
};

function initializeAchievements() {
    const achievementPanel = document.getElementById('achievementPanel');
    const achievementList = document.getElementById('achievementList');

    // Create achievement items
    Object.keys(achievements).forEach(key => {
        const achievement = achievements[key];
        const item = document.createElement('div');
        item.className = 'achievement-item';
        item.innerHTML = `
            <span class="icon">${achievement.icon}</span>
            <div class="text">
                <div class="title">${achievement.title}</div>
                <div class="description">${achievement.description}</div>
            </div>
        `;
        achievementList.appendChild(item);
    });

    // Show panel on hover
    achievementPanel.addEventListener('mouseenter', () => {
        achievementPanel.classList.add('show');
    });

    achievementPanel.addEventListener('mouseleave', () => {
        achievementPanel.classList.remove('show');
    });

    updateProgressBar();
}

function unlockAchievement(key) {
    if (achievements[key] && !achievements[key].unlocked) {
        achievements[key].unlocked = true;
        showAchievementNotification(achievements[key]);
        updateAchievementDisplay(key);
        updateProgressBar();
        triggerHapticFeedback('success');

        // Check for completionist achievement
        const totalAchievements = Object.keys(achievements).length - 1; // Exclude completionist
        const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
        if (unlockedCount === totalAchievements && !achievements['completionist'].unlocked) {
            setTimeout(() => unlockAchievement('completionist'), 1000);
        }
    }
}

function showAchievementNotification(achievement) {
    const notification = document.getElementById('achievementNotification');
    const title = notification.querySelector('.achievement-title');
    const description = notification.querySelector('.achievement-description');

    title.textContent = achievement.title;
    description.textContent = achievement.description;

    notification.classList.add('show');

    // Create extra celebration particles
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            createParticleExplosion(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight * 0.5,
                'star',
                5
            );
        }, i * 100);
    }

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function updateAchievementDisplay(key) {
    const achievementItems = document.querySelectorAll('.achievement-item');
    const keys = Object.keys(achievements);
    const index = keys.indexOf(key);

    if (index >= 0 && achievementItems[index]) {
        achievementItems[index].classList.add('unlocked');
    }
}

function updateProgressBar() {
    const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
    const totalCount = Object.keys(achievements).length;
    const percentage = (unlockedCount / totalCount) * 100;

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = percentage + '%';
    progressText.textContent = `${unlockedCount}/${totalCount}`;
}

function trackLetterClick() {
    userStats.lettersClicked++;
    userStats.sectionsVisited.add(currentSection);

    // Check achievements
    if (userStats.lettersClicked === 1) {
        unlockAchievement('first_letter');
    }

    if (userStats.lettersClicked === 20) {
        unlockAchievement('clicking_spree');
    }

    if (userStats.sectionsVisited.has('alphabet') && 
        userStats.sectionsVisited.has('lowercase') && 
        userStats.sectionsVisited.has('phonics')) {
        unlockAchievement('alphabet_explorer');
    }

    if (userStats.sectionsVisited.has('bangla') && 
        userStats.sectionsVisited.has('arabic')) {
        unlockAchievement('language_learner');
    }

    // Speed demon achievement
    const now = Date.now();
    if (now - userStats.lastClickTime < 3000) {
        userStats.fastClicks++;
        if (userStats.fastClicks >= 10) {
            unlockAchievement('speed_demon');
        }
    } else {
        userStats.fastClicks = 1;
    }
    userStats.lastClickTime = now;

    // Persistent achievement (10 minutes)
    if (now - userStats.startTime > 600000) {
        unlockAchievement('persistent');
    }
}

function createFloatingElements() {
    const container = document.getElementById('floatingElements');

    // Create floating bubbles
    for (let i = 0; i < 8; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'floating-bubble';
        bubble.style.width = Math.random() * 40 + 20 + 'px';
        bubble.style.height = bubble.style.width;
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.top = Math.random() * 100 + '%';
        bubble.style.animationDelay = Math.random() * 6 + 's';
        bubble.style.animationDuration = (6 + Math.random() * 4) + 's';
        container.appendChild(bubble);
    }

    // Initialize gesture recognition
    initializeGestureRecognition();
}

// Simple Gesture Recognition
let gestureData = {
    touchStartX: 0,
    touchStartY: 0,
    touchStartTime: 0,
    swipeThreshold: 50,
    tapThreshold: 300
};

function initializeGestureRecognition() {
    const body = document.body;

    // Touch events for mobile
    body.addEventListener('touchstart', handleTouchStart, { passive: true });
    body.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse events for desktop (for testing)
    body.addEventListener('mousedown', handleMouseStart);
    body.addEventListener('mouseup', handleMouseEnd);
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        gestureData.touchStartX = e.touches[0].clientX;
        gestureData.touchStartY = e.touches[0].clientY;
        gestureData.touchStartTime = Date.now();
    }
}

function handleTouchEnd(e) {
    if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();

        const deltaX = touchEndX - gestureData.touchStartX;
        const deltaY = touchEndY - gestureData.touchStartY;
        const deltaTime = touchEndTime - gestureData.touchStartTime;

        if (Math.abs(deltaX) > gestureData.swipeThreshold || Math.abs(deltaY) > gestureData.swipeThreshold) {
            handleSwipe(deltaX, deltaY);
        } else if (deltaTime < gestureData.tapThreshold) {
            handleTap(touchEndX, touchEndY);
        }
    }
}

function handleMouseStart(e) {
    gestureData.touchStartX = e.clientX;
    gestureData.touchStartY = e.clientY;
    gestureData.touchStartTime = Date.now();
}

function handleMouseEnd(e) {
    const deltaX = e.clientX - gestureData.touchStartX;
    const deltaY = e.clientY - gestureData.touchStartY;
    const deltaTime = Date.now() - gestureData.touchStartTime;

    if (Math.abs(deltaX) > gestureData.swipeThreshold || Math.abs(deltaY) > gestureData.swipeThreshold) {
        handleSwipe(deltaX, deltaY);
    } else if (deltaTime < gestureData.tapThreshold) {
        handleTap(e.clientX, e.clientY);
    }
}

function handleSwipe(deltaX, deltaY) {
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            // Swipe right - previous section
            navigateSection('previous');
        } else {
            // Swipe left - next section
            navigateSection('next');
        }
    } else {
        if (deltaY > 0) {
            // Swipe down - show achievements
            document.getElementById('achievementPanel').classList.add('show');
            setTimeout(() => {
                document.getElementById('achievementPanel').classList.remove('show');
            }, 3000);
        } else {
            // Swipe up - trigger celebration
            showCelebration('gesture');
        }
    }

    triggerHapticFeedback('medium');
}

function handleTap(x, y) {
    // Create ripple effect at tap location
    createParticleExplosion(x, y, 'heart', 3);
}

function navigateSection(direction) {
    const sections = ['alphabet', 'lowercase', 'phonics', 'bangla', 'arabic', 'spelling', 'counting', 'quiz', 'memory', 'nursery', 'drawing', 'storybooks'];
    const currentIndex = sections.indexOf(currentSection);

    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % sections.length;
    } else {
        newIndex = (currentIndex - 1 + sections.length) % sections.length;
    }

    showSection(sections[newIndex]);

    // Create transition particle effect
    createParticleExplosion(window.innerWidth / 2, window.innerHeight / 2, 'star', 8);
}

// Enhanced Animation and Particle Effects
function createParticleExplosion(x, y, type = 'star', count = 10) {
    const container = document.getElementById('particleContainer');
    const particles = ['⭐', '💖', '🎉', '✨', '🌟', '💫', '🎊'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = `particle ${type}`;

        if (type === 'confetti') {
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        } else {
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        }

        // Random position around click point
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 100 + Math.random() * 100;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--dx', Math.cos(angle) * velocity + 'px');
        particle.style.setProperty('--dy', Math.sin(angle) * velocity + 'px');

        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

function trigger3DLetterAnimation(element) {
    element.classList.remove('letter-3d');
    setTimeout(() => {
        element.classList.add('letter-3d');
        setTimeout(() => {
            element.classList.remove('letter-3d');
        }, 800);
    }, 10);
}

function triggerHapticFeedback(intensity = 'light') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: [10],
            medium: [20],
            strong: [50],
            success: [10, 50, 10]
        };
        navigator.vibrate(patterns[intensity] || patterns.light);
    }
}

function showCelebration(type = 'success') {
    // Create celebration particles across the screen
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createParticleExplosion(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                Math.random() > 0.5 ? 'star' : 'heart',
                3
            );
        }, i * 100);
    }

    triggerHapticFeedback('success');
}

function enhanceLetterClick(element, letter) {
    // Track for achievements
    trackLetterClick();

    // Add 3D animation
    trigger3DLetterAnimation(element);

    // Haptic feedback
    triggerHapticFeedback('medium');

    // Add temporary rainbow effect
    element.style.animation = 'rainbow 1s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 1000);
}

// Loading sequence
function startLoadingSequence() {
    const loadingBar = document.getElementById('loadingBar');
    let progress = 0;

    const loadingSteps = [
        { text: 'Loading letters...', duration: 500 },
        { text: 'Preparing sounds...', duration: 800 },
        { text: 'Setting up achievements...', duration: 400 },
        { text: 'Creating magic...', duration: 600 },
        { text: 'Almost ready!', duration: 300 }
    ];

    let currentStep = 0;

    function nextStep() {
        if (currentStep < loadingSteps.length) {
            const step = loadingSteps[currentStep];
            progress += 20;
            loadingBar.style.width = progress + '%';

            setTimeout(() => {
                currentStep++;
                nextStep();
            }, step.duration);
        } else {
            // Loading complete
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
            }, 500);
        }
    }

    nextStep();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    startLoadingSequence();
    initSoundPreference();

    setTimeout(() => {
        initializeAchievements();
        createFloatingElements();
        initializeAlphabet();
        initializeLowercase();
        initializePhonics();
        initializeBangla();
        initializeArabic();
        initializeSpelling();
        initializeCounting();
        initializeQuiz();
        initializeMemoryGame();
        initializeNurseryRhymes();
        initializeDrawing();
        showSection('alphabet');
    }, 1000);
});

// Navigation
function showSection(section) {
    const currentActive = document.querySelector('.learning-section.active');
    const targetSection = document.getElementById(section);

    // Check if targetSection exists
    if (!targetSection) {
        console.error(`Section with ID "${section}" not found`);
        return;
    }

    if (currentActive && currentActive !== targetSection) {
        // Add exit animation to current section
        currentActive.classList.add('slide-out-left');

        setTimeout(() => {
            // Remove active class from current section
            currentActive.classList.remove('active', 'slide-out-left');

            // Show and animate new section
            targetSection.classList.add('active');
            targetSection.classList.add('slide-in-right');

            // Remove animation class after animation completes
            setTimeout(() => {
                targetSection.classList.remove('slide-in-right');
            }, 500);

        }, 250);
    } else {
        // First load or same section
        document.querySelectorAll('.learning-section').forEach(sec => {
            sec.classList.remove('active');
        });
        targetSection.classList.add('active');
        targetSection.classList.add('scale-in');
        setTimeout(() => {
            targetSection.classList.remove('scale-in');
        }, 500);
    }

    currentSection = section;

    // Initialize specific sections when shown
    if (section === 'arabic') {
        setTimeout(() => {
            initializeArabic();
        }, 300);
    }

    // Play sound when switching sections
    playSound('click');
}

// Alphabet Section
function initializeAlphabet() {
    const grid = document.getElementById('alphabetGrid');
    grid.innerHTML = '';

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

    // Find the clicked button and enhance it
    const clickedButton = event ? event.target : null;
    if (clickedButton && clickedButton.classList.contains('letter-btn')) {
        enhanceLetterClick(clickedButton, letter);
    }

    // Play letter sound
    playSound('letter');
    speak(`${letter} is for ${alphabetData[letter]}`);
}

// Lowercase Letters Section
function initializeLowercase() {
    const grid = document.getElementById('lowercaseGrid');
    grid.innerHTML = '';

    for (let letter in alphabetData) {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter.toLowerCase();
        btn.onclick = () => showLowercaseLetter(letter.toLowerCase());
        grid.appendChild(btn);
    }
}

function showLowercaseLetter(letter) {
    const uppercaseLetter = letter.toUpperCase();
    document.getElementById('lowercaseBigLetter').textContent = letter;
    document.getElementById('lowercaseLetterWord').textContent = `${letter} is for ${alphabetData[uppercaseLetter].toLowerCase()}`;
    document.getElementById('lowercaseAlphabetImage').src = `images/${letter}.svg`;
    document.getElementById('lowercaseAlphabetImage').alt = alphabetData[uppercaseLetter];

    // Find the clicked button and enhance it
    const clickedButton = event ? event.target : null;
    if (clickedButton && clickedButton.classList.contains('letter-btn')) {
        enhanceLetterClick(clickedButton, letter);
    }

    // Play letter sound
    playSound('letter');
    speak(`${letter} is for ${alphabetData[uppercaseLetter].toLowerCase()}`);
}

// Phonics Section
function initializePhonics() {
    generateConsonantGrid();
    updatePhonicsDisplay();
}

function generateConsonantGrid() {
    const grid = document.getElementById('consonantGrid');
    grid.innerHTML = '';

    phonicsData.consonants.forEach(consonant => {
        const btn = document.createElement('button');
        btn.className = 'consonant-btn';
        btn.textContent = consonant + currentVowel.toLowerCase();
        btn.onclick = () => selectConsonant(consonant);
        grid.appendChild(btn);
    });
}

function selectVowel(vowel) {
    // Update active vowel button
    document.querySelectorAll('.vowel-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-vowel="${vowel}"]`).classList.add('active');

    currentVowel = vowel;
    generateConsonantGrid();
    updatePhonicsDisplay();

    // Play vowel sound
    playSound('click');
    speak(`${vowel.toUpperCase()} ${phonicsData.vowels[vowel].description}`);
}

function selectConsonant(consonant) {
    currentConsonant = consonant;
    updatePhonicsDisplay();

    // Play consonant-vowel combination
    playSound('click');
    const combination = consonant + currentVowel.toLowerCase();
    speak(`${consonant} ${phonicsData.consonantSounds[consonant]} with ${currentVowel.toUpperCase()} ${phonicsData.vowels[currentVowel].sound} makes ${combination}`);
}

function updatePhonicsDisplay() {
    const combination = currentConsonant + currentVowel.toLowerCase();
    document.getElementById('currentSound').textContent = combination;

    const description = `${currentConsonant} makes "${phonicsData.consonantSounds[currentConsonant]}" sound with ${currentVowel.toUpperCase()} makes "${phonicsData.vowels[currentVowel].sound}" = "${combination}"`;
    document.getElementById('soundDescription').textContent = description;
}

function playCurrentSound() {
    const combination = currentConsonant + currentVowel.toLowerCase();
    playSound('letter');
    speak(combination, 0.8); // Slower speech for pronunciation
}

function startPhonicsGame() {
    phonicsGameActive = true;
    document.getElementById('phonicsGame').style.display = 'block';
    generatePhonicsQuestion();
}

function generatePhonicsQuestion() {
    // Pick a random consonant and vowel
    const randomConsonant = phonicsData.consonants[Math.floor(Math.random() * phonicsData.consonants.length)];
    const randomVowel = Object.keys(phonicsData.vowels)[Math.floor(Math.random() * 5)];
    const correctAnswer = randomConsonant + randomVowel;

    document.getElementById('gameQuestion').textContent = `Find "${correctAnswer}"`;

    // Generate 4 options including the correct answer
    const options = [correctAnswer];
    while (options.length < 4) {
        const randomC = phonicsData.consonants[Math.floor(Math.random() * phonicsData.consonants.length)];
        const randomV = Object.keys(phonicsData.vowels)[Math.floor(Math.random() * 5)];
        const option = randomC + randomV;
        if (!options.includes(option)) {
            options.push(option);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Create option buttons
    const optionsContainer = document.getElementById('soundOptions');
    optionsContainer.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkPhonicsAnswer(option, correctAnswer, btn);
        optionsContainer.appendChild(btn);
    });

    // Speak the question
    speak(`Find ${correctAnswer}`);
}

function checkPhonicsAnswer(selected, correct, button) {
    if (selected === correct) {
        button.classList.add('correct');
        phonicsScore++;
        playSound('success');
        speak('Correct! Great job!');

        setTimeout(() => {
            generatePhonicsQuestion();
        }, 1500);
    } else {
        button.classList.add('wrong');
        playSound('error');
        speak(`Not quite! The answer is ${correct}`);

        // Highlight correct answer
        setTimeout(() => {
            const correctBtn = Array.from(document.querySelectorAll('.option-btn'))
                .find(btn => btn.textContent === correct);
            if (correctBtn) correctBtn.classList.add('correct');
        }, 500);

        setTimeout(() => {
            generatePhonicsQuestion();
        }, 2500);
    }

    document.getElementById('phonicsScore').textContent = phonicsScore;

    // Disable all buttons temporarily
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        setTimeout(() => btn.disabled = false, 1500);
    });
}

// Bangla Letters Section
function initializeBangla() {
    generateBanglaGrid();
    updateBanglaDisplay();
}

function selectBanglaCategory(category) {
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    currentBanglaCategory = category;
    currentBanglaLetter = category === 'vowels' ? 'অ' : 'ক';
    generateBanglaGrid();
    updateBanglaDisplay();

    playSound('click');
    // const categoryName = category === 'vowels' ? 'স্বরবর্ণ' : 'ব্যঞ্জনবর্ণ';
    // speakBengali(`${categoryName} নির্বাচিত হয়েছে`);
}

function generateBanglaGrid() {
    const grid = document.getElementById('banglaGrid');
    grid.innerHTML = '';

    const letters = banglaAlphabet[currentBanglaCategory];

    Object.keys(letters).forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'bangla-letter-btn';
        btn.textContent = letter;
        btn.onclick = () => selectBanglaLetter(letter);
        grid.appendChild(btn);
    });
}

function selectBanglaLetter(letter) {
    currentBanglaLetter = letter;
    updateBanglaDisplay();

    // Find the clicked button and enhance it
    const clickedButton = event ? event.target : null;
    if (clickedButton && clickedButton.classList.contains('bangla-letter-btn')) {
        enhanceLetterClick(clickedButton, letter);
    }

    // Play letter sound with proper Bengali letter name
    playSound('letter');
    // const letterData = banglaAlphabet[currentBanglaCategory][letter];
    // speakBengali(`${letterData.letterName}। ${letterData.word}`);
}

function updateBanglaDisplay() {
    const letterData = banglaAlphabet[currentBanglaCategory][currentBanglaLetter];

    document.getElementById('banglaBigLetter').textContent = currentBanglaLetter;
    document.getElementById('banglaPronunciation').textContent = `${currentBanglaLetter} (${letterData.pronunciation})`;
    document.getElementById('banglaWord').textContent = letterData.word;
    document.getElementById('banglaWordMeaning').textContent = letterData.meaning;

    // Update image
    const imageElement = document.getElementById('banglaAlphabetImage');
    if (imageElement) {
        imageElement.src = `images/bangla/${currentBanglaLetter}.svg`;
        imageElement.alt = letterData.word;

        // Fallback to common word images if letter-specific image doesn't exist
        imageElement.onerror = function() {
            // Try with word name instead
            this.src = `images/bangla/${letterData.word}.svg`;
            this.onerror = function() {
                // Final fallback to a default image
                this.src = `images/bangla/default.svg`;
                this.onerror = null; // Prevent infinite loop
            };
        };
    }
}

function playBanglaLetter() {
    const letterData = banglaAlphabet[currentBanglaCategory][currentBanglaLetter];
    playSound('letter');
    // speakBengali(`${letterData.letterName}। ${letterData.word}`, 0.6); // Slower for clear pronunciation
}

function startBanglaGame() {
    banglaGameActive = true;
    document.getElementById('banglaGame').style.display = 'block';
    generateBanglaQuestion();
}

function generateBanglaQuestion() {
    const letters = Object.keys(banglaAlphabet[currentBanglaCategory]);
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const letterData = banglaAlphabet[currentBanglaCategory][correctLetter];

    document.getElementById('banglaGameQuestion').innerHTML = `
        <div class="question-text">কোনটি "${correctLetter}" (${letterData.pronunciation})?</div>
    `;

    // Generate 4 options including the correct answer
    const options = [correctLetter];
    while (options.length < 4) {
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        if (!options.includes(randomLetter)) {
            options.push(randomLetter);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Create option buttons
    const optionsContainer = document.getElementById('banglaOptions');
    optionsContainer.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'bangla-option-btn';
        btn.textContent = option;
        btn.onclick = () => checkBanglaAnswer(option, correctLetter, btn);
        optionsContainer.appendChild(btn);
    });

    // Speak the question using proper letter name
    // speakBengali(`কোনটি ${letterData.letterName}?`);
}

function checkBanglaAnswer(selected, correct, button) {
    if (selected === correct) {
        button.classList.add('correct');
        banglaScore++;
        playSound('success');
        // speakBengali('সঠিক! খুব ভালো!');

        setTimeout(() => {
            generateBanglaQuestion();
        }, 1500);
    } else {
        button.classList.add('wrong');
        playSound('error');
        // const correctData = banglaAlphabet[currentBanglaCategory][correct];
        // speakBengali(`ভুল! সঠিক উত্তর হলো ${correctData.letterName}। ${correctData.word}`);

        // Highlight correct answer
        setTimeout(() => {
            const correctBtn = Array.from(document.querySelectorAll('.bangla-option-btn'))
                .find(btn => btn.textContent === correct);
            if (correctBtn) correctBtn.classList.add('correct');
        }, 500);

        setTimeout(() => {
            generateBanglaQuestion();
        }, 2500);
    }

    // Update score display (convert to Bangla numerals)
    const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const banglaScoreText = banglaScore.toString().split('').map(digit => banglaNumbers[parseInt(digit)]).join('');
    document.getElementById('banglaScore').textContent = banglaScoreText;

    // Disable all buttons temporarily
    document.querySelectorAll('.bangla-option-btn').forEach(btn => {
        btn.disabled = true;
        setTimeout(() => btn.disabled = false, 1500);
    });
}

// Test Bengali voice function
function testBengaliVoice() {
    console.log('Testing Bengali voice...');
    const testText = 'আসসালামু আলাইকুম! আমি বাংলায় কথা বলতে পারি।';
    // speakBengali(testText);

    // Also show instructions for installing Bengali voices
    alert(`Bengali Voice Test

Text: "${testText}"

If you don't hear Bengali pronunciation:

For Chrome/Edge:
1. Go to chrome://settings/languages
2. Add Bengali (বাংলা)
3. Enable "Use this language for spell check"
4. Restart browser

For Mac:
1. System Preferences > Accessibility > Speech
2. Click "System Voice" > "Customize"
3. Download Bengali voices

For Windows:
1. Settings > Time & Language > Speech
2. Add Bengali language pack
3. Download Bengali speech voices

The app will work with English pronunciation if Bengali voices aren't available.`);
}

// Arabic Letters Section
function initializeArabic() {
    generateArabicGrid();
    updateArabicDisplay();
}

function generateArabicGrid() {
    const arabicGrid = document.getElementById('arabicGrid');
    if (!arabicGrid) return;

    arabicGrid.innerHTML = '';

    Object.keys(arabicAlphabet).forEach(letter => {
        const letterBtn = document.createElement('button');
        letterBtn.className = 'letter-btn arabic-letter-btn';
        letterBtn.textContent = letter;
        letterBtn.onclick = () => selectArabicLetter(letter);
        letterBtn.setAttribute('aria-label', `Arabic letter ${letter}`);
        arabicGrid.appendChild(letterBtn);
    });
}

function selectArabicLetter(letter) {
    currentArabicLetter = letter;
    updateArabicDisplay();

    // Remove active class from all buttons
    document.querySelectorAll('.arabic-letter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to selected button and enhance it
    const clickedButton = event.target;
    clickedButton.classList.add('active');

    if (clickedButton && clickedButton.classList.contains('arabic-letter-btn')) {
        enhanceLetterClick(clickedButton, letter);
    }
}

function updateArabicDisplay() {
    const letterData = arabicAlphabet[currentArabicLetter];

    // Update big letter display
    const bigLetter = document.getElementById('arabicBigLetter');
    if (bigLetter) bigLetter.textContent = currentArabicLetter;

    // Update pronunciation
    const pronunciation = document.getElementById('arabicPronunciation');
    if (pronunciation) pronunciation.textContent = `${currentArabicLetter} (${letterData.pronunciation})`;

    // Update word and meaning
    const word = document.getElementById('arabicWord');
    if (word) word.textContent = letterData.word;

    const meaning = document.getElementById('arabicWordMeaning');
    if (meaning) meaning.textContent = letterData.meaning;

    // Update image
    const imageElement = document.getElementById('arabicAlphabetImage');
    if (imageElement) {
        imageElement.src = `images/arabic/${currentArabicLetter}.svg`;
        imageElement.alt = letterData.word;
        imageElement.onerror = function() {
            this.src = `images/arabic/${letterData.word}.svg`;
            this.onerror = function() {
                this.src = `images/arabic/default.svg`;
                this.onerror = null;
            };
        };
    }
}

function playArabicLetter() {
    const letterData = arabicAlphabet[currentArabicLetter];
    
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Function to get voices with retry
        const getVoicesWithRetry = () => {
            return new Promise((resolve) => {
                let voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    resolve(voices);
                } else {
                    // Wait for voices to load
                    window.speechSynthesis.onvoiceschanged = () => {
                        voices = window.speechSynthesis.getVoices();
                        resolve(voices);
                    };
                    // Fallback timeout
                    setTimeout(() => resolve([]), 1000);
                }
            });
        };
        
        getVoicesWithRetry().then(voices => {
            // First, speak the Arabic letter
            const letterUtterance = new SpeechSynthesisUtterance(currentArabicLetter);
            letterUtterance.lang = 'ar-SA'; // Arabic Saudi Arabia
            letterUtterance.rate = 0.6; // Slower for clarity
            letterUtterance.pitch = 1.1;
            letterUtterance.volume = 1.0;
            
            // Then speak the word in Arabic
            const wordUtterance = new SpeechSynthesisUtterance(letterData.word);
            wordUtterance.lang = 'ar-SA';
            wordUtterance.rate = 0.7;
            wordUtterance.pitch = 1.1;
            wordUtterance.volume = 1.0;
            
            // Finally, speak the English meaning
            const meaningUtterance = new SpeechSynthesisUtterance(letterData.meaning);
            meaningUtterance.lang = 'en-US';
            meaningUtterance.rate = 0.9;
            meaningUtterance.pitch = 1.1;
            meaningUtterance.volume = 1.0;

            // Try to find Arabic voice
            const arabicVoice = voices.find(voice => 
                voice.lang.startsWith('ar') || 
                voice.name.toLowerCase().includes('arabic')
            );
            
            const englishVoice = voices.find(voice => 
                voice.lang.startsWith('en')
            );

            if (arabicVoice) {
                letterUtterance.voice = arabicVoice;
                wordUtterance.voice = arabicVoice;
                console.log('Using Arabic voice:', arabicVoice.name);
            } else {
                console.log('No Arabic voice found, using default');
            }
            
            if (englishVoice) {
                meaningUtterance.voice = englishVoice;
            }

            // Log for debugging
            console.log('Playing Arabic letter:', currentArabicLetter, 'Word:', letterData.word);

            // Speak in sequence
            window.speechSynthesis.speak(letterUtterance);
            
            letterUtterance.onend = () => {
                setTimeout(() => {
                    window.speechSynthesis.speak(wordUtterance);
                }, 300);
            };
            
            wordUtterance.onend = () => {
                setTimeout(() => {
                    window.speechSynthesis.speak(meaningUtterance);
                }, 500);
            };
            
            // Error handling
            letterUtterance.onerror = (event) => {
                console.error('Speech error:', event);
                // Fallback to basic speak function
                speak(`${currentArabicLetter}. ${letterData.word}. ${letterData.meaning}`);
            };
        });
    } else {
        console.error('Speech synthesis not supported');
        alert('Your browser does not support text-to-speech. Please try a different browser.');
    }
}

function startArabicGame() {
    const gameDiv = document.getElementById('arabicGame');
    if (!gameDiv) return;

    arabicGameActive = true;
    gameDiv.style.display = 'block';
    generateArabicQuestion();
}

function generateArabicQuestion() {
    const letters = Object.keys(arabicAlphabet);
    const correctLetter = letters[Math.floor(Math.random() * letters.length)];
    const questionDiv = document.getElementById('arabicGameQuestion');
    const optionsDiv = document.getElementById('arabicOptions');

    if (!questionDiv || !optionsDiv) return;

    questionDiv.innerHTML = `<div class="question-text">أين "${correctLetter}"؟</div>`;

    // Generate wrong answers
    const wrongAnswers = letters.filter(l => l !== correctLetter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    const allOptions = [correctLetter, ...wrongAnswers].sort(() => Math.random() - 0.5);

    optionsDiv.innerHTML = '';
    allOptions.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'option-btn arabic-option-btn';
        button.textContent = letter;
        button.onclick = () => checkArabicAnswer(letter, correctLetter, button);
        optionsDiv.appendChild(button);
    });
}

function checkArabicAnswer(selected, correct, button) {
    if (!arabicGameActive) return;

    const allButtons = document.querySelectorAll('.arabic-option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selected === correct) {
        button.classList.add('correct');
        arabicGameScore += 10;
        setTimeout(() => {
            generateArabicQuestion();
            allButtons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('correct', 'wrong');
            });
        }, 1500);
    } else {
        button.classList.add('wrong');
        allButtons.forEach(btn => {
            if (btn.textContent === correct) {
                btn.classList.add('correct');
            }
        });
        setTimeout(() => {
            generateArabicQuestion();
            allButtons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('correct', 'wrong');
            });
        }, 2000);
    }

    // Update score display
    const scoreElement = document.getElementById('arabicScore');
    if (scoreElement) scoreElement.textContent = arabicGameScore.toString();
}

// Spelling Section
function initializeSpelling() {
    updateProgress();
    loadSpellingWord();
}

function loadSpellingWord() {
    const word = spellingWords[currentSpellingWord];
    spellingProgress = new Array(word.word.length).fill('');
    selectedLetters = [];
    hintCount = 0;

    // Show image
    document.getElementById('spellingImage').style.display = 'block';
    document.getElementById('spellingImage').src = `images/${word.image}`;
    document.getElementById('spellingImage').alt = word.word;
    document.getElementById('wordLabel').textContent = word.word;

    // Announce what to spell
    const wordName = word.word.toLowerCase();
    speak(`Can you spell ${wordName}? ${wordName}`);

    // Create letter slots
    const wordToSpell = document.getElementById('wordToSpell');
    wordToSpell.innerHTML = '';
    for (let i = 0; i < word.word.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        slot.id = `slot-${i}`;
        slot.onclick = () => removeLetterFromSlot(i);
        wordToSpell.appendChild(slot);
    }

    // Create letter choices (scrambled)
    const letters = word.word.split('');
    const extraLetters = ['B', 'P', 'M', 'N', 'R', 'L', 'T', 'S'];
    const extraToAdd = extraLetters.filter(l => !letters.includes(l)).slice(0, Math.min(3, 6 - letters.length));
    const allLetters = [...letters, ...extraToAdd];
    const shuffled = allLetters.sort(() => Math.random() - 0.5);

    const letterChoices = document.getElementById('letterChoices');
    letterChoices.innerHTML = '';
    shuffled.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-letter';
        btn.textContent = letter;
        btn.id = `choice-${index}`;
        btn.dataset.letter = letter;
        btn.onclick = () => selectLetter(letter, index);
        letterChoices.appendChild(btn);
    });

    // Clear any hint highlights
    document.querySelectorAll('.choice-letter').forEach(btn => btn.classList.remove('hint'));
}

function selectLetter(letter, btnIndex) {
    const word = spellingWords[currentSpellingWord].word;
    const nextEmptyIndex = spellingProgress.findIndex(slot => slot === '');

    if (nextEmptyIndex !== -1) {
        spellingProgress[nextEmptyIndex] = letter;
        selectedLetters[nextEmptyIndex] = btnIndex;
        document.getElementById(`slot-${nextEmptyIndex}`).textContent = letter;
        document.getElementById(`slot-${nextEmptyIndex}`).classList.add('filled');
        document.getElementById(`choice-${btnIndex}`).disabled = true;

        // Play different sounds based on correctness
        if (letter === word[nextEmptyIndex]) {
            playSound('click');
        } else {
            playSound('pop');
        }

        // Check if word is complete
        if (!spellingProgress.includes('')) {
            const isCorrect = spellingProgress.join('') === word;

            if (isCorrect) {
                // Correct!
                completedWords++;
                updateProgress();
                setTimeout(() => {
                    celebrate();
                    speak(`Great job! You spelled ${word}!`);
                }, 500);
            } else {
                // Wrong - shake the slots
                setTimeout(() => {
                    spellingProgress.forEach((letter, index) => {
                        if (letter !== word[index]) {
                            document.getElementById(`slot-${index}`).classList.add('wrong');
                        }
                    });
                    playSound('pop');
                    speak('Oops! Try again!');

                    // Auto clear after 2 seconds
                    setTimeout(() => clearSpelling(), 2000);
                }, 500);
            }
        }
    }
}

function clearSpelling() {
    // Clear all slots
    spellingProgress = spellingProgress.map(() => '');
    selectedLetters.forEach((btnIndex, slotIndex) => {
        if (btnIndex !== undefined) {
            document.getElementById(`choice-${btnIndex}`).disabled = false;
        }
    });
    selectedLetters = [];

    // Clear slot displays
    document.querySelectorAll('.letter-slot').forEach((slot, index) => {
        slot.textContent = '';
        slot.classList.remove('filled', 'wrong');
    });

    // Clear hint highlights
    document.querySelectorAll('.choice-letter').forEach(btn => btn.classList.remove('hint'));

    playSound('click');
}

function removeLetterFromSlot(slotIndex) {
    if (spellingProgress[slotIndex] !== '') {
        const btnIndex = selectedLetters[slotIndex];
        if (btnIndex !== undefined) {
            document.getElementById(`choice-${btnIndex}`).disabled = false;
        }

        spellingProgress[slotIndex] = '';
        selectedLetters[slotIndex] = undefined;

        const slot = document.getElementById(`slot-${slotIndex}`);
        slot.textContent = '';
        slot.classList.remove('filled', 'wrong');

        playSound('pop');
    }
}

function showHint() {
    const word = spellingWords[currentSpellingWord].word;
    const nextEmptyIndex = spellingProgress.findIndex(slot => slot === '');

    if (nextEmptyIndex !== -1 && hintCount < 2) {
        const correctLetter = word[nextEmptyIndex];

        // Highlight all buttons with the correct letter
        document.querySelectorAll('.choice-letter').forEach(btn => {
            if (btn.dataset.letter === correctLetter && !btn.disabled) {
                btn.classList.add('hint');
            }
        });

        hintCount++;
        speak(`Look for the letter ${correctLetter}`);
        playSound('letter');

        // Remove hint after 3 seconds
        setTimeout(() => {
            document.querySelectorAll('.choice-letter').forEach(btn => btn.classList.remove('hint'));
        }, 3000);
    } else if (hintCount >= 2) {
        speak('Try to spell it yourself!');
    }
}

function updateProgress() {
    const percentage = (completedWords / spellingWords.length) * 100;
    document.getElementById('progressFill').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${completedWords}/${spellingWords.length} Words`;

    // Check for difficulty progression
    if (completedWords === spellingWords.length && completedWords > 0) {
        setTimeout(() => {
            celebrate();

            // Progress to next difficulty
            if (currentDifficulty === 'easy' && completedWords >= 3) {
                currentDifficulty = 'medium';
                spellingWords = spellingWordsByDifficulty.medium;
                speak('Amazing! Now let\'s try some harder words!');
            } else if (currentDifficulty === 'medium' && completedWords >= 4) {
                currentDifficulty = 'hard';
                spellingWords = spellingWordsByDifficulty.hard;
                speak('Excellent! Ready for a challenge?');
            } else {
                speak('Amazing! You completed all the words!');
            }

            completedWords = 0; // Reset for next round
            currentSpellingWord = 0;
            setTimeout(() => loadSpellingWord(), 2000);
        }, 1000);
    }
}

function nextWord() {
    currentSpellingWord = (currentSpellingWord + 1) % spellingWords.length;
    loadSpellingWord();
    playSound('click');
}

// Counting Section
function initializeCounting() {
    createNumberButtons();
    showNumber(1);
}

function createNumberButtons() {
    const container = document.getElementById('numberButtons');
    container.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = i;
        btn.onclick = () => showNumber(i);
        container.appendChild(btn);
    }
}

function showNumber(num) {
    currentNumber = num;
    document.getElementById('numberDisplay').textContent = num;

    const container = document.getElementById('objectsContainer');
    container.innerHTML = '';

    // Use different emojis for different numbers
    const emojis = ['🌟', '🎈', '🍎', '🌺', '🦋', '🌈', '🎨', '🎵', '🌸', '🎪'];
    const emoji = emojis[num - 1] || '⭐';

    for (let i = 0; i < num; i++) {
        setTimeout(() => {
            const obj = document.createElement('div');
            obj.className = 'count-object';
            obj.textContent = emoji;
            container.appendChild(obj);
            playSound('pop');
        }, i * 200);
    }

    speak(`${num} ${num === 1 ? 'item' : 'items'}`);
}

// Celebration
function celebrate() {
    const celebration = document.getElementById('celebration');
    celebration.classList.add('show');
    playSound('success');
}

function closeCelebration() {
    const celebration = document.getElementById('celebration');
    celebration.classList.remove('show');
    if (currentSection === 'spelling') {
        nextWord();
    }
}

// Audio context (create once and reuse)
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Sound effects with more pleasant tones
function playSound(type) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch(type) {
        case 'click':
            playTone(ctx, 600, 0.05, 0.1, 'sine');
            playTone(ctx, 900, 0.05, 0.1, 'sine', 0.05);
            createSoundWaves(600, 'small');
            break;
        case 'letter':
            playTone(ctx, 400, 0.1, 0.2, 'sine');
            playTone(ctx, 800, 0.08, 0.2, 'triangle', 0.05);
            // Temporarily disabled to check if this causes the oval
            // createSoundWaves(400, 'medium');
            animateVolumeReactiveElements();
            break;
        case 'pop':
            // Bubble pop effect
            const popOsc = ctx.createOscillator();
            const popGain = ctx.createGain();
            popOsc.connect(popGain);
            popGain.connect(ctx.destination);
            popOsc.type = 'sine';
            popOsc.frequency.setValueAtTime(1000, now);
            popOsc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            popGain.gain.setValueAtTime(0.2, now);
            popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            popOsc.start(now);
            popOsc.stop(now + 0.1);
            createSoundWaves(1000, 'pop');
            break;
        case 'success':
            // Happy melody
            playTone(ctx, 523.25, 0.2, 0.15, 'sine'); // C
            playTone(ctx, 659.25, 0.2, 0.15, 'sine', 0.15); // E
            playTone(ctx, 783.99, 0.2, 0.15, 'sine', 0.3); // G
            playTone(ctx, 1046.5, 0.3, 0.2, 'sine', 0.45); // C
            createSuccessWaves();
            animateVolumeReactiveElements();
            break;
    }
}

function createSoundWaves(frequency, intensity = 'medium') {
    const container = document.getElementById('floatingElements');
    if (!container) return;

    const sizes = {
        small: { count: 2, maxScale: 2, duration: 800 },
        medium: { count: 3, maxScale: 3, duration: 1000 },
        pop: { count: 4, maxScale: 4, duration: 600 },
        large: { count: 5, maxScale: 5, duration: 1200 }
    };

    const config = sizes[intensity] || sizes.medium;

    // Create sound wave ripples
    for (let i = 0; i < config.count; i++) {
        const wave = document.createElement('div');
        wave.style.position = 'fixed';
        wave.style.top = '50%';
        wave.style.left = '50%';
        wave.style.width = '20px';
        wave.style.height = '20px';
        wave.style.border = `2px solid rgba(78, 205, 196, ${0.8 - i * 0.2})`;
        wave.style.borderRadius = '50%';
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.pointerEvents = 'none';
        wave.style.zIndex = '10';

        container.appendChild(wave);

        // Animate the wave based on frequency
        const colorIntensity = Math.min(255, frequency / 4);
        wave.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0)', 
                opacity: 1,
                borderColor: `rgb(${colorIntensity}, 205, 196)`
            },
            { 
                transform: `translate(-50%, -50%) scale(${config.maxScale})`, 
                opacity: 0,
                borderColor: `rgb(${colorIntensity}, 100, 150)`
            }
        ], {
            duration: config.duration + (i * 150),
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        });
    }
}

function createSuccessWaves() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const wave = document.createElement('div');
            wave.style.position = 'fixed';
            wave.style.top = Math.random() * 100 + '%';
            wave.style.left = Math.random() * 100 + '%';
            wave.style.width = '30px';
            wave.style.height = '30px';
            wave.style.background = colors[i];
            wave.style.borderRadius = '50%';
            wave.style.pointerEvents = 'none';
            wave.style.zIndex = '10';

            document.getElementById('floatingElements').appendChild(wave);

            wave.animate([
                { transform: 'scale(0) rotate(0deg)', opacity: 1 },
                { transform: 'scale(3) rotate(360deg)', opacity: 0 }
            ], {
                duration: 1500,
                easing: 'ease-out'
            }).addEventListener('finish', () => {
                if (wave.parentNode) {
                    wave.parentNode.removeChild(wave);
                }
            });
        }, i * 100);
    }
}

function animateVolumeReactiveElements() {
    // Make letters pulse with sound
    const currentSection = document.querySelector('.learning-section.active');
    if (currentSection) {
        const letters = currentSection.querySelectorAll('.letter-btn');
        letters.forEach((letter, index) => {
            setTimeout(() => {
                letter.style.transform = 'scale(1.05)';
                letter.style.filter = 'brightness(1.2)';
                setTimeout(() => {
                    letter.style.transform = '';
                    letter.style.filter = '';
                }, 200);
            }, index * 50);
        });
    }

    // Animate floating bubbles
    const bubbles = document.querySelectorAll('.floating-bubble');
    bubbles.forEach(bubble => {
        bubble.style.animation = 'none';
        bubble.offsetHeight; // Force reflow
        bubble.style.animation = 'floatingBubbles 2s ease-in-out';
    });

    // Pulse the background
    document.body.style.animation = 'none';
    document.body.offsetHeight; // Force reflow
    document.body.style.animation = 'backgroundShift 3s ease infinite';
}

function playTone(ctx, frequency, volume, duration, type = 'sine', delay = 0) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;

    // Smooth envelope
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(volume, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

    osc.start(now + delay);
    osc.stop(now + delay + duration);
}

// Enhanced text to speech with better voice selection
function speak(text, rate = 0.85) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate; // Adjustable rate
        utterance.pitch = 1.1; // Natural pitch
        utterance.volume = 0.9;

        // Try to find a child-friendly voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = voices.filter(voice => 
            voice.name.includes('Female') || 
            voice.name.includes('Samantha') ||
            voice.name.includes('Victoria') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Google US English Female') ||
            voice.name.includes('Microsoft Zira')
        );

        if (preferredVoices.length > 0) {
            utterance.voice = preferredVoices[0];
        }

        // Add visual feedback when speaking
        utterance.onstart = () => {
            document.body.classList.add('speaking');
        };

        utterance.onend = () => {
            document.body.classList.remove('speaking');
        };

        window.speechSynthesis.speak(utterance);
    }
}

// Bengali text to speech with better voice detection
function speakBengali(text, rate = 0.7) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Force reload voices if empty
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            // Wait a bit and try again
            setTimeout(() => speakBengali(text, rate), 100);
            return;
        }

        console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;

        // Try to find Bengali voices (more comprehensive search)
        let selectedVoice = null;

        // First try: Bengali voices
        const bengaliVoices = voices.filter(voice => 
            voice.lang.toLowerCase().includes('bn') || 
            voice.name.toLowerCase().includes('bengali') ||
            voice.name.toLowerCase().includes('bangla')
        );

        if (bengaliVoices.length > 0) {
            selectedVoice = bengaliVoices[0];
            utterance.lang = 'bn-BD';
            console.log('Using Bengali voice:', selectedVoice.name);
        } else {
            // Second try: Hindi/Urdu voices (similar phonetics)
            const indianVoices = voices.filter(voice =>
                voice.lang.toLowerCase().includes('hi') || 
                voice.lang.toLowerCase().includes('ur') ||
                voice.name.toLowerCase().includes('hindi') ||
                voice.name.toLowerCase().includes('indian')
            );

            if (indianVoices.length > 0) {
                selectedVoice = indianVoices[0];
                utterance.lang = 'hi-IN'; // Use Hindi but it can handle some Bengali
                console.log('Using Hindi voice for Bengali:', selectedVoice.name);
            } else {
                // Third try: Any female voice (better for children)
                const femaleVoices = voices.filter(voice =>
                    voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('woman') ||
                    voice.name.toLowerCase().includes('samantha') ||
                    voice.name.toLowerCase().includes('zira')
                );

                if (femaleVoices.length > 0) {
                    selectedVoice = femaleVoices[0];
                    console.log('Using female voice for Bengali:', selectedVoice.name);
                } else {
                    // Last resort: use first available voice
                    selectedVoice = voices[0];
                    console.log('Using default voice for Bengali:', selectedVoice.name);
                }
                utterance.lang = 'bn-BD'; // Still try Bengali language
            }
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Add visual feedback when speaking
        utterance.onstart = () => {
            document.body.classList.add('speaking');
            console.log('Speaking Bengali text:', text);
        };

        utterance.onend = () => {
            document.body.classList.remove('speaking');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            document.body.classList.remove('speaking');
        };

        window.speechSynthesis.speak(utterance);
    } else {
        console.log('Speech synthesis not supported, text was:', text);
    }
}

// Load voices when ready with better detection
if ('speechSynthesis' in window) {
    let voicesLoaded = false;

    function loadVoices() {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0 && !voicesLoaded) {
            voicesLoaded = true;
            console.log(`Loaded ${voices.length} voices total`);

            // List Bengali voices
            const bengaliVoices = voices.filter(voice => 
                voice.lang.toLowerCase().includes('bn') || 
                voice.name.toLowerCase().includes('bengali') ||
                voice.name.toLowerCase().includes('bangla')
            );
            console.log('Available Bengali voices:', bengaliVoices.length > 0 ? bengaliVoices.map(v => v.name) : 'None found');

            // List Hindi voices as fallback
            const hindiVoices = voices.filter(voice => 
                voice.lang.toLowerCase().includes('hi') || 
                voice.name.toLowerCase().includes('hindi')
            );
            console.log('Available Hindi voices (fallback):', hindiVoices.length > 0 ? hindiVoices.map(v => v.name) : 'None found');

            // List all available languages
            const languages = [...new Set(voices.map(v => v.lang))].sort();
            console.log('All available languages:', languages);
        }
    }

    // Try multiple ways to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Also try loading immediately (some browsers need this)
    loadVoices();

    // And try after a short delay
    setTimeout(loadVoices, 500);
}

// Quiz Section Functions
function initializeQuiz() {
    loadQuizQuestion();
}

function selectQuizCategory(category) {
    currentQuizCategory = category;
    currentQuizQuestion = 0;
    answeredQuestions = 0;

    // Update category buttons
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    loadQuizQuestion();
    playSound('click');
}

function getQuizQuestions() {
    if (currentQuizCategory === 'all') {
        // Combine all categories
        const allQuestions = [];
        Object.values(quizQuestions).forEach(categoryQuestions => {
            allQuestions.push(...categoryQuestions);
        });
        return allQuestions;
    }
    return quizQuestions[currentQuizCategory] || [];
}

function loadQuizQuestion() {
    const questions = getQuizQuestions();
    if (questions.length === 0) return;

    const question = questions[currentQuizQuestion % questions.length];

    // Update question
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('questionContent').textContent = question.content;

    // Create answer buttons
    const answersContainer = document.getElementById('quizAnswers');
    answersContainer.innerHTML = '';

    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(index, question.correct);
        answersContainer.appendChild(btn);
    });

    // Hide next question button
    document.getElementById('nextQuestionBtn').style.display = 'none';

    // Read the question aloud
    speak(question.question);
}

function selectAnswer(selectedIndex, correctIndex) {
    const answerButtons = document.querySelectorAll('.answer-btn');
    const isCorrect = selectedIndex === correctIndex;

    // Disable all buttons
    answerButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        // Correct answer
        answerButtons[selectedIndex].classList.add('correct');
        quizScore++;
        quizStreak++;
        playSound('success');
        speak('Correct! Great job!');

        // Celebrate if streak is high
        if (quizStreak % 5 === 0) {
            setTimeout(() => celebrate(), 500);
        }
    } else {
        // Wrong answer
        answerButtons[selectedIndex].classList.add('wrong');
        answerButtons[correctIndex].classList.add('correct');
        quizStreak = 0;
        playSound('pop');
        speak(`Oops! The correct answer is ${answerButtons[correctIndex].textContent}`);
    }

    answeredQuestions++;
    updateQuizScore();

    // Show next question button
    setTimeout(() => {
        document.getElementById('nextQuestionBtn').style.display = 'block';
    }, 2000);
}

function updateQuizScore() {
    document.getElementById('quizScore').textContent = quizScore;
    document.getElementById('quizStreak').textContent = quizStreak;

    // Special celebration for high scores
    if (answeredQuestions > 0 && answeredQuestions % 10 === 0) {
        setTimeout(() => {
            celebrate();
            speak(`Amazing! You've answered ${answeredQuestions} questions!`);
        }, 1000);
    }
}

function nextQuestion() {
    currentQuizQuestion++;
    loadQuizQuestion();
    playSound('click');
}

// Memory Game Functions
function initializeMemoryGame() {
    startNewMemoryGame();
}

function setMemoryDifficulty(difficulty) {
    memoryDifficulty = difficulty;

    // Update difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    startNewMemoryGame();
    playSound('click');
}

function getCardCount() {
    switch(memoryDifficulty) {
        case 'easy': return 4; // 2 pairs
        case 'medium': return 8; // 4 pairs
        case 'hard': return 12; // 6 pairs
        default: return 4;
    }
}

function startNewMemoryGame() {
    // Reset game state
    memoryCards = [];
    flippedCards = [];
    matchedCards = [];
    memoryMoves = 0;
    memoryMatches = 0;
    memoryStartTime = Date.now();
    canFlipCards = true;

    // Clear existing timer
    if (memoryTimer) {
        clearInterval(memoryTimer);
    }

    // Create cards
    createMemoryCards();
    updateMemoryStats();
    updateMemoryMessage("Find all the matching pairs!");

    // Start timer
    memoryTimer = setInterval(updateMemoryTime, 1000);

    speak("Memory game started! Find the matching pairs!");
}

function createMemoryCards() {
    const cardCount = getCardCount();
    const pairCount = cardCount / 2;

    // Get random cards from different sets
    const allCards = [
        ...memoryCardSets.letters.slice(0, 3),
        ...memoryCardSets.numbers.slice(0, 3),
        ...memoryCardSets.emojis.slice(0, 3),
        ...memoryCardSets.shapes.slice(0, 3)
    ];

    // Select cards for this game
    const selectedCards = allCards.slice(0, pairCount);
    const gameCards = [...selectedCards, ...selectedCards]; // Create pairs

    // Shuffle the cards
    gameCards.sort(() => Math.random() - 0.5);

    // Create card objects
    memoryCards = gameCards.map((content, index) => ({
        id: index,
        content: content,
        isFlipped: false,
        isMatched: false
    }));

    renderMemoryBoard();
}

function renderMemoryBoard() {
    const board = document.getElementById('memoryBoard');
    board.className = `memory-board ${memoryDifficulty}`;
    board.innerHTML = '';

    memoryCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.onclick = () => flipCard(index);

        const cardColor = getCardColor(card.content);

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front ${cardColor}">${card.content}</div>
                <div class="card-back"></div>
            </div>
        `;

        board.appendChild(cardElement);
    });
}

function getCardColor(content) {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const hash = content.charCodeAt(0) + content.length;
    return colors[hash % colors.length];
}

function flipCard(cardIndex) {
    if (!canFlipCards) return;

    const card = memoryCards[cardIndex];
    const cardElement = document.querySelectorAll('.memory-card')[cardIndex];

    // Can't flip if already flipped or matched
    if (card.isFlipped || card.isMatched) return;

    // Can't flip more than 2 cards
    if (flippedCards.length >= 2) return;

    // Flip the card
    card.isFlipped = true;
    cardElement.classList.add('flipped');
    flippedCards.push(cardIndex);

    playSound('click');

    // Check if we have 2 flipped cards
    if (flippedCards.length === 2) {
        memoryMoves++;
        updateMemoryStats();

        setTimeout(() => {
            checkForMatch();
        }, 1000);
    }
}

function checkForMatch() {
    const [firstIndex, secondIndex] = flippedCards;
    const firstCard = memoryCards[firstIndex];
    const secondCard = memoryCards[secondIndex];

    const firstElement = document.querySelectorAll('.memory-card')[firstIndex];
    const secondElement = document.querySelectorAll('.memory-card')[secondIndex];

    if (firstCard.content === secondCard.content) {
        // Match found!
        firstCard.isMatched = true;
        secondCard.isMatched = true;
        firstElement.classList.add('matched');
        secondElement.classList.add('matched');

        memoryMatches++;
        matchedCards.push(firstIndex, secondIndex);

        playSound('success');
        speak('Great match!');

        // Check if game is complete
        if (memoryMatches === getCardCount() / 2) {
            gameComplete();
        }
    } else {
        // No match - flip cards back
        firstCard.isFlipped = false;
        secondCard.isFlipped = false;
        firstElement.classList.remove('flipped');
        secondElement.classList.remove('flipped');

        playSound('pop');
    }

    // Clear flipped cards array
    flippedCards = [];
    updateMemoryStats();
}

function gameComplete() {
    clearInterval(memoryTimer);
    canFlipCards = false;

    const finalTime = Math.floor((Date.now() - memoryStartTime) / 1000);

    setTimeout(() => {
        celebrate();
        speak(`Fantastic! You completed the memory game in ${memoryMoves} moves and ${finalTime} seconds!`);
        updateMemoryMessage(`🎉 Completed in ${memoryMoves} moves and ${finalTime} seconds!`);
    }, 500);
}

function updateMemoryStats() {
    document.getElementById('memoryMoves').textContent = memoryMoves;
    document.getElementById('memoryMatches').textContent = `${memoryMatches}/${getCardCount() / 2}`;
}

function updateMemoryTime() {
    const elapsed = Math.floor((Date.now() - memoryStartTime) / 1000);
    document.getElementById('memoryTime').textContent = `${elapsed}s`;
}

function updateMemoryMessage(message) {
    document.getElementById('memoryMessage').textContent = message;
}

// Nursery Rhymes Functions
function initializeNurseryRhymes() {
    createSongButtons();
    loadSong(0);
}

function createSongButtons() {
    const container = document.getElementById('songButtons');
    container.innerHTML = '';

    nurseryRhymes.forEach((song, index) => {
        const btn = document.createElement('button');
        btn.className = 'song-btn';
        if (index === 0) btn.classList.add('active');
        btn.innerHTML = `<span>${song.icon}</span> ${song.title}`;
        btn.onclick = () => selectSong(index);
        container.appendChild(btn);
    });
}

function selectSong(songIndex) {
    // Stop current song if playing
    if (isPlaying) {
        stopSong();
    }

    currentSong = songIndex;

    // Update active button
    document.querySelectorAll('.song-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index === songIndex);
    });

    loadSong(songIndex);
    playSound('click');
}

function loadSong(songIndex) {
    const song = nurseryRhymes[songIndex];
    currentWordIndex = 0;
    songDuration = song.duration;

    // Update UI
    document.getElementById('songTitle').textContent = song.title;
    document.getElementById('playIcon').textContent = '▶️';
    document.getElementById('speedText').textContent = 'Normal';

    // Load lyrics
    displayLyrics();

    // Load animations
    loadAnimations(song.animations);

    // Reset progress
    updateProgress(0);

    speak(`Let's sing ${song.title}!`);
}

function displayLyrics() {
    const song = nurseryRhymes[currentSong];
    const lyricsContainer = document.getElementById('lyricsLine');

    // Create word elements
    lyricsContainer.innerHTML = '';
    song.lyrics.forEach((word, index) => {
        const wordElement = document.createElement('span');
        wordElement.className = 'lyrics-word';
        wordElement.textContent = word.text;
        wordElement.id = `word-${index}`;
        wordElement.onclick = () => speakWord(word.text);
        lyricsContainer.appendChild(wordElement);
    });
}

function loadAnimations(animations) {
    const container = document.getElementById('rhymeAnimations');
    container.innerHTML = '';

    animations.forEach((emoji, index) => {
        const element = document.createElement('div');
        element.className = 'animation-element';
        element.textContent = emoji;
        container.appendChild(element);
    });
}

function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    isPlaying = true;
    songStartTime = Date.now();
    currentWordIndex = 0;
    currentChordIndex = 0;

    document.getElementById('playIcon').textContent = '⏸️';

    // Clear previous highlights
    document.querySelectorAll('.lyrics-word').forEach(word => {
        word.classList.remove('highlighted', 'sung');
    });

    // Initialize musical context
    initializeMusicContext();

    // Start the song timer
    songTimer = setInterval(() => {
        updateSongProgress();
    }, 100);

    // Start musical accompaniment
    startMusicalAccompaniment();

    // Add singing indicator
    const indicator = document.createElement('div');
    indicator.className = 'singing-indicator';
    indicator.textContent = '🎵';
    indicator.id = 'singingIndicator';
    document.body.appendChild(indicator);

    playSound('success');
    speak('Let\'s sing together!');
}

function pauseSong() {
    isPlaying = false;

    if (songTimer) {
        clearInterval(songTimer);
        songTimer = null;
    }

    if (beatInterval) {
        clearInterval(beatInterval);
        beatInterval = null;
    }

    // Stop all musical sounds
    stopMusicalAccompaniment();

    document.getElementById('playIcon').textContent = '▶️';

    // Remove singing indicator
    const indicator = document.getElementById('singingIndicator');
    if (indicator) {
        indicator.remove();
    }

    playSound('click');
}

function stopSong() {
    pauseSong();
    currentWordIndex = 0;
    songStartTime = 0;

    // Clear all highlights
    document.querySelectorAll('.lyrics-word').forEach(word => {
        word.classList.remove('highlighted', 'sung');
    });

    updateProgress(0);
}

function restartSong() {
    stopSong();
    setTimeout(() => playSong(), 200);
    playSound('click');
}

function toggleSpeed() {
    playbackSpeed = playbackSpeed === 1 ? 0.7 : 1;
    const speedText = playbackSpeed === 1 ? 'Normal' : 'Slow';
    document.getElementById('speedText').textContent = speedText;

    playSound('click');
    speak(speedText + ' speed');
}

function updateSongProgress() {
    if (!isPlaying) return;

    const elapsed = (Date.now() - songStartTime) / 1000 * playbackSpeed;
    const song = nurseryRhymes[currentSong];

    // Update progress bar
    const progress = Math.min(elapsed / songDuration, 1);
    updateProgress(progress);

    // Highlight current word
    highlightCurrentWord(elapsed);

    // Check if song is finished
    if (elapsed >= songDuration) {
        finishSong();
    }
}

function highlightCurrentWord(elapsed) {
    const song = nurseryRhymes[currentSong];

    // Find current word based on timing
    for (let i = currentWordIndex; i < song.lyrics.length; i++) {
        const word = song.lyrics[i];
        const nextWord = song.lyrics[i + 1];

        if (elapsed >= word.timing && (!nextWord || elapsed < nextWord.timing)) {
            if (i !== currentWordIndex) {
                // Mark previous word as sung
                if (currentWordIndex < song.lyrics.length) {
                    const prevWordEl = document.getElementById(`word-${currentWordIndex}`);
                    if (prevWordEl) {
                        prevWordEl.classList.remove('highlighted');
                        prevWordEl.classList.add('sung');
                    }
                }

                // Highlight current word
                const currentWordEl = document.getElementById(`word-${i}`);
                if (currentWordEl) {
                    currentWordEl.classList.add('highlighted');
                    speakWord(word.text);
                    playWordAccent(word.text); // Add musical accent
                }

                currentWordIndex = i;
            }
            break;
        }
    }
}

function finishSong() {
    stopSong();

    // Mark all words as sung
    document.querySelectorAll('.lyrics-word').forEach(word => {
        word.classList.remove('highlighted');
        word.classList.add('sung');
    });

    setTimeout(() => {
        celebrate();
        speak('Great singing! You did wonderful!');
    }, 500);
}

function speakWord(word) {
    // Don't interrupt if already playing the song
    if (!isPlaying) {
        speak(word);
    }
}

function updateProgress(progress) {
    const elapsed = Math.floor(progress * songDuration);
    const total = Math.floor(songDuration);

    document.getElementById('progressFillRhyme').style.width = `${progress * 100}%`;
    document.getElementById('progressTextRhyme').textContent = 
        `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')} / ${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
}

// Musical Enhancement Functions
function initializeMusicContext() {
    if (!musicContext) {
        musicContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create gain nodes for different parts
        backgroundMusicGain = musicContext.createGain();
        drumGain = musicContext.createGain();
        melodyGain = musicContext.createGain();

        // Connect to destination
        backgroundMusicGain.connect(musicContext.destination);
        drumGain.connect(musicContext.destination);
        melodyGain.connect(musicContext.destination);

        // Set initial volumes
        backgroundMusicGain.gain.value = 0.15; // Quiet background
        drumGain.gain.value = 0.1; // Subtle drums
        melodyGain.gain.value = 0.2; // Gentle melody
    }
}

function startMusicalAccompaniment() {
    if (!musicContext || !nurseryRhymes[currentSong].chords) return;

    const song = nurseryRhymes[currentSong];
    const beatDuration = 60 / song.tempo; // Beat duration in seconds

    // Start drum beat
    startDrumBeat(beatDuration);

    // Start chord progression
    startChordProgression();

    // Play gentle melody notes
    if (song.melody) {
        playMelodyNotes();
    }
}

function startDrumBeat(beatDuration) {
    let beatCount = 0;

    beatInterval = setInterval(() => {
        if (!isPlaying) return;

        // Simple kick-snare pattern
        if (beatCount % 4 === 0) {
            playDrumSound('kick'); // Kick on 1 and 3
        } else if (beatCount % 4 === 2) {
            playDrumSound('snare'); // Snare on 2 and 4
        }

        // Gentle hi-hat on every beat
        if (beatCount % 2 === 0) {
            playDrumSound('hihat');
        }

        beatCount++;
    }, (beatDuration * 1000) / playbackSpeed);
}

function playDrumSound(type) {
    if (!musicContext) return;

    const now = musicContext.currentTime;

    switch(type) {
        case 'kick':
            playPercussion(60, 0.1, 0.1, 'square');
            break;
        case 'snare':
            playPercussion(200, 0.05, 0.08, 'sawtooth');
            break;
        case 'hihat':
            playPercussion(8000, 0.02, 0.05, 'triangle');
            break;
    }
}

function playPercussion(frequency, volume, duration, type = 'sine') {
    const osc = musicContext.createOscillator();
    const gain = musicContext.createGain();

    osc.connect(gain);
    gain.connect(drumGain);

    osc.type = type;
    osc.frequency.value = frequency;

    const now = musicContext.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
}

function startChordProgression() {
    const song = nurseryRhymes[currentSong];
    if (!song.chords) return;

    song.chords.forEach(chordData => {
        setTimeout(() => {
            if (isPlaying) {
                playChord(chordData.chord, chordData.duration);
            }
        }, (chordData.timing * 1000) / playbackSpeed);
    });
}

function playChord(frequencies, duration) {
    if (!musicContext) return;

    const now = musicContext.currentTime;

    frequencies.forEach((freq, index) => {
        const osc = musicContext.createOscillator();
        const gain = musicContext.createGain();

        osc.connect(gain);
        gain.connect(backgroundMusicGain);

        osc.type = 'sine';
        osc.frequency.value = freq;

        // Gentle attack and release
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
        gain.gain.setValueAtTime(0.05, now + duration - 0.2);
        gain.gain.linearRampToValueAtTime(0, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    });
}

function playMelodyNotes() {
    const song = nurseryRhymes[currentSong];
    if (!song.melody) return;

    song.melody.forEach(note => {
        setTimeout(() => {
            if (isPlaying) {
                playMelodyNote(note.note, note.duration);
            }
        }, (note.timing * 1000) / playbackSpeed);
    });
}

function playMelodyNote(frequency, duration) {
    if (!musicContext) return;

    const osc = musicContext.createOscillator();
    const gain = musicContext.createGain();

    osc.connect(gain);
    gain.connect(melodyGain);

    osc.type = 'triangle';
    osc.frequency.value = frequency;

    const now = musicContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.setValueAtTime(0.1, now + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration);
}

function stopMusicalAccompaniment() {
    // All musical elements will stop naturally or are managed by intervals
    // that get cleared in pauseSong()
}

function playWordAccent(word) {
    // Play a gentle note when a word is highlighted
    if (!musicContext || !isPlaying) return;

    const frequencies = [523.25, 587.33, 659.25, 698.46]; // C5, D5, E5, F5
    const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];

    const osc = musicContext.createOscillator();
    const gain = musicContext.createGain();

    osc.connect(gain);
    gain.connect(melodyGain);

    osc.type = 'sine';
    osc.frequency.value = randomFreq;

    const now = musicContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
}

// Drawing & Coloring Functions
function initializeDrawing() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    templateCanvas = document.getElementById('templateCanvas');
    templateCtx = templateCanvas.getContext('2d');

    // Set up canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Create color palette
    createColorPalette();

    // Create stickers
    createStickers();

    // Add event listeners for drawing
    addDrawingEventListeners();

    // Set initial message
    updateDrawingMessage("Choose colors and start drawing! 🎨");
}

function createColorPalette() {
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';

    colors.forEach((color, index) => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn';
        colorBtn.style.backgroundColor = color;
        if (index === 0) colorBtn.classList.add('active');
        colorBtn.onclick = () => selectColor(color, colorBtn);
        palette.appendChild(colorBtn);
    });
}

function createStickers() {
    const stickerContainer = document.getElementById('stickers');
    stickerContainer.innerHTML = '';

    stickers.forEach(sticker => {
        const stickerBtn = document.createElement('button');
        stickerBtn.className = 'sticker-btn';
        stickerBtn.textContent = sticker;
        stickerBtn.onclick = () => addSticker(sticker);
        stickerContainer.appendChild(stickerBtn);
    });
}

function addDrawingEventListeners() {
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function selectColor(color, element) {
    currentColor = color;

    // Update active color button
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    playSound('click');
    speak(`${getColorName(color)} selected!`);
}

function getColorName(hexColor) {
    const colorNames = {
        '#ff6b6b': 'Red', '#4ecdc4': 'Teal', '#45b7d1': 'Blue', '#96ceb4': 'Green',
        '#feca57': 'Yellow', '#ff9ff3': 'Pink', '#54a0ff': 'Light Blue', '#5f27cd': 'Purple',
        '#00d2d3': 'Cyan', '#ff9f43': 'Orange', '#10ac84': 'Dark Green', '#ee5a6f': 'Rose',
        '#2c2c54': 'Dark Blue', '#40407a': 'Navy', '#706fd3': 'Lavender', '#f0932b': 'Dark Orange',
        '#eb4d4b': 'Dark Red', '#6ab04c': 'Lime Green'
    };
    return colorNames[hexColor] || 'Color';
}

function setBrushSize(size) {
    brushSize = size;

    // Update active brush button
    document.querySelectorAll('.brush-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    playSound('click');
    speak(`${size === 10 ? 'Small' : size === 20 ? 'Medium' : 'Large'} brush selected!`);
}

function setDrawingMode(mode) {
    drawingMode = mode;

    // Update active mode button
    document.querySelectorAll('.activity-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Clear template canvas
    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);

    switch(mode) {
        case 'free':
            updateDrawingMessage("Free drawing mode! Let your creativity flow! ✏️");
            break;
        case 'trace':
            loadRandomTemplate();
            updateDrawingMessage("Trace the letters or numbers! 📝");
            break;
        case 'color':
            loadColoringPage();
            updateDrawingMessage("Color inside the shapes! 🎨");
            break;
        case 'mix':
            showColorMixingPanel();
            updateDrawingMessage("Mix primary colors to create new colors! 🌈");
            break;
    }

    playSound('click');
    speak(`${mode === 'free' ? 'Free drawing' : mode === 'trace' ? 'Letter tracing' : mode === 'color' ? 'Coloring' : 'Color mixing'} mode!`);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    lastX = (e.clientX - rect.left) * scaleX;
    lastY = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;

    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);

    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        playSound('pop');
    }
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    playSound('click');
    speak('Canvas cleared!');
    updateDrawingMessage("Ready for a new masterpiece! ✨");
}

function saveDrawing() {
    try {
        // Create a new canvas to avoid clipboard API issues
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        const link = document.createElement('a');
        link.download = `drawing-${Date.now()}.png`;

        // Use toBlob instead of toDataURL to avoid clipboard API issues
        tempCanvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.click();

            // Clean up
            setTimeout(function() {
                URL.revokeObjectURL(url);
            }, 100);
        });

        celebrate();
        playSound('success');
        speak('Your drawing has been saved!');
    } catch (error) {
        console.error('Error saving drawing:', error);
        speak('Sorry, there was a problem saving your drawing.');
    }
}

function loadTemplate() {
    if (drawingMode === 'trace') {
        loadRandomTemplate();
    } else if (drawingMode === 'color') {
        loadColoringPage();
    } else {
        clearCanvas();
    }
    playSound('click');
}

function loadRandomTemplate() {
    const allTemplates = [...drawingTemplates.letters, ...drawingTemplates.numbers];
    const template = allTemplates[Math.floor(Math.random() * allTemplates.length)];

    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    templateCtx.font = '200px Arial';
    templateCtx.strokeStyle = '#ddd';
    templateCtx.lineWidth = 8;
    templateCtx.textAlign = 'center';
    templateCtx.textBaseline = 'middle';

    templateCtx.strokeText(template.data, templateCanvas.width / 2, templateCanvas.height / 2);

    speak(`Trace the ${template.name}!`);
}

function loadColoringPage() {
    const shapes = drawingTemplates.shapes;
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    templateCtx.strokeStyle = '#333';
    templateCtx.lineWidth = 4;
    templateCtx.fillStyle = 'transparent';

    const centerX = templateCanvas.width / 2;
    const centerY = templateCanvas.height / 2;
    const size = 150;

    switch(shape.shape) {
        case 'circle':
            templateCtx.beginPath();
            templateCtx.arc(centerX, centerY, size, 0, 2 * Math.PI);
            templateCtx.stroke();
            break;
        case 'square':
            templateCtx.strokeRect(centerX - size, centerY - size, size * 2, size * 2);
            break;
        case 'triangle':
            templateCtx.beginPath();
            templateCtx.moveTo(centerX, centerY - size);
            templateCtx.lineTo(centerX - size, centerY + size);
            templateCtx.lineTo(centerX + size, centerY + size);
            templateCtx.closePath();
            templateCtx.stroke();
            break;
        case 'star':
            drawStar(templateCtx, centerX, centerY, 5, size, size * 0.5);
            break;
        case 'heart':
            drawHeart(templateCtx, centerX, centerY, size);
            break;
    }

    speak(`Color the ${shape.name}!`);
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.stroke();
}

function drawHeart(ctx, cx, cy, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(cx, cy + topCurveHeight);
    ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
    ctx.bezierCurveTo(cx - size / 2, cy + (size + topCurveHeight) / 2, cx, cy + (size + topCurveHeight) / 2, cx, cy + size);
    ctx.bezierCurveTo(cx, cy + (size + topCurveHeight) / 2, cx + size / 2, cy + (size + topCurveHeight) / 2, cx + size / 2, cy + topCurveHeight);
    ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + topCurveHeight);
    ctx.closePath();
    ctx.stroke();
}

function addSticker(sticker) {
    const centerX = canvas.width / 2 + (Math.random() - 0.5) * 200;
    const centerY = canvas.height / 2 + (Math.random() - 0.5) * 200;

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker, centerX, centerY);

    playSound('click');
    speak('Sticker added!');
}

function updateDrawingMessage(message) {
    document.getElementById('drawingMessage').textContent = message;
}

// Color Mixing Functions
function showColorMixingPanel() {
    // Hide other panels
    document.getElementById('stickerPanel').style.display = 'none';

    // Show color mixing panel
    document.getElementById('colorMixingPanel').style.display = 'block';

    // Reset mixing state
    resetMixing();

    speak('Let\s learn about mixing colors! Choose two primary colors to create a new color!');
}

function selectPrimaryColor(colorName, colorValue) {
    // Check if this color is already selected
    if (selectedColors.some(c => c.name === colorName)) {
        speak(`${colorName} is already selected! Choose a different color.`);
        return;
    }

    // Add color to selection (respecting max colors for current mode)
    if (selectedColors.length < maxColors) {
        selectedColors.push({ name: colorName, value: colorValue });

        // Update visual displays
        updateSelectedColorsDisplay();
        updateMixingBowls();

        // Visual feedback for selection
        highlightSelectedColor(colorName);

        // Check if we can enable mix button
        if (selectedColors.length >= 2) {
            document.getElementById('mixBtn').disabled = false;
            if (selectedColors.length === 2) {
                speak(`Great! You selected ${selectedColors[0].name} and ${selectedColors[1].name}. ${mixingMode === 'advanced' ? 'You can add more colors or' : ''} Click the mix button!`);
            } else {
                speak(`Wow! You have ${selectedColors.length} colors selected. Ready to create something amazing!`);
            }
        } else {
            speak(`You selected ${colorName}! ${mixingMode === 'simple' ? 'Choose one more color' : 'Choose at least one more color'} to mix.`);
        }

        playSound('ding');
    } else {
        speak(`You can only select ${maxColors} colors in ${mixingMode} mode. Try removing a color first!`);
    }
}

function setMixingMode(mode) {
    mixingMode = mode;
    maxColors = mode === 'simple' ? 2 : 6; // Allow up to 6 colors in advanced mode

    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode + 'ModeBtn').classList.add('active');

    // Reset selections
    resetMixing();

    // Update explanation
    const explanation = document.getElementById('mixingExplanation');
    if (mode === 'simple') {
        explanation.textContent = 'Choose exactly 2 colors to mix together! 🌈';
    } else {
        explanation.textContent = 'Choose 2-6 colors to create amazing new colors! 🧪✨';
    }

    speak(`${mode === 'simple' ? 'Simple' : 'Advanced'} mixing mode selected! ${mode === 'simple' ? 'Choose 2 colors' : 'Choose 2 to 6 colors'} to mix together.`);
    playSound('click');
}

function highlightSelectedColor(colorName) {
    // Add visual feedback to the selected color button
    const colorBtn = document.querySelector(`[data-color="${colorName}"]`);
    if (colorBtn) {
        colorBtn.classList.add('selected');
        setTimeout(() => {
            colorBtn.style.transform = 'scale(1.1)';
        }, 100);
    }
}

function updateSelectedColorsDisplay() {
    const selectedColorsList = document.getElementById('selectedColorsList');
    selectedColorsList.innerHTML = '';

    selectedColors.forEach((color, index) => {
        const colorChip = document.createElement('div');
        colorChip.className = 'selected-color-chip';
        colorChip.innerHTML = `
            <div class="color-chip" style="background-color: ${color.value};"></div>
            <span class="color-name">${color.name}</span>
            <button class="remove-color-btn" onclick="removeSelectedColor(${index})">×</button>
        `;
        selectedColorsList.appendChild(colorChip);
    });
}

function removeSelectedColor(index) {
    const removedColor = selectedColors[index];
    selectedColors.splice(index, 1);

    // Remove visual selection from button
    const colorBtn = document.querySelector(`[data-color="${removedColor.name}"]`);
    if (colorBtn) {
        colorBtn.classList.remove('selected');
        colorBtn.style.transform = '';
    }

    // Update displays
    updateSelectedColorsDisplay();
    updateMixingBowls();

    // Update mix button state
    document.getElementById('mixBtn').disabled = selectedColors.length < 2;

    speak(`Removed ${removedColor.name}!`);
    playSound('click');
}

function updateMixingBowls() {
    const mixingBowlsContainer = document.getElementById('mixingBowls');
    mixingBowlsContainer.innerHTML = '';

    selectedColors.forEach((color, index) => {
        const bowl = document.createElement('div');
        bowl.className = 'mixing-bowl';
        bowl.innerHTML = `
            <div class="bowl-content" style="background-color: ${color.value}; opacity: 1;" id="bowlContent${index}"></div>
            <div class="bowl-label">${color.name}</div>
        `;
        mixingBowlsContainer.appendChild(bowl);

        if (index < selectedColors.length - 1) {
            const plus = document.createElement('div');
            plus.className = 'mixing-plus';
            plus.textContent = '+';
            mixingBowlsContainer.appendChild(plus);
        }
    });

    if (selectedColors.length > 0) {
        const equals = document.createElement('div');
        equals.className = 'mixing-equals';
        equals.textContent = '=';
        mixingBowlsContainer.appendChild(equals);

        const resultBowl = document.createElement('div');
        resultBowl.className = 'mixing-bowl result-bowl';
        resultBowl.innerHTML = `
            <div class="bowl-content" id="resultContent" style="opacity: 0.3;"></div>
            <div class="bowl-label">New Color!</div>
        `;
        mixingBowlsContainer.appendChild(resultBowl);
    }
}

function mixColors() {
    if (selectedColors.length < 2) return;

    // Start mixing animation sequence
    startMixingAnimation();

    // Create mixed result using dynamic algorithm
    const result = createMixedColorResult(selectedColors);

    // Speak the mixing process
    const colorNames = selectedColors.map(c => c.name).join(', ');
    speak(`Let's mix ${colorNames} together! This is going to be amazing!`);

    // Simulate mixing process with realistic timing
    setTimeout(() => {
        // Phase 1: Start swirling after all colors are poured
        startSwirlingAnimation();
    }, selectedColors.length * 600 + 1000);

    setTimeout(() => {
        // Phase 2: Colors start blending in cauldron
        blendColorsAnimation();
    }, selectedColors.length * 600 + 2000);

    setTimeout(() => {
        // Phase 3: Final magical result
        showMixingResult(result);
    }, selectedColors.length * 600 + 4500);
}

function createMixedColorResult(colors) {
    // Try predefined combinations first for educational value
    if (colors.length === 2) {
        const combinationKey = `${colors[0].name}+${colors[1].name}`;
        const predefined = colorMixingData[combinationKey];
        if (predefined) {
            return predefined;
        }
    }

    // Dynamic color mixing algorithm
    const mixedRGB = averageColors(colors.map(c => c.value));
    const colorName = generateColorName(colors, mixedRGB);

    return {
        color: rgbToHex(mixedRGB.r, mixedRGB.g, mixedRGB.b),
        name: colorName
    };
}

function averageColors(hexColors) {
    let totalR = 0, totalG = 0, totalB = 0;

    hexColors.forEach(hex => {
        const rgb = hexToRgb(hex);
        totalR += rgb.r;
        totalG += rgb.g;
        totalB += rgb.b;
    });

    return {
        r: Math.round(totalR / hexColors.length),
        g: Math.round(totalG / hexColors.length),
        b: Math.round(totalB / hexColors.length)
    };
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function generateColorName(colors, rgb) {
    // Special names for interesting combinations
    const colorNames = colors.map(c => c.name.toLowerCase());

    if (colors.length === 3) {
        if (colorNames.includes('red') && colorNames.includes('blue') && colorNames.includes('yellow')) {
            return 'Magic Rainbow Mix';
        }
        if (colorNames.includes('red') && colorNames.includes('green') && colorNames.includes('blue')) {
            return 'Super Power Color';
        }
        if (colorNames.some(name => name.includes('light')) && colorNames.length === 3) {
            return 'Dreamy Cloud Mix';
        }
    }

    if (colors.length === 4) {
        return 'Amazing Four-Color Wonder';
    }

    if (colors.length >= 5) {
        return 'Ultimate Rainbow Creation';
    }

    // Analyze the resulting color
    const { r, g, b } = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Determine dominant color with creative names
    if (r > g && r > b) {
        if (r > 200) return 'Fire Engine Red Mix';
        if (r > 150) return 'Cherry Red Blend';
        return 'Ruby Red Creation';
    } else if (g > r && g > b) {
        if (g > 200) return 'Lime Green Wonder';
        if (g > 150) return 'Grass Green Mix';
        return 'Forest Green Blend';
    } else if (b > r && b > g) {
        if (b > 200) return 'Ocean Blue Mix';
        if (b > 150) return 'Blueberry Blend';
        return 'Navy Blue Creation';
    }

    // Check for gray/brown tones
    const colorDiff = max - min;
    if (colorDiff < 30) {
        if (max > 180) return 'Silver Cloud';
        if (max > 100) return 'Elephant Gray';
        return 'Shadow Gray';
    }

    // Check for specific color ranges
    if (r > g && r > b && g > b) return 'Pumpkin Orange Mix';
    if (r > b && g > b && Math.abs(r - g) < 50) return 'Sunshine Yellow Mix';
    if (g > r && b > r && Math.abs(g - b) < 50) return 'Tropical Cyan Mix';
    if (r > g && b > g && Math.abs(r - b) < 50) return 'Unicorn Magenta Mix';

    return `Magical ${colors.length}-Color Creation`;
}

function startMixingAnimation() {
    const mixBtn = document.getElementById('mixBtn');
    const mixingBowls = document.querySelector('.mixing-bowls');
    const cauldronContent = document.querySelector('.cauldron-content');

    // Animate the mix button
    mixBtn.classList.add('mixing');
    mixBtn.textContent = '🪄 Pouring Colors...';
    mixBtn.disabled = true;

    // Start cauldron activation
    if (cauldronContent) {
        cauldronContent.classList.add('mixing-active');
    }

    // Start pouring animation for each color bowl
    selectedColors.forEach((color, index) => {
        setTimeout(() => {
            pourColorFromBowl(index, color);
        }, index * 600); // Stagger the pouring
    });
}

function pourColorFromBowl(bowlIndex, color) {
    const bowlContent = document.getElementById(`bowlContent${bowlIndex}`);
    const bowl = bowlContent?.parentElement;

    if (!bowl) return;

    // Tilt the bowl
    bowlContent.classList.add('pouring');

    // Play pouring sound
    playPouringSound();

    // Create color stream
    const stream = document.createElement('div');
    stream.className = 'color-stream';
    stream.style.setProperty('--stream-color', color.value);

    // Position the stream from bowl to cauldron
    const bowlRect = bowl.getBoundingClientRect();
    const cauldron = document.querySelector('.cauldron-content');
    const cauldronRect = cauldron?.getBoundingClientRect();

    if (cauldronRect) {
        // Calculate stream position
        const streamLeft = bowlRect.left + bowlRect.width/2 - 4; // Center stream
        const streamTop = bowlRect.bottom;

        stream.style.left = streamLeft + 'px';
        stream.style.top = streamTop + 'px';
        stream.style.position = 'fixed';

        document.body.appendChild(stream);

        // Start flowing animation
        setTimeout(() => {
            stream.classList.add('flowing');

            // Add color swirl to cauldron when stream reaches it
            setTimeout(() => {
                addColorSwirlToCauldron(color.value, bowlIndex);
            }, 800);

        }, 100);

        // Clean up stream
        setTimeout(() => {
            if (stream.parentNode) {
                stream.parentNode.removeChild(stream);
            }
        }, 2500);
    }

    // Reset bowl tilt after pouring
    setTimeout(() => {
        bowlContent.classList.remove('pouring');
    }, 2000);
}

function addColorSwirlToCauldron(colorValue, index) {
    const cauldronSurface = document.getElementById('cauldronSurface');
    if (!cauldronSurface) return;

    // Create a swirl element for this color
    const swirl = document.createElement('div');
    swirl.className = 'color-swirl';
    swirl.style.background = `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 15}%, ${colorValue} 20%, transparent 60%)`;
    swirl.style.transform = `rotate(${index * 45}deg)`;

    cauldronSurface.appendChild(swirl);

    // Start swirling animation
    setTimeout(() => {
        swirl.classList.add('swirling');
    }, 100);

    // Update cauldron surface opacity
    cauldronSurface.style.opacity = '0.9';

    // Play magical swirl sound
    playMagicalSwirlSound();
}

function startSwirlingAnimation() {
    // This function now triggers after all colors are poured
    speak('Watch the colors swirl together in the magic pot!');

    // Create additional magical particles
    createMagicalParticles();
}

function createMagicalParticles() {
    const cauldron = document.querySelector('.cauldron-content');
    if (!cauldron) return;

    const rect = cauldron.getBoundingClientRect();

    // Create sparkle particles around the cauldron
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.background = selectedColors[i % selectedColors.length].value;
        particle.style.borderRadius = '50%';
        particle.style.left = rect.left + rect.width/2 + Math.random() * 100 - 50 + 'px';
        particle.style.top = rect.top + rect.height/2 + Math.random() * 100 - 50 + 'px';
        particle.style.animation = `magicalSparkle ${1.5 + Math.random()}s ease-out forwards`;
        particle.style.zIndex = '1000';
        particle.style.pointerEvents = 'none';

        document.body.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2500);
    }
}

function playPouringSound() {
    // Create pouring sound effect
    if (musicContext) {
        const oscillator = musicContext.createOscillator();
        const gainNode = musicContext.createGain();
        const filter = musicContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(musicContext.destination);

        // Liquid pouring sound
        oscillator.frequency.setValueAtTime(150, musicContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, musicContext.currentTime + 1.5);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, musicContext.currentTime);

        gainNode.gain.setValueAtTime(0.08, musicContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, musicContext.currentTime + 1.5);

        oscillator.type = 'sawtooth';
        oscillator.start(musicContext.currentTime);
        oscillator.stop(musicContext.currentTime + 1.5);
    }
}

function playMagicalSwirlSound() {
    // Create magical swirl sound
    if (musicContext) {
        const oscillator = musicContext.createOscillator();
        const gainNode = musicContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(musicContext.destination);

        // Magical swirling sound
        oscillator.frequency.setValueAtTime(300, musicContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, musicContext.currentTime + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(200, musicContext.currentTime + 1);

        gainNode.gain.setValueAtTime(0.05, musicContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, musicContext.currentTime + 1);

        oscillator.type = 'sine';
        oscillator.start(musicContext.currentTime);
        oscillator.stop(musicContext.currentTime + 1);
    }
}

function blendColorsAnimation() {
    const resultBowl = document.getElementById('resultContent');
    const cauldronSurface = document.getElementById('cauldronSurface');

    // Start cauldron bubbling animation
    startCauldronBubbling();

    // Animate progressive color blending
    let blendStep = 0;
    const totalSteps = 100;
    const blendInterval = setInterval(() => {
        blendStep += 5;

        // Create progressive blend of all selected colors
        const blendedColor = blendMultipleColors(selectedColors.map(c => c.value), blendStep / totalSteps);

        // Update both result bowl and cauldron
        if (resultBowl) {
            resultBowl.style.backgroundColor = blendedColor;
            resultBowl.style.opacity = Math.min(blendStep / totalSteps, 1);
        }

        if (cauldronSurface) {
            cauldronSurface.style.backgroundColor = blendedColor;
            cauldronSurface.style.opacity = Math.min(blendStep / totalSteps * 0.8, 0.8);
        }

        if (blendStep >= totalSteps) {
            clearInterval(blendInterval);
        }
    }, 40);
}

function blendMultipleColors(hexColors, ratio) {
    if (hexColors.length === 1) return hexColors[0];

    // Progressive blending: start with first color, gradually add others
    let currentColor = hexToRgb(hexColors[0]);

    for (let i = 1; i < hexColors.length; i++) {
        const nextColor = hexToRgb(hexColors[i]);
        const blendRatio = Math.min(ratio * hexColors.length - (i - 1), 1);

        if (blendRatio > 0) {
            currentColor = {
                r: Math.round(currentColor.r * (1 - blendRatio) + nextColor.r * blendRatio),
                g: Math.round(currentColor.g * (1 - blendRatio) + nextColor.g * blendRatio),
                b: Math.round(currentColor.b * (1 - blendRatio) + nextColor.b * blendRatio)
            };
        }
    }

    return rgbToHex(currentColor.r, currentColor.g, currentColor.b);
}

function startCauldronBubbling() {
    const bubblesContainer = document.getElementById('bubbles');
    if (!bubblesContainer) return;

    // Clear existing bubbles
    bubblesContainer.innerHTML = '';

    // Create animated bubbles
    const bubbleCount = 8 + selectedColors.length * 2; // More bubbles for more colors

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = Math.random() * 80 + 10 + '%';
        bubble.style.animationDelay = Math.random() * 2 + 's';
        bubble.style.animationDuration = (2 + Math.random() * 3) + 's';
        bubblesContainer.appendChild(bubble);
    }

    // Add bubbling class for extra effects
    document.querySelector('.cauldron-content').classList.add('bubbling');
}

function showMixingResult(result) {
    mixedColor = result.color;

    // Clean up animations
    const cauldronContent = document.querySelector('.cauldron-content');
    if (cauldronContent) {
        cauldronContent.classList.remove('mixing-active', 'bubbling');
    }

    // Final cauldron color reveal
    const cauldronSurface = document.getElementById('cauldronSurface');
    if (cauldronSurface) {
        cauldronSurface.style.backgroundColor = result.color;
        cauldronSurface.style.opacity = '1';
        cauldronSurface.style.transform = 'scale(1.1)';

        setTimeout(() => {
            cauldronSurface.style.transform = 'scale(1)';
        }, 500);
    }

    // Show final result with dramatic effect
    const resultBowl = document.getElementById('resultContent');
    if (resultBowl) {
        resultBowl.style.backgroundColor = result.color;
        resultBowl.style.opacity = '1';
        resultBowl.style.transform = 'scale(1.3)';

        setTimeout(() => {
            resultBowl.style.transform = 'scale(1)';
        }, 500);
    }

    // Update result text with animation
    const resultText = document.getElementById('resultText');
    const colorsList = selectedColors.map(c => c.name).join(' + ');
    if (resultText) {
        resultText.innerHTML = `🎉 ${colorsList} = <strong>${result.name}!</strong>`;
        resultText.style.display = 'block';
        resultText.style.animation = 'resultSlideIn 0.5s ease-out';
    }

    // Show use color button
    const useColorBtn = document.getElementById('useColorBtn');
    if (useColorBtn) {
        useColorBtn.style.display = 'inline-block';
    }

    // Reset mix button
    const mixBtn = document.getElementById('mixBtn');
    mixBtn.classList.remove('mixing');
    mixBtn.textContent = '🌀 Mix Colors!';
    mixBtn.disabled = true; // Keep disabled until reset

    // Play celebration sound and speak result
    playCelebrationSound();
    const colorNames = selectedColors.map(c => c.name).join(' and ');
    speak(`Wow! ${colorNames} makes ${result.name}! That's amazing magic!`);

    // Show celebration
    setTimeout(() => {
        showCelebration(`You made ${result.name}!`);
    }, 1000);
}

function createColorParticles() {
    const mixingArea = document.querySelector('.mixing-area');

    // Create floating color particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = i % 2 === 0 ? selectedColors[0].value : selectedColors[1].value;
        particle.style.left = Math.random() * 300 + 'px';
        particle.style.top = Math.random() * 100 + 'px';
        particle.style.animation = `floatParticle ${2 + Math.random() * 2}s ease-out forwards`;
        particle.style.zIndex = '1000';

        mixingArea.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 4000);
    }
}

function createBlendedColor(color1, color2, ratio) {
    // Simple color blending - convert hex to RGB, blend, convert back
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);

    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

    return `rgb(${r}, ${g}, ${b})`;
}

function playMixingSound() {
    // Create a mixing sound effect using Web Audio API
    if (musicContext) {
        const oscillator = musicContext.createOscillator();
        const gainNode = musicContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(musicContext.destination);

        // Create a "swirling" sound effect
        oscillator.frequency.setValueAtTime(200, musicContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, musicContext.currentTime + 1);
        oscillator.frequency.exponentialRampToValueAtTime(100, musicContext.currentTime + 2);

        gainNode.gain.setValueAtTime(0.1, musicContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, musicContext.currentTime + 2);

        oscillator.type = 'sine';
        oscillator.start(musicContext.currentTime);
        oscillator.stop(musicContext.currentTime + 2);
    }
}

function resetMixing() {
    selectedColors = [];
    mixedColor = null;

    // Clear selected colors display
    updateSelectedColorsDisplay();
    updateMixingBowls();

    // Clear cauldron
    const cauldronSurface = document.getElementById('cauldronSurface');
    const bubbles = document.getElementById('bubbles');
    if (cauldronSurface) {
        cauldronSurface.style.backgroundColor = 'transparent';
        cauldronSurface.style.opacity = '0';
    }
    if (bubbles) {
        bubbles.innerHTML = '';
    }

    // Remove bubbling effects
    const cauldronContent = document.querySelector('.cauldron-content');
    if (cauldronContent) {
        cauldronContent.classList.remove('bubbling');
    }

    // Hide result elements
    const resultText = document.getElementById('resultText');
    const useColorBtn = document.getElementById('useColorBtn');
    if (resultText) resultText.style.display = 'none';
    if (useColorBtn) useColorBtn.style.display = 'none';

    // Disable mix button
    document.getElementById('mixBtn').disabled = true;

    // Remove active states from all color buttons
    document.querySelectorAll('.primary-color-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.transform = '';
    });

    const modeText = mixingMode === 'simple' ? 'Choose 2 colors' : 'Choose 2 or more colors';
    speak(`${modeText} to mix together!`);
}

function useNewColor() {
    if (mixedColor) {
        currentColor = mixedColor;

        // Add the mixed color to the color palette
        addMixedColorToPalette(mixedColor, selectedColors);

        // Switch to free drawing mode
        setDrawingMode('free');

        speak('Great! Now you can draw with your new color!');
        playSound('click');
    }
}

function addMixedColorToPalette(color, colorInfo) {
    const colorPalette = document.getElementById('colorPalette');

    // Check if this color already exists
    const existingColor = Array.from(colorPalette.children).find(btn => 
        btn.style.backgroundColor === color
    );

    if (!existingColor) {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn mixed-color';
        colorBtn.style.backgroundColor = color;
        colorBtn.onclick = () => selectColor(color, colorBtn);
        colorBtn.title = `Mixed ${colorInfo[0].name} + ${colorInfo[1].name}`;

        // Add a small indicator that this is a mixed color
        colorBtn.innerHTML = '<small>🌈</small>';

        colorPalette.appendChild(colorBtn);
    }
}

// Interactive Storybooks Functions
function initializeStorybooks() {
    const bookShelf = document.getElementById('bookShelf');
    if (!bookShelf) return;

    bookShelf.innerHTML = '';

    interactiveStories.forEach(story => {
        const bookCover = document.createElement('div');
        bookCover.className = 'book-cover';
        bookCover.onclick = () => openStory(story.id);

        bookCover.innerHTML = `
            <div class="book-spine">
                <div class="book-cover-emoji">${story.cover}</div>
                <div class="book-title">${story.title}</div>
                <div class="book-description">${story.description}</div>
            </div>
        `;

        bookShelf.appendChild(bookCover);
    });
}

function openStory(storyId) {
    currentStory = interactiveStories.find(story => story.id === storyId);
    if (!currentStory) return;

    currentPage = 0;
    isAutoReading = false;

    // Show story reader, hide library
    document.getElementById('storyLibrary').style.display = 'none';
    document.getElementById('storyReader').style.display = 'block';
    document.getElementById('storyCompletion').style.display = 'none';

    // Update header
    document.getElementById('currentStoryTitle').textContent = currentStory.title;

    // Load first page
    loadStoryPage();

    // Play opening sound
    playStorySound();
    speak(`Let's read ${currentStory.title} together!`);
}

function loadStoryPage() {
    if (!currentStory || currentPage >= currentStory.pages.length) return;

    const page = currentStory.pages[currentPage];

    // Update page counter
    document.getElementById('pageCounter').textContent = 
        `Page ${currentPage + 1} of ${currentStory.pages.length}`;

    // Update story text
    document.getElementById('storyText').textContent = page.text;

    // Render interactive scene
    renderStoryScene(page.scene);

    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentPage === 0;
    document.getElementById('nextBtn').disabled = currentPage === currentStory.pages.length - 1;

    // Update progress
    const progress = ((currentPage + 1) / currentStory.pages.length) * 100;
    document.getElementById('progressFillStory').style.width = progress + '%';

    // Page turn animation
    const storyPage = document.getElementById('storyPage');
    storyPage.style.animation = 'pageFlip 0.5s ease-in-out';
    setTimeout(() => {
        storyPage.style.animation = '';
    }, 500);
}

function renderStoryScene(scene) {
    const storyScene = document.getElementById('storyScene');
    storyScene.innerHTML = '';
    storyScene.style.backgroundColor = scene.background;

    scene.elements.forEach((element, index) => {
        const sceneElement = document.createElement('div');
        sceneElement.className = 'scene-element';
        sceneElement.style.left = element.x + '%';
        sceneElement.style.top = element.y + '%';
        sceneElement.style.fontSize = element.size + 'px';
        sceneElement.textContent = element.content;
        sceneElement.style.transform = 'translate(-50%, -50%)';
        sceneElement.style.position = 'absolute';
        sceneElement.style.cursor = element.clickable ? 'pointer' : 'default';
        sceneElement.style.userSelect = 'none';
        sceneElement.style.transition = 'all 0.3s ease';

        if (element.clickable) {
            sceneElement.onclick = () => playElementSound(element.sound);
            sceneElement.onmouseover = () => {
                sceneElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
                sceneElement.style.filter = 'drop-shadow(0 0 10px rgba(255,255,0,0.8))';
            };
            sceneElement.onmouseout = () => {
                sceneElement.style.transform = 'translate(-50%, -50%) scale(1)';
                sceneElement.style.filter = 'none';
            };
        }

        // Animate elements appearing
        sceneElement.style.opacity = '0';
        sceneElement.style.transform += ' scale(0.1)';

        storyScene.appendChild(sceneElement);

        // Stagger animations
        setTimeout(() => {
            sceneElement.style.opacity = '1';
            sceneElement.style.transform = 'translate(-50%, -50%) scale(1)';
        }, index * 200);
    });
}

function playElementSound(soundText) {
    speak(soundText);
    playSound('ding');

    // Add sparkle effect
    createSparkleEffect(event.target);
}

function createSparkleEffect(element) {
    const rect = element.getBoundingClientRect();

    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.position = 'fixed';
        sparkle.style.left = rect.left + rect.width/2 + 'px';
        sparkle.style.top = rect.top + rect.height/2 + 'px';
        sparkle.style.fontSize = '20px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '10000';
        sparkle.style.animation = `sparkleFloat ${1 + Math.random()}s ease-out forwards`;

        document.body.appendChild(sparkle);

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1500);
    }
}

function nextPage() {
    if (!currentStory || currentPage >= currentStory.pages.length - 1) return;

    currentPage++;
    loadStoryPage();
    playPageTurnSound();

    if (currentPage === currentStory.pages.length - 1) {
        setTimeout(() => {
            completeStory();
        }, 3000);
    }
}

function previousPage() {
    if (!currentStory || currentPage <= 0) return;

    currentPage--;
    loadStoryPage();
    playPageTurnSound();
}

function readCurrentPage() {
    if (!currentStory) return;

    const page = currentStory.pages[currentPage];
    speak(page.text);
    playStorySound();
}

function toggleAutoRead() {
    isAutoReading = !isAutoReading;
    const autoBtn = document.getElementById('autoBtn');

    if (isAutoReading) {
        autoBtn.innerHTML = '⏸️ Pause';
        startAutoReading();
    } else {
        autoBtn.innerHTML = '▶️ Auto Play';
        stopAutoReading();
    }
}

function startAutoReading() {
    if (!currentStory || !isAutoReading) return;

    readCurrentPage();

    // Auto advance after 8 seconds
    storyAutoTimer = setTimeout(() => {
        if (isAutoReading && currentPage < currentStory.pages.length - 1) {
            nextPage();
            startAutoReading();
        } else if (currentPage === currentStory.pages.length - 1) {
            completeStory();
        }
    }, 8000);
}

function stopAutoReading() {
    if (storyAutoTimer) {
        clearTimeout(storyAutoTimer);
        storyAutoTimer = null;
    }
}

function completeStory() {
    stopAutoReading();

    // Show completion screen
    document.getElementById('storyReader').style.display = 'none';
    document.getElementById('storyCompletion').style.display = 'block';

    // Update completion message
    document.getElementById('completionMessage').textContent = 
        `Wonderful! You finished reading "${currentStory.title}"! You're becoming a great reader!`;

    // Play celebration
    playCelebrationSound();
    speak(`Hooray! You finished the story! That was amazing reading!`);

    // Show celebration
    setTimeout(() => {
        showCelebration(`Story Complete! 📚`);
    }, 1000);
}

function restartStory() {
    currentPage = 0;
    isAutoReading = false;
    stopAutoReading();

    document.getElementById('storyCompletion').style.display = 'none';
    document.getElementById('storyReader').style.display = 'block';

    loadStoryPage();
    speak(`Let's read ${currentStory.title} again!`);
}

function backToLibrary() {
    stopAutoReading();
    currentStory = null;
    currentPage = 0;
    isAutoReading = false;

    document.getElementById('storyReader').style.display = 'none';
    document.getElementById('storyCompletion').style.display = 'none';
    document.getElementById('storyLibrary').style.display = 'block';

    speak('Choose another story to read!');
}

function playStorySound() {
    // Create gentle story reading sound
    if (musicContext) {
        const oscillator = musicContext.createOscillator();
        const gainNode = musicContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(musicContext.destination);

        oscillator.frequency.setValueAtTime(220, musicContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(330, musicContext.currentTime + 0.5);

        gainNode.gain.setValueAtTime(0.05, musicContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, musicContext.currentTime + 0.5);

        oscillator.type = 'sine';
        oscillator.start(musicContext.currentTime);
        oscillator.stop(musicContext.currentTime + 0.5);
    }
}

function playPageTurnSound() {
    // Create page turning sound effect
    if (musicContext) {
        const oscillator = musicContext.createOscillator();
        const gainNode = musicContext.createGain();
        const filter = musicContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(musicContext.destination);

        oscillator.frequency.setValueAtTime(800, musicContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, musicContext.currentTime + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, musicContext.currentTime);

        gainNode.gain.setValueAtTime(0.08, musicContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, musicContext.currentTime + 0.3);

        oscillator.type = 'sawtooth';
        oscillator.start(musicContext.currentTime);
        oscillator.stop(musicContext.currentTime + 0.3);
    }
}
