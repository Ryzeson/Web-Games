class Othello extends AbstractGame {

    constructor() {
        super();

        //////////////////////////
        //                      //
        //    Game Constants    //
        //                      //
        //////////////////////////
        this.EMPTY_CELL = -1;

        this.nRows = 6;
        this.nCols = 6;

        this.board = [];
        for (let i = 0; i < this.nRows * this.nCols; i++)
            this.board[i] = this.EMPTY_CELL;

        this.initializeBoard();
        this.possibleMoves;
        this.getPossibleMoves(this.curPlayer);

        this.movesPlayed = [];

        this.placePieceSFX = new Audio("../resources/place_piece.mp3");
        this.placePieceSFX.volume = 1;

        ////////////////////////////
        //                        //
        //    Canvas Constants    //
        //                        //
        ////////////////////////////
        this.cellHeight = this.cHeight / this.nRows;
        this.cellWidth = this.cWidth / this.nCols;

        this.FIRST_TO_MOVE_COLOR = "#000000";
        this.SECOND_TO_MOVE_COLOR = "#FFFFFF";

        this.PLAYER_ONE_COLOR = this.FIRST_TO_MOVE_COLOR;
        this.PLAYER_TWO_COLOR = this.SECOND_TO_MOVE_COLOR;
        this.CUR_PLAYER_COLOR = this.PLAYER_ONE_COLOR;
        this.CIRCLE_COLOR = this.FIRST_TO_MOVE_COLOR;
        this.BOARD_COLOR = "green";
        this.BOARD_MARKER_COLOR = "#00000088"; //https://www.digitalocean.com/community/tutorials/css-hex-code-colors-alpha-values

    }

    // Must Implement
    drawBoard() {
        const { cWidth } = this;
        const { cHeight } = this;
        const { nCols } = this;
        const { nRows } = this;
        const { LINE_COLOR } = this;

        const { cellWidth } = this;
        const { cellHeight } = this;

        this.clearBoard();

        // Othello board
        for (let i = 1; i < nCols; i++)
            super.drawLine((cWidth / nCols) * i, 0, (cWidth / nCols) * i, cHeight, LINE_COLOR, 2);

        for (let i = 1; i < nRows; i++)
            super.drawLine(0, (cHeight / nRows) * i, cWidth, (cHeight / nRows) * i, LINE_COLOR, 2);

        for (let cell in this.board) {
            var cellRow = Math.floor(cell / this.nCols);
            var cellCol = cell % this.nCols;
            var textX = (cellCol * cellWidth) + 2;
            var textY = (cellRow * cellHeight) + 20;
            this.ctx.fillStyle = "black";
            this.ctx.font = "20px sans-serif";
            this.ctx.fillText(cell, textX, textY);
        };

        // Draw board markers
        // if (this.nRows >= 9 && this.nCols >= 9) {
        //     this.drawCellMini((this.nCols * Math.floor(this.nRows / 2)) + Math.floor(this.nCols / 2)); // center
        // }
        // if (this.nRows >= 13 && this.nCols >= 13) {
        //     this.drawCellMini(this.nCols * 3 + 3); // top-left
        //     this.drawCellMini(this.nCols * 4 - 4); // top-right
        //     this.drawCellMini(this.board.length - (this.nCols * 4) + 3); // bottom-left
        //     this.drawCellMini(this.board.length - (this.nCols * 3) - 4); // bottom-right
        // }
        // if (this.nRows >= 19 && this.nCols >= 19) {
        //     this.drawCellMini(this.nCols * 3 + Math.floor(this.nCols / 2)); // top-middle
        //     this.drawCellMini(this.board.length - (this.nCols * 4) + Math.floor(this.nCols / 2)); // bottom-middle
        //     this.drawCellMini((this.nCols * Math.floor(this.nRows / 2)) + 3); // left-middle
        //     this.drawCellMini((this.nCols * Math.ceil(this.nRows / 2)) - 4);// right-middle
        // }
    }

    // Must Implement
    clearBoard() {
        this.ctx.fillStyle = this.BOARD_COLOR;
        this.ctx.fillRect(0, 0, this.cWidth, this.cHeight);
    }

    drawCell(cell, color) {
        const { cellWidth } = this;
        const { cellHeight } = this;

        var cellRow = Math.floor(cell / this.nCols);
        var cellCol = cell % this.nCols;

        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);
        if (color)
            super.drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 3, color);
        else
            super.drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 3, this.CIRCLE_COLOR);
    }

    drawCellMini(cell, color) {
        const { cellWidth } = this;
        const { cellHeight } = this;

        var cellRow = Math.floor(cell / this.nCols);
        var cellCol = cell % this.nCols;

        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);

        super.drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 8, color);
    }

    // Draws the board, including pieces as defined by this.board
    drawBoardWithState() {
        this.drawBoard();
        for (let cell in this.board) {
            let cellVal = this.board[cell];
            if (cellVal != this.EMPTY_CELL) {
                let color = cellVal == this.PLAYER_ONE_VAL ? this.PLAYER_ONE_COLOR : this.PLAYER_TWO_COLOR;
                this.drawCell(cell, color);
            }
        }
    }

    drawPossibleMoves() {
        for (let move of this.possibleMoves.keys()) {
            this.drawCellMini(move, this.CUR_PLAYER_COLOR + "AA");
        }
    }

    resetGame() {
        super.resetGame();

        // Must Implement
        throw new Error("Not Implemented!");
    }

    // Must Implement (returns a boolean)
    checkForWin() {

    }

    takeTurn(cell) {
        // Must Implement
        // if (this.sound)
        //     this.placePieceSFX.play();
        this.board[cell] = this.curPlayer;
        let piecesToFlip = this.possibleMoves.get(cell);
        for (let piece of piecesToFlip)
            this.board[piece] = this.curPlayer;
        this.drawBoardWithState();
        
        // this.movesPlayed.push(cell);

        // Call to super to end turn
        super.endTurn();

        this.getPossibleMoves(this.curPlayer);
        this.drawPossibleMoves();
    }

    changePlayer() {
        super.changePlayer();
        this.CUR_PLAYER_COLOR = this.curPlayer == this.PLAYER_ONE_VAL ? this.PLAYER_ONE_COLOR : this.PLAYER_TWO_COLOR
        this.CIRCLE_COLOR = this.CUR_PLAYER_COLOR;
    }

    // Must Implement
    cpuTurn() {

        // Super call to set move, passing in the necessary parameter to takeTurn()
        super.setCPUMove(chosenCell);
    }

    // Must Implement
    gameHandleClick(clickX, clickY) {
        var cell = this.getCell(clickX, clickY);
        if (this.board[cell] == this.EMPTY_CELL)
            this.takeTurn(cell);
    }


    //////////////////////////////
    //                          //
    //    Game State & Logic    //
    //                          //
    //////////////////////////////

    initializeBoard() {
        this.midRow1 = this.nRows / 2;
        this.midRow2 = this.midRow1 - 1;
        this.midCol1 = this.nCols / 2;
        this.midCol2 = this.midCol1 - 1;

        this.board[this.getCellIndex(this.midRow1, this.midCol1)] = this.secondMovePlayer;
        this.board[this.getCellIndex(this.midRow2, this.midCol2)] = this.secondMovePlayer;
        this.board[this.getCellIndex(this.midRow1, this.midCol2)] = this.firstMovePlayer;
        this.board[this.getCellIndex(this.midRow2, this.midCol1)] = this.firstMovePlayer;
    }

    getCell(x, y) {
        // Use Math.floor to replicate integer division in JavaScript (https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr)
        let row = Math.floor(y / (this.cHeight / this.nRows));
        let col = Math.floor(x / (this.cWidth / this.nCols));
        return (row * this.nCols) + col;
    }

    getCellIndex(r, c) {
        return r * this.nCols + c;
    }

    startGame() {
        this.drawBoardWithState();
    }

    getPossibleMoves(player) {
        this.possibleMoves = new Map();
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] == this.EMPTY_CELL) {
                let flippablePieces = this.getFlippablePieces(i, player);
                if (flippablePieces.length > 0) {
                    this.possibleMoves.set(i, flippablePieces);
                }
            }
        }
    }

    getFlippablePieces(cell, player) {
        let opPlayer = (player + 1) % 2;
        var piecesToFlip = [];
        
        var validMove = false;
        var potentialPiecesToFlip = [];
        for (let i = cell - this.nCols; i >= 0; i -= this.nCols) { // Up
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player)
                piecesToFlip.push(...[potentialPiecesToFlip]);
            else
                break;
        }

        validMove = false;
        potentialPiecesToFlip = [];
        for (let i = cell + this.nCols; i <= this.board.length; i += this.nCols) { // Down
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player) {
                piecesToFlip.push(...[potentialPiecesToFlip]);
                break;
            }
            else
                break;
        }

        validMove = false;
        potentialPiecesToFlip = [];
        for (let i = cell - 1; i % this.nCols > 0; i--) { // Left
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player) {
                piecesToFlip.push(...[potentialPiecesToFlip]);
                break;
            }
            else
                break;
        }

        validMove = false;
        potentialPiecesToFlip = [];
        for (let i = cell + 1; i % this.nCols < (this.nCols - 1); i++) { // Right
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player) {
                piecesToFlip.push(...[potentialPiecesToFlip]);
                break;
            }
            else
                break;
        }

        validMove = false;
        potentialPiecesToFlip = [];
        for (let i = (cell - this.nCols) - 1; (i >= 0) && (i % this.nCols > 0); i = (i - this.nCols) - 1) { // Up-Left
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player) {
                piecesToFlip.push(...[potentialPiecesToFlip]);
                break;
            }
            else
                break;
        }

        validMove = false;
        potentialPiecesToFlip = [];
        for (let i = (cell - this.nCols) + 1; (i >= 0) && (i % this.nCols < (this.nCols - 1)); i = (i - this.nCols) + 1) { // Up-Right
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player) {
                piecesToFlip.push(...[potentialPiecesToFlip]);
                break;
            }
            else
                break;
        }

        validMove = false;
        potentialPiecesToFlip = [];
        for (let i = (cell + this.nCols) - 1; (i <= this.board.length) && (i % this.nCols > 0); i = (i + this.nCols) - 1) { // Down-Left
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player) {
                piecesToFlip.push(...[potentialPiecesToFlip]);
                break;
            }
            else
                break;
        }

        validMove = false;
        potentialPiecesToFlip = [];
        for (let i = (cell + this.nCols) + 1; (i <= this.board.length) && (i % this.nCols < (this.nCols - 1)); i = (i + this.nCols) + 1) { // Down-Right
            if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else if (validMove && this.board[i] == player) {
                piecesToFlip.push(...[potentialPiecesToFlip]);
                break;
            }
            else
                break;
        }

        return piecesToFlip;
    }

}

game_object = new Othello();
game_object.startGame();
game_object.validOptions = game_object.getValidOptions();

//////////////////////////
//                      //
//    Listeners + UI    //
//                      //
//////////////////////////
window.onresize = () => {
    game_object.boundingRect = game_object.canvas.getBoundingClientRect();
};

window.onscroll = () => {
    game_object.boundingRect = game_object.canvas.getBoundingClientRect();
};

$(document).keypress(e => {
    if (e.key.toLowerCase() == 'o')
        $("#options-modal").modal("toggle");
    else if (e.key.toLowerCase() == 'r')
        game_object.resetGame();
    else if (e.key.toLowerCase() == 'u')
        game_object.undoMove();
    else if (e.key.toLowerCase() == 's')
        game_object.toggleSound();
});

// Toggles the hide/show arrows
$(".collapse-controller").on("click", e => {
    let arrowIcon = $(e.target);
    if ($(e.target).children().length > 0)
        arrowIcon = $(e.target).children()[0];
    $(arrowIcon).toggleClass("fa-caret-right");
    $(arrowIcon).toggleClass("fa-caret-down");
})
