let pontuation = 0;
let questionAnswered = 0;
let quizzData;
let answerIndex =[];
let id;
let local = [];
let myQuizzesArr = [];
let allQuestions;
let editKey;
const API = "https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes";
const Time_2S = 2 * 1000;
const first_SCREEN = document.querySelector(".screen_first");
const second_SCREEN = document.querySelector(".screen_second");
const third_SCREEN = document.querySelector(".screen_third");

let quizzTitle;
let quizzURL;
let quizzNumberOfQuestions;
let quizzNumberOfLevels;

let quizzQuestions = [];
let quizzArrLevels = [];

let newUserQuizz;

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

    loadPageIn();

    const promise = axios.get(API);
    promise.then(renderAllQuizzes);
    promise.catch(deuErrado);
}

function renderAllQuizzes(response) {

    loadPageOff();

    const allQuizzesList = response.data;
    const allQuizzesHTML = document.querySelector(".all-quizzes > .quizzes");
    renderAllQuizzesList(allQuizzesList, allQuizzesHTML);
}

function getUserQuizzes() {
    if (localStorage.getItem("quizzes") !== null) {
        const myQuizzes = localStorage.getItem("quizzes");
        myQuizzesArr = JSON.parse(myQuizzes);
        if (myQuizzesArr !== null) {
            if(myQuizzesArr.length > 0) {
                for (let i = 0; i < myQuizzesArr.length; i++) {

                    const promise = axios.get(`${API}/${myQuizzesArr[i][0]}`);

                    promise.then(renderUserQuizzes);
                    promise.catch(deuErrado);
                }
            } else {
                document.querySelector(".no-quizzes").setAttribute("style","display: flex");
                document.querySelector(".user-quizzes").setAttribute("style","display: none");
            }
        }
    } else {
        document.querySelector(".no-quizzes").setAttribute("style","display: flex");
        document.querySelector(".user-quizzes").setAttribute("style","display: none");
    }
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

function editQuizz(id) {
    const object = axios.get(`${API}/${id}`);

    object.then(editar);

    for (let i = 0; i < myQuizzesArr.length; i++) {
        if (id === myQuizzesArr[i][0]) {
                editKey = myQuizzesArr[i][1];
        }
    }
        
}

function editar(object) {
/*
    //API-ID -> OBJETO ANTIGO : OK
    //OBJECT.DATA -> OBJETO NOVO <-PRECISAMOS DISSO - renderizar a parte
    //SECRET-KEY - OBJETO ANTIGO : JÁ SALVO

    id = object.data.id;
    delete object.data.id;
    
    console.log(object.data);
    
    //COMO ENVIAR PARA O SERVIDOR
    const promise = axios.put(`${API}/${id}`,object.data,{headers:{'Secret-Key':editKey}});
    
    promise.then(deuCerto);
    promise.catch(deuErrado);
*/
    
}

function deleteQuizz(id) {
    if(confirm("Tem certeza que gostaria de deletar esse extraordinário Quizz?")) {
        let getKey;
        for (let i = 0; i < myQuizzesArr.length; i++) {
            if (id === myQuizzesArr[i][0]) {
                getKey = myQuizzesArr[i][1];
            }
        }
        
        if (getKey !== undefined) {
            const promise = axios.delete(`${API}/${id}`,{headers:{'Secret-Key':getKey}});
            
            removeLocalStorage(id);

            promise.then(backHome);
            promise.catch(deuErrado);
        }
    }
}

function removeLocalStorage(id) {
    for (let i = 0; i < myQuizzesArr.length; i++) {
        if (id === myQuizzesArr[i][0]) {
            myQuizzesArr.splice(i,1);
        }
    }

    local = myQuizzesArr;
    const stringsSave = JSON.stringify(local);
    localStorage.removeItem("quizzers");
    localStorage.setItem("quizzes",stringsSave);
}

//=======================================================================================
//=============================== SECOND SCREEN FUNCTIONS ===============================
//=======================================================================================

function quizzPage (APIid) {
    id = APIid;

    resetVariables();

    document.querySelector(".screen_first").setAttribute("style","display:none");
    document.querySelector(".screen_third").setAttribute("style","display:none");

    loadPageIn();

    const promise = axios.get(`${API}/${id}`);

    promise.then(getQuizz);
    promise.catch(error);
}

function getQuizz(quizz) {
    loadPageOff();
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

    document.querySelector(".quizz_title").scrollIntoView();
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
            <button class="quizz-result-button_answer-again" onclick="quizzPage(${id})">Reiniciar Quizz</button>
            <button class="quizz-result_button_back-home" onclick="backHome()">Voltar pra home</button>
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
        nextQuestionElement.scrollIntoView(false);
    } else {
        document.querySelector(".quizz-result-buttons").scrollIntoView(false);
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
}

function error(erro) {
    alert(erro.response.data);
}
function deuCerto (object) {
    console.log(object);
    console.log("Deu certo");
}

function deuErrado(erro) {
    console.log("Erroooou " + erro.response.status);
    console.log(erro.response.data);
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
        
        renderNewQuizzQuestionsScreen(quizzNumberOfQuestions);
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

        saveObjectQuestion();

        renderNewQuizzLevelsScreen(quizzNumberOfLevels);
        displayNone(newQuizzQuestions);
        displayFlex(newQuizzLevels);
    }
}

