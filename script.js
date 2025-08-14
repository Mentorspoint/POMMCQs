let currentQuestionIndex = 0;
let selectedSubject = "";
let userAnswers = [];
let totalQuestions = 0;
let testQuestions = [];
let questionBank = {};
let questionsLoaded = false;

// Load questions from JSON file
function loadQuestions() {
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorIndicator = document.getElementById('error-indicator');
  const subjectButtons = document.querySelectorAll('.subject-btn');
  
  // Show loading indicator and disable buttons
  loadingIndicator.style.display = 'block';
  errorIndicator.style.display = 'none';
  subjectButtons.forEach(btn => btn.disabled = true);

  fetch('questions.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      questionBank = data;
      questionsLoaded = true;
      loadingIndicator.style.display = 'none';
      subjectButtons.forEach(btn => btn.disabled = false);
      console.log('Questions loaded successfully:', Object.keys(questionBank));
    })
    .catch(error => {
      console.error('Error loading questions:', error);
      loadingIndicator.style.display = 'none';
      errorIndicator.style.display = 'block';
      subjectButtons.forEach(btn => btn.disabled = true);
    });
}

function startTest(subject) {
  if (!questionsLoaded) {
    alert('Questions are still loading. Please wait a moment and try again.');
    return;
  }

  selectedSubject = subject;
  currentQuestionIndex = 0;
  userAnswers = [];
  
  const subjectQuestions = questionBank[subject];
  
  if (!subjectQuestions || subjectQuestions.length === 0) {
    alert(`No questions found for ${subject}. Please check your questions.json file.`);
    return;
  }
  
  // Shuffle and select 25 random questions
  const shuffled = [...subjectQuestions].sort(() => Math.random() - 0.5);
  testQuestions = shuffled.slice(0, 25); // Limit to 25
  totalQuestions = testQuestions.length;

  // Initialize user answers array
  userAnswers = new Array(totalQuestions).fill(-1);
  
  // Show test interface
  document.getElementById('subject-selection').style.display = 'none';
  document.getElementById('mcq-test').style.display = 'block';
  document.getElementById('subject-title').textContent = subject;
  
  loadQuestion();
}

function loadQuestion() {
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const counter = document.getElementById('question-counter');
  const card = document.getElementById('mcq-card');
  const progressFill = document.getElementById('progress-fill');

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progressFill.style.width = progress + '%';

  card.classList.add('fade-out');

  setTimeout(() => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    questionEl.textContent = currentQuestion.question;
    optionsEl.innerHTML = '';

    currentQuestion.options.forEach((optionText, i) => {
      const btn = document.createElement('button');
      btn.classList.add('option-btn');
      btn.textContent = String.fromCharCode(65 + i) + '. ' + optionText;
      btn.onclick = () => selectOption(btn, i);
      
      if (userAnswers[currentQuestionIndex] === i) {
        btn.classList.add('selected');
        document.getElementById('next-btn').disabled = false;
      }
      
      optionsEl.appendChild(btn);
    });

    // Remove any old explanation so none appears until an option is clicked
    const oldExplanation = document.querySelector('.explanation');
    if (oldExplanation) oldExplanation.remove();

    counter.textContent = 'Question ' + (currentQuestionIndex + 1) + ' of ' + totalQuestions;
    
    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
    document.getElementById('next-btn').style.display = currentQuestionIndex === totalQuestions - 1 ? 'none' : 'inline-block';
    document.getElementById('finish-btn').style.display = currentQuestionIndex === totalQuestions - 1 ? 'inline-block' : 'none';

    card.classList.remove('fade-out');
  }, 300);
}

function selectOption(btn, optionIndex) {
  const currentQuestion = testQuestions[currentQuestionIndex];

  // Remove any existing explanation for this question
  const oldExplanation = document.querySelector('.explanation');
  if (oldExplanation) oldExplanation.remove();

  // Update option button classes and highlight correct answer if needed
  document.querySelectorAll('.option-btn').forEach((button, idx) => {
    button.classList.remove('selected');

    if (idx === currentQuestion.correctAnswer && optionIndex !== currentQuestion.correctAnswer) {
      button.style.borderColor = '#28a745';
      button.style.background = '#d4edda';
    } else {
      button.style.borderColor = '';
      button.style.background = '';
    }
  });

  // Store user's answer
  userAnswers[currentQuestionIndex] = optionIndex;

  // Mark selected
  btn.classList.add('selected');

  if (optionIndex !== currentQuestion.correctAnswer) {
    btn.style.borderColor = '#dc3545';
    btn.style.background = '#f8d7da';
  }

  // Show explanation
  const explanationDiv = document.createElement('div');
  explanationDiv.classList.add('explanation');
  explanationDiv.innerHTML = `<strong>Explanation:</strong> ${currentQuestion.explanation || 'No explanation provided.'}`;
  document.getElementById('mcq-card').appendChild(explanationDiv);

  // Enable next button
  document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}

