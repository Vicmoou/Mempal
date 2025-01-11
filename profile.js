document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email;

    // Load user statistics
    const flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    document.getElementById('totalCards').textContent = flashcards.length;

    const studyHistory = JSON.parse(localStorage.getItem('studyHistory')) || [];
    document.getElementById('totalSessions').textContent = studyHistory.length;

    // Calculate success rate
    const totalCorrect = studyHistory.reduce((sum, session) => sum + session.correctCount, 0);
    const totalAnswers = studyHistory.reduce((sum, session) => 
        sum + session.correctCount + session.incorrectCount, 0);
    const successRate = totalAnswers > 0 
        ? Math.round((totalCorrect / totalAnswers) * 100) 
        : 0;
    document.getElementById('successRate').textContent = `${successRate}%`;
});
