let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
let currentCardIndex = 0;
let timer;
let studyStartTime;
let correctCount = 0;
let incorrectCount = 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
    document.getElementById(`${sectionName}Section`).classList.remove('hidden');
    if (sectionName === 'stats') {
        updateStatistics(); 
    }
}

function updatePreview(editorId, previewId) {
    const editor = document.getElementById(editorId);
    const preview = document.getElementById(previewId);
    preview.innerHTML = editor.innerHTML;
}

function addCard() {
    const frontText = document.getElementById('frontTextEditor').innerHTML.trim();
    const backText = document.getElementById('backTextEditor').innerHTML.trim();
    const category = document.getElementById('cardCategory').value;
    const difficulty = document.getElementById('cardDifficulty').value;
    const tags = document.getElementById('tagInput').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (!frontText || !backText) {
        alert('Please fill in both front and back of the card');
        return;
    }

    const card = {
        id: Date.now(),
        front: frontText,
        back: backText,
        category,
        difficulty,
        tags,
        stats: {
            timesReviewed: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            lastReviewed: null
        }
    };

    flashcards.push(card);
    saveToLocalStorage();
    resetCardForm();
    
    // Redirect to cards page after adding
    window.location.href = 'cards.html';
}

function resetCardForm() {
    document.getElementById('frontTextEditor').innerHTML = '';
    document.getElementById('backTextEditor').innerHTML = '';
    document.getElementById('tagInput').value = '';
    document.getElementById('frontTextPreview').innerHTML = '';
    document.getElementById('backTextPreview').innerHTML = '';
}

function displayCards() {
    const cardListContent = document.getElementById('cardListContent');
    cardListContent.classList.add('loading');
    
    const filterCategory = document.getElementById('filterCategory').value;
    const searchText = document.getElementById('searchCards').value.toLowerCase();

    const filteredCards = flashcards.filter(card => {
        const matchesCategory = filterCategory === 'all' || card.category === filterCategory;
        const matchesSearch = card.front.toLowerCase().includes(searchText) || 
                            card.back.toLowerCase().includes(searchText) ||
                            card.tags.some(tag => tag.toLowerCase().includes(searchText));
        return matchesCategory && matchesSearch;
    });

    cardListContent.innerHTML = filteredCards.map(card => `
        <div class="flashcard">
            <h4>${card.front}</h4>
            <p><strong>Category:</strong> ${card.category}</p>
<p><strong>Back:</strong> ${card.back}</p>
            <p><strong>Difficulty:</strong> ${card.difficulty}</p>
            <p><strong>Tags:</strong> ${card.tags.join(', ') || 'None'}</p>
            <button onclick="deleteCard(${card.id})" class="delete-button">Delete</button>
        </div>
    `).join('');
    
    setTimeout(() => {
        cardListContent.classList.remove('loading');
    }, 300);
}


function deleteCard(id) {
    if (confirm('Are you sure you want to delete this card?')) {
        flashcards = flashcards.filter(card => card.id !== id);
        saveToLocalStorage();
        displayCards();
    }
}

function startPractice() {
    const category = document.getElementById('practiceCategory').value;
    
    // Filter cards based on selected category only
    let practiceCards = [...flashcards]; // Create a copy of flashcards array
    
    if (category !== 'all') {
        practiceCards = practiceCards.filter(card => card.category === category);
    }

    if (practiceCards.length === 0) {
        alert('No cards available for practice in this category. Please select a different category.');
        return;
    }

    // Shuffle cards for random practice
    practiceCards = practiceCards.sort(() => Math.random() - 0.5);
    
    // Update practice session setup
    currentCardIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    
    document.querySelector('.study-section').classList.add('hidden');
    document.getElementById('practiceMode').classList.remove('hidden');
    
    // Store practice cards for this session
    sessionStorage.setItem('practiceCards', JSON.stringify(practiceCards));
    
    displayCurrentCard();
    startTimer();
    updateProgress();
}

function displayCurrentCard() {
    const card = flashcards[currentCardIndex];
    document.getElementById('currentCard').innerHTML = card.front;
    document.getElementById('userAnswer').value = '';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('userAnswer').focus();
}