function finishTest() {
  let correctAnswers = 0;
  for (let i = 0; i < totalQuestions; i++) {
    if (userAnswers[i] === testQuestions[i].correctAnswer) {
      correctAnswers++;
    }
  }

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const wrongAnswers = totalQuestions - correctAnswers;

  document.getElementById('total-questions').textContent = totalQuestions;
  document.getElementById('correct-answers').textContent = correctAnswers;
  document.getElementById('wrong-answers').textContent = wrongAnswers;
  document.getElementById('score-percentage').textContent = percentage + '%';
  document.getElementById('final-percentage').textContent = percentage + '%';

  const scoreCircle = document.getElementById('score-circle');
  const motivationalMessage = document.getElementById('motivational-message');

  if (percentage >= 80) {
    scoreCircle.className = 'score-circle score-excellent';
    motivationalMessage.textContent = "🌟 Excellent! You're on the right path!";
    motivationalMessage.style.color = '#28a745';
  } else if (percentage >= 60) {
    scoreCircle.className = 'score-circle score-good';
    motivationalMessage.textContent = "👍 Good job! A little more revision will make you perfect!";
    motivationalMessage.style.color = '#ffc107';
  } else {
    scoreCircle.className = 'score-circle score-needs-improvement';
    motivationalMessage.textContent = "💪 Don't give up! Keep practicing and you'll master it!";
    motivationalMessage.style.color = '#dc3545';
  }

  document.getElementById('mcq-test').style.display = 'none';
  document.getElementById('results').style.display = 'block';
}

function reviewAnswers() {
  document.getElementById('results').style.display = 'none';
  document.getElementById('review').style.display = 'block';

  const reviewContent = document.getElementById('review-content');
  reviewContent.innerHTML = '';

  for (let i = 0; i < totalQuestions; i++) {
    const question = testQuestions[i];
    const userAnswer = userAnswers[i];
    const isCorrect = userAnswer === question.correctAnswer;

    const reviewQuestion = document.createElement('div');
    reviewQuestion.className = 'review-question' + (isCorrect ? '' : ' incorrect');

    let userAnswerText = userAnswer === -1 ? 'Not answered' : String.fromCharCode(65 + userAnswer) + '. ' + question.options[userAnswer];
    let correctAnswerText = String.fromCharCode(65 + question.correctAnswer) + '. ' + question.options[question.correctAnswer];

    reviewQuestion.innerHTML = 
      '<div class="review-header">' +
        '<span class="question-number">Q' + (i + 1) + '</span>' +
        '<span class="answer-status ' + (isCorrect ? 'correct' : 'incorrect') + '">' +
          (isCorrect ? '✓ Correct' : '✗ Incorrect') +
        '</span>' +
      '</div>' +
      '<h4>' + question.question + '</h4>' +
      '<div style="margin: 15px 0;">' +
        '<p><strong>Your Answer:</strong> ' + userAnswerText + '</p>' +
        '<p><strong>Correct Answer:</strong> ' + correctAnswerText + '</p>' +
      '</div>' +
      '<div class="explanation">' +
        '<strong>Explanation:</strong> ' + (question.explanation || 'No explanation provided.') +
      '</div>';

    reviewContent.appendChild(reviewQuestion);
  }
}

function retakeTest() {
  startTest(selectedSubject);
}

function backToSubjects() {
  document.getElementById('mcq-test').style.display = 'none';
  document.getElementById('results').style.display = 'none';
  document.getElementById('review').style.display = 'none';
  document.getElementById('subject-selection').style.display = 'block';
  currentQuestionIndex = 0;
}

function backToResults() {
  document.getElementById('review').style.display = 'none';
  document.getElementById('results').style.display = 'block';
}

// Load questions when the page loads
window.addEventListener('DOMContentLoaded', loadQuestions);