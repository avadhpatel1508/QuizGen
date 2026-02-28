// DOM Elements
const setupView = document.getElementById('setup-view');
const quizView = document.getElementById('quiz-view');
const resultsView = document.getElementById('results-view');

const quizInput = document.getElementById('quiz-input');
const startBtn = document.getElementById('start-btn');
const errorMsg = document.getElementById('error-message');

const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const quizActions = document.getElementById('quiz-actions');
const nextBtn = document.getElementById('next-btn');

const scoreText = document.getElementById('score-text');
const scoreMessage = document.getElementById('score-message');
const restartBtn = document.getElementById('restart-btn');
const newQuizBtn = document.getElementById('new-quiz-btn');

// State
let questions = [];
let currentIndex = 0;
let score = 0;

// Parsers
function parseQuestions(text) {
    const parsedQuestions = [];
    const qBlocks = text.split('\\question').slice(1);
    
    for (let block of qBlocks) {
        // Extract Question Text
        const qTextMatch = block.match(/(.*?)\\begin\{choices\}/s);
        if (!qTextMatch) continue;
        const qText = qTextMatch[1].trim();

        // Extract Choices Block
        const choicesMatch = block.match(/\\begin\{choices\}(.*?)\\end\{choices\}/s);
        if (!choicesMatch) continue;
        const choicesBlock = choicesMatch[1];

        const choices = [];
        let correctChoice = null;

        const lines = choicesBlock.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('\\choice')) {
                choices.push(trimmed.replace('\\choice', '').trim());
            } else if (trimmed.startsWith('\\CorrectChoice')) {
                const ans = trimmed.replace('\\CorrectChoice', '').trim();
                choices.push(ans);
                correctChoice = ans;
            }
        }

        // Check outside choices block for correct answer
        if (!correctChoice) {
            const extraMatch = block.match(/\\CorrectChoice\s+(.+)/);
            if (extraMatch) {
                correctChoice = extraMatch[1].trim();
            }
        }

        if (qText && choices.length > 0 && correctChoice) {
            parsedQuestions.push({
                question: qText,
                choices: choices,
                answer: correctChoice
            });
        }
    }
    return parsedQuestions;
}

function switchView(view) {
    setupView.classList.remove('active');
    quizView.classList.remove('active');
    resultsView.classList.remove('active');
    
    setTimeout(() => {
        setupView.classList.add('hidden');
        quizView.classList.add('hidden');
        resultsView.classList.add('hidden');
        
        view.classList.remove('hidden');
        setTimeout(() => view.classList.add('active'), 50);
    }, 300);
}

// Event Listeners
startBtn.addEventListener('click', () => {
    const text = quizInput.value;
    questions = parseQuestions(text);
    
    if (questions.length === 0) {
        errorMsg.classList.remove('hidden');
        return;
    }
    
    errorMsg.classList.add('hidden');
    currentIndex = 0;
    score = 0;
    loadQuestion();
    switchView(quizView);
});

nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

restartBtn.addEventListener('click', () => {
    currentIndex = 0;
    score = 0;
    loadQuestion();
    switchView(quizView);
});

newQuizBtn.addEventListener('click', () => {
    quizInput.value = '';
    switchView(setupView);
});

// Quiz Logic
function loadQuestion() {
    quizActions.classList.add('hidden');
    const q = questions[currentIndex];
    
    // Update Progress
    const progress = ((currentIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.innerText = `Question ${currentIndex + 1} of ${questions.length}`;

    // Render Question
    questionText.innerText = q.question;
    choicesContainer.innerHTML = '';

    q.choices.forEach(choiceText => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choiceText;
        btn.onclick = () => handleAnswer(btn, choiceText);
        choicesContainer.appendChild(btn);
    });
}

function handleAnswer(selectedBtn, selectedChoice) {
    const q = questions[currentIndex];
    const isCorrect = selectedChoice === q.answer;
    
    if (isCorrect) score++;

    // Disable all buttons and show styling
    const buttons = choicesContainer.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
        
        // Normalize strings for comparison just in case
        const btnText = btn.innerText.trim();
        const ansText = q.answer.trim();
        
        if (btnText === ansText) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Update Progress Bar to reflect filled point
    const progress = ((currentIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    quizActions.classList.remove('hidden');
}

function showResults() {
    scoreText.innerText = `${score}/${questions.length}`;
    
    const percentage = score / questions.length;
    if (percentage === 1) scoreMessage.innerText = "Perfect! You nailed it! 🌟";
    else if (percentage >= 0.7) scoreMessage.innerText = "Great job! Keep it up! 👏";
    else scoreMessage.innerText = "Good effort! Try again to improve your score! 💪";

    switchView(resultsView);
}
