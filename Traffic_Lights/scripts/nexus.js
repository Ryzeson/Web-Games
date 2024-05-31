class TrafficLights extends AbstractGame {

    constructor() {
        super();
        //////////////////////////
        //                      //
        //    Game Constants    //
        //                      //
        //////////////////////////
        this.nCols = 4;
        this.nRows = 3;

        this.board = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];

        this.wins = [
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

        ////////////////////////////
        //                        //
        //    Canvas Constants    //
        //                        //
        ////////////////////////////
        this.cellHeight = this.cHeight / this.nRows;
        this.cellWidth = this.cWidth / this.nCols;

        this.CIRCLE_COLOR = "green";
        this.TRIANGLE_COLOR = "yellow";
        this.SQUARE_COLOR = "red";
    }

    //////////////////////
    //                  //
    //    Game Logic    //
    //                  //
    //////////////////////
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
        super.resetGame(function() {
            for (let cell in game_object.board) {
                game_object.board[cell] = 0;
            }
            game_object.drawBoard();
        });
    }

    activateCell(cell) {
        const { cellWidth } = this;
        const { cellHeight } = this;

        // 0 -> draw a circle
        // 1 -> draw a triangle
        // 2 -> draw a square
        var cellRow = Math.floor(cell / this.nCols);
        var cellCol = cell % this.nCols;
        var boardPos = this.board[cell];
        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);
        if (boardPos == 0) {
            super.drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 3, this.CIRCLE_COLOR);
        }
        else if (boardPos == 1) {
            // Cheat for covering up previous circle: Draw a new (slightly bigger) one at the same spot
            super.drawCircle(centerX, centerY, (Math.min(cellWidth, cellHeight) / 3) + 1, this.BOARD_COLOR);

            var p1 = [(cellCol * cellWidth) + (cellWidth / 2), (cellRow * cellHeight) + (cellHeight / 6)];
            var p2 = [(cellCol * cellWidth) + (cellWidth / 6), (cellRow * cellHeight) + (cellHeight * 5 / 6)];
            var p3 = [(cellCol * cellWidth) + (cellWidth * 5 / 6), (cellRow * cellHeight) + (cellHeight * 5 / 6)];
            super.drawTriangle(p1, p2, p3, this.TRIANGLE_COLOR);
        }
        else if (boardPos == 2) {
            // we want the square to occupy 2/3 of the cell (1/6 gaps from the sides to the side of the square)
            var startX = (cellCol * cellWidth) + (cellWidth / 6);
            var startY = (cellRow * cellHeight) + (cellHeight / 6);
            this.ctx.fillStyle = this.SQUARE_COLOR;
            this.ctx.fillRect(startX, startY, (cellWidth * 2) / 3, (cellHeight * 2) / 3);
        }
        this.board[cell]++;
    }

    getCell(x, y) {
        // Use Math.floor to replicate integer division in JavaScript (https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr)
        let row = Math.floor(y / (this.cHeight / this.nRows));
        let col = Math.floor(x / (this.cWidth / this.nCols));
        return (row * this.nCols) + col;
    }

    // Must Implement
    checkForWin() {
        const { board } = this;
        const { wins } = this;

        for (let i = 0; i < wins.length; i++) {
            var winRow = wins[i];
            if ((board[winRow[0]] == board[winRow[1]]) && (board[winRow[0]] == board[winRow[2]]) && (board[winRow[0]] != 0))
                return true;
        }
        return false;
    }

    takeTurn(cell) {
        // Must Implement
        this.activateCell(cell);

        // Call to super to end turn
        super.endTurn();
    }

    setWinningPlayer() {
        this.winningPlayer = this.curPlayer;
    }

    /////////////////////////////////
    //                             //
    //    Computer Player Logic    //
    //                             //
    /////////////////////////////////

    // All -> If there is a winning move, make it.
    // Easy ->  Play in a random spot
    // Hard -> Play in a random spot, unless this could allow the opponent to win on the next move

    // Must Implement
    cpuTurn() {
        const { board } = this;
        const { Difficulties } = this;

        var possibleMoves = this.calculatePossibleMoves();
        var chosenCell;
        for (let move of possibleMoves) {
            board[move]++;
            if (this.checkForWin())
                chosenCell = move;
            board[move]--;
        }
        if (!chosenCell) {
            switch (this.cpuDifficulty) {
                case (Difficulties.EASY):
                    var randomIndex = Math.floor(Math.random() * possibleMoves.length);
                    var chosenCell = possibleMoves[randomIndex];
                    break;
                case (Difficulties.HARD):
                    var potentialMoves = [...possibleMoves];
                    for (let move of possibleMoves) {
                        board[move]++;
                        var humanPossibleMoves = this.calculatePossibleMoves();
                        for (let humanMove of humanPossibleMoves) {
                            board[humanMove]++;
                            if (this.checkForWin()) {
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
                    console.error("CPU difficulty is not one of the options!")
            }
        }

        // Super call to set move, passing in the necessary parameter to takeTurn()
        super.setCPUMove(chosenCell);
    }

    calculatePossibleMoves() {
        var possibleMoves = [];
        for (let i in this.board) {
            if (this.board[i] < 3)
                possibleMoves.push(i);
        }
        return possibleMoves;
    }

    // Must Implement
    gameHandleClick(clickX, clickY) {
        var cell = this.getCell(clickX, clickY);
        if (this.board[cell] < 3) {
            this.takeTurn(cell);
        }
    }

}

game_object = new TrafficLights();
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
