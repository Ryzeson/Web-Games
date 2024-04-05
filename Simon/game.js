const colors = ["red", "blue", "yellow", "green"]
const soundEffects = [
    redAudio = new Audio("sounds/red.mp3"),
    blueAudio = new Audio("sounds/blue.mp3"),
    yellowAudio = new Audio("sounds/yellow.mp3"),
    greenAudio = new Audio("sounds/green.mp3")
]
for (var sfx of soundEffects) {
    sfx.volume = .1;
}
const wrongSfx = new Audio("sounds/wrong.mp3");
wrongSfx.volume = .1;

var sequence = [];
var currIndex = 0;

var level = 1;


$(document).on("keydown", function (e) {
    compTurn();
});

function compTurn() {
    $("#level-title").text("Level " + level++);
    addColor();
    console.log(sequence)
    playSequence();
    $(document).off("keydown");
}

function playerTurn() {
    $("div[type=button]").on("click", e => {
        var currColor = sequence[currIndex];
        if ($(e.target).attr("id") === currColor) {
            beep(currColor);
            if (currIndex < sequence.length - 1) {
                currIndex++;
            }
            else {
                currIndex = 0;
                $("div[type=button]").off("click");
                setTimeout( e => {
                    compTurn();
                }, 1000);
            }
        }
        else {
            gameOver();
        }
    })
}

function addColor() {
    sequence.push(colors[Math.floor(Math.random() * 4)]);
}


function playSequence(i = 0) {
    beep(sequence[i]);
    i++;
    if (i < sequence.length) {
        setTimeout(function () {
            playSequence(i);
        }, 600);
    }
    else {
        playerTurn();
    }
}

function beep(color) {
    soundEffects[colors.indexOf(color)].play();
    $('div .' + color).addClass("pressed");
    setTimeout(function () {
        $('div .' + color).removeClass("pressed");
    }, 500)
}

function gameOver() {
    $("div[type=button]").off("click");
    $("body").addClass("game-over");
    $("#level-title").text("Game Over!");
    wrongSfx.play();
    $("#restart").removeClass("hidden");
    $("#restart").on("click", function() {
        $("#restart").addClass("hidden");
        $("body").removeClass("game-over");
        sequence = [];
        level = 1;
        currIndex = 0;
        compTurn();
    });
}