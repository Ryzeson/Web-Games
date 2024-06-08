class Othello extends AbstractGame {

    constructor() {
        super();

        //////////////////////////
        //                      //
        //    Game Constants    //
        //                      //
        //////////////////////////
        this.EMPTY_CELL = -1;

        this.nRows = 8;
        this.nCols = 8;

        this.initEmptyBoard();

        this.possibleMoves;
        this.previousMoveSkipped = false;
        this.playerOneScore = 0;
        this.playerTwoScore = 0;

        this.flippedPiecesHistory = [];

        this.placePieceSFX = new Audio("../resources/place_piece.mp3");
        this.placePieceSFX.volume = 1;
        this.gameMessageDuration = 7000;

        ////////////////////////////
        //                        //
        //    Canvas Constants    //
        //                        //
        ////////////////////////////
        this.cellHeight = this.cHeight / this.nRows;
        this.cellWidth = this.cWidth / this.nCols;

        this.FIRST_TO_MOVE_COLOR = "#000000";
        this.SECOND_TO_MOVE_COLOR = "#FFFFFF";
        this.BOARD_COLOR = "#008000";
        this.BOARD_MARKER_COLOR = "#00000088"; //https://www.digitalocean.com/community/tutorials/css-hex-code-colors-alpha-values

        this.PLAYER_ONE_COLOR = this.FIRST_TO_MOVE_COLOR;
        this.PLAYER_TWO_COLOR = this.SECOND_TO_MOVE_COLOR;
        this.CUR_PLAYER_COLOR = this.PLAYER_ONE_COLOR;
        this.CIRCLE_COLOR = this.FIRST_TO_MOVE_COLOR;


    }

    initEmptyBoard() {
        this.board = [];
        for (let i = 0; i < this.nRows * this.nCols; i++)
            this.board[i] = this.EMPTY_CELL;
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

        // for (let cell in this.board) {
        //     var cellRow = Math.floor(cell / this.nCols);
        //     var cellCol = cell % this.nCols;
        //     var textX = (cellCol * cellWidth) + 2;
        //     var textY = (cellRow * cellHeight) + 20;
        //     this.ctx.fillStyle = "black";
        //     this.ctx.font = "20px sans-serif";
        //     this.ctx.fillText(cell, textX, textY);
        // };

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
        if (!this.showMoves)
            return;
        for (let move of this.possibleMoves.keys()) {
            this.drawCellMini(move, this.CUR_PLAYER_COLOR + "AA");
        }
    }

    resetGame() {
        super.resetGame(this.resetGameHelper);
    }

    // Should contain any logic that needs executed before the computer player would make their move, if they move first
    // Passed as a callback to resetGame()
    resetGameHelper() {
        game_object.initEmptyBoard();
        game_object.previousMoveSkipped = false;
        game_object.flippedPiecesHistory = [];
        game_object.playerOneScore = 0;
        game_object.playerTwoScore = 0;
        game_object.resetPlayerColors();
        game_object.resetScores();
        game_object.startGame();
    }

    resetPlayerColors() {
        // Set players' colors based on who moves first
        if (this.firstMovePlayer == this.PLAYER_ONE_VAL) {
            this.PLAYER_ONE_COLOR = this.FIRST_TO_MOVE_COLOR;
            this.PLAYER_TWO_COLOR = this.SECOND_TO_MOVE_COLOR;
        }
        else {
            this.PLAYER_ONE_COLOR = this.SECOND_TO_MOVE_COLOR;
            this.PLAYER_TWO_COLOR = this.FIRST_TO_MOVE_COLOR;
        }
        this.CUR_PLAYER_COLOR = this.FIRST_TO_MOVE_COLOR;
    }

    // Must Implement (returns a boolean)
    checkForWin() {
        let isBoardFilled = true;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] == this.EMPTY_CELL) {
                isBoardFilled = false;
                break;
            }
        }

        return isBoardFilled;
    }

    takeTurn(cell) {
        // Must Implement
        if (cell != -1) {
            if (this.sound)
                this.placePieceSFX.play();
            let flippedPiecesSet = [];
            this.board[cell] = this.curPlayer;
            flippedPiecesSet.push(cell);

            let piecesToFlip = this.possibleMoves.get(cell);
            for (let piece of piecesToFlip) {
                this.board[piece] = this.curPlayer;
                flippedPiecesSet.push(piece);
            }
            this.flippedPiecesHistory.push(flippedPiecesSet);
            this.drawBoardWithState();
            this.previousMoveSkipped = false;
        }
        else {
            this.previousMoveSkipped = true;
        }


        // Call to super to end turn
        super.endTurn();

        if (this.gameOver)
            return;

        if (this.possibleMoves.size == 0) {
            if (this.previousMoveSkipped)
                this.endGame();
            else
                this.skipTurn();
        }
        else
            this.drawPossibleMoves();
    }

    skipTurn() {
        $("#game-message").removeClass("invisible");
        let playerText = "Player " + (this.curPlayer + 1);
        if (this.curPlayer == this.COMPUTER_VAL && this.gameMode == this.Game_Modes.PVC)
            playerText = "Computer player";
        let skipTurnText = playerText + " skipped their turn because there were no available moves!"
        $("#game-message").text(skipTurnText);
        setTimeout(() => {
            $("#game-message").addClass("invisible");
        }, this.gameMessageDuration);

        if (this.curPlayer == this.PLAYER_ONE_VAL || this.gameMode == this.Game_Modes.PVP) // Computer will already call takeTurn(-1) if there is no possible move
            this.takeTurn(-1);
    }

    changePlayer() {
        super.changePlayer();
        this.setPossibleMoves();
        this.updateCurrentPlayerColor();
        this.CIRCLE_COLOR = this.CUR_PLAYER_COLOR;
    }

    // Must Implement
    cpuTurn() {
        const { Difficulties } = this;

        let chosenCell = -1;
        if (this.possibleMoves.size == 0) {
            super.setCPUMove(chosenCell);
            return;
        }
        switch (this.cpuDifficulty) {
            case (Difficulties.EASY):
                let possibleMovesArray = Array.from(this.possibleMoves.keys());
                chosenCell = possibleMovesArray[Math.floor(Math.random() * this.possibleMoves.size)];
                // chosenCell = possibleMovesArray[0]; // for testing
                break;
            case (Difficulties.MEDIUM):
                let maxLength = 0;
                let possibleChoices = [];
                for (let [key, value] of this.possibleMoves.entries()) {
                    if (value.length > maxLength) {
                        maxLength = value.length;
                        possibleChoices = [];
                        possibleChoices.push(key);
                    }
                    else if (value.length = maxLength) {
                        possibleChoices.push(key);
                    }
                }
                chosenCell = possibleChoices[Math.floor(Math.random() * possibleChoices.length)];
                break;
        }

        // Super call to set move, passing in the necessary parameter to takeTurn()
        super.setCPUMove(chosenCell);
    }

    // Must Implement
    gameHandleClick(clickX, clickY) {
        var cell = this.getCell(clickX, clickY);
        if (this.board[cell] == this.EMPTY_CELL && this.possibleMoves.has(cell))
            this.takeTurn(cell);
    }

    endGame() {
        super.endGame();
        this.displayScores();
    }

    displayScores() {
        var playerOneText = $("#p1-label").text();
        $("#p1-label").text(playerOneText + ": " + this.playerOneScore);

        var playerTwoText = $("#p2-label").text();
        $("#p2-label").text(playerTwoText + ": " + this.playerTwoScore);
    }

    resetScores() {
        $("#p1-label").text("Player 1");
        let playerTwoLabel;
        if (this.gameMode == this.Game_Modes.PVP)
            playerTwoLabel = "Player 2";
        else
            playerTwoLabel = "Computer";
        $("#p2-label").text(playerTwoLabel);
    }


    //////////////////////////////
    //                          //
    //    Game State & Logic    //
    //                          //
    //////////////////////////////

    setupBoard() {
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
        this.setupBoard();
        this.drawBoardWithState();
        this.setPossibleMoves();
        this.drawPossibleMoves();
    }

    setPossibleMoves() {
        this.possibleMoves = new Map();
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] == this.EMPTY_CELL) {
                let flippablePieces = this.getFlippablePieces(i, this.curPlayer);
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
        let i = cell;
        while (i >= this.nCols) { // Up
            if (i == cell) {
                i -= this.nCols;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i -= this.nCols;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        validMove = false;
        potentialPiecesToFlip = [];
        i = cell;
        while (i <= (this.board.length - this.nCols)) { // Down
            if (i == cell) {
                i += this.nCols;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i += this.nCols;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        validMove = false;
        potentialPiecesToFlip = [];
        i = cell;
        while (i % this.nCols > 0) { // Left
            if (i == cell) {
                i--;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i--;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        validMove = false;
        potentialPiecesToFlip = [];
        i = cell;
        while (i % this.nCols < (this.nCols - 1)) { // Right
            if (i == cell) {
                i++;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i++;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        validMove = false;
        potentialPiecesToFlip = [];
        i = cell;
        while ((i >= this.nCols) && (i % this.nCols > 0)) { // Up-Left
            if (i == cell) {
                i = (i - this.nCols) - 1;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i = (i - this.nCols) - 1;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        validMove = false;
        potentialPiecesToFlip = [];
        i = cell;
        while ((i >= this.nCols) && (i % this.nCols < (this.nCols - 1))) { // Up-Right
            if (i == cell) {
                i = (i - this.nCols) + 1;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i = (i - this.nCols) + 1;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        validMove = false;
        potentialPiecesToFlip = [];
        i = cell;
        while ((i <= (this.board.length - this.nCols)) && (i % this.nCols > 0)) { // Down-Left
            if (i == cell) {
                i = (i + this.nCols) - 1;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i = (i + this.nCols) - 1;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        validMove = false;
        potentialPiecesToFlip = [];
        i = cell;
        while ((i <= (this.board.length - this.nCols)) && (i % this.nCols < (this.nCols - 1))) { // Down-Right
            if (i == cell) {
                i = (i + this.nCols) + 1;
                continue;
            }
            else if (this.board[i] == opPlayer) {
                validMove = true;
                potentialPiecesToFlip.push(i);
            }
            else
                break;
            i = (i + this.nCols) + 1;
        }
        if (validMove && this.board[i] == player)
            piecesToFlip.push(...potentialPiecesToFlip);

        return piecesToFlip;
    }

    setWinningPlayer() {
        let playerOneSum = 0;
        let playerTwoSum = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] == this.PLAYER_ONE_VAL)
                playerOneSum++;
            else if (this.board[i] == this.PLAYER_TWO_VAL)
                playerTwoSum++;
        }
        this.playerOneScore = playerOneSum;
        this.playerTwoScore = playerTwoSum;
        if (playerOneSum == playerTwoSum)
            this.winningPlayer = -1;
        else
            this.winningPlayer = playerOneSum > playerTwoSum ? this.PLAYER_ONE_VAL : this.PLAYER_TWO_VAL;
    }

    undoMove() {
        if (!this.gameOver && this.flippedPiecesHistory.length > 0) {
            if (this.gameMode == this.Game_Modes.PVC) {
                // Only undo the player's last move. If the computer starts, then there needs to be at least 2 played pieces for one of them to be the player's
                if (this.firstMovePlayer == this.COMPUTER_VAL && this.flippedPiecesHistory.length == 1)
                    return;
                if (this.curPlayer == this.PLAYER_ONE_VAL) {
                    this.revertPieces();
                    this.revertPieces();
                    this.setPossibleMoves();
                }
                else {
                    this.revertPieces();
                    clearTimeout(this.cpuTurnTimeoutId);
                    this.changePlayer();
                }
            }
            else {
                this.revertPieces();
                this.changePlayer();
            }
            this.drawBoardWithState();
            this.drawPossibleMoves();
        }
    }

    revertPieces() {
        let lastFlippedSet = this.flippedPiecesHistory.pop();
        let player = (this.board[lastFlippedSet[lastFlippedSet.length - 1]] + 1) % 2; // Flip the pieces back to the opposite color of what they are now
        for (let i = 0; i < lastFlippedSet.length; i++) {
            let piece = lastFlippedSet[i];
            if (i == 0)
                this.board[piece] = this.EMPTY_CELL; // Except for the first cell in the set
            else
                this.board[piece] = player;
        }
    }

    updateOptions() {
        super.updateOptions();
        this.drawBoardWithState();
        if (this.showMoves)
            this.drawPossibleMoves();
    }

    setColors(colors) {
        for (let [key, value] of colors.entries()) {
            if (key == "boardColor")
                this.BOARD_COLOR = value;
            else if (key == "playerOneColor") {
                this.FIRST_TO_MOVE_COLOR = value;
                this.PLAYER_ONE_COLOR = value;
            }
            else if (key == "playerTwoColor") {
                this.SECOND_TO_MOVE_COLOR = value;
                this.PLAYER_TWO_COLOR = value;
            }
        }
        this.updateCurrentPlayerColor();
        this.updateBoardWithColors();
    }

    updateBoardWithColors() {
        this.drawBoardWithState();
        this.drawPossibleMoves();
    }

    updateCurrentPlayerColor() {
        this.CUR_PLAYER_COLOR = this.curPlayer == this.PLAYER_ONE_VAL ? this.PLAYER_ONE_COLOR : this.PLAYER_TWO_COLOR;
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
