$(async function(){
    //check if logged in
    let logged_in = checkIfLoggedIn();
    if(!logged_in){
        //check #login
        let type = $("#login").attr("data-type");
        if(type == "cover"){
            $("#login-bg").show("fade", 400);
            $("#login").animate({bottom: "400px"}, 600);
        }
        else if(type == "onaction"){
            $(".require-login").on('click', function(){
                $("#login-bg").show("fade", 400);
                $("#login").animate({bottom: "400px"}, 600);
                let awaitlogin = setInterval(() => {
                    if(checkIfLoggedIn()){
                        clearInterval(awaitlogin);
                        $("#login-bg").hide("fade", 400);
                        $("#login").animate({bottom: "105%"}, 600);
                    }
                }, 300);
            });
        }
    }
});