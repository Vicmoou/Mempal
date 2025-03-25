let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];

function displayCards() {
    const cardListContent = document.getElementById('cardListContent');
    const filterCategory = document.getElementById('filterCategory').value;
    const searchText = document.getElementById('searchCards').value.toLowerCase();

    const filteredCards = flashcards.filter(card => {
        const matchesCategory = filterCategory === 'all' || card.category === filterCategory;
        const matchesSearch = 
            stripHtml(card.front).toLowerCase().includes(searchText) || 
            stripHtml(card.back).toLowerCase().includes(searchText) ||
            card.tags.some(tag => tag.toLowerCase().includes(searchText));
        return matchesCategory && matchesSearch;
    });

    cardListContent.innerHTML = filteredCards.map(card => `
        <div class="flashcard" data-category="${card.category}" data-difficulty="${card.difficulty}">
            <div class="card-content">
                <div class="card-text">
                    <h4><i class="fas fa-file-alt"></i> ${card.front}</h4>
                    <div class="answer hidden">
                        <i class="fas fa-comment-dots"></i> ${card.back}
                    </div>
                </div>
                <div class="card-info">
                    <p><i class="fas fa-folder"></i> <strong>Category:</strong> ${card.category}</p>
                    <p><i class="fas fa-signal"></i> <strong>Difficulty:</strong> ${card.difficulty}</p>
                    <p><i class="fas fa-tags"></i> <strong>Tags:</strong> ${card.tags.join(', ') || 'None'}</p>
                </div>
            </div>
            <div class="card-actions">
                <button onclick="toggleAnswer(this)" class="flip-button">
                    <i class="fas fa-sync-alt"></i> Show Answer
                </button>
                <button onclick="deleteCard(${card.id})" class="delete-btn">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function toggleAnswer(button) {
    const card = button.closest('.flashcard');
    const answer = card.querySelector('.answer');
    
    if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        button.innerHTML = '<i class="fas fa-sync-alt fa-rotate-180"></i> Hide Answer';
    } else {
        answer.classList.add('hidden');
        button.innerHTML = '<i class="fas fa-sync-alt"></i> Show Answer';
    }
}

function deleteCard(id) {
    if (confirm('Are you sure you want to delete this card?')) {
        flashcards = flashcards.filter(card => card.id !== id);
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
        displayCards();
    }
}

function filterCards() {
    displayCards();
}

function toggleView() {
    const cardsGrid = document.getElementById('cardListContent');
    cardsGrid.classList.toggle('cards-grid');
    cardsGrid.classList.toggle('cards-list');
    localStorage.setItem('viewPreference', cardsGrid.classList.contains('cards-grid') ? 'grid' : 'list');
}

function sortCards() {
    const sortOrder = document.getElementById('sortOrder').value;
    
    flashcards.sort((a, b) => {
        switch(sortOrder) {
            case 'newest':
                return b.id - a.id;
            case 'oldest':
                return a.id - b.id;
            case 'category':
                // Define category order for consistent sorting
                const categoryOrder = {
                    'General': 0,
                    'Math': 1,
                    'Science': 2,
                    'English': 3,
                    'History': 4,
                    'French': 5,
                    'Information Technology': 6,
                    'Programming': 7,
                    'Teaching': 8
                };
                return (categoryOrder[a.category] || 999) - (categoryOrder[b.category] || 999);
            default:
                return 0;
        }
    });
    
    displayCards();
}

// Initialize the display when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayCards();
    const viewPreference = localStorage.getItem('viewPreference') || 'grid';
    const cardsGrid = document.getElementById('cardListContent');
    if (viewPreference === 'list') {
        cardsGrid.classList.remove('cards-grid');
        cardsGrid.classList.add('cards-list');
    }
});
