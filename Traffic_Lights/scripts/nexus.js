// Get the canvas element and its context
const canvas = $("canvas")[0];
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// Fix the blurriness issue on HD screens
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
////////////////////////////////////////
// Get the DPR and size of the canvas
const dpr = window.devicePixelRatio;
const rect = canvas.getBoundingClientRect();

// Set the "actual" size of the canvas
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

// Scale the context to ensure correct drawing operations
ctx.scale(dpr, dpr);

// Set the "drawn" size of the canvas
canvas.style.width = `${rect.width}px`;
canvas.style.height = `${rect.height}px`;
////////////////////////////////////////

// Set font size
ctx.font = "48px serif";

// Game constants
const nCols = 4;
const nRows = 3;

const board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

const wins = [
    // Horizontal
    [[0,0], [0,1], [0,2]],
    [[0,1], [0,2], [0,3]],
    [[1,0], [1,1], [1,2]],
    [[1,1], [1,2], [1,3]],
    [[2,0], [2,1], [2,2]],
    [[2,1], [2,2], [2,3]],
    // Vertical
    [[0,0], [1,0], [2,0]],
    [[0,1], [1,1], [2,1]],
    [[0,2], [1,2], [2,2]],
    [[0,3], [1,3], [2,3]],
    // Diaganol
    [[0,0], [1,1], [2,2]],
    [[0,1], [1,2], [2,3]],
    [[2,0], [1,1], [0,2]],
    [[2,1], [1,2], [0,3]]
]

var curPlayer = 0;
var gameOver = false;


// Canvas constants
// New canvas width and height to match the DPR logic
const cWidth = canvas.width / dpr;
const cHeight = canvas.height / dpr;

const centerX = cWidth / 2;
const centerY = cHeight / 2;

// Gets the location of the canvas on the entire screen
// https://stackoverflow.com/questions/70519964/how-to-get-topleft-topright-bottomleft-bottomright-and-centretop-position-of
var boundingRect = canvas.getBoundingClientRect();
var canvasTop = boundingRect.top;
var canvasRight = boundingRect.right;
var canvasBottom = boundingRect.bottom;
var canvasLeft = boundingRect.left;

const cellHeight = cHeight / nRows;
const cellWidth = cWidth / nCols;

const GREEN = "green";
const YELLOW = "yellow";
const RED = "red";
const BOARD_COLOR = "#CFF5F1";
const TEXT_BOX_COLOR = 'rgba(208, 211, 218, 0.8)';

// Set circle properties
const radius = 50;
const fillColor = "blue";



// Functions
function drawLine(startX, startY, endX, endY, lineColor, lineWidth) {
    ctx.beginPath(); 
    ctx.moveTo(startX, startY); 
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke(); // Actually draw the line
    ctx.closePath();
}

function drawTriangle(p1, p2, p3, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.fill();
    ctx.closePath();
}

function drawCircle(centerX, centerY, radius, fillColor) {
    ctx.beginPath(); // Begin a new path
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Define the circle
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.closePath();
}

function drawShape(cellRow, cellCol) {
    // 0 -> draw a circle
    // 1 -> draw a triangle
    // 2 -> draw a square
    var boardPos = board[cellRow][cellCol];
    if (boardPos == 0) {
        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);
        drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 3, GREEN);
        board[cellRow][cellCol]++;
    }
    else if (boardPos == 1) {
        // Cheat for covering up previous circle: Draw a new one at the same spot
        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);
        drawCircle(centerX, centerY, (Math.min(cellWidth, cellHeight) / 3) + 1, BOARD_COLOR);

        // Draw triangle
        var p1 = [(cellCol * cellWidth) + (cellWidth / 2), (cellRow * cellHeight) + (cellHeight / 6)];
        var p2 = [(cellCol * cellWidth) + (cellWidth / 6), (cellRow * cellHeight) + (cellHeight * 5 / 6)];
        var p3 = [(cellCol * cellWidth) + (cellWidth * 5 / 6), (cellRow * cellHeight) + (cellHeight * 5 / 6)];
        drawTriangle(p1, p2, p3, YELLOW);
        board[cellRow][cellCol]++;
    }
    else if (boardPos == 2) {
        // we want the square to occupy 2/3 of the cell (1/6 gaps from the sides to the side of the square)
        var startX = (cellCol * cellWidth) + (cellWidth / 6);
        var startY = (cellRow * cellHeight) + (cellHeight / 6);
        ctx.fillStyle = RED;
        ctx.fillRect(startX, startY, (cellWidth * 2) / 3, (cellHeight * 2) / 3);
        board[cellRow][cellCol]++;
    }
    console.log("Finished drawing shape");
}

function getCell(x, y) {
    let row;
    let col;
    // Use Math.floor to replicate integer division in JavaScript
    // https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr
    row = Math.floor(y / (cHeight / nRows));
    col = Math.floor(x / (cWidth / nCols));
    return [row, col];
}

function changePlayer() {
    curPlayer = (curPlayer + 1) % 2;
    $(".player-box").toggleClass("current-player");
}

function checkForWin() {
    for (let i = 0; i < wins.length; i++) {
        var winRow = wins[i];
        if ((board[winRow[0][0]][winRow[0][1]] == board[winRow[1][0]][winRow[1][1]]) &&
        (board[winRow[0][0]][winRow[0][1]] == board[winRow[2][0]][winRow[2][1]]) &&
        (board[winRow[0][0]][winRow[0][1]] != 0)
        ) {
            gameOver = true;
            return true;
        }
    }
    return false;
}

function displayWinner() {
    let text = 'Player ' + (curPlayer + 1) + ' wins!';
    let textWidth = ctx.measureText(text).width;
    let textHeight = ctx.measureText('M').width; // cheat to get height
    let textX = (cWidth / 2) - textWidth / 2;
    let textY = cHeight / 2;

    let textBoxWidth = textWidth * 1.2;
    let textBoxHeight = textHeight * 1.4;
    let textBoxX = textX - (textWidth * .1);
    let textBoxY = textY - textHeight;

    // Draw the box first
    ctx.fillStyle = TEXT_BOX_COLOR;
    ctx.fillRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);
    // ctx.fill();

    // Then draw the text
    ctx.fillStyle = 'black';
    ctx.fillText(text, textX, textY);

    console.log("Finished displaying winner");
}

// Draw the board
for (let i = 1; i < nCols; i++)
    drawLine((cWidth / nCols) * i, 0, (cWidth / nCols) * i, cHeight, "black", 2);

for (let i = 1; i < nRows; i++)
    drawLine(0, (cHeight / nRows) * i, cWidth, (cHeight / nRows) * i, "black", 2);

/*
    LISTENERS
*/

function handleClick(e) {
    // var coord = getCell(e.clientX, e.clientY);
    const clickX = e.clientX - canvasLeft;
    const clickY = e.clientY - canvasTop;
    console.log("X: " + e.clientX + ", Y: " +  e.clientY);
    if (!gameOver) {
        var cell = getCell(clickX, clickY);
        console.log(cell);
        console.log(board[cell[0]][cell[1]]);
        drawShape(cell[0], cell[1]);
        if(checkForWin())
            displayWinner();
        else
            if (board[cell[0]][cell[1]] < 3)    
                changePlayer();
    }
}

$("canvas").on("click", handleClick);

onresize = (event) => {
    boundingRect = canvas.getBoundingClientRect();
    canvasTop = boundingRect.top;
    canvasRight = boundingRect.right;
    canvasBottom = boundingRect.bottom;
    canvasLeft = boundingRect.left;
};

// Reset game
$(document).keypress(function(e){
    if (e.key == 'r')
        window.location.reload();
});
