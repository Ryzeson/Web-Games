class Gomoku extends AbstractGame {

    constructor() {
        super();

        //////////////////////////
        //                      //
        //    Game Constants    //
        //                      //
        //////////////////////////
        this.EMPTY_CELL = -1;

        this.nRows = 15;
        this.nCols = 15;

        this.board = [];
        for (let i = 0; i < this.nRows * this.nCols; i++) {
            this.board[i] = this.EMPTY_CELL;
        }

        this.mostRecentCell;

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
    }

    // Must Implement (returns a boolean)
    checkForWin() {
        for (let cell = 0; cell < this.board.length; cell++) {
            let cellVal = this.board[cell];
            if (cellVal != this.EMPTY_CELL) {
                var cellRow = Math.floor(cell / this.nCols);
                var cellCol = cell % this.nCols;
                // Horizontal
                if (cellCol <= this.nCols - 5) {
                    var winFlag = true;
                    for (let i = cell; i < cell + 5; i++) {
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) return true;
                }
                // Vertical
                if (cellRow <= this.nRows - 5) {
                    var winFlag = true;
                    for (let i = cell; i < cell + (5 * this.nCols); i = i + this.nCols) {
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) return true;
                }
                // Diagonal (down-right)
                if (cellCol <= this.nCols - 5) {
                    var winFlag = true;
                    for (let i = cell; i < cell + (5 * (this.nCols + 1)); i = i + this.nCols + 1) {
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) return true;
                }
                // Diagonal (down-left)
                if (cellCol >= 4) {
                    var winFlag = true;
                    for (let i = cell; i < cell + (5 * (this.nCols - 1)); i = i + (this.nCols - 1)) {
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) return true;
                }
            }
        }
        return false;
    }

    takeTurn(cell) {
        // Must Implement
        this.activateCell(cell);

        // Call to super to end turn
        super.endTurn();
    }

    changePlayer() {
        super.changePlayer();
        this.CIRCLE_COLOR = this.curPlayer == 0 ? this.PLAYER_ONE_COLOR : this.PLAYER_TWO_COLOR;
    }

    activateCell(cell) {
        const { cellWidth } = this;
        const { cellHeight } = this;

        var cellRow = Math.floor(cell / this.nCols);
        var cellCol = cell % this.nCols;

        console.log(cell);
        console.log(cellRow);
        console.log(cellCol);

        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);
        super.drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 3, this.CIRCLE_COLOR);
        this.board[cell] = this.curPlayer;
    }

    getCell(x, y) {
        // Use Math.floor to replicate integer division in JavaScript (https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr)
        let row = Math.floor(y / (this.cHeight / this.nRows));
        let col = Math.floor(x / (this.cWidth / this.nCols));
        return (row * this.nCols) + col;
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
