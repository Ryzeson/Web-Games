// Get the canvas element and its context
const canvas = $("canvas")[0];
const ctx = canvas.getContext("2d");

// Fix the blurriness issue on HD screens (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
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

//////////////////////////
//                      //
//    Game Constants    //
//                      //
//////////////////////////
const nCols = 4;
const nRows = 3;

const board = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
];

const wins = [
    // Horizontal
    [0, 1, 2],
    [1, 2, 3],
    [4, 5, 6],
    [5, 6, 7],
    [8, 9, 10],
    [9, 10, 11],
    // Vertical
    [0, 4, 8],
    [1, 5, 9],
    [2, 6, 10],
    [3, 7, 11],
    // Diagonal
    [0, 5, 10],
    [1, 6, 11],
    [2, 5, 8],
    [3, 6, 9]
]

var curPlayer = 0;
var gameOver = false;
var gameMode = "pvc"; // "pvp" or "pvc"
var cpuDifficulty = "hard";
var cpuTurnTimeoutId;

////////////////////////////
//                        //
//    Canvas Constants    //
//                        //
////////////////////////////
// Set font size to match Bootstrap 4 default typography
ctx.font = '48px "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

// New canvas width and height to match the DPR logic
const cWidth = canvas.width / dpr;
const cHeight = canvas.height / dpr;

const centerX = cWidth / 2;
const centerY = cHeight / 2;

// Gets the location of the canvas on the entire screen
// https://stackoverflow.com/questions/70519964/how-to-get-topleft-topright-bottomleft-bottomright-and-centretop-position-of
var boundingRect = canvas.getBoundingClientRect();
window.onresize = () => {
    boundingRect = canvas.getBoundingClientRect();
};

const cellHeight = cHeight / nRows;
const cellWidth = cWidth / nCols;

const CIRCLE_COLOR = "green";
const TRIANGLE_COLOR = "yellow";
const SQUARE_COLOR = "red";
const BOARD_COLOR = "#D2D7DF";
const LINE_COLOR = "black";
const TEXT_BOX_COLOR = "#353535";
const TEXT_BOX_TEXT_COLOR = "white";

//////////////////////
//                  //
//    Game Logic    //
//                  //
//////////////////////
function drawLine(startX, startY, endX, endY, lineColor, lineWidth) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
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
    ctx.fillStyle = fillColor;
    ctx.beginPath(); // Begin a new path
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Define the circle
    ctx.fill();
    ctx.closePath();
}

function drawBoard() {
    for (let i = 1; i < nCols; i++)
        drawLine((cWidth / nCols) * i, 0, (cWidth / nCols) * i, cHeight, LINE_COLOR, 2);

    for (let i = 1; i < nRows; i++)
        drawLine(0, (cHeight / nRows) * i, cWidth, (cHeight / nRows) * i, LINE_COLOR, 2);
}

function resetGame() {
    clearTimeout(cpuTurnTimeoutId);
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, cellWidth * nCols, cellHeight * nRows);
    for (cell in board) {
        drawBoard();
        board[cell] = 0;
    }

    gameOver = false;
    curPlayer = 0;
    $("#p1").addClass("current-player");
    $("#p2").removeClass("current-player");
}

function activateCell(cell) {
    // 0 -> draw a circle
    // 1 -> draw a triangle
    // 2 -> draw a square
    var cellRow = Math.floor(cell / nCols);
    var cellCol = cell % nCols;
    var boardPos = board[cell];
    var centerX = (cellCol * cellWidth) + (cellWidth / 2);
    var centerY = (cellRow * cellHeight) + (cellHeight / 2);
    if (boardPos == 0) {
        drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 3, CIRCLE_COLOR);
    }
    else if (boardPos == 1) {
        // Cheat for covering up previous circle: Draw a new (slightly bigger) one at the same spot
        drawCircle(centerX, centerY, (Math.min(cellWidth, cellHeight) / 3) + 1, BOARD_COLOR);

        var p1 = [(cellCol * cellWidth) + (cellWidth / 2), (cellRow * cellHeight) + (cellHeight / 6)];
        var p2 = [(cellCol * cellWidth) + (cellWidth / 6), (cellRow * cellHeight) + (cellHeight * 5 / 6)];
        var p3 = [(cellCol * cellWidth) + (cellWidth * 5 / 6), (cellRow * cellHeight) + (cellHeight * 5 / 6)];
        drawTriangle(p1, p2, p3, TRIANGLE_COLOR);
    }
    else if (boardPos == 2) {
        // we want the square to occupy 2/3 of the cell (1/6 gaps from the sides to the side of the square)
        var startX = (cellCol * cellWidth) + (cellWidth / 6);
        var startY = (cellRow * cellHeight) + (cellHeight / 6);
        ctx.fillStyle = SQUARE_COLOR;
        ctx.fillRect(startX, startY, (cellWidth * 2) / 3, (cellHeight * 2) / 3);
    }
    board[cell]++;
}

