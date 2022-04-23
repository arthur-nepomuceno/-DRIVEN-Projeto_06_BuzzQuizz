let pontuation = 0;
let questionAnswered = 0;
let quizzData;
let answerIndex =[];
let id = 2;
const API = "https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes";
const Time_2S = 2 * 1000;
const first_SCREEN = document.querySelector(".screen_first");
const second_SCREEN = document.querySelector(".screen_second");
const third_SCREEN = document.querySelector(".screen_third");

function quizzPage () {
    resetVariables();
    //Usando um único quizz (id = 2) para estilizar tudo e montar o código, depois trocar isso.

    //SO PARA ESTILIZAR, REMOVENDO A PARTE DO ARTHUR:
    document.querySelector(".screen_first").innerHTML = "";
    
    //Remover espaço demais

    const promise = axios.get(`https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes/${id}`)

    promise.then(getQuizz);
    promise.catch(error);
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

        setTimeout(scrollToNextQuestion,Time_2S,element);
    }
}

function checkIfScore(element,elementParent) {
    const question = parseInt(elementParent.getAttribute("data-question"));
    const answer = parseInt(element.getAttribute("data-answer"));

    if (answerIndex[question] === answer) {
        pontuation++;
        colorChoose(true,element);
    } else {
        colorChoose(false,element);
    }
}

function checkIfFinished() {
    const numberOfQuestion = document.querySelectorAll(".quizz-question").length;

    if (questionAnswered == numberOfQuestion) {   
        finishQuizz();
    }
}

function scrollToNextQuestion(element) {
    const nextQuestionIndex = parseInt(element.parentElement.getAttribute("data-question"))+1;
    if (nextQuestionIndex < document.querySelectorAll(".quizz-question").length) {
        const nextQuestionElement = document.querySelector(`.question_${nextQuestionIndex}`);
        nextQuestionElement.scrollIntoView();
    } else {
        document.querySelector(".quizz-result").scrollIntoView();
    }
}

function colorChoose(boolean,element) {
    if (boolean) {
        element.querySelector("h1").classList.add("answer_green");

    } else {
        element.querySelector("h1").classList.add("answer_red");
    }
    
    colorRest(element);
}

function colorRest(element) {
    const divs = element.parentElement.querySelectorAll("div");
    const arrayDivs = [...divs];
    element.classList.add("choose");

    arrayDivs.filter(removeElement).map(addOpacityColor);
}

function removeElement(element) {
    if (element !== element.parentElement.querySelector(".choose")) {
        return true;
    }
}

function addOpacityColor(element) {
    element.classList.add("answer_opacity");

    const question = parseInt(element.parentElement.getAttribute("data-question"));
    const elementIndex = parseInt(element.getAttribute("data-answer"));

    if (answerIndex[question] === elementIndex) {
        element.querySelector("h1").classList.add("answer_green");
    } else {
        element.querySelector("h1").classList.add("answer_red");
    }
}

function resetVariables() {
    pontuation = 0;
    questionAnswered = 0;
    answerIndex = [];

    document.querySelector("header").scrollIntoView();
}

function error(erro) {
    alert(erro.response.data);
}
function deuCerto () {
    console.log("Deu certo");
}

function deuErrado(erro) {
    console.log("Erroooou " + erro.response.status);
    console.log(erro.response.data);
}

//=======================================================================================
//=============================== FIRST SCREEN FUNCTIONS ================================
//=======================================================================================
//= function getAllQuizzes()
//= function renderAllQuizzes(response)
//= function getUserQuizzes()
//= function renderUserQuizzes(response)
//= function createNewQuizz()
//=======================================================================================

getAllQuizzes();
getUserQuizzes();

function getAllQuizzes() {
    const promise = axios.get(API);
    promise.then(renderAllQuizzes);
    promise.catch(deuErrado);
}

function renderAllQuizzes(response) {
    const allQuizzesList = response.data;
    const allQuizzesHTML = document.querySelector(".all-quizzes > .quizzes");
    renderQuizzesList(allQuizzesList, allQuizzesHTML);
}

function getUserQuizzes() {
    const promise = axios.get(API);
    promise.then(renderUserQuizzes);
    promise.catch(deuErrado);
}

