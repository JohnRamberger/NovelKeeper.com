let current_page = 0;
let page_count = 3;
let page_transition = 700;
$(async function(){
    //prevent scrolling
    /*let prevent_scroll = setInterval(() => {
        $("#wrapper").scrollTop("0px");
    }, 1);*/


    //onscroll event
    let busy = false;
    document.addEventListener("wheel", async function(e){
        if(e.deltaY > 0){
            scrollDown();
        }
        else if(e.deltaY < 0){
            scrollUp();
        }
    });

    var xDown = null;                                                        
    var yDown = null;

    function getTouches(evt) {
        return evt.touches ||             // browser API
            evt.originalEvent.touches; // jQuery
    } 

    document.addEventListener('touchstart', function(evt){
        const firstTouch = getTouches(evt)[0];                                      
        xDown = firstTouch.clientX;                                      
        yDown = firstTouch.clientY; 
    }, false);        
    document.addEventListener('touchmove', function(evt){
        if ( ! xDown || ! yDown ) {
            return;
        }

        var xUp = evt.touches[0].clientX;                                    
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {//most significant
            if ( xDiff > 0 ) {
                // left swipe 
            } else {
                //right swipe 
            }                       
        } else {
            if ( yDiff > 0 ) {
                //up swipe 
                scrollDown();
            } else { 
                // down swipe 
                //evt.preventDefault();
                scrollUp();
            }                                                                 
        }
        // reset values
        xDown = null;
        yDown = null;  
    }, false);

    function scrollDown(){
        //scrolling down
        if(!busy)
        if(current_page < page_count){
            
            busy = true;
            //scroll down
            let newtop = -100 * (current_page);
            $("#wrapper .pages").animate({top: `${newtop}vh`}, page_transition);

            if(current_page == 0){
                //change nav
                $("#nav").animate({top: `-60px`}, (page_transition / 2));
                setTimeout(() => {
                    //$("#wrapper .logo").animate({})
                }, 250);
                $("#wrapper #page0").animate({top: `-100vh`}, page_transition);
                //show pagecount
                /*setTimeout(() => {
                    $("#page-count").animate({opacity:"1"}, 300);
                }, 300);*/
            }
            //change pagecount color
            let new_color = $(`#wrapper .pages .page[data-page="${current_page + 1}"]`).attr("data-color");
            $("#page-count .count").animate({color:new_color}, page_transition);
            $("#page-count .line").animate({borderColor: new_color}, page_transition);

            current_page++;

            //change pagecount
            setTimeout(() => {
                $("#page-count .count").text(`0${current_page}.`);
            }, (page_transition / 2));
            /*$("#page-count .count").fadeOut(100, function(){
                $("#page-count .count").text(`0${current_page}.`).fadeIn(100);
            });*/

            setTimeout(() => {
                busy = false;
                $("#mobile-scroller").scrollTop("10px");
            }, (page_transition * 0.9));
        }
    }
    function scrollUp(){
        //scrolling up
        if(!busy)
        if(current_page > 0){
            busy = true;
            //scroll up
            let newtop = (-100 * (current_page - 2));
            $("#wrapper .pages").animate({top: `${newtop}vh`}, page_transition);

            if(current_page == 1){
                //change nav
                setTimeout(() => {
                    $("#nav").animate({top: `0px`}, (page_transition / 2));
                }, (page_transition / 2));
                $("#wrapper #page0").animate({top: `0px`}, page_transition);
                //hide pagecount
                /*setTimeout(() => {
                    $("#page-count").animate({opacity:"0"}, 300);
                }, 300);*/
                //set next color
            }
            //change pagecount color
            let new_color = $(`#wrapper .pages .page[data-page="${current_page - 1}"]`).attr("data-color");
            $("#page-count .count").animate({color:new_color}, page_transition);
            $("#page-count .line").animate({borderColor: new_color}, page_transition);

            current_page--;

            //change pagecount
            setTimeout(() => {
                $("#page-count .count").text(`0${current_page}.`);
            }, (page_transition / 2));
            /*$("#page-count .count").fadeOut(100, function(){
                $("#page-count .count").text(`0${current_page}.`).fadeIn(100);
            });*/
            
            setTimeout(() => {
                busy = false;
                //console.log(current_page)
                if(current_page == 1){
                    $("#mobile-scroller").scrollTop("0px");
                }else{
                    $("#mobile-scroller").scrollTop("10px");
                }
            }, (page_transition * 0.9));
        }
    }
});