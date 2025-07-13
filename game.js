const cavas = document.getElementById("canvas");
const canvasContext = cavas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");
let createReact = (x, y, width, heigth,color) => {
    canvasContext.fillstyle = color
    canvasContext.fillRect(x, y, width, heigth);
};

let map = [];