function saveObjectQuestion() {

    for(let i = 1; i <= quizzNumberOfQuestions; i++) {
        const valueTitle = document.querySelector(`[data-question='${i}'] input`).value;
        const valueColor = document.querySelector(`[data-question='${i}'] .question-color input`).value;
        
        const arrObjectAnswer = saveObjectAnswer(i);

        const object = {title:valueTitle,color:valueColor,answers:arrObjectAnswer};
        
        quizzQuestions.push(object);
    }
}

function saveObjectAnswer(i) {
    const arrObject = [];

    const valueAnswerText = document.querySelector(`[data-question='${i}'] .right-answer-text input`).value;
    const valueAnswerImage = document.querySelector(`[data-question='${i}'] .right-answer-image input`).value;
    const objectAnswer = {text:valueAnswerText,image:valueAnswerImage,isCorrectAnswer:true};
    arrObject.push(objectAnswer);
    
    const wrongAnswersText = [...document.querySelectorAll(`[data-question='${i}'] .wrong-answer-text input`)];
    const wrongAnswerImage = [...document.querySelectorAll(`[data-question='${i}'] .wrong-answer-image input`)];
    
    for (let j=0; j < 3; j++) {
            const objectAnswer = {text:wrongAnswersText[j].value,image:wrongAnswerImage[j].value,isCorrectAnswer:false};
            arrObject.push(objectAnswer);
        }

    return arrObject;
}

function moveToSuccessScreen() {
    isValidLevelTitle();
    isValidLevelPercentage();
    isValidLevelURL();
    isValidLevelDescription();

    if(isValidLevelTitle() && isValidLevelPercentage() 
    && isValidLevelURL() && isValidLevelDescription()){

        saveObjectLevels();

        sendQuizzToAPI();

        displayNone(newQuizzLevels);
        displayFlex(newQuizzSuccess);
    } 
}

function saveObjectLevels() {
    for(let i = 1; i <= quizzNumberOfLevels; i++) {
        const valueTitle = document.querySelector(`[data-level='${i}'] .level-text input`).value;
        const valueImage = document.querySelector(`[data-level='${i}'] .level-url input`).value;
        const valueText = document.querySelector(`[data-level='${i}'] .level-description input`).value;
        const valueMinValue = document.querySelector(`[data-level='${i}'] .level-percentage input`).value;
        
        const object = {title:valueTitle,image:valueImage,text:valueText,minValue:valueMinValue};
        
        quizzArrLevels.push(object);
    }
}

function sendQuizzToAPI() {
    newUserQuizz = {
        title: quizzTitle,
        image: quizzURL, 
        questions: quizzQuestions, 
        levels: quizzArrLevels
    };

    const promise = axios.post(API,newUserQuizz);

    promise.then(getMyQuizz);
    promise.catch(deuErrado); 
}

function getMyQuizz(object) {
    saveToLocalStorage(object.data.id,object.data.key);

    renderSucessQuizz(object);
}

