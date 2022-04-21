function quizzPage () {
    const id = "2"; //Usarei um único quizz para estilizar tudo e montar o código, depois trocar isso.


    const promise = axios.get(`https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes/${id}`)

    promise.then(getQuizz);
    promise.catch(deuErrado);
}

function getQuizz(quizz) {
    const titleObject = quizz.data;
    const questionsObject = quizz.data.questions;
    console.log(questionsObject);

    renderQuizzTitle(titleObject);
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
        console.log(question);

        element.innerHTML +=`
        <div class="quizz-question question_${i}">
            <p style="background-color: ${question.color}">${question.title}</p>
        `
        renderAnswers(question,i);
    }
}

function renderAnswers(question,i) {
    const element = document.querySelector(`.question_${i}`);

    for (let j = 0; j < question.answers.length; j++) {
        const answer = question.answers[j];

        element.innerHTML += `
        <div onclick = "chooseAnswer(this)">
        <img src="${answer.image}">
        <h1>${answer.text}</h1>
        </div>
        `
    }
}

function chooseAnswer(element) {
    console.log("click foi");
}

function deuCerto () {
    console.log("Deu certo");
}

function deuErrado(erro) {
    console.log("Erroooou " + erro.response.status);
    console.log(erro.response.data);
}

//quizzPage();