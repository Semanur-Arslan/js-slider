let counterType = null;

//Questions
let questions = [];
let totalStepQuestion = 0;
let currentStep = 0;
let userAnswers = [];

//Products
let totalProduct = 0;
let currentIndex = 0;
let productWidth = 0;


const container = document.querySelector(".container");
const questionSlider = document.querySelector(".question-slider");
const productSlider = document.querySelector(".product-slider");
const noProductMessage = document.querySelector(".no-product-message")
const resetButton = document.querySelector(".reset");
const productsContainer = document.querySelector('.products-container');

// Toggle Elements
function toggleSliders() {
    const isQuestionStep = currentStep < totalStepQuestion;
    if (isQuestionStep) {
        noProductMessage.classList.add("hidden");
        productSlider.classList.add("hidden");
        questionSlider.classList.remove("hidden");

    } else {
        questionSlider.classList.add("hidden");
        if (totalProduct === 0) {
            productSlider.classList.add("hidden");
            noProductMessage.classList.remove("hidden");
        } else {
            noProductMessage.classList.add("hidden");
            productSlider.classList.remove("hidden");
            
        }
    }
}

function toggleResetButton() {
    if (userAnswers.length > 0) {
        resetButton.classList.remove('hidden');
    } else {
        resetButton.classList.add('hidden'); 
    }
}

//Create Counter
function createCounter(type, totalStep, stepNumber) {
    const counter = document.querySelector('.counter');

    if (counterType !== type) {
        counter.innerHTML = '';
        counterType = type; 
    }

    if (!counter.children.length) {
        [...Array(totalStep)].forEach(() => {
            const stepElement = document.createElement('div');
            stepElement.classList.add('step');
            counter.appendChild(stepElement);
        });
    }

    const steps = counter.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    steps[stepNumber]?.classList.add('active');
}


//----------------------------------------------------- QUESTIONS -----------------------------------------------------------//

async function fetchQuestions() {
    try {
        const { steps } = (await fetch("/data/questions.json").then(res => res.json())).find(category => category.name === "kadın");
        questions = steps;
        totalStepQuestion = steps.length;

        createCounter('questions', totalStepQuestion, currentStep);
        renderQuestion(currentStep);
        toggleSliders();


    } catch (error) {
        console.error("Soruları getirirken bir hata oluştu:", error.message);
    }
}

function questionsEventListeners() {
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    const navigate = (direction) => {
        if (direction === -1 && currentStep > 0) {
            currentStep--;
            renderQuestion(currentStep);
            createCounter('questions', totalStepQuestion, currentStep);
        } else if (direction === 1 && currentStep < totalStepQuestion - 1) {
            if (!isAnswerGivenForCurrentStep()) {
                createAlert('Lütfen Cevabınızı Seçin', 'danger');
                return;
            }
            currentStep++;
            renderQuestion(currentStep);
            createCounter('questions', totalStepQuestion, currentStep);
        } else if (direction === 1 && currentStep === totalStepQuestion - 1) {
            if (!isAnswerGivenForCurrentStep()) {
                createAlert('Lütfen Cevabınızı Seçin', 'danger');
                return;
            }
            currentStep++;
            fetchProducts();
        }

        localStorage.setItem('currentStep', currentStep);
    };

    prevButton.addEventListener("click", () => navigate(-1));
    nextButton.addEventListener("click", () => navigate(1));
} 

function isAnswerGivenForCurrentStep() {
    const currentQuestion = questions[currentStep];
    return userAnswers.some(ans => ans.step === currentQuestion.step && ans.answer);
}

function saveAnswer(step, subtype, answer) {
    const existingAnswerIndex = userAnswers.findIndex(ans => ans.step === step);
    existingAnswerIndex !== -1 ? userAnswers[existingAnswerIndex].answer = answer : userAnswers.push({ step, subtype, answer });
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    toggleResetButton();
}

