let intervalo = 80;
const PESO = 10;
const tamanioCanvas = 800;
let ANCHO = window.innerWidth - 32;
let ALTO = window.innerHeight - 82
const DIRECCION = {
    A: [-1, 0],
    W: [0, -1],
    S: [0, 1],
    D: [1, 0],
    a: [-1, 0],
    w: [0, -1],
    s: [0, 1],
    d: [1, 0],
    ArrowDown: [0, 1],
    ArrowUp: [0, -1],
    ArrowRight: [1, 0],
    ArrowLeft: [-1, 0]
}

let controles = {
    direccion: { x: 1, y: 0 },
    snake: [{ x: 0, y: 0 }],
    victima: { x: 0, y: 250 },
    jugando: false,
    crecimiento: 0
}

let nombre;
let direccionKey;
// Referencio el canvas
let papel = document.querySelector("canvas");
papel.width = ANCHO;
papel.height = ALTO;

// Referencia al contexto del canvas
let ctx = papel.getContext("2d");

let menuGameOver = document.querySelector(".menu-game-over");
let menuInicio = document.querySelector(".menu-inicio");
let btnPlay = document.querySelector(".btn-play");
let btnReiniciar = document.querySelector(".btn-reiniciar");
let numberPuntaje = document.querySelector(".puntajeSpan");
let puntaje_ = document.querySelector(".puntaje");

menuInicio.style.width = `${ANCHO + 2}px`;
menuInicio.style.height = `${ALTO + 2}px`;
menuGameOver.style.width = `${ANCHO + 2}px`;
menuGameOver.style.height = `${ALTO + 2}px`;

//menu.style.width = `${tamanioCanvas -30}px`;
//menu.style.height = `${tamanioCanvas - 80}px`;

let puntaje = 0;

let looper = () => {

    // Creo la cola de la serpiente
    let colaSnake = {};

    // Clono en la cola de la serpiente, lo que hay en el elemento anterior a ese elemento
    Object.assign(colaSnake, controles.snake[controles.snake.length - 1]);

    // Referencio la cabeza del bicho
    const headSnake = controles.snake[0];

    // Pregunto si la serpiente choca o "come" a la victima
    let atrapado = headSnake.x === controles.victima.x && headSnake.y === controles.victima.y;

    // Si hubo colision dejo de jugar
    if (colision()) {
        controles.jugando = false;
        papel.style.backgroundColor = '#819e01';
        menuGameOver.style.display = "flex";
        numberPuntaje.innerHTML = puntaje;
        btnReiniciar.addEventListener("click", () => {
            iniciarJuego();
        });
  
    }

    switch (puntaje) {
        case 300: intervalo = 70;
            break;
        case 500: intervalo = 60;
            break;
        case 800: intervalo = 50;
            break;
        case 1000: intervalo = 40;
            break;
        case 1500: intervalo = 30;
            break;
        default: break;
    }
    // Referencio la direccion actual
    let dx = controles.direccion.x;
    let dy = controles.direccion.y;

    //Voy moviendo las posiciones, si no es la cabeza, lo que hago es mover esa cola a la posicion inmediatamente anterior
    // Y si es la cabeza muevo en el sentido que haya apretado

    if (controles.jugando) {
        for (let i = controles.snake.length - 1; i > -1; i--) {
            const snake = controles.snake[i];
            if (i === 0) {
                snake.x += dx;
                snake.y += dy;
            } else {
                snake.x = controles.snake[i - 1].x;
                snake.y = controles.snake[i - 1].y;
            }
        }
    }

    // Si la victima fue atrapada, le suma uno a crecimiento y revive a la victima en una posicion random
    if (atrapado) {
        controles.crecimiento += 1;
        puntaje += 100;
        revivirVictima();
    }

    // Si la serpiente comio, debe crecer la cola en 1
    if (controles.crecimiento > 0) {
        controles.snake.push(colaSnake);
        controles.crecimiento -= 1;
    }

    // Llamo a la animacion a dibujar
    requestAnimationFrame(dibujar);

    // Llamar a la funcion de X intervalo
    setTimeout(looper, intervalo);

}