function getCell(x, y) {
    // Use Math.floor to replicate integer division in JavaScript (https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr)
    let row = Math.floor(y / (cHeight / nRows));
    let col = Math.floor(x / (cWidth / nCols));
    return (row * nCols) + col;
}

function changePlayer() {
    curPlayer = (curPlayer + 1) % 2;
    $(".player-box").toggleClass("current-player");
}

function checkForWin() {
    for (let i = 0; i < wins.length; i++) {
        var winRow = wins[i];
        if ((board[winRow[0]] == board[winRow[1]]) && (board[winRow[0]] == board[winRow[2]]) && (board[winRow[0]] != 0))
            return true;
    }
    return false;
}

function displayWinner() {
    changePlayer();

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

    // Then draw the text
    ctx.fillStyle = TEXT_BOX_TEXT_COLOR;
    ctx.fillText(text, textX, textY);
}

function makeMove(cell) {
    console.log(board);
    console.log(cell);
    changePlayer();
    activateCell(cell);
    if (checkForWin()) {
        gameOver = true;
        displayWinner();
    }
    else if (gameMode == "pvc" && curPlayer == 1) {
        cpuTurn();
    }
    console.log(board);
}

/////////////////////////////////
//                             //
//    Computer Player Logic    //
//                             //
/////////////////////////////////

// All -> If there is a winning move, make it.
// Easy ->  Play in a random spot
// Hard -> Play in a random spot, unless this could allow the opponent to win on the next move

function cpuTurn() {
    var possibleMoves = calculatePossibleMoves();
    var chosenCell;
    for (let move of possibleMoves) {
        board[move]++;
        if (checkForWin())
            chosenCell = move;
        board[move]--;
    }
    if (!chosenCell) {
        switch (cpuDifficulty) {
            case ("easy"):
                var randomIndex = Math.floor(Math.random() * possibleMoves.length);
                var chosenCell = possibleMoves[randomIndex];
                break;
            case ("hard"):
                var potentialMoves = [...possibleMoves];
                for (let move of possibleMoves) {
                    board[move]++;
                    var humanPossibleMoves = calculatePossibleMoves();
                    for (let humanMove of humanPossibleMoves) {
                        board[humanMove]++;
                        if (checkForWin()) {
                            potentialMoves.splice(potentialMoves.indexOf(move), 1);
                            board[humanMove]--;
                            break;
                        }
                        board[humanMove]--;
                    }
                    board[move]--;
                }
                if (potentialMoves.length == 0) {
                    var randomIndex = Math.floor(Math.random() * possibleMoves.length);
                    var chosenCell = possibleMoves[randomIndex];
                }
                else {
                    var randomIndex = Math.floor(Math.random() * potentialMoves.length);
                    var chosenCell = potentialMoves[randomIndex];
                }
                break;
            default:
                console.log("CPU difficulty is not one of the options!")
        }
    }

    cpuTurnTimeoutId = setTimeout(() => {
        makeMove(chosenCell)
    }, 1100);
}

function calculatePossibleMoves() {
    var possibleMoves = [];
    for (i in board) {
        if (board[i] < 3)
            possibleMoves.push(i);
    }
    console.log("Possible moves" + possibleMoves);
    return possibleMoves;
}

//////////////////////////
//                      //
//    Listeners + UI    //
//                      //
//////////////////////////
$("canvas").on("click", handleClick);

function handleClick(e) {
    const clickX = e.clientX - boundingRect.left;
    const clickY = e.clientY - boundingRect.top;
    if (!gameOver && (gameMode == "pvp" || (gameMode == "pvc" && curPlayer == 0))) {
        var cell = getCell(clickX, clickY);
        if (board[cell] < 3) {
            makeMove(cell);
        }
    }
}

function optionsListener() {
    var d = getCheckedValue("game_mode");
    console.log("Checked value: " + d)
    if(getCheckedValue("game_mode") != gameMode)
        $(".options-warning").removeClass("invisible");
    else
        $(".options-warning").addClass("invisible");
}

function updateOptions() {
    cpuDifficulty = getCheckedValue("cpu_difficulty");
    var newGameMode = getCheckedValue("game_mode");
    if (newGameMode != gameMode)
        resetGame();
    gameMode = newGameMode;
    updatePlayerLabels();

    $(".options-warning").addClass("invisible");
}

function getCheckedValue(groupName) {
    var form = $("#options-form")[0];
    var inputs = [...form.elements[groupName]]; //https://stackoverflow.com/questions/2735067/how-to-convert-a-dom-node-list-to-an-array-in-javascript
    var checkedValue;
    inputs.forEach(input => {
        if (input.checked) {
            checkedValue = input.value;
        }
    })
    return checkedValue;
}

function updatePlayerLabels() {
    var p2Label = $("#p2-label");
    if (gameMode == "pvc")
        p2Label.text("Computer");
    else
        p2Label.text("Player 2");
}

function addPlayAgainButton() {
    
}

$(document).keypress(e => {
    if (e.key.toLowerCase() == 'o' || e.key.toLowerCase() == 's' )
        $("#options-modal").modal("toggle");
    else if (e.key.toLowerCase() == 'r')
        resetGame();
});

drawBoard();