function renderSucessQuizz(object) {
    const element = document.querySelector(".new-quizz-success");

    element.innerHTML += `
    <div class="new-quizz-card" data-id='${object.data.id}'>
        <img src="${object.data.image}">
        <img class="black-mask" src="./img/black-mask.png" style="height: 55%">
        <p>${object.data.title}</p>
    </div>
    <button id="access-quizz" onclick="quizzPage(${object.data.id})">Acessar Quizz</button>
    <button id="home" onclick="moveToFirstScreen()">Voltar para home</button>
    `;
}

function saveToLocalStorage(id,key) {
    const userQuizzArray = [id,key];

    if(localStorage.getItem("quizzes") !== null) {
        const myQuizzes = localStorage.getItem("quizzes");
        local = JSON.parse(myQuizzes);
    }

    local.push(userQuizzArray);

    const stringsSave = JSON.stringify(local);
    
    localStorage.setItem("quizzes",stringsSave);
}

function moveToFirstScreen() {
    window.location.reload();
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

        quizzTitle = newQuizzTitleInput.value;
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

        quizzURL = url;
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
        
        quizzNumberOfQuestions = newQuizzNumberOfQuestionsInput.value;
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

        quizzNumberOfLevels = newQuizzNumberOfLevelsInput.value;
        return true;
    }
}

/* ============================================================================
=================== NEW QUIZZ QUESTIONS SCREEN FUNCTIONS ====================
//= isValidQuestionText()
//= isValidQuestionColor()
//= isValidRightAnswer()
//= isValidRightAnswerURL()
//= hideWrongAnswerWarnings(documentObject)
//= hideWrongAnswerURLWarnings(documentObject)
//= isValidWrongData()
============================================================================ */
const newQuizzQuestionsHTML = document.querySelector(".new-quizz-questions");

function renderNewQuizzQuestionsScreen(n) {
    
    for(let i = 1; i <= n; i++){
        let newQuestionHTML = `<div class="new-question" data-question="${i}">
                                    <p>Pergunta ${i}<ion-icon name="create-outline" onclick="hideNewQuestionData(this)"></ion-icon></p>
                                    <div class="new-question-data hidden">
                                        <div class="question-text">
                                            <input type="text" placeholder="Texto da pergunta ${i}">
                                        </div>
                                        <p class="invalid-info hidden" id="question-text">O texto deve ter no mínimo 20 caracteres.</p>
                                        
                                        <div class="question-color">
                                            <input type="text" placeholder="Cor de fundo da pergunta">  
                                        </div>
                                        <p class="invalid-info hidden" id="question-color">A cor deve estar em formato hexadecimal, começando com "#".</p>
                                        
                                        <p>Resposta correta</p>
                                        <div class="right-answer">
                                            <div class="right-answer-text">
                                                <input type="text" placeholder="Resposta correta">
                                            </div>
                                            <p class="invalid-info hidden" id="right-answer-text">O texto não pode estar vazio.</p>
                                            <div class="right-answer-image">
                                                <input type="text" placeholder="URL da imagem">
                                            </div>
                                            <p class="invalid-info hidden" id="right-answer-image">O valor informado não é uma URL válida.</p>    
                                        </div>
                                        
                                        <p>Respostas incorretas</p>
                                        <div class="wrong-answer">
                                            <div class="wrong-answer-text">
                                                <input type="text" placeholder="Resposta incorreta 1">
                                            </div>
                                            <p class="invalid-info hidden" id="wrong-answer-text">Deve haver pelo menos uma resposta incorreta.</p>
                                            <div class="wrong-answer-image">
                                                <input type="text" placeholder="URL da imagem 1">
                                            </div>
                                            <p class="invalid-info hidden" id="wrong-answer-image">O valor informado não é uma URL válida.</p>
                                        </div>
                                        <div class="wrong-answer">
                                            <div class="wrong-answer-text">
                                                <input type="text" placeholder="Resposta incorreta 2">
                                            </div>
                                            <p class="invalid-info hidden" id="wrong-answer-text">Deve haver pelo menos uma resposta incorreta.</p>
                                            <div class="wrong-answer-image">
                                                <input type="text" placeholder="URL da imagem 2">
                                            </div>
                                            <p class="invalid-info hidden" id="wrong-answer-image">O valor informado não é uma URL válida.</p>
                                        </div>
                                        <div class="wrong-answer">
                                            <div class="wrong-answer-text">
                                                <input type="text" placeholder="Resposta incorreta 3">
                                            </div>
                                            <p class="invalid-info hidden" id="wrong-answer-text">Deve haver pelo menos uma resposta incorreta.</p>
                                            <div class="wrong-answer-image">
                                                <input type="text" placeholder="URL da imagem 3">
                                            </div>
                                            <p class="invalid-info hidden" id="wrong-answer-image">O valor informado não é uma URL válida.</p>
                                        </div>                            
                                    </div>               
                                </div>
                                `;
        
        newQuizzQuestionsHTML.innerHTML += newQuestionHTML;
    }
    newQuizzQuestionsHTML.innerHTML += `<button onclick="moveToCreateLevelsScreen()">Prosseguir para criar níveis</button>`
    allQuestions = newQuizzQuestionsHTML.querySelectorAll(".new-question");

    hideNewQuestionData(document.querySelector("[data-question='1']"));
}

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
        } else {
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
    let rightAnswerList = [];
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
            rightAnswerList.push(newRightAnswerInput.value);
            isValid = true;
        }
    }
    if(rightAnswerList.length < quizzNumberOfQuestions){
        isValid = false;
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
            }
        }
    }
    return isValid;
}