let colision = () => {
    const headSnake = controles.snake[0];

    // Detecto si choco contra algun borde
    if (headSnake.x < 0 || headSnake.x >= ANCHO / PESO || headSnake.y < 0 || headSnake.y >= ALTO / PESO)
        return true;

    // Detecto si choca contra si misma
    for (let i = 1; i < controles.snake.length; i++) {
        if (headSnake.x === controles.snake[i].x && headSnake.y === controles.snake[i].y)
            return true;
    }
}

document.onkeydown = (e) => {

    // Guardo en direccionKey la nueva direccion
    direccionKey = DIRECCION[e.key];

    // Deconstruyo x e y
    const [x, y] = direccionKey;

    // Valido de que no se pueda ir en la direccion contraria de la que voy
    // Si voy para arriba no puedo pasar a ir para abajo asi nomas, tengo que dar la vueltita
    if (-x != controles.direccion.x && -y != controles.direccion.y) {
        // Asigno las direcciones a los controles
        controles.direccion.x = x;
        controles.direccion.y = y;
    }

}

let dibujar = () => {
    // Elimina el canvas
    ctx.clearRect(0, 0, ANCHO, ALTO);

    // Recorro la serpiente
    for (let i = 0; i < controles.snake.length; i++) {
        const { x, y } = controles.snake[i];
        dibujarActores('green', x, y);
    }
    ctx.font = "25px Verdana";
    ctx.strokeText("Score:", ANCHO-200, 30);
    ctx.strokeText(puntaje, ANCHO-100, 30);

    ctx.strokeText("Jugador:", ANCHO*0.01, 30);
    ctx.strokeText(nombre, ANCHO*0.1, 30);

    // Dibujo la victima
    const victima = controles.victima;
    dibujarActores('red', victima.x, victima.y);

}

let dibujarActores = (color, x, y) => {

    // Le doy color del dibujo a crear
    ctx.fillStyle = color;

    // Creo un rectangulo en (PosicionX, posicionY, Ancho, Alto)
    ctx.fillRect(x * PESO, y * PESO, PESO, PESO);

}

let posicionRandom = () => {
    // Convierte a DIRECCION en un array
    let arrayDireccion = Object.values(DIRECCION);
    return {
        x: parseInt(Math.random() * ANCHO / PESO),
        y: parseInt(Math.random() * ALTO / PESO),
        d: arrayDireccion[parseInt(Math.random() * 11)]
    }
}

let revivirVictima = () => {
    let nuevaPosicionVictima = posicionRandom();
    let victima = controles.victima;
    victima.x = nuevaPosicionVictima.x;
    victima.y = nuevaPosicionVictima.y;
}

let iniciarJuego = () => {
    controles = {
        direccion: { x: 1, y: 0 },
        snake: [{ x: 40, y: 0 }],
        victima: { x: 0, y: 250 },
        jugando: false,
        crecimiento: 0
    }
    papel.style.backgroundColor = '#add400';
    puntaje = 0;
    menuGameOver.style.display = "none";
    menuInicio.style.display = "none";
    intervalo = 80;
    posicionSnake = posicionRandom();
    posicionVictima = posicionRandom();
    let headSnake = controles.snake[0];
    let victima = controles.victima;
    headSnake.x = 25;
    headSnake.y = 25;
    victima.x = posicionVictima.x;
    victima.y = posicionVictima.y;
    controles.direccion.x = posicionSnake.d[0];
    controles.direccion.y = posicionSnake.d[1];
    controles.jugando = true;
}

// Cuando el documento carga, llamo a looper
window.onload = () => {
    btnPlay.addEventListener("click", () => {
        nombre = document.getElementById("name").value;
        console.log(nombre); 
        iniciarJuego();
        looper();
    });
}

