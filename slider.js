let questions = [];
let totalStep = 0;
let currentStep = 0;
let userAnswers = [];

const container = document.querySelector(".container");

// Fetch Questions
async function fetchQuestions() {
    try {
        const { steps } = (await fetch("/data/questions.json").then(res => res.json())).find(category => category.name === "kadın");
        questions = steps;
        totalStep = steps.length;

        const savedStep = localStorage.getItem("currentStep");
        currentStep = savedStep ? Number(savedStep) : 0;

        createCounter(totalStep);
        renderQuestion(currentStep);

        
    } catch (error) {
        console.error("Soruları getirirken bir hata oluştu:", error.message);
    }
}

// Control Buttons
function setupEventListeners() {
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    const navigate = (direction) => {
        if (direction === -1 && currentStep > 0) {
            currentStep--;
        } else if (direction === 1) {
            if (!isAnswerGivenForCurrentStep()) {
                createAlert('Lütfen Cevabınızı Seçin', 'danger');
                return;
            }
            if (currentStep < questions.length - 1) {
                currentStep++;
            }
        }

        localStorage.setItem('currentStep', currentStep);
        renderQuestion(currentStep);
        createCounter(totalStep);
    };

    prevButton.addEventListener("click", () => navigate(-1));
    nextButton.addEventListener("click", () => navigate(1));
}


//Create Counter
function createCounter(totalStep) {
    const counter = document.querySelector('.counter');
    
    if (!counter.children.length) {
        [...Array(totalStep)].forEach(() => {
            const stepElement = document.createElement('div');
            stepElement.classList.add('step');
            counter.appendChild(stepElement);
        });
    }
    
    const steps = counter.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    steps[currentStep]?.classList.add('active');
}


// Save/Load Answers
function saveAnswer(step, subtype, answer) {
    const existingAnswerIndex = userAnswers.findIndex(ans => ans.step === step);
    existingAnswerIndex !== -1 ? userAnswers[existingAnswerIndex].answer = answer : userAnswers.push({ step, subtype, answer });
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    reset();
}

function loadAnswers() {
    const savedAnswers = localStorage.getItem('userAnswers');
    userAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
}


//Render Question
function renderQuestion(step) {
    const questionContainer = document.querySelector(".question-container");
    questionContainer.innerHTML = "";
    const question = questions.find(q => q.step === step);
    const questionCard = createQuestionCard(question);
    questionContainer.appendChild(questionCard);
    updateSelection(step, question);
}

function updateSelection(step, question) {
    const selectedAnswer = userAnswers.find(ans => ans.step === step);

    const selectedElement = selectedAnswer && document.querySelector(`.answer[data-answer="${selectedAnswer.answer}"]`);

    if (selectedElement) {
        selectedElement.classList.add("selected");
        if (question.subtype === "color") addCheckIcon(selectedElement);
    }
}


// Create Question Card
function createQuestionCard(question) {
    const questionContainer = document.createElement("div");
    questionContainer.classList.add("question-card");

    const questionTitle = document.createElement("h3");
    questionTitle.classList.add("question");
    questionTitle.textContent = question.title;

    const answersContainer = document.createElement("div");
    answersContainer.classList.add("answers");

    if (question.type === "color") {
        answersContainer.classList.add("colors");
    }

        question.answers.forEach(answer => {
            const answerElement = document.createElement("button");
            answerElement.classList.add("answer");
            answerElement.setAttribute("data-answer", answer);

            if (question.type === "color") {
                const color = document.createElement("div");
                color.classList.add("color");
                color.style.backgroundColor = getColorFromName(answer);
                answerElement.append(color);
            } else {
                answerElement.textContent = answer;
            }

            answerElement.addEventListener("click", () => handleAnswerSelection(question, answerElement, answer));
            answersContainer.appendChild(answerElement);
        });


    questionContainer.append(questionTitle, answersContainer);

    return questionContainer;
}

function handleAnswerSelection(question, answerElement, answer) {
    document.querySelectorAll(`.answer.selected`).forEach(el => {
        el.classList.remove("selected");
        el.querySelector(".check-icon")?.remove();
    });
    answerElement.classList.add("selected");
    if (question.type === "color") {
        addCheckIcon(answerElement);
    }
    saveAnswer(question.step, question.subtype, answer);
}

function addCheckIcon(element) {
    if (!element.querySelector(".check-icon")) {
        const checkIcon = document.createElement("i");
        checkIcon.classList.add("fa-solid", "fa-check", "check-icon");
        element.appendChild(checkIcon);
    }
}


// Answer Control
function isAnswerGivenForCurrentStep() {
    const currentQuestion = questions[currentStep];
    return userAnswers.some(ans => ans.step === currentQuestion.step && ans.answer);
}

// Color Function
function getColorFromName(colorName) {
    const colors = {
        siyah: "#000000",
        bej: "#f5f5dc",
        beyaz: "#ffffff",
        mavi: "#0000ff",
        kırmızı: "#ff0000",
        yeşil: "#008000"
    };
    return colors[colorName] || "#cccccc";
}

//Create Alert
function createAlert(message, type) {

    const myAlert = document.createElement("div");
    myAlert.classList.add("my-alert");

    myAlert.classList.remove("success", "danger");
    myAlert.classList.add(type === 'success' ? "success" : type === 'danger' ? "danger" : "");
    
    myAlert.innerHTML = `<p>${message}</p>`;

    container.appendChild(myAlert);

    setTimeout(() => myAlert.remove(), 2000);
}

//Reset Function 
function reset() {
    const resetButton = document.querySelector(".reset");
    if (!resetButton && userAnswers.length) {
        const newResetButton = document.createElement("p");
        newResetButton.classList.add("reset");
        newResetButton.textContent = "Tüm Seçimleri Sıfırla";
        newResetButton.addEventListener("click", () => {
            localStorage.clear();
            userAnswers = [];
            currentStep = 0;
            renderQuestion(currentStep);
            createCounter(totalStep);
            createAlert("Seçimler Sıfırlandı", "success");
            newResetButton.remove();
        });
        container.append(newResetButton);
        
    }
}

// Initialize app
window.addEventListener("load", () => {
    loadAnswers();
    setupEventListeners();
    fetchQuestions();
    reset();
});