/* ============================================================================
====================== NEW QUIZZ LEVELS SCREEN FUNCTIONS ======================
isValidLevelTitle()
isValidLevelPercentage()
isValidLevelURL()
isValidLevelDescription()
============================================================================ */

const newQuizzLevelsHTML = document.querySelector(".new-quizz-levels");
let allLevels;
function renderNewQuizzLevelsScreen(n){    
    for(let i = 1; i <= n; i++){
        let newLevelHTML = `<div class="new-level" data-level="${i}">
                                <p>Nível ${i}<ion-icon name="create-outline" onclick="hideNewLevelData(this)"></ion-icon></p>
                                <div class="new-level-data hidden">
                                    <div class="level-text">
                                        <input type="text" placeholder="Título do nível ${i}">
                                    </div>
                                    <p class="invalid-info hidden" id="level-text">O título deve ter no mínimo 10 caracteres.</p>
                                    
                                    <div class="level-percentage">
                                        <input type="text" placeholder="% de acerto mínima">
                                    </div>
                                    <p class="invalid-info hidden" id="level-percentage">Digite um número entre 0 e 100.</p>
                                    
                                    <div class="level-url">
                                        <input type="text" placeholder="URL da imagem do nível">
                                    </div>
                                    <p class="invalid-info hidden" id="level-url">O valor informado não é uma URL válida.</p>    
                                    
                                    <div class="level-description">
                                        <input type="text" placeholder="Descrição do nível">
                                    </div>
                                    <p class="invalid-info hidden" id="level-description">A descrição deve ter no mínimo 30 caracteres.</p>
                                </div>
                            </div>
                            `;

        newQuizzLevelsHTML.innerHTML += newLevelHTML;
    }
    newQuizzLevelsHTML.innerHTML += `<button onclick="moveToSuccessScreen()">Finalizar Quizz</button>`
    allLevels = newQuizzLevelsHTML.querySelectorAll(".new-level");

    hideNewLevelData(document.querySelector("[data-level='1']"));
}

function isValidLevelTitle() {
    let isValid;
    let levelTitleList = [];
    for (let i = 0; i < allLevels.length; i++){        
        const newLevelTitle = allLevels[i].querySelector(".level-text");      
        const newLevelTitleInput = newLevelTitle.querySelector("input");
        const invalidLevelTitle = allLevels[i].querySelector(".invalid-info#level-text");

        if (newLevelTitleInput.value.length < 10) {
            showObject(invalidLevelTitle);
            backgroundPink(newLevelTitle);
            backgroundPink(newLevelTitleInput);
            isValid = false;      
        } 
        else {
            hideObject(invalidLevelTitle);
            backgroundWhite(newLevelTitle);
            backgroundWhite(newLevelTitleInput);
            levelTitleList.push(newLevelTitleInput.value);
            isValid = true;
        }
    }

    if (levelTitleList.length < quizzNumberOfLevels) {
        isValid = false;
    }
    return isValid;
}

