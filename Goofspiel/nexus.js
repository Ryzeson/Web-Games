// Get the canvas element and its context
const canvas = $("canvas")[0];
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.font = "48px serif";

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

// Canvas constants
const canvasWidth = canvas.width / dpr;
const canvasHeight = canvas.height / dpr;

// Game constants
const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
let playerCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
let opCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
let prizeCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const GAME_SPEED = 20; // Wait time for animations in miliseconds (default 2000)

// Set the card dimensions
const cardDim = 5 / 7;
const cardWidth = 35;
const cardHeight = cardWidth / cardDim;
const cornerRadius = 5;
const cardColor = "white";
const textColor = "black";
const opCardColor = "red";
const spaceBetweenCards = cardWidth / 4;
const startingX = canvasWidth / cards.length - (cardWidth * 1.5);
const playerStartingY = canvasHeight - 10 - cardHeight;
const opStartingY = 10;

const prizeX = (canvasWidth - cardWidth) / 2;
const prizeY = (canvasHeight - cardHeight) / 2;
const prizeCardOffset = cardWidth / 2;

const boardColor = '#CFF5F1';
const TEXT_BOX_COLOR = 'rgba(208, 211, 218, 0.8)';
// Set font size
const cardFont = "10px serif";
const winFont = "48px serif";

const PLAYER_ONE = 0;
const PLAYER_TWO = 1;

var pScore = 0;
var opScore = 0;

var playerCard;
var opCard;
var nTies = 0;

var playerTieCards = [];
var opTieCards = [];
var prizeStack = [];

var gameOver = false;

// Function to draw a rounded rectangle
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

// Draw the card
function drawCard(x, y, cardColor, text = '', textColor = cardColor, cardBorderColor = "black") {
    // Draw card body
    ctx.fillStyle = cardColor;
    ctx.strokeStyle = cardBorderColor;
    drawRoundedRect(x, y, cardWidth, cardHeight, cornerRadius);
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = textColor;
    // Top text
    ctx.fillText(text, x + cardWidth / 7, y + cardHeight / 4);
    // Bottom text
    ctx.fillText(text, x + cardWidth - (cardWidth / 7) - ctx.measureText(text).width, y + cardHeight - (cardHeight / 4) + ctx.measureText('M').width); // hack to find height: width and height of 'M' are about the same
}

function drawCircle(centerX, centerY, radius, fillColor) {
    ctx.beginPath(); // Begin a new path
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Define the circle
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.closePath();
}

function getCard(x, y) {
    // drawCircle(x, y, 2, "green");
    if (y > (playerStartingY) && y < (playerStartingY + cardHeight)) {
        let cardNum = Math.floor((x - startingX) / (cardWidth + spaceBetweenCards)); // Reverse formula for placing the cards initially
        if ((cardNum >= 1 && cardNum <= 13) && playerCards.includes(cardNum)) {
            playerCard = cardNum;
            playerTieCards.push(playerCard);
            initBout();
        }
    }
}

async function initBout() {
    playCardAnim(playerCard, PLAYER_ONE);
    playerCards.splice(playerCards.indexOf(playerCard), 1);

    // If you play a card, then opponent plays one as well
    opTurn();

    $("canvas").off("click", handleMouseMove);
    setTimeout(() => {
        $("canvas").on("click", handleMouseMove);
    }, GAME_SPEED + 1);
    await sleep(GAME_SPEED);

    if (playerCard > opCard) {
        updateScore(PLAYER_ONE);
        nTies = 0;
    }
    else if (playerCard < opCard) {
        updateScore(PLAYER_TWO);
        nTies = 0;
    }
    else {
        nTies++;
    }

    newTurn();
}

function playCardAnim(cardN, playerNum) {
    // Trick to fully cover up the original card's border
    let origLineWidth = ctx.lineWidth;
    ctx.lineWidth = origLineWidth + 1;
    if (playerNum == PLAYER_ONE) {
        drawCard(startingX + (cardN * (cardWidth + spaceBetweenCards)), playerStartingY, boardColor, "", textColor, boardColor);
        ctx.lineWidth = origLineWidth;
        drawCard(startingX + (cardN * (cardWidth + spaceBetweenCards)), playerStartingY - cardHeight, cardColor, cardN, textColor);
    }
    else {
        drawCard(startingX + (cardN * (cardWidth + spaceBetweenCards)), opStartingY, boardColor, "", textColor, boardColor);
        ctx.lineWidth = origLineWidth;
        drawCard(startingX + (cardN * (cardWidth + spaceBetweenCards)), opStartingY + cardHeight, cardColor, cardN, textColor);
    }
}

