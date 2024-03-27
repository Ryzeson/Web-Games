class Gomoku extends AbstractGame {

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

        this.board = [];
        for (let i = 0; i < this.nRows * this.nCols; i++) {
            this.board[i] = this.EMPTY_CELL;
        }

        this.mostRecentCell;
        this.winningCombos;

        ////////////////////////////
        //                        //
        //    Canvas Constants    //
        //                        //
        ////////////////////////////
        this.cellHeight = this.cHeight / this.nRows;
        this.cellWidth = this.cWidth / this.nCols;

        this.PLAYER_ONE_COLOR = "white";
        this.PLAYER_TWO_COLOR = "black";
        this.CIRCLE_COLOR = this.PLAYER_ONE_COLOR;
    }

    // Must Implement
    drawBoard() {
        const { cWidth } = this;
        const { cHeight } = this;
        const { nCols } = this;
        const { nRows } = this;
        const { LINE_COLOR } = this;

        // Clear board
        this.ctx.fillStyle = this.BOARD_COLOR;
        this.ctx.fillRect(0, 0, this.cellWidth * this.nCols, this.cellHeight * this.nRows);

        for (let i = 1; i < nCols; i++)
            super.drawLine((cWidth / nCols) * i, 0, (cWidth / nCols) * i, cHeight, LINE_COLOR, 2);

        for (let i = 1; i < nRows; i++)
            super.drawLine(0, (cHeight / nRows) * i, cWidth, (cHeight / nRows) * i, LINE_COLOR, 2);
    }

    resetGame() {
        super.resetGame();

        // Must Implement
        for (let i = 0; i < this.nRows * this.nCols; i++) {
            this.board[i] = this.EMPTY_CELL;
        }
        this.CIRCLE_COLOR = this.PLAYER_ONE_COLOR;
    }

    // Must Implement (returns a boolean)
    checkForWin() {
        var combos = this.getCombos(5);
        this.winningCombos = combos;
        return combos.length > 0;
    }

    getCombos(nPieces, playerVal) {
        var combos = [];
        var players = (playerVal ? [playerVal] : [this.PLAYER_ONE_VAL, this.PLAYER_TWO_VAL])
        for (let cell = 0; cell < this.board.length; cell++) {
            let cellVal = this.board[cell];
            if (cellVal != this.EMPTY_CELL && players.includes(cellVal)) {
                var cellRow = Math.floor(cell / this.nCols);
                var cellCol = cell % this.nCols;
                // Horizontal
                if (cellCol <= this.nCols - nPieces) {
                    var winFlag = true;
                    var possibleCombo = [];
                    for (let i = cell; i < cell + nPieces; i++) {
                        possibleCombo.push(i);
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) combos.push(possibleCombo);
                }
                // Vertical
                if (cellRow <= this.nRows - nPieces) {
                    var winFlag = true;
                    var possibleCombo = [];
                    for (let i = cell; i < cell + (nPieces * this.nCols); i = i + this.nCols) {
                        possibleCombo.push(i);
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) combos.push(possibleCombo);
                }
                // Diagonal (down-right)
                if (cellCol <= this.nCols - nPieces) {
                    var winFlag = true;
                    var possibleCombo = [];
                    for (let i = cell; i < cell + (nPieces * (this.nCols + 1)); i = i + this.nCols + 1) {
                        possibleCombo.push(i);
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) combos.push(possibleCombo);
                }
                // Diagonal (down-left)
                if (cellCol >= (nPieces - 1)) {
                    var winFlag = true;
                    var possibleCombo = [];
                    for (let i = cell; i < cell + (nPieces * (this.nCols - 1)); i = i + (this.nCols - 1)) {
                        possibleCombo.push(i);
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) combos.push(possibleCombo);
                }
            }
        }
        return combos;
    }

    takeTurn(cell) {
        // Must Implement
        this.drawCell(cell);
        this.board[cell] = this.curPlayer;

        // Call to super to end turn
        super.endTurn();
    }

    changePlayer() {
        super.changePlayer();
        this.CIRCLE_COLOR = this.curPlayer == 0 ? this.PLAYER_ONE_COLOR : this.PLAYER_TWO_COLOR;
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

    drawCellOutline(cell, color) {
        const { cellWidth } = this;
        const { cellHeight } = this;

        var cellRow = Math.floor(cell / this.nCols);
        var cellCol = cell % this.nCols;

        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);
        super.drawCircleNoFill(centerX, centerY, (Math.min(cellWidth, cellHeight) / 3) + 1, color, 3);
    }

    getCell(x, y) {
        // Use Math.floor to replicate integer division in JavaScript (https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr)
        let row = Math.floor(y / (this.cHeight / this.nRows));
        let col = Math.floor(x / (this.cWidth / this.nCols));
        return (row * this.nCols) + col;
    }

    // Must Implement
    cpuTurn() {
        const { board } = this;
        const { Difficulties } = this;

        let possibleMoves = this.calculatePossibleMoves();
        let randomMove = Math.floor(Math.random() * possibleMoves.length);
        let chosenCell = possibleMoves[randomMove];
        console.log(possibleMoves);
        console.log(chosenCell);
        switch (this.cpuDifficulty) {
            case (Difficulties.EASY):
            case (Difficulties.HARD):
                // var comboMap = new Map();
                let curHumanCombos = this.getCombos(4, this.PLAYER_ONE_VAL);
                if (curHumanCombos.length > 0) {
                    this.getWinningMoveForCombo(curHumanCombos[0]);
                }
                
                let curMostCombos = 0;
                for (let cell of possibleMoves) {
                    // comboMap.set(cell, this.getConsecutivePieces(4).length);
                    this.board[cell] = this.COMPUTER_VAL;
                    let curCPUCombos = this.getCombos(4, this.COMPUTER_VAL);
                    let curNumCombos = curCPUCombos.length;
                    
                    if (curNumCombos > curMostCombos) {
                        curMostCombos = curNumCombos;
                        chosenCell = cell;
                    }
                    this.board[cell] = this.EMPTY_CELL;
                }
                break;
            default:
                console.error("CPU difficulty is not one of the options!")
        }

        // Super call to set move, passing in the necessary parameter to takeTurn()
        super.setCPUMove(chosenCell);
    }

    calculatePossibleMoves() {
        var possibleMoves = [];
        for (let i in this.board) {
            if (this.board[i] == this.EMPTY_CELL)
                possibleMoves.push(i);
        }
        return possibleMoves;
    }

    getWinningMoveForCombo(combo) {
        console.log(combo);
        if (Math.floor(combo[0] / this.nCols) == Math.floor(combo[1] / this.nCols)) { // row

        }
        else if (Math.floor(combo[0] % this.nCols) == Math.floor(combo[1] % this.nCols)) { // col

        }
        else if (Math.floor(combo[0] % this.nCols) < Math.floor(combo[1] % this.nCols)) {

        }
        else {

        }
    }

    // Must Implement
    gameHandleClick(clickX, clickY) {
        var cell = this.getCell(clickX, clickY);
        if (this.board[cell] == this.EMPTY_CELL)
            this.takeTurn(cell);
    }

    endGame() {
        this.showWinningCombos();
        super.endGame();
    }

    showWinningCombos() {
        console.log(this.winningCombos);
        for (let i = 0; i < this.winningCombos.length; i++) {
            for (let j = 0; j < 5; j++) {
                this.drawCellOutline(this.winningCombos[i][j], "gold");
            }
        }
    }
}

game_object = new Gomoku();
game_object.startGame();

//////////////////////////
//                      //
//    Listeners + UI    //
//                      //
//////////////////////////
window.onresize = () => {
    boundingRect = game_object.canvas.getBoundingClientRect();
};

$(document).keypress(e => {
    if (e.key.toLowerCase() == 'o' || e.key.toLowerCase() == 's')
        $("#options-modal").modal("toggle");
    else if (e.key.toLowerCase() == 'r')
        game_object.resetGame();
});

// Toggles the hide/show arrows
$(".collapse-controller").on("click", e => {
    let arrowIcon = $(e.target);
    if ($(e.target).children().length > 0)
        arrowIcon = $(e.target).children()[0];
    $(arrowIcon).toggleClass("fa-caret-right");
    $(arrowIcon).toggleClass("fa-caret-down");
})