function renderUserQuizzes(response) {
    const userQuizzesList = response.data;
    const userQuizzesHTML = document.querySelector(".user-quizzes > .quizzes");
    renderQuizzesList(userQuizzesList, userQuizzesHTML);
}

function createNewQuizz() {
    displayNone(first_SCREEN);
    displayFlex(third_SCREEN);
    displayFlex(newQuizzStart);
}

//=======================================================================================
//=============================== THIRD SCREEN FUNCTIONS ================================
//=======================================================================================
//= function hideNewQuestionData(element)
//= function hideNewLevelData(element)
//
//= function moveToCreateQuestionsScreen()
//= function moveToCreateLevelsScreen()
//= function moveToSuccessScreen()
//= function moveToFirstScreen()
//=======================================================================================

const newQuizzStart = third_SCREEN.querySelector(".new-quizz-start");
const newQuizzQuestions = third_SCREEN.querySelector(".new-quizz-questions")
const newQuizzLevels = third_SCREEN.querySelector(".new-quizz-levels");
const newQuizzSuccess = third_SCREEN.querySelector(".new-quizz-success");

function hideNewQuestionData(element){
    const newQuestionData = element.parentNode.parentNode.querySelector(".new-question-data");
    newQuestionData.classList.toggle("hidden");
}

function hideNewLevelData(element){
    const newLevelData = element.parentNode.parentNode.querySelector(".new-level-data");
    newLevelData.classList.toggle("hidden");
}

function moveToCreateQuestionsScreen() {
    isValidTitle();
    isValidURL();
    isValidNumberOfQuestions();
    isValidNumberOfLevels();

    if (isValidTitle() && isValidURL() && isValidNumberOfQuestions()  && isValidNumberOfLevels()) {
        displayNone(newQuizzStart);
        displayFlex(newQuizzQuestions);
    }    
}

function moveToCreateLevelsScreen() {
    isValidQuestionText();

    //displayNone(newQuizzQuestions);
    //displayFlex(newQuizzLevels);
}

function moveToSuccessScreen() {
    displayNone(newQuizzLevels);
    displayFlex(newQuizzSuccess);
}

function moveToFirstScreen() {
    displayNone(newQuizzSuccess);
    displayNone(third_SCREEN);
    displayFlex(first_SCREEN);
}

/* ============================================================================
===================== NEW QUIZZ - START SCREEN FUNCTIONS ======================
//= isValidTitle()
//= isValidURL()
//= isValidNumberOfQuestions()
//= isValidNumberOfLevels()
============================================================================ */

function isValidTitle(){    
    const newQuizzTitle = document.querySelector(".new-quizz-basic > .title");
    const newQuizzTitleInput = newQuizzTitle.querySelector("input");
    const invalidTitle = document.querySelector(".new-quizz-basic > .invalid-info#title");

    if(newQuizzTitleInput.value.length < 20 || newQuizzTitleInput.value.length > 65) { 
        showObject(invalidTitle);
        backgroundPink(newQuizzTitle);
        backgroundPink(newQuizzTitleInput);
        
        return false;
    } else {
        hideObject(invalidTitle);
        backgroundWhite(newQuizzTitle);
        backgroundWhite(newQuizzTitleInput);

        return true;
    }
}

function isValidURL() {
    const newQuizzURL = document.querySelector(".new-quizz-basic > .url");
    const newQuizzURLInput = newQuizzURL.querySelector("input");
    const invalidURL = document.querySelector(".new-quizz-basic > .invalid-info#url");

    const url = newQuizzURLInput.value
    const testResult = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    const includesHTTPS = url.includes("https://");
    const includesWWW = url.includes("www.");

    if (testResult === null || (includesHTTPS === false && includesWWW === false)) {
        showObject(invalidURL);
        backgroundPink(newQuizzURL);
        backgroundPink(newQuizzURLInput);

        return false;
    } else {
        hideObject(invalidURL);
        backgroundWhite(newQuizzURL);
        backgroundWhite(newQuizzURLInput);

        return true;
    }
}

