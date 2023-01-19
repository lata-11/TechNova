alert("hello");

function resize(){
    if($(window).width()<700)
    {
        
    }
}

$(window).on("resize", function(){
    resize()
});