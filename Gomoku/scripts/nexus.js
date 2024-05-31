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
        for (let i = 0; i < this.nRows * this.nCols; i++)
            this.board[i] = this.EMPTY_CELL;

        this.winningCombos;

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

        this.FIRST_TO_MOVE_COLOR = "black";
        this.SECOND_TO_MOVE_COLOR = "white";

        this.PLAYER_ONE_COLOR = this.FIRST_TO_MOVE_COLOR;
        this.PLAYER_TWO_COLOR = this.SECOND_TO_MOVE_COLOR;
        this.CIRCLE_COLOR = this.FIRST_TO_MOVE_COLOR;
        this.BOARD_COLOR = "tan";
        this.BOARD_MARKER_COLOR = "#00000088"; //https://www.digitalocean.com/community/tutorials/css-hex-code-colors-alpha-values
    }

    //////////////////////////
    //                      //
    //    Canvas Methods    //
    //                      //
    //////////////////////////

    // Must Implement
    drawBoard() {
        const { cWidth } = this;
        const { cHeight } = this;
        const { nCols } = this;
        const { nRows } = this;
        const { LINE_COLOR } = this;

        const { cellWidth } = this;
        const { cellHeight } = this;

        // Clear board
        this.ctx.fillStyle = this.BOARD_COLOR;
        this.ctx.fillRect(0, 0, this.cellWidth * this.nCols, this.cellHeight * this.nRows);

        // Go board
        var halfCellWidth = cellWidth / 2;
        var halfCellHeight = cellHeight / 2;
        for (let i = 1; i < nCols + 1; i++)
            super.drawLine(((cWidth / nCols) * i) - halfCellWidth, halfCellWidth, ((cWidth / nCols) * i) - halfCellWidth, cHeight - halfCellWidth, LINE_COLOR, 2);

        for (let i = 1; i < nRows + 1; i++)
            super.drawLine(halfCellHeight, ((cHeight / nRows) * i) - halfCellHeight, cWidth - halfCellHeight, ((cHeight / nRows) * i) - halfCellHeight, LINE_COLOR, 2);

        // Draw board markers
        if (this.nRows >= 9 && this.nCols >= 9) {
            this.drawCellMini((this.nCols * Math.floor(this.nRows / 2)) + Math.floor(this.nCols / 2)); // center
        }
        if (this.nRows >= 13 && this.nCols >= 13) {
            this.drawCellMini(this.nCols * 3 + 3); // top-left
            this.drawCellMini(this.nCols * 4 - 4); // top-right
            this.drawCellMini(this.board.length - (this.nCols * 4) + 3); // bottom-left
            this.drawCellMini(this.board.length - (this.nCols * 3) - 4); // bottom-right
        }
        if (this.nRows >= 19 && this.nCols >= 19) {
            this.drawCellMini(this.nCols * 3 + Math.floor(this.nCols / 2)); // top-middle
            this.drawCellMini(this.board.length - (this.nCols * 4) + Math.floor(this.nCols / 2)); // bottom-middle
            this.drawCellMini((this.nCols * Math.floor(this.nRows / 2)) + 3); // left-middle
            this.drawCellMini((this.nCols * Math.ceil(this.nRows / 2)) - 4);// right-middle
        }

        // Debug board
        // for (let i = 1; i < nCols; i++)
        //     super.drawLine((cWidth / nCols) * i, 0, (cWidth / nCols) * i, cHeight, LINE_COLOR, 2);

        // for (let i = 1; i < nRows; i++)
        //     super.drawLine(0, (cHeight / nRows) * i, cWidth, (cHeight / nRows) * i, LINE_COLOR, 2);

        // for (let cell in this.board) {
        //     var cellRow = Math.floor(cell / this.nCols);
        //     var cellCol = cell % this.nCols;
        //     var textX = (cellCol * cellWidth) + 2;
        //     var textY = (cellRow * cellHeight) + 20;
        //     this.ctx.fillStyle = "black";
        //     this.ctx.font = "20px sans-serif";
        //     this.ctx.fillText(cell, textX, textY);
        // }
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

    drawCellMini(cell) {
        const { cellWidth } = this;
        const { cellHeight } = this;

        var cellRow = Math.floor(cell / this.nCols);
        var cellCol = cell % this.nCols;

        var centerX = (cellCol * cellWidth) + (cellWidth / 2);
        var centerY = (cellRow * cellHeight) + (cellHeight / 2);

        super.drawCircle(centerX, centerY, Math.min(cellWidth, cellHeight) / 8, this.BOARD_MARKER_COLOR);
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

    //////////////////////////
    //                      //
    //    CPU Logic & AI    //
    //                      //
    //////////////////////////

    // Must Implement
    cpuTurn() {
        const { Difficulties } = this;

        let possibleMoves = this.calculatePossibleMoves();
        let randomMove = Math.floor(Math.random() * possibleMoves.length);
        let chosenCell = possibleMoves[randomMove];
        switch (this.cpuDifficulty) {
            case (Difficulties.EASY):
            case (Difficulties.HARD):
                var necessaryMove = false;

                let gapPlayerMap5 = this.getNComboGap(5);
                let gapPlayerMapSet5 = this.uniqBy(gapPlayerMap5, JSON.stringify);

                // If there is a winning move available, make it
                for (let winningMove of gapPlayerMapSet5) {
                    if (winningMove[1] == this.COMPUTER_VAL) {
                        chosenCell = winningMove[0];
                        necessaryMove = true;
                    }
                }
                if (necessaryMove) break;

                // If the opponent has a winning move available, block it. (Chose a random one if multiple.)
                if (gapPlayerMap5.length > 0) {
                    chosenCell = gapPlayerMap5[Math.floor(Math.random() * gapPlayerMap5.length)][0];
                    break;
                }


                // If we have 3 in a row with empty cells at either end, place there
                let cpu3Combos = this.getCombos(3, this.COMPUTER_VAL);
                for (let cpu3Combo of cpu3Combos) {
                    var winningMoves = this.getWinningMovesForCombo(cpu3Combo);
                    if (winningMoves.length == 2) {
                        chosenCell = winningMoves[Math.floor(Math.random() * 2)]
                        necessaryMove = true;
                        break;
                    }
                }
                if (necessaryMove) break;

                // If the opponent has 3 in a row with empty cells at either end, place there or else they will win in 2 turns
                let human3Combos = this.getCombos(3, this.PLAYER_ONE_VAL);
                for (let human3Combo of human3Combos) {
                    var winningMoves = this.getWinningMovesForCombo(human3Combo);
                    if (winningMoves.length == 2) {
                        chosenCell = winningMoves[Math.floor(Math.random() * 2)]
                        necessaryMove = true;
                        break;
                    }
                }
                if (necessaryMove) break;

                // If the opponent has 3 out of 5 in a row with only empty cells, place in one of these gaps
                // gapsPlayer map will look like this, where the first index is an array of the gaps, and the second index holds the player the potential combo belongs to
                // [[21, 23], 0]
                // [[0, 19], 1]
                let gapsPlayerMap = this.getCombo2Gap();
                let humanGaps = gapsPlayerMap.filter(gaps => gaps[1] == this.PLAYER_ONE_VAL)

                if (humanGaps.length > 0) {
                    var chosenGaps = humanGaps[Math.floor(Math.random() * humanGaps.length)];
                    chosenCell = chosenGaps[0][Math.floor(Math.random() * 2)];
                    break;
                }

                // If an opponent unit has 8 or more liberties, place at one of these liberties
                var allUnits = this.getAllUnits(this.PLAYER_ONE_VAL);
                var libertiesByUnit = this.getAllLiberties(allUnits);
                for (let libertySet of libertiesByUnit) {
                    if (libertySet.length >= 8) {
                        chosenCell = libertySet[Math.floor(Math.random() * libertySet.length)];
                        necessaryMove = true;
                        break;
                    }
                }
                if (necessaryMove) break;

                // If the player has three in a row, place at one of the ends 
                if (gapPlayerMap5.length > 0) {
                    chosenCell = gapPlayerMap5[Math.floor(Math.random() * gapPlayerMap5.length)][0];
                    break;
                }

                // TODO
                // If we have 3 out of 4 in a row, and there is a gap, and there are empty cells at either side
                // If we can make 4 in a row with empty cells at the end, do this so we can win next turn
                // If there is a pair of 2/3 combos that share an empty cell at their ends, play there 

                break;
            default:
                console.error("CPU difficulty is not one of the options!")
        }

        // Super call to set move, passing in the necessary parameter to takeTurn()
        super.setCPUMove(chosenCell);
    }

    // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
    uniqBy(a, key) {
        var seen = {};
        return a.filter(function (item) {
            var k = key(item);
            return seen.hasOwnProperty(k) ? false : (seen[k] = true);
        })
    }

    calculatePossibleMoves() {
        var possibleMoves = [];
        for (let i in this.board) {
            if (this.board[i] == this.EMPTY_CELL)
                possibleMoves.push(i);
        }
        return possibleMoves;
    }

    // Returns a list of all sets of consecutive pieces (i.e., combos) that are nPieces long
    // nPieces: number of pieces to be considered
    // playerVal: player's whose pieces should be checked
    getCombos(nPieces, playerVal) {
        var combos = [];
        var players = (playerVal ? [playerVal] : [this.PLAYER_ONE_VAL, this.PLAYER_TWO_VAL]);
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
                    for (let i = cell; i < cell + (nPieces * this.nCols); i += this.nCols) {
                        possibleCombo.push(i);
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) combos.push(possibleCombo);
                }
                // Diagonal (down-right)
                if (cellCol <= this.nCols - nPieces && cellRow <= this.nRows - nPieces) {
                    var winFlag = true;
                    var possibleCombo = [];
                    for (let i = cell; i < cell + (nPieces * (this.nCols + 1)); i += this.nCols + 1) {
                        possibleCombo.push(i);
                        if (this.board[i] != cellVal)
                            winFlag = false;
                    }
                    if (winFlag) combos.push(possibleCombo);
                }
                // Diagonal (down-left)
                if (cellCol >= (nPieces - 1) && cellRow <= this.nRows - nPieces) {
                    var winFlag = true;
                    var possibleCombo = [];
                    for (let i = cell; i < cell + (nPieces * (this.nCols - 1)); i += (this.nCols - 1)) {
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

    // Calculates all sets of nPieces cells where (nPieces - 1) of them are occupied by same color, and the other cell is a gap
    // Returns a list of 2d arrays where the first value is the index of the gap, and the second is the player to which the potential combo belongs
    // Example: [[42, 1], [177, 0]]
    getNComboGap(nPieces) {
        var gapPlayerMap = [];
        for (let cell = 0; cell < this.board.length; cell++) {
            var cellRow = Math.floor(cell / this.nCols);
            var cellCol = cell % this.nCols;
            // Horizontal
            if (cellCol <= this.nCols - nPieces) {
                let winFlag = true;
                let gap = this.EMPTY_CELL;
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + nPieces; i++) {
                    var curCellVal = this.board[i];
                    // If there has already been a gap and the current cell is another gap, OR
                    // we have a player whose combo we think this is and the current cell is not empty and is not that player's color, then this is not a potential combo
                    if ((gap != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        gap = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapPlayerMap.push([gap, player]);
            }
            // Vertical
            if (cellRow <= this.nRows - nPieces) {
                let winFlag = true;
                let gap = this.EMPTY_CELL;
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + (nPieces * this.nCols); i += this.nCols) {
                    var curCellVal = this.board[i];
                    if ((gap != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        gap = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapPlayerMap.push([gap, player]);
            }
            // Diagonal (down-right)
            if (cellCol <= this.nCols - nPieces && cellRow <= this.nRows - nPieces) {
                let winFlag = true;
                let gap = this.EMPTY_CELL;
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + (nPieces * (this.nCols + 1)); i += this.nCols + 1) {
                    var curCellVal = this.board[i];
                    if ((gap != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        gap = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapPlayerMap.push([gap, player]);
            }
            // Diagonal (down-left)
            if (cellCol >= (nPieces - 1) && cellRow <= this.nRows - nPieces) {
                let winFlag = true;
                let gap = this.EMPTY_CELL;
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + (nPieces * (this.nCols - 1)); i += (this.nCols - 1)) {
                    var curCellVal = this.board[i];
                    if ((gap != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        gap = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapPlayerMap.push([gap, player]);
            }
        }
        return gapPlayerMap;
    }

    // Returns all sets of 5 cells where 3 of them are occupied by the color specified, and the other 2 cells are gaps.
    // Returns a list of 2d arrays where the first value is the index of the gap, and the second is the player to which the potential combo belongs
    // Example: [[42, 1], [177, 0]]
    getCombo2Gap() {
        var gapsPlayerMap = [];
        var nPieces = 5;
        for (let cell = 0; cell < this.board.length; cell++) {
            var cellRow = Math.floor(cell / this.nCols);
            var cellCol = cell % this.nCols;
            // Horizontal
            if (cellCol <= this.nCols - nPieces) {
                let winFlag = true;
                let gaps = [this.EMPTY_CELL, this.EMPTY_CELL];
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + nPieces; i++) {
                    var curCellVal = this.board[i];
                    // If there has already been two gaps identified and the current cell is another gap, OR
                    // we have a player whose combo we think this is and the current cell is not empty and is not that player's color, then this is not a potential combo
                    if ((gaps[0] != this.EMPTY_CELL && gaps[1] != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        if (gaps[0] == this.EMPTY_CELL)
                            gaps[0] = i;
                        else
                            gaps[1] = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapsPlayerMap.push([gaps, player]);
            }
            // Vertical
            if (cellRow <= this.nRows - nPieces) {
                let winFlag = true;
                let gaps = [this.EMPTY_CELL, this.EMPTY_CELL];
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + (nPieces * this.nCols); i += this.nCols) {
                    var curCellVal = this.board[i];
                    if ((gaps[0] != this.EMPTY_CELL && gaps[1] != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        if (gaps[0] == this.EMPTY_CELL)
                            gaps[0] = i;
                        else
                            gaps[1] = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapsPlayerMap.push([gaps, player]);
            }
            // Diagonal (down-right)
            if (cellCol <= this.nCols - nPieces && cellRow <= this.nRows - nPieces) {
                let winFlag = true;
                let gaps = [this.EMPTY_CELL, this.EMPTY_CELL];
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + (nPieces * (this.nCols + 1)); i += this.nCols + 1) {
                    var curCellVal = this.board[i];
                    if ((gaps[0] != this.EMPTY_CELL && gaps[1] != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        if (gaps[0] == this.EMPTY_CELL)
                            gaps[0] = i;
                        else
                            gaps[1] = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapsPlayerMap.push([gaps, player]);
            }
            // Diagonal (down-left)
            if (cellCol >= (nPieces - 1) && cellRow <= this.nRows - nPieces) {
                let winFlag = true;
                let gaps = [this.EMPTY_CELL, this.EMPTY_CELL];
                let player = this.EMPTY_CELL;
                for (let i = cell; i < cell + (nPieces * (this.nCols - 1)); i += (this.nCols - 1)) {
                    var curCellVal = this.board[i];
                    if ((gaps[0] != this.EMPTY_CELL && gaps[1] != this.EMPTY_CELL && curCellVal == this.EMPTY_CELL) || (curCellVal != player && player != this.EMPTY_CELL && curCellVal != this.EMPTY_CELL)) {
                        winFlag = false;
                        break;
                    }
                    if (curCellVal == this.EMPTY_CELL)
                        if (gaps[0] == this.EMPTY_CELL)
                            gaps[0] = i;
                        else
                            gaps[1] = i;
                    else {
                        player = curCellVal
                    }
                }
                if (winFlag)
                    gapsPlayerMap.push([gaps, player]);
            }
        }
        return gapsPlayerMap;
    }

    // Recursive method that returns the unit the provided cell belongs to
    // A unit is a set of pieces of the same color that are connected to each other via at least one adjacent side
    // Example, the X's below make up one unit
    // X | O | O | X
    // X | X | X | X
    // X | O | X | O
    // O | O | X | O
    getUnit(cell) {
        var unit = [];
        if (this.board[cell] == this.EMPTY_CELL)
            return unit;
        var visited = [];
        var cellRow = Math.floor(cell / this.nCols);
        var cellCol = cell % this.nCols;
        return this.getUnitHelper(cellRow, cellCol, unit, visited, this.board[cell]);
    }

    getUnitHelper(cellRow, cellCol, unit, visited, player) {
        var cell = (cellRow * this.nCols) + cellCol;
        if (0 <= cellRow < this.nRows - 1 && 0 <= cellCol < this.nCols - 1) {
            if (this.board[cell] == player && !unit.includes(cell)) {
                unit.push(cell);
                unit = this.getUnitHelper(cellRow + 1, cellCol, unit, visited, player);
                unit = this.getUnitHelper(cellRow - 1, cellCol, unit, visited, player);
                unit = this.getUnitHelper(cellRow, cellCol + 1, unit, visited, player);
                unit = this.getUnitHelper(cellRow, cellCol - 1, unit, visited, player);
            }
        }
        return unit;
    }

    // Returns a list of all of a player's units
    getAllUnits(player) {
        var units = [];
        for (let cell = 0; cell < this.board.length; cell++) {
            var alreadyIncluded = units.some(unit => unit.includes(cell))
            if (this.board[cell] == player && !alreadyIncluded) {
                units.push(this.getUnit(cell));
            }
        }
        return units;
    }

    // For a given unit, return a list of all its liberties
    // Liberty: https://en.wikipedia.org/wiki/Rules_of_Go#:~:text=occupied%20by%20black).-,Definition.,is%20connected%20to%20that%20stone.
    getLiberties(unit) {
        var liberties = [];
        for (let cell of unit) {
            // Check all 8 directions for Gomoku
            var directions = [cell + 1, cell - 1, cell + this.nCols, cell - this.nCols, cell + (this.nCols + 1), cell + (this.nCols - 1), cell - (this.nCols + 1), cell - (this.nCols - 1)];
            for (let dir of directions) {
                if (0 <= dir <= this.nRows - 1 && 0 <= dir <= this.nCols - 1 && this.board[dir] == this.EMPTY_CELL && !liberties.includes(dir))
                    liberties.push(dir);
            }
        }
        return liberties;
    }

    // Returns a list of all liberties for the list of units provided
    // The nth index of libertiesByUnit contains the liberties for the nth unit of units
    getAllLiberties(units) {
        var libertiesByUnit = [];
        for (let unit of units) {
            libertiesByUnit.push(this.getLiberties(unit));
        }
        return libertiesByUnit;
    }

    // For the given combo (set of consecutive pieces), this returns the empty cells at either side of the combo, if applicable
    // Returns winningMoves, which will contain at maximum 2 elements
    getWinningMovesForCombo(combo) {
        var winningMoves = [];
        var firstInCombo = combo[0];
        var lastInCombo = combo[combo.length - 1];
        var firstCol = firstInCombo % this.nCols;
        var firstRow = Math.floor(firstInCombo / this.nCols);
        var lastCol = lastInCombo % this.nCols;
        var lastRow = Math.floor(lastInCombo / this.nCols);

        if (firstRow == lastRow) { // row
            var beforeFirstPiece = firstInCombo - 1;
            var afterLastPiece = lastInCombo + 1;
            if (firstInCombo % this.nCols > 0 && (this.board[beforeFirstPiece] == this.EMPTY_CELL))
                winningMoves.push(beforeFirstPiece)
            if (lastCol < this.nCols - 1 && (this.board[afterLastPiece] == this.EMPTY_CELL))
                winningMoves.push(afterLastPiece)
        }
        else if (firstCol == lastCol) { // col
            var beforeFirstPiece = firstInCombo - this.nCols;
            var afterLastPiece = lastInCombo + this.nCols;
            if (firstRow > 0 && (this.board[beforeFirstPiece] == this.EMPTY_CELL))
                winningMoves.push(beforeFirstPiece)
            if (lastCol < this.nCols - 1 && (this.board[afterLastPiece] == this.EMPTY_CELL))
                winningMoves.push(afterLastPiece)
        }
        else if (firstCol < lastCol) { // diagonal (down-right)
            var beforeFirstPiece = firstInCombo - (this.nCols + 1);
            var afterLastPiece = lastInCombo + (this.nCols + 1);
            if (firstCol > 0 && firstRow > 0 && (this.board[beforeFirstPiece] == this.EMPTY_CELL))
                winningMoves.push(beforeFirstPiece)
            if (lastCol < this.nCols - 1 && lastRow < this.nRows - 1 && (this.board[afterLastPiece] == this.EMPTY_CELL))
                winningMoves.push(afterLastPiece)
        }
        else { // diagonal (down-left)
            var beforeFirstPiece = firstInCombo - (this.nCols - 1);
            var afterLastPiece = lastInCombo + (this.nCols - 1);
            if (firstCol < this.nCols - 1 && firstRow > 0 && (this.board[beforeFirstPiece] == this.EMPTY_CELL))
                winningMoves.push(beforeFirstPiece)
            if (firstCol > 0 && lastRow < this.nRows - 1 && (this.board[afterLastPiece] == this.EMPTY_CELL))
                winningMoves.push(afterLastPiece)
        }
        return winningMoves;
    }

    //////////////////////////////
    //                          //
    //    Game State & Logic    //
    //                          //
    //////////////////////////////
    // Must Implement
    gameHandleClick(clickX, clickY) {
        var cell = this.getCell(clickX, clickY);
        if (this.board[cell] == this.EMPTY_CELL)
            this.takeTurn(cell);
    }

    takeTurn(cell) {
        // Must Implement
        this.drawCell(cell);
        if (this.sound)
            this.placePieceSFX.play();
        this.board[cell] = this.curPlayer;
        this.movesPlayed.push(cell);

        // Call to super to end turn
        super.endTurn();
    }

    changePlayer() {
        super.changePlayer();
        this.CIRCLE_COLOR = this.curPlayer == this.PLAYER_ONE_VAL ? this.PLAYER_ONE_COLOR : this.PLAYER_TWO_COLOR;
    }

    getCell(x, y) {
        // Use Math.floor to replicate integer division in JavaScript (https://stackoverflow.com/questions/4228356/how-to-perform-an-integer-division-and-separately-get-the-remainder-in-javascr)
        let row = Math.floor(y / (this.cHeight / this.nRows));
        let col = Math.floor(x / (this.cWidth / this.nCols));
        return (row * this.nCols) + col;
    }

    // Must Implement (returns a boolean)
    checkForWin() {
        var combos = this.getCombos(5);
        this.winningCombos = combos;
        return combos.length > 0;
    }

    setWinningPlayer() {
        this.winningPlayer = this.curPlayer;
    }

    endGame() {
        this.showWinningCombos();
        super.endGame();
    }

    resetGame() {
        // Must Implement
        this.board = [];
        for (let i = 0; i < this.nRows * this.nCols; i++)
            this.board[i] = this.EMPTY_CELL;

        this.CIRCLE_COLOR = this.FIRST_TO_MOVE_COLOR;

        // Set players' colors based on who moves first
        if (this.firstMovePlayer == this.PLAYER_ONE_VAL) {
            this.PLAYER_ONE_COLOR = this.FIRST_TO_MOVE_COLOR;
            this.PLAYER_TWO_COLOR = this.SECOND_TO_MOVE_COLOR;
        }
        else {
            this.PLAYER_ONE_COLOR = this.SECOND_TO_MOVE_COLOR;
            this.PLAYER_TWO_COLOR = this.FIRST_TO_MOVE_COLOR;
        }

        this.movesPlayed = [];

        // Call to super
        super.resetGame(() => game_object.drawBoard());
    }

    undoMove() {
        if (!this.gameOver && this.movesPlayed.length > 0) {
            if (this.gameMode == this.Game_Modes.PVC) {
                // Only undo the player's last move. If the computer starts, then there needs to be at least 2 played pieces for one of them to be the player's
                if (this.firstMovePlayer == this.COMPUTER_VAL && this.movesPlayed.length <= 1)
                    return;
                if (this.curPlayer == this.PLAYER_ONE_VAL) {
                    this.board[this.movesPlayed.pop()] = this.EMPTY_CELL;
                    this.board[this.movesPlayed.pop()] = this.EMPTY_CELL;
                }
                else {
                    this.board[this.movesPlayed.pop()] = this.EMPTY_CELL;
                    clearTimeout(this.cpuTurnTimeoutId);
                    this.changePlayer();
                }
            }
            else {
                this.board[this.movesPlayed.pop()] = this.EMPTY_CELL;
                this.changePlayer();
            }
            this.drawBoardWithState();
        }
    }

    showWinningCombos() {
        for (let i = 0; i < this.winningCombos.length; i++) {
            for (let j = 0; j < 5; j++) {
                this.drawCellOutline(this.winningCombos[i][j], "gold");
            }
        }
    }
}

game_object = new Gomoku();
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