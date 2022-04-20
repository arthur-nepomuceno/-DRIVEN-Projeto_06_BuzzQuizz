function quizzPage () {
    const id = "2"; //Usarei um único quizz para estilizar tudo e montar o código, depois trocar isso.


    const promise = axios.get(`https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes/${id}`)

    promise.then(renderQuizz);
    promise.catch(deuErrado);
}

function renderQuizz(ArrayObject) {
    const element = document.querySelector(".screen_second");

    //element.innerHTML = ``

}

function deuCerto () {
    console.log("Deu certo");
}

function deuErrado(erro) {
    console.log("Erroooou " + erro.response.status);
    console.log(erro.response.data);
}

quizzPage();