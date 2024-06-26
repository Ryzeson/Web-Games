class AbstractGame {

    constructor() {
        if (this.constructor == AbstractGame) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        // Get the canvas element and its context
        this.canvas = $("canvas")[0];
        this.ctx = this.canvas.getContext("2d");

        // Fix the blurriness issue on HD screens (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
        // Get the DPR and size of the canvas
        var dpr = window.devicePixelRatio;
        var rect = this.canvas.getBoundingClientRect();

        // Set the "actual" size of the canvas
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Scale the context to ensure correct drawing operations
        this.ctx.scale(dpr, dpr);

        // Set the "drawn" size of the canvas
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        // Set font size to match Bootstrap 4 default typography
        this.ctx.font = '48px "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

        //////////////////////////
        //                      //
        //    Game Constants    //
        //                      //
        //////////////////////////
        // https://stackoverflow.com/questions/44447847/enums-in-javascript-with-es6
        this.Game_Modes = Object.freeze({
            PVP: "pvp",
            PVC: "pvc"
        });

        this.Difficulties = Object.freeze({
            EASY: "easy",
            MEDIUM: "medium",
            HARD: "hard"
        });

        this.Game_Speeds = Object.freeze({
            NORMAL: 1100,
            INSTANT: 0
        });

        this.validOptions;

        this.PLAYER_ONE_VAL = 0;
        this.PLAYER_TWO_VAL = 1;
        this.COMPUTER_VAL = 1;
        this.curPlayer = this.PLAYER_ONE_VAL;
        this.firstMovePlayer = this.PLAYER_ONE_VAL;
        this.secondMovePlayer = this.PLAYER_TWO_VAL;
        this.gameOver = false;
        this.winningPlayer;
        this.gameMode = this.Game_Modes.PVP; // leave as PVP
        this.cpuDifficulty = this.Difficulties.EASY; // leave as EASY
        this.cpuSpeed = this.Game_Speeds.NORMAL; // leave as Normal
        this.cpuTurnTimeoutId; // while resetting the game, we need to make sure we can clear all actions in the timeout queue
        this.showMoves = true;
        this.sound = true;

        ////////////////////////////
        //                        //
        //    Canvas Constants    //
        //                        //
        ////////////////////////////


        // New canvas width and height to match the DPR logic
        this.cWidth = this.canvas.width / dpr;
        this.cHeight = this.canvas.height / dpr;
        this.centerX = this.cWidth / 2;
        this.centerY = this.cHeight / 2;

        // Gets the location of the canvas on the entire screen
        // https://stackoverflow.com/questions/70519964/how-to-get-topleft-topright-bottomleft-bottomright-and-centretop-position-of
        this.boundingRect = this.canvas.getBoundingClientRect();

        this.BOARD_COLOR = "#D2D7DF";
        this.LINE_COLOR = "black";
        this.TEXT_BOX_COLOR = "#35353588";
        this.TEXT_BOX_TEXT_COLOR = "white";
    }

    //////////////////////
    //                  //
    //    Game Logic    //
    //                  //
    //////////////////////
    drawLine(startX, startY, endX, endY, lineColor, lineWidth) {
        const { ctx } = this;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke(); // Actually draw the line
        ctx.closePath();
    }

    drawTriangle(p1, p2, p3, fillColor) {
        const { ctx } = this;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.fill();
        ctx.closePath();
    }

    drawCircle(centerX, centerY, radius, fillColor) {
        const { ctx } = this;
        ctx.fillStyle = fillColor;
        ctx.beginPath(); // Begin a new path
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Define the circle
        ctx.fill();
        ctx.closePath();
    }

    drawCircleNoFill(centerX, centerY, radius, strokeColor, lineWidth) {
        const { ctx } = this;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath(); // Begin a new path
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Define the circle
        ctx.stroke();
        ctx.closePath();
    }

    resetGame(resetGameHelper) {
        clearTimeout(this.cpuTurnTimeoutId);
        this.gameOver = false;
        this.curPlayer = this.firstMovePlayer;
        if (this.firstMovePlayer == this.PLAYER_ONE_VAL) {
            $("#p1").addClass("current-player");
            $("#p2").removeClass("current-player");
        }
        else {
            $("#p1").removeClass("current-player");
            $("#p2").addClass("current-player");
        }

        this.removePlayAgainButton();

        resetGameHelper();

        if (this.gameMode == this.Game_Modes.PVC && this.firstMovePlayer == this.COMPUTER_VAL) {
            this.cpuTurn();
        }
    }

    changePlayer() {
        this.curPlayer = (this.curPlayer + 1) % 2;
        $(".player-box").toggleClass("current-player");
    }

    displayWinner() {
        const { ctx } = this;
        let text;
        if (this.winningPlayer == -1)
            text = "Draw!";
        else
            text = 'Player ' + (this.winningPlayer + 1) + ' wins!';
        if (this.gameMode == "pvc" && this.winningPlayer == this.COMPUTER_VAL)
            text = 'Computer wins!';
        let textWidth = ctx.measureText(text).width;
        let textHeight = ctx.measureText('M').width; // cheat to get height
        let textX = (this.cWidth / 2) - textWidth / 2;
        let textY = this.cHeight / 2;

        let textBoxWidth = textWidth * 1.2;
        let textBoxHeight = textHeight * 1.4;
        let textBoxX = textX - (textWidth * .1);
        let textBoxY = textY - textHeight;

        // Draw the box first
        ctx.fillStyle = this.TEXT_BOX_COLOR;
        ctx.fillRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);

        // Then draw the text
        ctx.fillStyle = this.TEXT_BOX_TEXT_COLOR;
        ctx.fillText(text, textX, textY);
    }

    endTurn() {
        if (this.checkForWin())
            this.endGame();
        else {
            this.changePlayer();
            if (this.gameMode == this.Game_Modes.PVC && this.curPlayer == this.COMPUTER_VAL)
                this.cpuTurn();
        }
    }

    endGame() {
        this.gameOver = true;
        this.setWinningPlayer();
        this.displayWinner();
        this.addPlayAgainButton();
    }

    /////////////////////////////////
    //                             //
    //    Computer Player Logic    //
    //                             //
    /////////////////////////////////
    setCPUMove(param) {
        this.cpuTurnTimeoutId = setTimeout(() => {
            this.takeTurn(param)
        }, this.cpuSpeed);
    }

    //////////////////////////
    //                      //
    //    Listeners + UI    //
    //                      //
    //////////////////////////
    handleClick(e) {
        if (!this.gameOver && (this.gameMode == this.Game_Modes.PVP || (this.gameMode == this.Game_Modes.PVC && this.curPlayer == this.PLAYER_ONE_VAL))) {
            const clickX = e.clientX - this.boundingRect.left;
            const clickY = e.clientY - this.boundingRect.top;
            this.gameHandleClick(clickX, clickY)
        }
    }

    optionsListener() {
        const { validOptions } = this;
        var gameModeChanged = false;
        var firstMoveChanged = false;
        var boardDimensionsChanged = false;

        if (validOptions.game_mode)
            gameModeChanged = this.getCheckedValue("game_mode") != this.gameMode;
        if (validOptions.first_move)
            firstMoveChanged = this.getCheckedValue("first_move") != this.firstMovePlayer;
        if (validOptions.board_dimensions)
            boardDimensionsChanged = this.getCheckedValue("board_dimensions") != this.nRows;

        if (gameModeChanged || firstMoveChanged || boardDimensionsChanged)
            $(".options-warning").removeClass("invisible");
        else
            $(".options-warning").addClass("invisible");
    }

    updateOptions() {
        const { validOptions } = this;

        var resetGameFlag = false;

        if (validOptions.cpu_difficulty)
            this.cpuDifficulty = this.getCheckedValue("cpu_difficulty");

        if (validOptions.game_mode) {
            var newGameMode = this.getCheckedValue("game_mode");
            if (newGameMode != this.gameMode)
                resetGameFlag = true;
            this.gameMode = newGameMode;
            this.updatePlayerLabels();

            $(".options-warning").addClass("invisible");
        }

        if (validOptions.cpu_speed) {
            this.cpuSpeed = parseInt(this.getCheckedValue("cpu_speed"));
        }

        if (validOptions.first_move) {
            var newFirstMovePlayer = parseInt(this.getCheckedValue("first_move"));
            if (newFirstMovePlayer != this.firstMovePlayer)
                resetGameFlag = true;
            this.firstMovePlayer = newFirstMovePlayer;
            this.secondMovePlayer = (newFirstMovePlayer + 1) % 2;
        }

        if (validOptions.board_dimensions) {
            var dimensions = parseInt(this.getCheckedValue("board_dimensions"));
            if (dimensions != this.nRows)
                resetGameFlag = true;
            this.nRows = dimensions;
            this.nCols = dimensions;
            this.cellHeight = this.cHeight / this.nRows;
            this.cellWidth = this.cWidth / this.nCols;
        }

        if (validOptions.sound)
            this.sound = this.getCheckedValue("sound") == 'on';

        if (validOptions.show_moves)
            this.showMoves = this.getCheckedValue("show_moves") == 'on';

        if (validOptions.color) {
            let colors = this.getSelectedColors("color");
            console.log(colors);
            this.setColors(colors);
        }


        if (resetGameFlag) this.resetGame();
    }

    // Gets the applicable options from the options form
    // Takes distinct input group names from the options modal, and creates a map like the example one below
    // validOptions = {
    //     "cpu_difficulty" : true,
    //     "game_mode" : true
    // }
    getValidOptions() {
        var formInputs = $('#options-form input');
        var formGroupNames = [];
        for (let input of formInputs) {
            var groupName = input.getAttribute('name');
            if (!formGroupNames.includes(groupName))
                formGroupNames.push(groupName);
        }
        var validOptions = formGroupNames.reduce((acc, curr) => {
            acc[curr] = true;
            return acc;
        }, {});
        return validOptions
    }

    getCheckedValue(groupName) {
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

    getSelectedColors(groupName) {
        var form = $("#options-form")[0];
        var inputs = [...form.elements[groupName]];
        var colors = new Map();
        inputs.forEach(input => {
            colors.set(input.id, input.value);
        })
        return colors;
    }

    setColorValues(colors) {
        var form = $("#options-form")[0];
        var inputs = [...form.elements["color"]];
        inputs.forEach(input => {
            input.value = colors.get(input.id);
        })
    }

    updatePlayerLabels() {
        var p2Label = $("#p2-label");
        if (this.gameMode == this.Game_Modes.PVC)
            p2Label.text("Computer");
        else
            p2Label.text("Player 2");
    }

    addPlayAgainButton() {
        $("#play-again-button").removeClass("invisible");
    }

    removePlayAgainButton() {
        $("#play-again-button").addClass("invisible");
    }

    toggleSound() {
        this.sound = !this.sound;
    }

    drawBoard() {
        throw new Error("Draw board must be implemented");
    }

    checkForWin() {
        throw new Error("checkForWin must be implemented");
    }

    startGame() {
        this.drawBoard();
    };
}