function renderQuestion(step) {
    const questionContainer = document.querySelector(".question-container");
    questionContainer.innerHTML = "";
    const question = questions.find(q => q.step === step);
    if(question){
        const questionCard = createQuestionCard(question);
        questionContainer.appendChild(questionCard);
    }

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

function createAlert(message, type) {

    const myAlert = document.createElement("div");
    myAlert.classList.add("my-alert");

    myAlert.classList.remove("success", "danger");
    myAlert.classList.add(type === 'success' ? "success" : type === 'danger' ? "danger" : "");

    myAlert.innerHTML = `<p>${message}</p>`;

    container.appendChild(myAlert);

    setTimeout(() => myAlert.remove(), 2000);
}

//----------------------------------------------------- PRODUCTS -----------------------------------------------------------//



async function fetchProducts() {

    try {

        isProductLoading = true

        const response = await fetch("/data/products.json");
        const data = await response.json();
        const filters = JSON.parse(localStorage.getItem('userAnswers')) || [];
       
        // Product Filter
        const filteredProducts = data.filter(product => {
            return filters.every(filter => {
                if (filter.subtype === 'category') {
                    return product.category.some(cat => cat.toLowerCase().includes(filter.answer.toLowerCase()));
                } else if (filter.subtype === 'color') {
                    return product.colors.some(color => color.toLowerCase() === filter.answer.toLowerCase());
                } else if (filter.subtype === 'price') {
                    if (filter.answer.includes('+')) {
                        const minPrice = parseInt(filter.answer.replace('+', ''), 10);
                        return product.price >= minPrice;
                    } else {
                        const [minPrice, maxPrice] = filter.answer.split('-').map(Number);
                        return product.price >= minPrice && product.price <= maxPrice;
                    }
                }
                return true;
            });
        });
        totalProduct = filteredProducts.length
        renderProducts(filteredProducts)
        createCounter('products', totalProduct, currentIndex);
        toggleSliders()

        requestAnimationFrame(() => {
            updateProductWidth();
        });

    } catch (error) {
        console.error("Ürünleri getirirken bir hata oluştu:", error.message);
    }
}

function renderProducts(filteredProducts) {
  
    productsContainer.innerHTML = ""
        filteredProducts.forEach(product => {
    
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
            
        });

}

function createProductCard(product) {
    const productItem = document.createElement("div");
    productItem.classList.add("product-item");

    const img = document.createElement("img");
    img.classList.add("product-image");
    img.alt = product.name;
    img.setAttribute("data-src", product.image);
    img.src = "";
    img.loading = "lazy";

    const placeholder = document.createElement("div");
    placeholder.classList.add("image-placeholder");
    placeholder.style.height = "70%";

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                image.src = image.getAttribute("data-src");
                image.onload = () => {
                image.classList.add('loaded');
                placeholder.style.display = 'none';
                };
                observer.unobserve(image);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(img);

    const productName = document.createElement("h4");
    productName.classList.add("product-name");
    productName.textContent = product.name;

    const prices = document.createElement("div");
    prices.classList.add("prices");

    const oldPrice = document.createElement("p");
    oldPrice.classList.add("old-price");
    oldPrice.textContent = product.oldPriceText

    const newPrice = document.createElement("p");
    newPrice.classList.add("new-price");
    newPrice.textContent=product.priceText

    if(product.oldPrice) {
        prices.append(oldPrice, newPrice);
    } else {
        prices.append(newPrice);
    }

    const viewButton = document.createElement('button')
    viewButton.classList.add('view-button')
    viewButton.textContent = 'VIEW PRODUCT'

    productItem.append(placeholder, img, productName, prices, viewButton);

    return productItem;
}


const updateProductWidth = () => {
    const firstProduct = productsContainer.querySelector('.product-item');
    if (firstProduct) {
        productWidth = firstProduct.offsetWidth;
    }
};

function updateSlider() {
    productsContainer.style.transform = `translateX(-${currentIndex * productWidth}px)`;
}

function productEventListeners() {
    const prevButton = document.getElementById('prev-product');
    const nextButton = document.getElementById('next-product');

    const navigate = (direction) => {
        if (direction === -1 && currentIndex > 0) {
            currentIndex--;
            updateSlider();
            createCounter('questions', totalProduct, currentIndex);
        } else if (direction === 1 && currentIndex < totalProduct - 1) {
            currentIndex++;
            
            updateSlider();
            createCounter('questions', totalProduct, currentIndex);
            
        }
    };

    prevButton.addEventListener("click", () => navigate(-1));
    nextButton.addEventListener("click", () => navigate(1));
}



//--------------------------------------------------- INITIALIZE APP ----------------------------------------------------//


window.addEventListener("load", () => {
    fetchQuestions();
    toggleResetButton();
    
    questionsEventListeners();
    productEventListeners();
    resetButton.addEventListener("click", reset);
});


//Reset Function 
function reset() {

    localStorage.clear();

    questions = [];
     totalStepQuestion = 0;
     currentStep = 0;
     userAnswers = [];

    totalProduct = 0;
    currentIndex = 0;
    productWidth = 0;

    fetchQuestions();
    updateSlider();
    createAlert("Seçimler Sıfırlandı", "success");

    resetButton.classList.add('hidden');


}




