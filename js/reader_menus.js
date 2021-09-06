async function load_reader_menus(){
    let root = document.documentElement;

    //check theme cookie
    let theme = await decryptCookie("theme");
    if(theme == "light"){
        $("html").addClass("light-mode");
        $("#light-radio").prop("checked", true);
        $(`meta[name="theme-color"]`).attr("content", "#ffffff");//#1f2129
        //$("head").append(`<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#ffffff">`);
    }
    else if(theme == "black"){
        $("html").addClass("black-mode");
        $("#black-radio").prop("checked", true);
        $(`meta[name="theme-color"]`).attr("content", "rgb(1,1,1)");//#1f2129
    }
    else//dark by default
    {
        //set cookie
        await encryptCookie("theme", "dark", 1000);
        //$("html").removeClass("light-mode");
        $("#dark-radio").prop("checked", true);
        $(`meta[name="theme-color"]`).attr("content", "#1f2129");//#1f2129
        //$("head").append(`<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1f2129">`);
    }
    //check font cookie
    let font = await decryptCookie("font");
    if(font == "2"){
        //change font to font2
        $("#page").removeClass("font1").addClass("font2");

        $("#font2-radio").prop("checked", true);
    }
    else//font1 by default
    {
        //setcookie
        await encryptCookie("font", "1", 1000);
        $("#font1-radio").prop("checked", true);
    }
    //check autoscroll cookie
    let autoscroll = await decryptCookie("autoscroll");
    if(autoscroll == "0"){
        //change check in settings

        $("#pagescroll-radio").prop("checked", true);
    }
    else//autoscroll by default
    {
        //setcookie
        await encryptCookie("autoscroll", "1", 1000);
        $("#autoscroll-radio").prop("checked", true);
    }
    //check font-size cookie
    let fontsize = await decryptCookie("fontsize");
    fontsize = parseInt(fontsize);
    if(fontsize >= 14 && fontsize <= 36){
        $("#font-size-input").val(fontsize);
        //change font size
        root.style.setProperty('--reader-font-size', fontsize + "px");
    }
    else//18 by default
    {
        //set cookie
        await encryptCookie("fontsize", "18", 1000);
    }

    //----------------------------------------------

    //apply all menu buttons
    $("#dark-radio").on('input', async function(){
        //const input = this;
        let checked = $("#dark-radio").prop("checked");
        //console.log(checked)
        if(checked){
            //change to dark theme (remove light mode class)
            $("html").removeClass("light-mode");
            $("html").removeClass("black-mode");
            //uncheck light radio button
            //$("#dark-radio").prop("checked", true);
            //$("#light-radio").prop("checked", false);

            //set cookie
            await encryptCookie("theme", "dark", 1000);

            //set browser theme
            $(`meta[name="theme-color"]`).attr("content", "#1f2129");//#1f2129
        }
    });
    $("#light-radio").on('input', async function(){
        //const input = this;
        let checked = $("#light-radio").prop("checked");
        //console.log(checked)
        if(checked){
            //change to light theme (add light mode class)
            $("html").addClass("light-mode");
            $("html").removeClass("black-mode");
            //uncheck light radio button
            //$("#dark-radio").prop("checked", false);
            //$("#light-radio").prop("checked", true);

            //set cookie 
            await encryptCookie("theme", "light", 1000);

            //set browser theme
            $(`meta[name="theme-color"]`).attr("content", "#ffffff");//#1f2129
        }
    });
    $("#black-radio").on('input', async function(){
        //const input = this;
        let checked = $("#black-radio").prop("checked");
        //console.log(checked)
        if(checked){
            //change to black theme (add light mode class)
            $("html").addClass("black-mode");
            $("html").removeClass("light-mode");
            //uncheck other radio buttons
            //$("#dark-radio").prop("checked", false);
            //$("#light-radio").prop("checked", true);

            //set cookie 
            await encryptCookie("theme", "black", 1000);

            //set browser theme
            $(`meta[name="theme-color"]`).attr("content", "rgb(1,1,1)");//#1f2129
        }
    });

    $("#font1-radio+strong").on('click tap', async function(){
        //const input = this;
        let checked = $("#font1-radio").prop("checked");
        if(!checked){
            //change to font1
            $("#page").removeClass("font2").addClass("font1");
            //uncheck font2 radio button
            $("#font1-radio").prop("checked", true);
            $("#font2-radio").prop("checked", false);

            //set cookie
            await encryptCookie("font", "1", 1000);
        }
    });
    $("#font2-radio+strong").on('click tap', async function(){
        //const input = this;
        let checked = $("#font2-radio").prop("checked");
        if(!checked){
            //change to font2
            $("#page").removeClass("font1").addClass("font2");
            //uncheck font1 radio button
            $("#font2-radio").prop("checked", true);
            $("#font1-radio").prop("checked", false);

            //set cookie
            await encryptCookie("font", "2", 1000);
        }
    });

    $("#autoscroll-radio+strong, #autoscroll-radio+svg").on('click tap', async function(){
        //const input = this;
        let checked = $("#autoscroll-radio").prop("checked");
        if(!checked){
            //uncheck pagescroll radio button
            $("#autoscroll-radio").prop("checked", true);
            $("#pagescroll-radio").prop("checked", false);

            //set cookie
            await encryptCookie("autoscroll", "1", 1000);
            //reload page
            document.location.reload();
        }
    });
    $("#pagescroll-radio+svg,#pagescroll-radio+strong").on('click tap', async function(){
        //const input = this;
        let checked = $("#pagescroll-radio").prop("checked");
        if(!checked){
            //uncheck autoscroll radio button
            $("#autoscroll-radio").prop("checked", false);
            $("#pagescroll-radio").prop("checked", true);

            //set cookie
            await encryptCookie("autoscroll", "0", 1000);
            //reload page
            document.location.reload();
        }
    });
    fontsizes = [14,16,18,20,24,28,32,36];
    $("#a-minus").on('click tap', async function(){
        //const input = this;
        let fontsize = await decryptCookie("fontsize");
        fontsize = parseInt(fontsize);
        if(fontsize > 14 && fontsizes.indexOf(fontsize) >= 0){
            //get next font size
            let index = fontsizes.indexOf(fontsize);

            $("#font-size-input").val(fontsizes[index - 1]);
            //change font size
            root.style.setProperty('--reader-font-size', fontsizes[index - 1] + "px");

            //set cookie
            await encryptCookie("fontsize", fontsizes[index - 1], 1000);
            //reload page
            //document.location.reload();
        }
    });
    $("#a-plus").on('click tap', async function(){
        //const input = this;
        let fontsize = await decryptCookie("fontsize");
        fontsize = parseInt(fontsize);
        if(fontsize < 36 && fontsizes.indexOf(fontsize) >= 0){
            //get next font size
            let index = fontsizes.indexOf(fontsize);

            $("#font-size-input").val(fontsizes[index + 1]);
            //change font size
            root.style.setProperty('--reader-font-size', fontsizes[index + 1] + "px");

            //set cookie
            await encryptCookie("fontsize", fontsizes[index + 1], 1000);
            //reload page
            //document.location.reload();
        }
    });

    //handle menu transitions
    $(".button").on("click tap", async function(){
        let toggle = $(this).attr("data-toggle");
        if(toggle)
        if($(toggle).hasClass("open")){
            //close menu
            $(toggle).removeClass("open");
            $(`.buttons .button[data-toggle='${toggle}'`).removeClass("_on");
        }
        else{
            //close any other menus
            $(".menu").each(function(){
                if($(this).hasClass("open"))
                    $(this).removeClass("open");
            })
            //reset buttons
            $(".buttons .button[data-toggle*='#']").each(function(){
                $(this).removeClass("_on");
            })

            //open menu
            $(toggle).addClass("open");
            $(`.buttons .button[data-toggle='${toggle}'`).addClass("_on");
        }
    })


    //check for mobile menus
    let width = parseInt($(window).width());
    if(width <= 820){
        $("#mobile-touchpad").on("click tap", async function(){
            //console.log("open mobile menus");
            $("#mobile-top-bar").toggleClass("_open-top");
            $("#mobile-bottom-bar").toggleClass("_open-bottom");
        });
        $(window).on('scroll', async function () {
            if($("#mobile-top-bar").hasClass("_open-top")){
                $("#mobile-top-bar").removeClass("_open-top");
            }
            if($("#mobile-bottom-bar").hasClass("_open-bottom")){
                $("#mobile-bottom-bar").removeClass("_open-bottom");
            }
        });
    }
};