function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim().toLowerCase();
    const currentCard = flashcards[currentCardIndex];
    
    // Strip HTML from the answer before comparing
    const correctAnswer = stripHtml(currentCard.back).toLowerCase().trim();

    currentCard.stats.timesReviewed++;
    currentCard.stats.lastReviewed = new Date();

    if (userAnswer === correctAnswer) {
        correctCount++;
        currentCard.stats.correctAnswers++;
        document.getElementById('feedback').innerHTML = `
            <div class="correct">Correct!</div>
            <div class="actual-answer">Answer: ${currentCard.back}</div>`;
        document.getElementById('feedback').className = 'feedback correct';
        setTimeout(nextCard, 1500);
    } else {
        incorrectCount++;
        currentCard.stats.incorrectAnswers++;
        document.getElementById('feedback').innerHTML = `
            <div class="incorrect">Incorrect. Try again!</div>
            <div class="actual-answer">Correct answer: ${currentCard.back}</div>`;
        document.getElementById('feedback').className = 'feedback incorrect';
    }

    updateProgress();
    saveToLocalStorage();
}

// Add this helper function if not already present
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function skipCard() {
    nextCard();
}

function nextCard() {
    currentCardIndex++;
    if (currentCardIndex >= flashcards.length) {
        endPractice();
    } else {
        displayCurrentCard();
    }
    updateProgress();
}

function updateProgress() {
    const totalCards = flashcards.length;
    const progress = ((currentCardIndex + 1) / totalCards) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('cardsReviewed').textContent = currentCardIndex + 1;
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('incorrectAnswers').textContent = incorrectCount;
}

function startTimer() {
    studyStartTime = new Date();
    timer = setInterval(() => {
        const now = new Date();
        const diff = now - studyStartTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        document.getElementById('studyTimer').textContent = 
            `Study Time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function endPractice() {
    clearInterval(timer);
    document.querySelector('.study-section').classList.remove('hidden');
    document.getElementById('practiceMode').classList.add('hidden');
    
    const studySession = {
        date: new Date(),
        duration: new Date() - studyStartTime,
        correctCount,
        incorrectCount
    };
    
    const studyHistory = JSON.parse(localStorage.getItem('studyHistory')) || [];
    studyHistory.push(studySession);
    localStorage.setItem('studyHistory', JSON.stringify(studyHistory));
}

function updateStatistics() {
    const statsSection = document.getElementById('statsSection');
    const totalCards = flashcards.length;
    const totalReviews = flashcards.reduce((sum, card) => sum + card.stats.timesReviewed, 0);
    const totalCorrect = flashcards.reduce((sum, card) => sum + card.stats.correctAnswers, 0);
    
    // Calculate category statistics including new categories
    const categoryStats = {};
    const allCategories = ['General', 'Math', 'Science', 'English', 'History', 
                          'French', 'Information Technology', 'Programming', 'Teaching'];
    
    // Initialize all categories with zero values
    allCategories.forEach(category => {
        categoryStats[category] = {
            total: 0,
            correct: 0,
            reviews: 0
        };
    });
    
    // Update stats for existing cards
    flashcards.forEach(card => {
        if (categoryStats[card.category]) {
            categoryStats[card.category].total++;
            categoryStats[card.category].correct += card.stats.correctAnswers;
            categoryStats[card.category].reviews += card.stats.timesReviewed;
        }
    });

    // Display overall statistics
    document.getElementById('overallStats').innerHTML = `
        <p>Total Cards: ${totalCards}</p>
        <p>Total Reviews: ${totalReviews}</p>
        <p>Overall Accuracy: ${totalReviews ? Math.round((totalCorrect / totalReviews) * 100) : 0}%</p>
    `;

    // Display category statistics
    document.getElementById('categoryStats').innerHTML = Object.entries(categoryStats)
        .map(([category, stats]) => `
            <div class="category-stat">
                <h4>${category}</h4>
                <p>Cards: ${stats.total}</p>
                <p>Accuracy: ${stats.reviews ? Math.round((stats.correct / stats.reviews) * 100) : 0}%</p>
            </div>
        `).join('');
}

function filterCards() {
    displayCards();
}

function saveToLocalStorage() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

// Update the initialization function
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('frontTextEditor')) {
        // Initialize rich text editors
        new RichTextEditor('frontTextEditor', 'frontTextPreview');
        new RichTextEditor('backTextEditor', 'backTextPreview');
    }

    // Other initializations
    if (document.getElementById('cardListContent')) {
        displayCards();
    }
    
    // Initialize dark mode
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
});

// Theme switching functionality
function initializeThemeSelector() {
    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
        localStorage.setItem('theme', e.target.value);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeSelect.value = savedTheme;
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', isDarkMode);
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key.toLowerCase()) {
            case 'n': // New card
                showSection('create');
                break;
            case 'p': // Practice
                showSection('practice');
                break;
            case 's': // Statistics
                showSection('stats');
                break;
            case ' ': // Space to flip card
                if (document.querySelector('.card-content')) {
                    toggleCardFlip(document.querySelector('.flip-button'));
                }
                break;
        }
    });
}
