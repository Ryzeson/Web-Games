// Toggles the hide/show arrows
$(".collapse-controller").on("click", e => {
    let arrowIcon = $(e.target);
    if ($(e.target).children().length > 0)
        arrowIcon = $(e.target).children()[0];
    $(arrowIcon).toggleClass("fa-caret-right");
    $(arrowIcon).toggleClass("fa-caret-down");
})