function deleteCardAnim(cardN, playerNum) {
    // Trick to fully cover up the original card's border
    let origLineWidth = ctx.lineWidth;
    ctx.lineWidth = origLineWidth + 1;
    if (playerNum == PLAYER_ONE) {
        playerTieCards.forEach(cardN => {
            drawCard(startingX + (cardN * (cardWidth + spaceBetweenCards)), playerStartingY - cardHeight, boardColor, "", textColor, boardColor);
        });
        ctx.lineWidth = origLineWidth;
    }
    else {
        opTieCards.forEach(cardN => {
            drawCard(startingX + (cardN * (cardWidth + spaceBetweenCards)), opStartingY + cardHeight, boardColor, "", textColor, boardColor);
        });

        ctx.lineWidth = origLineWidth;
    }
}

function opTurn() {
    let cardNum = opChooseCard();
    playCardAnim(cardNum, PLAYER_TWO);
    opCard = opCards.splice(opCards.indexOf(cardNum), 1);
    opTieCards.push(opCard);
}

function opChooseCard() {
    // Default opponent strategy is to pick a random card
    // let randomNum = Math.floor(Math.random() * opCards.length);
    let randomNum = 0;
    return opCards[randomNum];
}

function newTurn() {
    // Draw new prize card
    drawPrizeCard();

    // Erase previously played cards
    if (nTies == 0 || gameOver) {
        deleteCardAnim(playerCard, PLAYER_ONE);
        deleteCardAnim(opCard, PLAYER_TWO);
    }

    if (gameOver)
        displayWinner();
}

function updateScore(playerNum) {
    let scoreToAdd = 0;
    while (prizeStack.length != 0)
        scoreToAdd += prizeStack.pop();

    if (playerNum == PLAYER_ONE)
        pScore += scoreToAdd;
    else
        opScore += scoreToAdd;

    displayScore(playerNum);
}

function displayScore(playerNum) {
    let score = playerNum == PLAYER_ONE ? pScore : opScore;
    $("#p" + (playerNum + 1) + "-score").text(score);
}

function displayWinner() {
    let text;
    if (pScore == opScore)
        text = 'Draw!';
    else {
        let winner = pScore > opScore ? PLAYER_ONE : PLAYER_TWO;
        text = 'Player ' + (winner + 1) + ' wins!';
    }

    ctx.font = winFont;
    let textWidth = ctx.measureText(text).width;
    let textHeight = ctx.measureText('M').width; // cheat to get height
    let textX = (canvasWidth / 2) - textWidth / 2;
    let textY = canvasHeight / 2;

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

    ctx.font = cardFont;
}

// Draw the prize card
function drawPrizeCard() {
    // Redraw over prize card(s), which could be up to 13 if
    // There were many draws
    // There are no more prize cards
    if (nTies == 0 || prizeCards.length == 0) {
        let origLineWidth = ctx.lineWidth;
        ctx.lineWidth = origLineWidth + 1;
        for (let i = 0; i < cards.length; i++) {
            drawCard(prizeX + (i * prizeCardOffset), prizeY, boardColor, "", textColor, boardColor);
        }
        ctx.lineWidth = origLineWidth;
    }

    if (prizeCards.length != 0) {
        let randomNumber = Math.floor(Math.random() * prizeCards.length);
        let curPrizeCard = prizeCards[randomNumber];
        prizeStack.push(curPrizeCard);
        drawCard(prizeX + (nTies * prizeCardOffset), prizeY, cardColor, curPrizeCard, textColor);
        prizeCards.splice(randomNumber, 1);
    }
    else {
        gameOver = true;
    }

}

function beginGame() {
    ctx.font = cardFont;
    drawPrizeCard();

    // Draw hands
    for (i = 1; i < cards.length + 1; i++) {
        // Draw player hand
        drawCard(startingX + (i * (cardWidth + spaceBetweenCards)), playerStartingY, cardColor, i, textColor);
        // Draw opponent hand
        drawCard(startingX + (i * (cardWidth + spaceBetweenCards)), opStartingY, opCardColor, i, opCardColor);
    }
}


/*
    HELPER METHODS
*/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
    LISTENERS
*/
function handleMouseMove(e) {
    const clickX = e.clientX - canvas.getBoundingClientRect().left;
    const clickY = e.clientY - canvas.getBoundingClientRect().top;
    getCard(clickX, clickY);

    console.log("Player hand: " + playerCards);
    console.log("Opponent hand: " + opCards);

}

$("canvas").on("click", handleMouseMove);

/*
    BEGIN GAME
*/
beginGame();