function isValidLevelPercentage() {
    let isValid;
    let percentageList = [];
    for (let i = 0; i < allLevels.length; i++){        
        const newLevelPercentage = allLevels[i].querySelector(".level-percentage");      
        const newLevelPercentageInput = newLevelPercentage.querySelector("input");
        const invalidLevelPercentage = allLevels[i].querySelector(".invalid-info#level-percentage");
        
        const levelPercentage = Math.floor(Number(newLevelPercentageInput.value));       

        if (isNaN(Number(newLevelPercentageInput.value)) || newLevelPercentageInput.value == "" 
        || levelPercentage < 0 || levelPercentage > 100) {
            showObject(invalidLevelPercentage);
            backgroundPink(newLevelPercentage);
            backgroundPink(newLevelPercentageInput);
            isValid = false;      
        } 
        else {
            hideObject(invalidLevelPercentage);
            backgroundWhite(newLevelPercentage);
            backgroundWhite(newLevelPercentageInput);
            percentageList.push(levelPercentage)
            isValid = true;
        }
    }

    if(percentageList.includes(0) == false) {
        isValid = false;
        alert("Pelo menos um nível deve ter porcentagem igual a 0.")
    }

    return isValid;
}

function isValidLevelURL() {
    let isValid;
    for (let i = 0; i < allLevels.length; i++){
        const newLevelURL = allLevels[i].querySelector(".level-url");
        const newLevelURLInput = newLevelURL.querySelector("input");
        const invalidLevelURL = allLevels[i].querySelector(".invalid-info#level-url");

        const url = newLevelURLInput.value;

        if (isValidURL(url)) {
            hideObject(invalidLevelURL);
            backgroundWhite(newLevelURL);
            backgroundWhite(newLevelURLInput);       
    
            isValid = true;
        } else {
            showObject(invalidLevelURL);
            backgroundPink(newLevelURL);
            backgroundPink(newLevelURLInput);    
    
            isValid = false;
        }
    }
    return isValid;
}

function isValidLevelDescription() {
    let isValid;
    for (let i = 0; i < allLevels.length; i++){        
        const newLevelDescription = allLevels[i].querySelector(".level-description");      
        const newLevelDescriptionInput = newLevelDescription.querySelector("input");
        const invalidLevelDescription = allLevels[i].querySelector(".invalid-info#level-description");

        if (newLevelDescriptionInput.value.length < 30) {
            showObject(invalidLevelDescription);
            backgroundPink(newLevelDescription);
            backgroundPink(newLevelDescriptionInput);
            isValid = false;      
        } 
        else {
            hideObject(invalidLevelDescription);
            backgroundWhite(newLevelDescription);
            backgroundWhite(newLevelDescriptionInput);
            isValid = true;
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
        documentObject.innerHTML += `<div class="quizz-card" onclick="quizzPage(${arr[i].id})">                 
                                        <img src=${arr[i].image}>
                                        <img class="black-mask" src="./img/black-mask.png" style="height: 55%">
                                        <p>${arr[i].title}</p>
                                    </div>`
    }
}

function renderUserQuizzesList(object, documentObject) {
        documentObject.innerHTML += `
        <div class="quizz-card" data-user="${object.id}">                 
            <img src=${object.image} onclick="quizzPage(${object.id})">
            <img class="black-mask" src="./img/black-mask.png" style="height: 55%" onclick="quizzPage(${object.id})">
            <p onclick="quizzPage(${object.id})">${object.title}</p>
            <div class="EditRemoveQuizz">
	            <ion-icon name="create-outline" onclick="editQuizz(${object.id})"></ion-icon>
	            <ion-icon name="trash-outline" onclick="deleteQuizz(${object.id})"></ion-icon>
            </div>
        </div>
        `

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

function loadPageIn() {
    document.querySelector(".screen_second").innerHTML += `
    <div class="loadPage">
        <img src="./img/loading.svg">
        <h1>Carregando</h1>
    </div>
    `
}

function loadPageOff() {
    document.querySelector(".loadPage").remove();
}

function backHome() {
    window.location.reload();
}
