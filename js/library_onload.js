var uuid = "";
var maxRetries = 3;

$(async function () {
    //check logged in
    let logged_in = checkIfLoggedIn();
    if(!logged_in){
        //send to login page
        //document.location.href = "./login.html";
    }else{
        uuid = logged_in.uuid;

        $(".draggable").draggable();

        //setup login menu in top right
        $("#nav .user-block .user-container").css("opacity", "1");
        $("#nav .user-block .user-container").hide();

        $("#nav .user-block .user").text(logged_in.username);
        $("#nav .user-block .user").on('click', function(){
            $("#nav .user-block .user-container").toggle("drop", {direction: "up"}, 200);
        });

        //click off
        $("#wrapper").on('click scroll', function(e){
            if($("#nav .user-block .user-container").is(":visible")){
                $("#nav .user-block .user-container").hide("drop", {direction: "up"}, 200);
            }

            //console.log($(e.target).parents(".sorting"))
            
            if(!$(e.target).parents(".sorting").length > 0 && $("#library .sorting .options").is(":visible")){
                //console.log("hide options")
                $("#library .sorting .options").hide();
            }
        });

        $(document).on('click', () => {
            if($("#novel-context-menu").is(":visible")){
                $("#novel-context-menu").hide();
            }
        });

        if (document.addEventListener) {
            document.addEventListener('contextmenu', function (e) {
                //alert("You've tried to open context menu1"); //here you draw your own menu
                //check e
                const novel = e.path.find(x => $(x).hasClass('novel'));
                if(novel){
                    //draw novel edit menu
                    let x = mouseX(event);
                    let y = mouseY(event);
                    //console.log(`x: ${x}px | y: ${y}px`)
                    let maxX = $(window).width();
                    let maxY = $(window).height();

                    let menuX = $("#novel-context-menu").width();
                    let menuY = $("#novel-context-menu").height();

                    let buffer = 30;

                    let offsetX = maxX - menuX - buffer;
                    let offsetY = maxY - menuY - buffer;

                    if(x > offsetX){
                        x -= menuX;
                    }
                    if(y > offsetY){
                        y -= menuY
                    }
                    //console.log(`${x}/${maxX} | ${y}/${maxY}`)

                    let nuid = $(novel).attr('data-novel-uuid');
                    const nov = library.find(x => x.novel_uuid == nuid);

                    $("#novel-context-menu").attr('data-nuid', nov.novel_uuid);
                    $("#novel-context-menu .open").attr("href", `read?t=${nov.novel_title}&nu=${nov.novel_url}&cu=${nov.current_chapter_url}`)
                    $("#novel-context-menu .download").attr("href", `download?nu=${nov.novel_url}`)
                    $("#novel-context-menu .openorign").attr("href", `${nov.novel_url}`)
                    $("#novel-context-menu .openorigc").attr("href", `${nov.current_chapter_url}`)
                    $("#novel-context-menu .details").attr("href", `addnovel?nu=${nov.novel_url}`)
                    $("#novel-context-menu .remove").on('click', () => {
                        //confirm removal of novel
                        $("#confirm .desc .novel-title").text(nov.novel_title);
                        $("#confirm").attr("data-nuid", nov.novel_uuid);
                        $("#confirm").attr("data-nu", nov.novel_url);

                        $("#confirm input").val("");

                        $("#confirm").show("drop", {direction: "down"}, 300);
                    });
                    
                    //edit context menu
                    $("#novel-context-menu .header").text(nov.novel_title);
                    //$("#novel-context-menu .footer").text(nuid);

                    $("#novel-context-menu").css("top", y + "px");
                    $("#novel-context-menu").css("left", x + "px");
                    $("#novel-context-menu").show();

                    e.preventDefault();
                }else{
                    $("#novel-context-menu").hide();
                }              
            }, false);
        } else {
            document.attachEvent('oncontextmenu', function () {
                //alert("You've tried to open context menu2");
                window.event.returnValue = false;
            });
        }

        //add event listeners to confirm textbox
        $("#confirm input").on("input", (e) => {
            let $input = $(e.target);
            let goal = $input.attr("placeholder");
            let val = $input.val();

            let progress = 0;
            let goal_progress = goal.split('').length;
            //check progress towards goal
            for (let i = 0; i < val.split('').length; i++) {
                const c = val.split('')[i];
                if(c.toLowerCase() == goal.split('')[i].toLowerCase()){
                    progress++;
                }
                else{
                    progress = 0;
                    break;
                }
            }
            //change gradient
            //let percent = Math.round((progress / goal_progress) * 10000) / 100;

            //check if progress is maxed
            if(progress === goal_progress){
                if(!$("#confirm .bg").hasClass("complete")){
                    $("#confirm .bg").addClass("complete");
                    $("#confirm a.confirm").addClass("enabled");
                }
            }else{
                if($("#confirm .bg").hasClass("complete")){
                    $("#confirm .bg").removeClass("complete");
                    $("#confirm a.confirm").removeClass("enabled");
                }
            }            
        });

        $("#confirm a.cancel").on('click tap', () => {
            if($("#confirm").is(":visible")){
                $("#confirm").hide("drop", {direction: "down"}, 300);
            }
        });

        $("#confirm a.confirm").on('click tap', async () => {
            if($("#confirm").is(":visible")){
                if($("#confirm a.confirm").hasClass("enabled")){
                    let nuid = $("#confirm").attr("data-nuid");
                    let nu = $("#confirm").attr("data-nu");

                    //remove novel from db and library ui
                    await delete_novel(logged_in.uuid, nu);
                    $("#library").find(`.novel[data-novel-uuid="${nuid}"]`).remove();
                    //reinitialize library
                    library = await get_library(uuid);

                    //hide confirm menu
                    $("#confirm").hide("drop", {direction: "down"}, 300);

                    //show confirmed animation??
                }                
            }
        });
    }
    var t0 = performance.now();
    //get library from db
    var library = await get_library(uuid);
    if(library.length <= 0){
        $("#library .empty").show();
    }

    let order = 0;
    for(const novel of library){

        

        
        //check novel url and chapter url for parameters
        /*if(novel.novel_url.includes('?') || novel.current_chapter_url.includes('?')){
            //console.log(novel.novel_url)
            //console.log(novel.current_chapter_url)
            //create new DB entry
            var novel1 = novel;
            if(novel1.novel_url.includes('?'))
                novel1.novel_url = novel1.novel_url.split('?')[0];
            if(novel1.current_chapter_url.includes('?'))
                novel1.current_chapter_url = novel1.current_chapter_url.split('?')[0];
            
                console.log(novel.novel_url)
                console.log(novel1.novel_url)

            //console.log(novel1.novel_url)
            await insert_novel(uuid, novel1.novel_url, novel1.novel_title, novel1.novel_cover_url, novel1.current_chapter_url, novel1.current_chapter_index);
            //delete old entry
            let res = await delete_novel(uuid, novel.novel_uuid);
            //window.location.reload();
        }*/



        let novel_abbrev = "";
        novel.novel_title.split(' ').forEach(word => {
            if(word != "" && word.length >= 2 && isLetter(word.split('')[0]))
                novel_abbrev += word.split('')[0].toUpperCase();
        });
        let current_chapter_index = parseInt(novel.current_chapter_index) + 1;

        let chartitle = "";
        for(const c of novel.novel_title.split('')){
            if(isLetter(c))
                chartitle += c;
        }
        //console.log(chartitle);

        //let title_aes = await encrypt(novel.novel_title);
        //let novel_url_aes = await encrypt(novel.novel_url);
        //let chapter_url_aes = await encrypt(novel.current_chapter_url);

        //let title_b64 = await encryptParam(novel.novel_title);
        //let novel_url_b64 = await encryptParam(novel.novel_url);
        //let chapter_url_b64 = await encryptParam(novel.current_chapter_url);

        //let aes = await encrypt(`${novel.novel_title}??${novel.novel_url}??${novel.current_chapter_url}`);
        //?t=${title_b64}&nu=${novel_url_b64}&cu=${chapter_url_b64}  title="${novel.novel_title}"
        let novel_markup = `<a class="novel" href="read?t=${novel.novel_title}&nu=${novel.novel_url}&cu=${novel.current_chapter_url}"  data-novel-uuid="${novel.novel_uuid}" data-last-read="${order}" data-progress="${novel.current_chapter_index}" data-title="${chartitle}">
                                <div class="novel-cover">
                                    <span class="error">
                                        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="exclamation-triangle" class="svg-inline--fa fa-exclamation-triangle fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>
                                    </span>
                                    <img onerror="this.style.display='none';" src="${novel.novel_cover_url}">
                                    <span class="img-missing">${novel_abbrev}</span>
                                </div>
                                <div class="info">
                                    <h1 class="novel-title" title="${novel.novel_title}">${novel.novel_title}</h1>
                                    <h2 class="progress">Progress ${numberWithCommas(current_chapter_index)}/...</h2>
                                </div>
                            </a>`;
        $("#library").append(novel_markup);
        order++;
    }

    var t1 = performance.now();
    console.log(`library load time: ${(t1 - t0) / 1000} s / ${t1 - t0} ms`);

    resize_tiles();
    //change sizing for novels
    $(window).on('resize', (e) => {
        resize_tiles();
        resize_margin();
    });

    //reorder novels
    let cookieordering = await decryptCookie('order');
    let cookieorder = 0;
    let cookieasc = "asc";
    if(cookieordering){
        cookieorder = parseInt(cookieordering.split(':')[0]);
        cookieasc = cookieordering.split(':')[1];
    }
    order_novels(cookieorder, cookieasc);

    //show reordered buttons
    if(cookieasc == "desc"){
        $("#library .sorting svg").removeClass("svg-asc").addClass("svg-desc");
    }
    if(cookieorder != parseInt($("#library .sorting .display").attr('data-val'))){
        //change display
        $("#library .sorting .display").attr('data-val', cookieorder);
        $("#library .sorting .display .text").text($(`#library .sorting .options .sort[data-val="${cookieorder}"]`).text());
    }


    //hide loading info
    $("#loading-info").hide("drop", {"direction": "up"}, 400);
    //open novel info
    setTimeout(() => {
        //$("#library").css("transition", "top 1s ease");
        let mtop = 0;
        if(parseInt($(window).width()) <= 1024)
            mtop = 24;

        $("#library").animate({marginTop: `${mtop}px`}, 1000);
        setTimeout(() => {
            novel_info_open = true;
            $("#wrapper").addClass("scroll");


            //add events for sorting 
            $("#library .sorting .display").on("click tap", () => {
                //change ordering in options
                let currordering = parseInt($("#library .sorting .display").attr("data-val"));
                let $options = $("#library .sorting .options");

                $options.find(".sort").sort(function(a,b){
                    if(parseInt(a.getAttribute("data-val")) == currordering) return -1;
                    else return 1;
                }).appendTo($options);

                //show
                $("#library .sorting .options").show();
            });

            $("#library .sorting .options .sort").on('click tap', async (e) => {
                //change sorting display
                //change asc/desc ??
                let oldsort = $("#library .sorting .display .text").text().trim();
                let newsort = $(e.delegateTarget).find('.text').text().trim();

                //let oldordering = parseInt($("#library .sorting .display").attr('data-val'));
                let newordering = parseInt($(e.delegateTarget).attr('data-val'));

                let asc = "asc";
                if($("#library .sorting .display svg").hasClass("svg-desc")){
                    asc = "desc";
                }

                if(oldsort === newsort){
                    //console.log("change asc/desc")
                    //change asc/desc
                    if(asc == "asc"){
                        asc = "desc";
                        $("#library .sorting svg").removeClass("svg-asc").addClass("svg-desc");
                    }else if(asc == "desc"){
                        asc = "asc";
                        $("#library .sorting svg").removeClass("svg-desc").addClass("svg-asc");
                    }
                }else{
                    //console.log("change sorting")
                    //change sorting
                    $("#library .sorting .display").attr("data-val", newordering);
                    $("#library .sorting .display .text").text(newsort);
                }


                //change sorting
                order_novels(newordering, asc);

                //update cookie
                await encryptCookie("order", `${newordering}:${asc}`)

                //hide options
                $("#library .sorting .options").hide();
            });



        }, 1000);
        /*setTimeout(() => {
            $("#buttons").animate({opacity: "1"}, 300);
        }, 700);*/
        /*setTimeout(() => {
            $("#read-button").css("bottom", "20px");
            $("#library-button").animate({opacity: "1"}, 300);
        }, 700);*/
    }, 400);

    /*$(".novel").on('click tap', async function(){
        const novel_a = this;
        const novel_uuid = $(novel_a).attr("data-novel-uuid");
        const novel = library.find(x => x.novel_uuid == novel_uuid);
        //set cookies
        await encryptCookie("novel_url", novel.novel_url, 1000);
        await encryptCookie("chapter_url", novel.current_chapter_url, 1000);
        await encryptCookie("title", novel.novel_title, 1000);
        //go to reader
        //alert("test")
        window.location.href = 'read';
    });*/

    //load json selectors
    let json = await load_json("./json/selectors.json");

    let ordered_library = $("#library .novel");

    //for(const novel of library){
    for(const htmlnovel of ordered_library){
        try{
            let nuid = htmlnovel.getAttribute('data-novel-uuid');
            const novel = library.find(x => x.novel_uuid == nuid);

            let baseurl = await get_base_url(novel.novel_url);
            let _html = await scrape(novel.novel_url);
            
            let _selectors = json.find(x => x.domain == baseurl);

            let toc_all = await get_novel_toc_urls(novel.novel_url, _html, _selectors);
            let retries = 0;
            while(toc_all[1].length <= 0){
                if(retries >= maxRetries){
                    //tried too many times to get chapters
                    //so error image
                    $(`#library .novel[data-novel-uuid="${novel.novel_uuid}"]`).find(".error").css("display", "block");

                    break;
                }
                _html = await scrape(novel.novel_url);
                toc_all = await get_novel_toc_urls(novel.novel_url, _html, _selectors);
                retries++;
            }
            if(retries > 0){
                console.warn(`failed ${retries} attempts to get chapter count of ` + `%c${novel.novel_title}`, `color:#fc03e8;`);
            }
            //let chapter_count = await get_novel_chapter_count(novel.novel_url, _html, _selectors);
            let chapter_count = toc_all[1].length;
            let current_chapter_index = parseInt(novel.current_chapter_index) + 1;
            $(`#library .novel[data-novel-uuid="${novel.novel_uuid}"]`).find(".progress").text(`Progress ${numberWithCommas(current_chapter_index)}/${numberWithCommas(chapter_count)}`);
        }
        catch(ex){
            console.warn(ex);
        }
    }
});

