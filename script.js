let pontuation = 0;
let questionAnswered = 0;
let quizzData;
let answerIndex =[];
let id = 2;

function quizzPage () {
    resetVariables();
    //Usando um único quizz (id = 2) para estilizar tudo e montar o código, depois trocar isso.

    //Adicionar o Scroll após responder algo
    //Scroll para resultado também
    //Falta Versão mobile
    //Remover espaço demais

    const promise = axios.get(`https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes/${id}`)

    promise.then(getQuizz);
    promise.catch(deuErrado);
}

function getQuizz(quizz) {
    quizzData = quizz.data;
    const questionsObject = quizz.data.questions;

    renderQuizzTitle(quizzData);
    renderQuizzQuestions(questionsObject);
}

function renderQuizzTitle(object) {

    const element = document.querySelector(".screen_second");
    element.innerHTML = `
    <div class="quizz_title">
    <p style="background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.57), rgba(0, 0, 0, 0.57)), url('${object.image}');">${object.title}</p>
    </div>
    `
}

function renderQuizzQuestions (questionsArray) {
    const element = document.querySelector(".screen_second");

    for (let i = 0; i < questionsArray.length; i++) {
        const question = questionsArray[i];

        element.innerHTML +=`
        <div class="quizz-question question_${i}" data-question="${i}">
            <p style="background-color: ${question.color}">${question.title}</p>
        `
        renderAnswers(question,i);
    }
}

function renderAnswers(question,i) {
    const element = document.querySelector(`.question_${i}`);

    question.answers.sort(shuffle);
   
    for (let j = 0; j < question.answers.length; j++) {
        const answer = question.answers[j];

        storeRightAnswer(answer,j);

        element.innerHTML += `
        <div data-answer="${j}" onclick = "chooseAnswer(this)">
        <img src="${answer.image}">
        <h1>${answer.text}</h1>
        </div>
        `
    }
}

function storeRightAnswer(answer,j) {
    if(answer.isCorrectAnswer) {
        answerIndex.push(j);
    }
}

function finishQuizz() {
    getResult();
    //Adicionar scroll pra baixo depois de 2 segundos
}

function getResult() {
    pontuation = scoreCalculate();
    const indexResult = checkLevelIndex();
    const result = quizzData.levels[indexResult];

    renderResult(result);
}

function scoreCalculate() {
    const numberOfQuestion = document.querySelectorAll(".quizz-question").length;
    const result = Math.round(pontuation/numberOfQuestion*100);

    return result;
}

function checkLevelIndex() {
    const minValueList = organizeLevels();

    const minValue = getMyObjectIndexLevel(minValueList); //Retorn minLevel

    const minValueIndex = getIndexLevel(minValue);

    return minValueIndex;
}

function organizeLevels() {
    const arrayOfLevels = arrayLevel();

    minValueReOrder(arrayOfLevels);

    return arrayOfLevels;
}

function arrayLevel() {
    const minValueList = [];
    const levels = quizzData.levels;

    for (let i = 0; i < levels.length; i++) {
        minValueList.push(levels[i].minValue);
    }

    return minValueList;
}

function minValueReOrder (array) {
    return array.sort(function(a, b){return b-a});
}

function getMyObjectIndexLevel(array) {
    for (let i = 0; i < array.length; i++) {
        if (pontuation >= array[i]) {
            return array[i];
        }
    }
}

function getIndexLevel(value) {
    const arrayLevels = arrayLevel();
    for (let i = 0; i < arrayLevels.length; i++) {
        if (arrayLevels[i] === value) {
            return i;
        }
    }
}

function renderResult(result) {
    const element = document.querySelector(".screen_second");
    element.innerHTML += `
    <div>
        <div class="quizz-result">
            <h1>${pontuation}% de acerto: ${result.title}</h1>
            <img src="${result.image}">
            <p>${result.text}</p>
        </div>
        <div class="quizz-result-buttons">
            <button class="quizz-result-button_answer-again" onclick="quizzPage()">Reiniciar Quizz</button>
            <button class="quizz-result_button_back-home">Voltar pra home</button>
        </div>        
    </div>
    `
}

function shuffle() { 
	return Math.random() - 0.5; 
}


function chooseAnswer(element) {
    const elementParent = element.parentElement;

    if (!elementParent.classList.contains("answered")) {
        elementParent.classList.add("answered");

        checkIfScore(element,elementParent);

        questionAnswered++;

        checkIfFinished();
    }
    
}

function checkIfScore(element,elementParent) {
    const question = parseInt(elementParent.getAttribute("data-question"));
    const answer = parseInt(element.getAttribute("data-answer"));

    if (answerIndex[question] === answer) {
        pontuation++;
    }


}

function checkIfFinished() {
    const numberOfQuestion = document.querySelectorAll(".quizz-question").length;

    if (questionAnswered == numberOfQuestion) {   
        finishQuizz();
    }
}


function deuCerto () {
    console.log("Deu certo");
}

function deuErrado(erro) {
    console.log("Erroooou " + erro.response.status);
    console.log(erro.response.data);
}

function resetVariables() {
    pontuation = 0;
    questionAnswered = 0;
    answerIndex =[];
}