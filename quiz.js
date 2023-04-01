const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 3;

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

const fetchQuestions = async () => {
  try {
    const response = await fetch("https://the-trivia-api.com/api/questions");
    const { results: loadedQuestions } = await response.json();
    const formattedQuestions = loadedQuestions.map(loadedQuestion => {
      const { correct_answer, incorrect_answers, question } = loadedQuestion;
      const answerChoices = [...incorrect_answers];
      const answerIndex = Math.floor(Math.random() * 3);
      answerChoices.splice(answerIndex, 0, correct_answer);
      const choices = answerChoices.reduce((acc, choice, index) => {
        acc[`choice${index + 1}`] = choice;
        return acc;
      }, {});
      return {
        question,
        ...choices,
        answer: answerIndex + 1
      };
    });
    availableQuestions = formattedQuestions;
    startGame();
  } catch (error) {
    console.error(error);
  }
};

const startGame = () => {
  questionCounter = 0;
  score = 0;
  acceptingAnswers = true;
  getNewQuestion();
  choices.forEach(choice => {
    choice.addEventListener("click", handleAnswerClick);
  });
};

const getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    window.location.assign("end.html");
    return;
  }
  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = currentQuestion.question;
  choices.forEach(choice => {
    const number = choice.dataset.number;
    choice.innerText = currentQuestion[`choice${number}`];
  });
  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true;
};

const handleAnswerClick = e => {
  if (!acceptingAnswers) return;
  acceptingAnswers = false;
  const selectedChoice = e.target;
  const selectedAnswer = selectedChoice.dataset.number;
  const classToApply =
    selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";
  if (classToApply === "correct") {
    incrementScore(CORRECT_BONUS);
  }
  selectedChoice.parentElement