function resize_tiles(){
    var library_width = parseInt($("#library").width());
    //5.5em x 1.33 + 2.5em
    //console.log(library_width);
    var window_width = parseInt($(window).width());

    let em = 36;
    if(window_width <= 720){
        em = 12;
        library_width = window_width - 2*em;

        $("#library .novel").width(`${(library_width - 5*em) / 3}px`);
        $("#library .novel").height(`${((((library_width - 5*em) / 3) + 4*em) * 1.33)}px`);
    }else if(window_width <= 1024){
        em = 24;
        library_width = window_width - 4*em;
        
        $("#library .novel").width(`${(library_width - 5*em) / 4}px`);
        $("#library .novel").height(`${((((library_width - 5*em) / 4) + 2.5*em) * 1.33)}px`);
    }else{
        library_width = window_width - 4*em;
        if (library_width > 1000) {library_width = 1000};

        $("#library .novel").width(`${(library_width - 5*em) / 4}px`);
        $("#library .novel").height(`${((((library_width - 5*em) / 4) + 2.5*em) * 1.33)}px`);
    }
    //console.log($("#library .novel").width())
}
function resize_margin(){
    var window_width = parseInt($(window).width());
    
    if(window_width <= 1024){
        $("#library").css("margin-top", "24px");
    }else{
        $("#library").css("margin-top", "0px");
    }
    //console.log($("#library .novel").width())
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function order_novels(ordering, direction){
    //0 = date
    //1 = alphabetical
    //2 = chapters read
    var $library = $("#library");
    if(ordering == 0){
        if(direction === "asc"){
            $library.find('.novel').sort(function(a, b) {
                return +a.getAttribute('data-last-read') - +b.getAttribute('data-last-read');
            }).appendTo($library);
            //console.log($novels);
        }else if(direction === "desc"){
            $library.find('.novel').sort(function(a, b) {
                return +b.getAttribute('data-last-read') - +a.getAttribute('data-last-read');
            }).appendTo($library);
        }
    }else if(ordering == 1){
        if(direction === "asc"){
            $library.find('.novel').sort(function(a, b) {
                if(a.getAttribute('data-title') > b.getAttribute('data-title')) return 1;
                if(a.getAttribute('data-title') < b.getAttribute('data-title')) return -1;
            }).appendTo($library);
            //console.log($novels);
        }else if(direction === "desc"){
            $library.find('.novel').sort(function(a, b) {
                if(a.getAttribute('data-title') < b.getAttribute('data-title')) return 1;
                if(a.getAttribute('data-title') > b.getAttribute('data-title')) return -1;
            }).appendTo($library);
        }
    }else if(ordering == 2){
        if(direction === "asc"){
            $library.find('.novel').sort(function(a, b) {
                return +a.getAttribute('data-progress') - +b.getAttribute('data-progress');
            }).appendTo($library);
            //console.log($novels);
        }else if(direction === "desc"){
            $library.find('.novel').sort(function(a, b) {
                return +b.getAttribute('data-progress') - +a.getAttribute('data-progress');
            }).appendTo($library);
        }
    }
}

function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft :
            document.body.scrollLeft);
    } else {
        return null;
    }
}

function mouseY(evt) {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
        return evt.clientY + (document.documentElement.scrollTop ?
            document.documentElement.scrollTop :
            document.body.scrollTop);
    } else {
        return null;
    }
}

/*
var t0 = performance.now();
var t1 = performance.now();
console.log((t1 - t0));
*/
