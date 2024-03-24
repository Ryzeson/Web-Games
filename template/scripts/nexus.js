class TrafficLights extends AbstractGame {

    constructor() {
        super();
        
        //////////////////////////
        //                      //
        //    Game Constants    //
        //                      //
        //////////////////////////


        ////////////////////////////
        //                        //
        //    Canvas Constants    //
        //                        //
        ////////////////////////////

    }

    // Must Implement
    drawBoard() {

    }

    // Must Implement
    clearBoard() {

    }

    resetGame() {
        super.resetGame();

        // Must Implement
    }

    // Must Implement (returns a boolean)
    checkForWin() {

    }

    takeTurn(cell) {
        // Must Implement

        // Call to super to end turn
        super.endTurn();
    }

    // Must Implement
    cpuTurn() {

        // Super call to set move, passing in the necessary parameter to takeTurn()
        super.setCPUMove(chosenCell);
    }

    // Must Implement
    gameHandleClick(clickX, clickY) {

    }

}

game_object = new TrafficLights();
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
