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
    renderAllQuizzesList(allQuizzesList, allQuizzesHTML);
}

function getUserQuizzes() {
    const promise = axios.get(API);
    promise.then(renderUserQuizzes);
    promise.catch(deuErrado);
}

function renderUserQuizzes(response) {
    const userQuizzesList = response.data;
    const userQuizzesHTML = document.querySelector(".user-quizzes > .quizzes");
    renderUserQuizzesList(userQuizzesList, userQuizzesHTML);
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
    isValidQuizzTitle();
    isValidQuizzURL();
    isValidNumberOfQuestions();
    isValidNumberOfLevels();
    
    if (isValidQuizzTitle() && isValidQuizzURL() && isValidNumberOfQuestions()  && isValidNumberOfLevels()) {
        displayNone(newQuizzStart);
        displayFlex(newQuizzQuestions);
    }
}

function moveToCreateLevelsScreen() {
    isValidQuestionText();
    isValidQuestionColor();
    isValidRightAnswer();
    isValidRightAnswerURL();
    isValidWrongAnswerData();    

    if (isValidQuestionText() && isValidQuestionColor() && isValidRightAnswer() && 
    isValidRightAnswerURL() && isValidWrongAnswerData()) {
        displayNone(newQuizzQuestions);
        displayFlex(newQuizzLevels);
    }
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
//= isValidQuizzTitle()
//= isValidQuizzURL()
//= isValidNumberOfQuestions()
//= isValidNumberOfLevels()
============================================================================ */

function isValidQuizzTitle(){    
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

function isValidQuizzURL() {
    const newQuizzURL = document.querySelector(".new-quizz-basic > .url");
    const newQuizzURLInput = newQuizzURL.querySelector("input");
    const invalidURL = document.querySelector(".new-quizz-basic > .invalid-info#url");
    const url = newQuizzURLInput.value

    if (isValidURL(url)) {
        hideObject(invalidURL);
        backgroundWhite(newQuizzURL);
        backgroundWhite(newQuizzURLInput);       

        return true;
    } else {
        showObject(invalidURL);
        backgroundPink(newQuizzURL);
        backgroundPink(newQuizzURLInput);        

        return false;
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
=================== NEW QUIZZ QUESTIONS SCREEN FUNCTIONS ====================
//= isValidQuestionText()
//= isValidQuestionColor()
//= isValidRightAnswer()
//= isValidRightAnswerURL()
//= isValidWrongAnswer()
//= isValidWrongAnswerURL()
//= isValidAnswerURL()
============================================================================ */
const allQuestions = document.querySelectorAll(".new-question");

function isValidQuestionText() {
    let isValid;
    for (let i = 0; i < allQuestions.length; i++){        
        const newQuestionText = allQuestions[i].querySelector(".question-text");      
        const newQuestionTextInput = newQuestionText.querySelector("input");
        const invalidQuestionText = allQuestions[i].querySelector(".invalid-info#question-text");

        if (newQuestionTextInput.value.length < 20) {
            showObject(invalidQuestionText);
            backgroundPink(newQuestionText);
            backgroundPink(newQuestionTextInput);
            isValid = false;      
        } 
        else {
            hideObject(invalidQuestionText);
            backgroundWhite(newQuestionText);
            backgroundWhite(newQuestionTextInput);
            isValid = true;
        }
    }
    return isValid;
}

function isValidQuestionColor() {
    let isValid;
    for (let i = 0; i < allQuestions.length; i++){
        const newQuestionColor = allQuestions[i].querySelector(".question-color");
        const newQuestionColorInput = newQuestionColor.querySelector("input");
        const invalidQuestionColor = allQuestions[i].querySelector(".invalid-info#question-color");
        
        
        if(startsWithHash(newQuestionColorInput.value) && 
            isHexadecimal(newQuestionColorInput.value)) {
                hideObject(invalidQuestionColor);
                backgroundWhite(newQuestionColor);
                backgroundWhite(newQuestionColorInput);
                isValid = true;
        } else {
            showObject(invalidQuestionColor);
            backgroundPink(newQuestionColor);
            backgroundPink(newQuestionColorInput);
            isValid = false;
        }
    }
    return isValid;
}

function isValidRightAnswer(){
    let isValid;
    for (let i = 0; i < allQuestions.length; i++){
        const newRightAnswer = allQuestions[i].querySelector(".right-answer-text");
        const newRightAnswerInput = newRightAnswer.querySelector("input");
        const invalidRightAnswer = allQuestions[i].querySelector(".invalid-info#right-answer-text");
        
        if (newRightAnswerInput.value.length == 0) {
            showObject(invalidRightAnswer);
            backgroundPink(newRightAnswer);
            backgroundPink(newRightAnswerInput);
            isValid = false;

        } else {
            hideObject(invalidRightAnswer);
            backgroundWhite(newRightAnswer);
            backgroundWhite(newRightAnswerInput);
            isValid = true;
        }
    }
    return isValid;
}

function isValidRightAnswerURL(){
    let isValid;
    for (let i = 0; i < allQuestions.length; i++){
        const newRightAnswerURL = allQuestions[i].querySelector(".right-answer-image");
        const newRightAnswerURLInput = newRightAnswerURL.querySelector("input");
        const invalidRightAnswerURL = allQuestions[i].querySelector(".invalid-info#right-answer-image");

        const url = newRightAnswerURLInput.value;

        if (isValidURL(url)) {
            hideObject(invalidRightAnswerURL);
            backgroundWhite(newRightAnswerURL);
            backgroundWhite(newRightAnswerURLInput);       
    
            isValid = true;
        } else {
            showObject(invalidRightAnswerURL);
            backgroundPink(newRightAnswerURL);
            backgroundPink(newRightAnswerURLInput);    
    
            isValid = false;
        }
    }
    return isValid;
}




function hideWrongAnswerWarnings(documentObject){
    const invalidWrongAnswer = documentObject.querySelector(".invalid-info#wrong-answer-text");
    hideObject(invalidWrongAnswer);

    const newWrongAnswer = documentObject.querySelector(".wrong-answer-text");
    backgroundWhite(newWrongAnswer)

    const newWrongAnswerInput = newWrongAnswer.querySelector("input");
    backgroundWhite(newWrongAnswerInput)
}

function hideWrongAnswerURLWarnings(documentObject){
    const invalidWrongAnswerURL = documentObject.querySelector(".invalid-info#wrong-answer-image");
    hideObject(invalidWrongAnswerURL);

    const newWrongAnswerURL = documentObject.querySelector(".wrong-answer-image");
    backgroundWhite(newWrongAnswerURL)

    const newWrongAnswerURLInput = newWrongAnswerURL.querySelector("input");
    backgroundWhite(newWrongAnswerURLInput)
}

function isValidWrongAnswerData(){
    let isValid;
    let wrongAnswerList = [];
    let wrongAnswerURLList = [];
    for(let i = 0; i < allQuestions.length; i++){
        const allWrongAnswers = [...allQuestions[i].querySelectorAll(".wrong-answer")];

        for(let j = 0; j < allWrongAnswers.length; j++) {            
            const newWrongAnswer = allWrongAnswers[j].querySelector(".wrong-answer-text");
            const newWrongAnswerInput = newWrongAnswer.querySelector("input");
            const invalidWrongAnswer = allWrongAnswers[j].querySelector(".invalid-info#wrong-answer-text");

            const newWrongAnswerURL = allWrongAnswers[j].querySelector(".wrong-answer-image");
            const newWrongAnswerURLInput = newWrongAnswerURL.querySelector("input");
            const invalidWrongAnswerURL = allWrongAnswers[j].querySelector(".invalid-info#wrong-answer-image");

            const url = newWrongAnswerURLInput.value;

            if (newWrongAnswerInput.value.length == 0 && wrongAnswerList.length == 0
                && isValidURL(url) == false && wrongAnswerURLList.length == 0) {
                showObject(invalidWrongAnswer);
                backgroundPink(newWrongAnswer);
                backgroundPink(newWrongAnswerInput);

                showObject(invalidWrongAnswerURL);
                backgroundPink(newWrongAnswerURL);
                backgroundPink(newWrongAnswerURLInput);

                isValid = false;                                
    
            } else if (newWrongAnswerInput.value.length != 0 && isValidURL(url) == false){
                hideObject(invalidWrongAnswer);
                backgroundWhite(newWrongAnswer);
                backgroundWhite(newWrongAnswerInput);

                showObject(invalidWrongAnswerURL);
                backgroundPink(newWrongAnswerURL);
                backgroundPink(newWrongAnswerURLInput);

                isValid = false;

            } else if (newWrongAnswerInput.value.length == 0 && isValidURL(url) == true) {
                showObject(invalidWrongAnswer);
                backgroundPink(newWrongAnswer);
                backgroundPink(newWrongAnswerInput);

                hideObject(invalidWrongAnswerURL);
                backgroundWhite(newWrongAnswerURL);
                backgroundWhite(newWrongAnswerURLInput);

                isValid = false;

            } else if (newWrongAnswerInput.value.length != 0 && isValidURL(url) == true){                    
                allWrongAnswers.forEach(hideWrongAnswerWarnings);
                wrongAnswerList.push(newWrongAnswerInput.value);

                allWrongAnswers.forEach(hideWrongAnswerURLWarnings);
                wrongAnswerURLList.push(newWrongAnswerURLInput.value);

                isValid = true;
                
                //alert(newWrongAnswerURLInput.value);
                //alert(newWrongAnswerInput.value);
            }
        }
    }
    return isValid;
}

//=======================================================================================
//================================= AUXILIAR FUNCTIONS ==================================
//=======================================================================================
//= function renderAllQuizzesList(arr, documentObject)
//= function renderUserQuizzesList(arr, documentObject)
//= function displayNone(documentObject)
//= function displayFlex(documentObject)
//= function backgroundPink(documentObject)
//= function backgroundWhite(documentObject)
//= function hideObject(documentObject)
//= function showObject(documentObject)
//= function isValidURL(str)
//= function startsWithHash(str)
//= function isHexadecimal(str)
//=======================================================================================

function renderAllQuizzesList(arr, documentObject) {
    for(let i = 0; i < arr.length; i++) {
        documentObject.innerHTML += `<div class="quizz-card">                 
                                        <img src=${arr[i].image}>
                                        <img class="black-mask" src="./img/black-mask.png" style="height: 55%">
                                        <p>${arr[i].title}</p>
                                    </div>`
    }
}

function renderUserQuizzesList(arr, documentObject) {
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

function isValidURL(str) {
    const testResult = str.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    const includesHTTPS = str.includes("https://");
    const includesWWW = str.includes("www.");

    if (testResult === null || (includesHTTPS === false && includesWWW === false)) {
        return false;
    } else {
        return true;
    }
}

function startsWithHash(str) {
    if(str[0] === "#") {
        return true;
    }
    return false;
}

function isHexadecimal(str) {
    const newStr = str.toLowerCase().replace("#", "");
    let count = 0;
    if (newStr.length === 6) {
        for(let i = 0; i <= newStr.length; i++) {
            
            if(newStr[i] == "a" || newStr[i] == "b" || newStr[i] == "c" || newStr[i] == "d" ||
                newStr[i] == "e" || newStr[i] == "f" || newStr[i] == "0" || newStr[i] == "1" || 
                newStr[i] == "2" || newStr[i] == "3" || newStr[i] == "4" || newStr[i] == "5" ||
                newStr[i] == "6" || newStr[i] == "7" || newStr[i] == "8" ||newStr[i] == "9") {
                    count ++;
            }
        }
    }

    if (count == 6) {
        return true;
    }
    return false;
}


displayNone(first_SCREEN);
displayFlex(third_SCREEN);

displayNone(newQuizzStart);
displayFlex(newQuizzQuestions);



//============================ IGNORAR POR ENQUANTO. ESTÁ AQUI SÓ POR SEGURANÇA.
/*
function isValidWrongAnswer(){
    let isValid;
    let wrongAnswerList = [];
    for(let i = 0; i < allQuestions.length; i++){
        const allWrongAnswers = [...allQuestions[i].querySelectorAll(".wrong-answer")];
        for(let j = 0; j < allWrongAnswers.length; j++) {
            
            const newWrongAnswer = allWrongAnswers[j].querySelector(".wrong-answer-text");
            const newWrongAnswerInput = newWrongAnswer.querySelector("input");
            const invalidWrongAnswer = allWrongAnswers[j].querySelector(".invalid-info#wrong-answer-text"); 

            if (newWrongAnswerInput.value.length == 0 && wrongAnswerList.length == 0) {
                showObject(invalidWrongAnswer);
                backgroundPink(newWrongAnswer);
                backgroundPink(newWrongAnswerInput);
                isValid = false;                                
    
            } else if (newWrongAnswerInput.value.length != 0){                    
                allWrongAnswers.forEach(hideWrongAnswerWarnings);
                isValid = true;
                wrongAnswerList.push(newWrongAnswerInput.value);
                //alert(newWrongAnswerInput.value);
            }            
        }
    }
    return isValid;
}

function isValidWrongAnswerURL(){
    let isValid;
    let wrongAnswerURLList = [];
    for(let i = 0; i < allQuestions.length; i++){
        const allWrongAnswers = [...allQuestions[i].querySelectorAll(".wrong-answer")];
        for(let j = 0; j < allWrongAnswers.length; j++) {
            
            const newWrongAnswerURL = allWrongAnswers[j].querySelector(".wrong-answer-image");
            const newWrongAnswerURLInput = newWrongAnswerURL.querySelector("input");
            const invalidWrongAnswerURL = allWrongAnswers[j].querySelector(".invalid-info#wrong-answer-image"); 

            if (newWrongAnswerURLInput.value.length == 0 && wrongAnswerURLList.length == 0) {
                showObject(invalidWrongAnswerURL);
                backgroundPink(newWrongAnswerURL);
                backgroundPink(newWrongAnswerURLInput);
                isValid = false;                                
    
            } else if (newWrongAnswerURLInput.value.length != 0){                    
                allWrongAnswers.forEach(hideWrongAnswerURLWarnings);
                isValid = true;
                wrongAnswerURLList.push(newWrongAnswerURLInput.value);
                //alert(newWrongAnswerURLInput.value);
            }            
        }
    }
    return isValid;
}*/