function isValidNumberOfQuestions(){    
    const newQuizzNumberOfQuestions = document.querySelector(".new-quizz-basic > .number-of-questions");
    const newQuizzNumberOfQuestionsInput = newQuizzNumberOfQuestions.querySelector("input");
    const invalidNumberOfQuestions = document.querySelector(".new-quizz-basic > .invalid-info#number-of-questions");

    if(newQuizzNumberOfQuestionsInput.value < 3 ||  isNaN(Number(newQuizzNumberOfQuestionsInput.value))) {        
        showObject(invalidNumberOfQuestions);
        backgroundPink(newQuizzNumberOfQuestions);
        backgroundPink(newQuizzNumberOfQuestionsInput);
        
        return false; 
    } else {
        hideObject(invalidNumberOfQuestions);
        backgroundWhite(newQuizzNumberOfQuestions);
        backgroundWhite(newQuizzNumberOfQuestionsInput);

        return true;
    }
}

function isValidNumberOfLevels(){    
    const newQuizzNumberOfLevels = document.querySelector(".new-quizz-basic > .number-of-levels");
    const newQuizzNumberOfLevelsInput = newQuizzNumberOfLevels.querySelector("input");
    const invalidNumberOfLevels = document.querySelector(".new-quizz-basic > .invalid-info#number-of-levels");

    if(newQuizzNumberOfLevelsInput.value < 2 ||  isNaN(Number(newQuizzNumberOfLevelsInput.value))) {        
        showObject(invalidNumberOfLevels);
        backgroundPink(newQuizzNumberOfLevels);
        backgroundPink(newQuizzNumberOfLevelsInput);

        return false;
    } else {
        hideObject(invalidNumberOfLevels);
        backgroundWhite(newQuizzNumberOfLevels);
        backgroundWhite(newQuizzNumberOfLevelsInput);

        return true;
    }
}

/* ============================================================================
=================== NEW QUIZZ - QUESTIONS SCREEN FUNCTIONS ====================
//= isValidQuestionText()
//= isValidQuestionColor()
//= isValidRightAnswer()
//= isValidWrongAnswer()
============================================================================ */

function isValidQuestionText() {
    const allQuestionData = document.querySelectorAll(".new-question-data");
    
    for (let i = 0; i <= allQuestionData.length; i++){
        const newQuestionText = allQuestionData[i].querySelector(".question-text");
        const newQuestionTextInput = newQuestionText.querySelector("input");
        const invalidQuestionText = allQuestionData[i].querySelector(".invalid-info#question-text");

        if (newQuestionTextInput.value < 20) {
            showObject(invalidQuestionText);
            backgroundPink(newQuestionText);
            backgroundPink(newQuestionTextInput);

        } else {
            hideObject(invalidQuestionText);
            backgroundWhite(newQuestionText);
            backgroundWhite(newQuestionTextInput);
        }

    }
    
}



//=======================================================================================
//================================= AUXILIAR FUNCTIONS ==================================
//=======================================================================================
//= function renderQuizzesList(arr, documentObject)
//= function displayNone(documentObject)
//= function displayFlex(documentObject)
//= function backgroundPink(documentObject)
//= function backgroundWhite(documentObject)
//= function hideObject(documentObject)
//= function showObject(documentObject)
//=======================================================================================

function renderQuizzesList(arr, documentObject) {
    for(let i = 0; i < arr.length; i++) {
        documentObject.innerHTML += `<div class="quizz-card">                 
                                        <img src=${arr[i].image}>
                                        <img class="black-mask" src="./img/black-mask.png" style="height: 55%">
                                        <p>${arr[i].title}</p>
                                    </div>`
    }
}

function displayNone(documentObject){
    documentObject.setAttribute("style", "display:none");
}

function displayFlex(documentObject){
    documentObject.setAttribute("style", "display:flex");
}

function backgroundPink(documentObject){
    documentObject.setAttribute("style", "background-color: #FFE9E9");
}

function backgroundWhite(documentObject){
    documentObject.setAttribute("style", "background-color: #FFFFFF");
}

function hideObject(documentObject){
    documentObject.classList.add("hidden");
}

function showObject(documentObject){
    documentObject.classList.remove("hidden");
}



displayNone(first_SCREEN);
displayFlex(third_SCREEN);
displayNone(newQuizzStart);
displayFlex(newQuizzQuestions);

