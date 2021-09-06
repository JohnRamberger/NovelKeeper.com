var url_input_done = false;
var novel_info_open = false;

var curr_novel_title = "";
var curr_novel_url = "";
var curr_chap_url = "";
$(async function(){
    //define variables
    let novel_url = "";
    let title = "";
    //let author = "";
    let cover = "";
    let toc_urls = [];

    let logged_in = checkIfLoggedIn();

    $("#url-input input").keypress(function(e){
        if(e.which == 13){
            //enter key pressed
            $("#url-input .nk-button").click();
        }
    });

    //click off
    $("#wrapper").on('click scroll', function(e){

        //console.log($(e.target).parents(".sorting"))
        
        if(!$(e.target).parents(".actions").length > 0 && $("#wrapper .actions .options").is(":visible")){
            //console.log("hide options")
            $("#wrapper .actions .options").hide();
        }
    });

    //add events for sorting 
    $("#wrapper .actions .display").on("click tap", () => {
        //show options
        $("#wrapper .actions .options").show();
    });

    $("#wrapper .actions .options .copy").on('click tap', async (e) => {
        //copy novel url to clipboard
        copyToClipboard(novel_url);

        //close menu
        $("#wrapper .actions .options").hide();
        //console.log("copied to clipboard");

        //show notif 
        show_notif("success", "novel url copied")
    });

    




    $("#url-input .nk-button").on("click", async function(){
        //check if can submit 
        let url_input = $("#url-input input").val();
        if(!url_input_done && url_input){
            //remove major title
            //$(".major").hide("drop", {"direction": "up"}, 400);
            //move url input and disable
            $("#url-input").addClass("_done");
            $("#url-input").css("top", "-128px");
            $("#url-input input").prop("disabled", true);
            $("#url-input input").attr("autocomplete", "off");
            //show loading info
            $("#loading-info").delay(400).show("drop", {"direction": "down"}, 400);
            //gather novel info
            var t0 = performance.now();
            let _url = await remove_url_prefix(url_input);
            novel_url = _url;

            if(novel_url.includes('?')){
                novel_url = novel_url.split('?')[0];
            }

            //check if logged in
            if(logged_in){
                //check if novel is in library
                let in_library = await check_novel_in_library(logged_in.uuid, novel_url);
                //console.log(in_library)
                if(in_library){
                    $("#library-button .add").hide();
                    $("#library-button .remove").show();

                    $("#wrapper .actions .options .add").text("update in library");

                    //console.log("in library");
                }else{
                    //console.log("not in library");
                }
            }

            const baseurl = get_base_url(_url);
            //console.log(baseurl)
            //console.log(_url)
            const _html = await scrape(_url);
            //console.log(_html)

            //console.log(_html)

            let json = await load_json("./json/selectors.json");
            let _selectors = json.find(x => x.domain == baseurl);
            //console.log(_selectors)
            if(baseurl && _selectors && !_selectors.block){

                //check for url params
                let url = new URL(window.location.href);
                if(!url.searchParams.has('nu')){
                    let newurl = `${window.location.href.replace("#", "")}?nu=${novel_url}`;
                    await window.history.pushState({}, null, newurl);
                }

                //get and set novel info
                title = await get_novel_title(_url, _html, _selectors);
                //console.log(title);
                let author = await get_novel_author(_url, _html, _selectors);
                //console.log(author);
                let summary = await get_novel_summary(_url, _html, _selectors);
                if(summary != null && summary.includes('\\n'))
                    summary = summary.replaceAll("\\n", "<br><br>")

                //console.log(summary);
                let genres = await get_novel_genres(_url, _html, _selectors);
                //console.log(genres);
                cover = await get_novel_cover(_url, _html, _selectors);
                //console.log(cover);
                let toc_all = await get_novel_toc_urls(_url, _html, _selectors);
                //console.log(toc_all)



                console.log(toc_all);
                
                
                
                
                toc_urls = toc_all[1];
                let toc_names = toc_all[0];
                let chapter_count = toc_urls.length;

                let chap1 = toc_urls[0];
                let chap1_title = toc_names[0];
                if(toc_names.find(x => parseInt(x.replace ( /[^\d.]/g, '' )) == 1)){
                    let chap1_index = toc_names.indexOf(toc_names.find(x => parseInt(x.replace ( /[^\d.]/g, '' )) == 1));
                    chap1 = toc_urls[chap1_index];
                    chap1_title = toc_names[chap1_index];
                    //console.log(chap1_index)
                }
                //console.log(chap1)
                let chap1_html = await scrape(chap1);
                //console.log(chap1_html)
                let chap1_baseurl = get_base_url(chap1);
                let _chap1_selectors = json.find(x => x.domain == chap1_baseurl);
                //console.log(chap1_html);
                let chap1_content = await get_chapter_content(toc_urls[0], chap1_html, _chap1_selectors);
                //console.log(chap1_content)
                //console.log(chap1_html)

                /*//remove chapter title from chap1 content
                chap1_content = $.parseHTML(chap1_content);
                chap1_content = $('<div> </div>').append(chap1_content);
                $(chap1_content).find("*").each(function () {
                    const child = this;
                    var inner = $(child).text().replace(/\s+/g, ' ').trim();
                    var ctitle1 = ctitle.replace(/\s+/g, ' ').trim();
                    //console.log(ctitle1)
                    if (inner == "" || inner == null) {
                        //console.log(child)
                        $(chap1_content).find(child).remove();
                    }
                    else if (inner.toLowerCase().includes(ctitle1.toLowerCase())) {
                        $(chap1_content).find(child).remove();
                    }
                })
                chap1_content = $(chap1_content).html();
                chap1_content = decode_unicode(chap1_content);*/

                curr_novel_title = title;
                curr_novel_url = _url;
                curr_chap_url = toc_urls[0];

                //console.log(cover);
                
                $("#novel-title").text(title);
                $("#novel-author").text(author);
                $("#novel-cover img").attr("src", cover);

                //set cover load/fail handlers
                //console.log(cover)
                $("#novel-cover img").get(0).onerror = async function(e){
                    let b64 = await tobase64(cover);
                    $("#novel-cover img").attr("src", b64);
                    cover = b64;
                }

                $("#novel-summary div").html(summary);
                $("#novel-tags > span").text(genres);

                if(!_selectors.load_full_chapters){
                    $("#novel-missing-chaps").addClass("_visible");
                }

                if(chapter_count > 1){
                    $("#novel-chapter-count").prepend(`${numberWithCommas(chapter_count)} Chapters`);
                } else {
                    $("#novel-chapter-count").prepend(`${chapter_count} Chapter`);
                }

                //$("#chapter-preview").append(`<h3>${chap1_title}</h3>` + chap1_content);
                $("#chapter-preview").append(chap1_content);

                var t1 = performance.now();
                let s = (t1 - t0) / 1000;
                let ms = (t1 - t0);
                //round
                s = Math.round(s * 1000) / 1000;
                ms = Math.round(ms * 10) / 10;

                $("#load-time").html(`load time <strong>${s}s</strong>`);
                //$("#load-time").html(`load time <strong>${s}s</strong> / <strong>${ms}ms</strong>`);
                $("#load-time").animate({"opacity":"0.5"}, 1000);
                console.log(`load time ${s}s/${ms}ms`);
                //hide loading info
                $("#loading-info").hide("drop", {"direction": "up"}, 400);
                //open novel info
                setTimeout(() => {
                    $("#novel-info").css("transition", "top 1s ease");
                    $("#novel-info").css("top", "24px");
                    setTimeout(() => {
                        novel_info_open = true;
                        $("#wrapper").addClass("scroll");
                    }, 1000);
                    setTimeout(() => {
                        $("#read-button").css("bottom", "20px");
                        $("#library-buttons").animate({opacity: "1"}, 300);

                        //enable library buttons
                        $("#library-buttons").removeClass("_off");
                    }, 700);
                }, 1200);

                //change read button href
                //$("#read-button").attr("href", `/read?t=${curr_novel_title}&nu=${curr_novel_url}&cu=${curr_chap_url}`)
                $("#wrapper .actions .options .read").attr("href", `/read?t=${curr_novel_title}&nu=${curr_novel_url}&cu=${curr_chap_url}`);
                $("#wrapper .actions .options .download").attr("href", `/download?nu=${curr_novel_url}`);
                
            }else{
                //no selector or blocked
                //fill #provider-not-supported
                let pre = _url.split(baseurl)[0];
                let post = _url.split(baseurl)[1];
                let base = baseurl;

                //console.log(`${pre}|${base}|${post}`);
                if(window.innerWidth > 450){
                    $("#provider-not-supported .p-url").html(`${pre}<span class="base">${base}</span>${post}`);
                }else{
                    $("#provider-not-supported .p-url").html(`www.<span class="base">${base}</span>`);
                }

                $("#request-button").on('click', async function(){
                    if($("#request-button .request").is(":visible")){
                        //request provider
                        await request_provider(base, _url);
                        //change button
                        $("#request-button .request").hide();
                        $("#request-button .requested").show();

                        $("#provider-not-supported .thanks").animate({opacity: "1"}, 400);
                        //console.log("requested")
                    }else{
                        //console.log("already requested")
                    }
                })

                //hide loading info
                $("#loading-info").hide("drop", {"direction": "up"}, 400);
                //show provider not supported
                setTimeout(() => {
                    $("#provider-not-supported").show("drop", {"direction": "down"}, 400);
                    setTimeout(() => {
                        $("#library-buttons").animate({opacity: "1"}, 300);
                        $("#library-buttons #library-button").hide();
                    }, 300);
                }, 1200);
            }
        }
    });

    //check for url params
    let url = new URL(window.location.href);
    if(url.searchParams.has('nu')){
        $("#url-input input").val(url.searchParams.get('nu'));
        $("#url-input .nk-button").trigger('click');
    }

    /*$("#read-button").on('click', async function(){

        //await encryptCookie("novel_url", curr_novel_url, 1000);
        //await encryptCookie("chapter_url", curr_chap_url, 1000);
        //await encryptCookie("title", curr_novel_title, 1000);
        window.location.href = `read?t=${curr_novel_title}&nu=${curr_novel_url}&cu=${curr_chap_url}`;
    });*/

    if(logged_in){
        //enable button
        $("#library-button").css("cursor", "pointer");
        //add event listener to button
        $("#wrapper .actions .options .add").on('click tap', async (e) => {
            //close menu
            $("#wrapper .actions .options").hide();
            if($("#wrapper .actions .options .add").text().trim() == "add to library"){
                //add novel to library
                let current_chapter_url = toc_urls[0];
                let res = await insert_novel(logged_in.uuid, novel_url, title, cover, current_chapter_url, toc_urls.indexOf(current_chapter_url));
                //console.log(res)
                $("#wrapper .actions .options .add").text("update in library");

                //show notif 
                show_notif("success", "novel added to library")
            }else if($("#wrapper .actions .options .add").text().trim() == "update in library"){
                
                //update in library
                //get current chapter info from db
                let library = await get_library(logged_in.uuid);
                const nov = library.find(x => x.novel_url == novel_url);
                await delete_novel(logged_in.uuid, novel_url);
                //let current_chapter_url = toc_urls[0];
                let res = await insert_novel(logged_in.uuid, novel_url, title, cover, nov.current_chapter_url, nov.current_chapter_index);

                //show notif 
                show_notif("success", "novel updated")
            }
        });
        $("#library-button").on('click', async function(){
            //check if trying to add or remove
            if($("#library-button .add").is(":visible")){
                //not in library
                let current_chapter_url = toc_urls[0];
                let res = await insert_novel(logged_in.uuid, novel_url, title, cover, current_chapter_url, toc_urls.indexOf(current_chapter_url));
                
                $("#library-button .add").hide();
                $("#library-button .remove").show();
                //change button
            }else{
                //in library
                let res = await delete_novel(logged_in.uuid, novel_url);
                //console.log(res)
                $("#library-button .add").show();
                $("#library-button .remove").hide();
                //change button
            }
        });
    }else{
        $("#library-button").css("cursor", "not-allowed");
    }
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

function show_notif(type, message){
    let duration = 5000;
    $("#wrapper .notif").text(message);
    $("#wrapper .notif").show();
    if(type == "default"){
        
    }else if(type == "error"){
        $("#wrapper .notif").addClass("error");
    }else if(type == "success"){
        $("#wrapper .notif").addClass("success");
    }
    $("#wrapper .notif").css("top", "20px");
    setTimeout(() => {
        let fade_dur = 1000;
        $("#wrapper .notif").hide("fade", fade_dur);
        setTimeout(() => {
            $("#wrapper .notif").css("top", "-300px");
            $("#wrapper .notif").removeClass("error");
            $("#wrapper .notif").removeClass("success");
        }, fade_dur + 50);
    }, 5000);
}