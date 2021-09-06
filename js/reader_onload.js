var loaded_chapter = 0;
var start_chapter = 0;
var focus_chapter = 0;
var toc = [];
var toc_urls = [];
var t = "";
var nu = "";
var cu = "";
var logged_in = checkIfLoggedIn();

var ci = -1;

$(async function () {
    //display loading icon 

    //load reader menus
    await load_reader_menus();
    //check next chapter setting
    let autoscroll = parseInt(await decryptCookie("autoscroll"));
    if(autoscroll){
        //show scrollbar
        $("#scroll-progress").css("visibility", "visible");
    }

    let t_url = new URL(window.location.href);
    t = t_url.searchParams.get('t');
    nu = t_url.searchParams.get('nu');
    cu = t_url.searchParams.get('cu');

    /*let t_url = new URL(window.location.href);
    if(!t_url.searchParams.has('t') || !t_url.searchParams.has('nu') || !t_url.searchParams.has('cu')){
        window.location.href = "/";
    }*/

    //let t = await decryptParam(window.location.href, "t");
    //let nu = await decryptParam(window.location.href, "nu");
    //let cu = await decryptParam(window.location.href, "cu");
    //console.log(t);
    //console.log(nu);
    //console.log(cu);
    

    //get url from cookie
    //var novel_url = await decryptCookie("novel_url");
    var novel_url = nu;
    if (novel_url == "") {
        document.location.href = "./index.html"
    }

    //check if novel is in library
    //check if logged in
    //logged_in 
    if(logged_in){
        //check if novel is in library
        let in_library = await check_novel_in_library(logged_in.uuid, novel_url);
        //console.log(in_library)
        if(in_library){
            $("#library-button .add").hide();
            $("#library-button .remove").show();
            $("#m-library-button .add").hide();
            $("#m-library-button .remove").show();
            //console.log("in library");
        }else{
            //console.log("not in library");
        }
    }
    //$("#library-button .remove").hide();

    let baseurl = await get_base_url(novel_url);
    let json = await load_json("./json/selectors.json");
    let _selectors = json.find(x => x.domain == baseurl);
    let novel_html = await scrape(novel_url);

    //get chapter url from cookie
    let chapter_url = cu;//= await decryptCookie("chapter_url");
    if (chapter_url == "") {
        //get 1st chapter link
    }
    //console.log(chapter_url)

    //check if chapters are from diff source
    let burl = get_base_url(chapter_url);
    //console.log(burl)
    if(burl){
        let _selectors1 = json.find(x => x.domain == burl);
        if(_selectors1){
            _selectors = _selectors1;
            baseurl = burl;
        }
    }

    //console.log(_selectors)


    //get novel title from cookie
    let title = t;//= await decryptCookie("title");
    if (title == "") {
        //get the title
        title = await get_novel_title(novel_url, novel_html, _selectors);
    }

    //get novel cover
    let cover = await get_novel_cover(novel_url, novel_html, _selectors);
    //console.log(cover)
    document.title = `Read ${title}`;
    $(".novel_title").text(title);
    $(".novel_title").attr("title", title);

    //load in chapter content
    let chapter_html = await scrape(chapter_url);
    //console.log(chapter_html)
    let chapter_content = await get_chapter_content(chapter_url, chapter_html, _selectors);
    //console.log(chapter_content)
    //console.log(chapter_content)
    let ctitle = await get_chapter_title(chapter_url, chapter_html, _selectors);
    if(!ctitle)
        ctitle = "N/A";

    $(".chapter_title").text(ctitle);
    $(".chapter_title").attr("title", ctitle);

    //remove chapter title from chapter content
    chapter_content = $.parseHTML(chapter_content);
    chapter_content = $('<div> </div>').append(chapter_content);
    $(chapter_content).find("*").each(function () {
        const child = this;
        var inner = $(child).text().replace(/\s+/g, ' ').trim();
        var ctitle1 = ctitle.replace(/\s+/g, ' ').trim();
        //console.log(ctitle1)
        if (inner == "" || inner == null) {
            //console.log(child)
            $(chapter_content).find(child).remove();
        }
        else if (inner.toLowerCase().includes(ctitle1.toLowerCase())) {
            $(chapter_content).find(child).remove();
        }
    })
    chapter_content = $(chapter_content).html();
    chapter_content = decode_unicode(chapter_content);
    let ch_title_markup = `<div class="ch-title"><h3>${ctitle}</h3></div>`;
    let buttons_markup = ``;
    if(!autoscroll){
        buttons_markup = `<div class="chapter-end-buttons"><div class="wrapper font1"><a class="prev-chapter full"><strong class="full">Prev Chapter</strong></a><a class="next-chapter full"><strong class="full">Next Chapter</strong></a></div></div>`;
        buttons_markup = `<div class="chapter-sep"></div>` + buttons_markup;
    }
    let markup = `<div class="chapter-container" id="loaded-chap-${loaded_chapter}">${ch_title_markup}${chapter_content}${buttons_markup}</div>`;
    $("#page-in").append(markup);
    //$("#page-in").find(`#${ctitle.replace(/\s+/g, '-')}`).html(chapter_content);

    //reset scroll
    window.scrollTo(0,0); 

    //get toc
    let toc_all = await get_novel_toc_urls(novel_url, novel_html, _selectors);
    let retries = 0;
    while(toc_all[1].length <= 0){
        if(retries > 100){
            //tried 100 times to get chapters
            alert("the site provides this novel doesn't seem to be working properly.");
            break;
        }
        novel_html = await scrape(novel_url);
        toc_all = await get_novel_toc_urls(novel_url, novel_html, _selectors);
        retries++;
    }
    if(retries > 0){
        console.warn(`took ${retries + 1} attempts to get chapters`);
    }
    //console.log(toc_all)
    toc = toc_all[0];
    toc_urls = toc_all[1];
    //console.log(toc);
    let chapter_title = toc[toc_urls.indexOf(chapter_url)];

    //set progress
    let chap_index = toc_urls.indexOf(chapter_url);

    ci = chap_index;

    start_chapter = chap_index;
    let progress = (((chap_index) / (toc_urls.length - 1)) * 100);
    progress = (parseInt(progress * 100)) / 100;
    $(".reading_progress").text(`${progress}%`);

    if(logged_in){
        //enable button
        $("#library-button").css("cursor", "pointer");
        $("#mlibrary-button").css("cursor", "pointer");
        //add event listener to button
        $("#library-button").on('click tap', async function(){
            //check if trying to add or remove
            if($("#library-button .add").is(":visible")){
                //not in library
                let current_chapter_url = cu; //= await decryptCookie("chapter_url");
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
        $("#m-library-button").on('click tap', async function(){
            //console.log("sajkdasjlkd")
            //check if trying to add or remove
            if($("#m-library-button .add").is(":visible")){
                //not in library
                let current_chapter_url = cu; //= await decryptCookie("chapter_url");
                let res = await insert_novel(logged_in.uuid, novel_url, title, cover, current_chapter_url, toc_urls.indexOf(current_chapter_url));
                $("#m-library-button .add").hide();
                $("#m-library-button .remove").show();
                //change button
            }else{
                //in library
                let res = await delete_novel(logged_in.uuid, novel_url);
                //console.log(res)
                $("#m-library-button .add").show();
                $("#m-library-button .remove").hide();
                //change button
            }
        });
    }else{
        $("#library-button").css("cursor", "not-allowed");
        $("#m-library-button").css("cursor", "not-allowed");
    }

    //check for empty chapter end buttons{
    if(chap_index <= 0){
        //prev chapter empty
        $(".prev-chapter").removeClass("full").addClass("empty");
        $(".prev-chapter").find("strong").removeClass("full").addClass("empty");
    }
    else if(chap_index >= toc_urls.length - 1)
    {
        //next chap empty
        $(".next-chapter").removeClass("full").addClass("empty");
        $(".next-chapter").find("strong").removeClass("full").addClass("empty");
    }

    //update toc tab
    for (var i = 0; i < toc_urls.length; i++) {
        const toc_url = toc_urls[i];
        const toc_name = toc[i];
        const toc_num = i + 1;
        let js_markup = 
        `toc_goto($(this).attr('data-url'));`;
        let toc_markup = `<a title="${toc_name}" data-url="${toc_url}" onclick="${js_markup}">
                <i>${toc_num}</i><strong>${toc_name}</strong>
            </a>`;
        $("#table-of-contents").find(".panel").append(toc_markup);
    }
    //remove toc loader
    $("#table-of-contents").find(".loader").hide();

    //add scrolling event handlers
    if(autoscroll){
        var busy = false;
        $(window).on('scroll', async function () {
            //check scroll percent relative to focused element
            var s = $(window).scrollTop() ,
                d = $(document).height(),
                c = $(window).height();

            var sbHeight = window.innerHeight * (window.innerHeight / document.body.offsetHeight);

            var scrollHeight = $(document).height();
            var scrollpos_top = $(window).scrollTop();
            var scrollpos_middle = ($(window).height() / 2) + $(window).scrollTop();
            var scrollpos_bottom = $(window).height() + $(window).scrollTop();

            let position = $("#loaded-chap-" + focus_chapter).position();
            let height = $("#loaded-chap-" + focus_chapter).outerHeight(true);
            let top = position.top - 55 - 2;
            let bottom = top + height + 57 + 30 + 1;
            //console.log(scrollpos_bottom + " | " + bottom)

            var scrollpercent_top = ((scrollpos_top - top) / (bottom - top)) * 100;
            var scrollpercent_middle = ((scrollpos_middle - top) / (bottom - top)) * 100;
            var scrollpercent_bottom = ((scrollpos_bottom - top) / (bottom - top)) * 100;

            //calculate percentage gap before rounding
            let percentgap = Math.abs(scrollpercent_bottom - scrollpercent_middle);

            //use the gap to make an avg of the percentages
            let gap = (percentgap / 100) * height;
            var scrollpercent_avg = ((scrollpos_top - top) / (bottom - top - (gap * 2))) * 100;

            scrollpercent_top = (parseInt(scrollpercent_top * 100)) / 100;
            scrollpercent_middle = (parseInt(scrollpercent_middle * 100)) / 100;
            scrollpercent_bottom = (parseInt(scrollpercent_bottom * 100)) / 100;
            percentgap = (parseInt(percentgap * 100)) / 100;
            scrollpercent_avg = (parseInt(scrollpercent_avg * 100)) / 100;
            //console.log(`scrollpercent top ${scrollpercent_top}% | middle ${scrollpercent_middle}% | bottom ${scrollpercent_bottom}% | gap ${percentgap}%`);
            
            //change scrollbar
            //$("#scroll-bar").css("height", (100 - scrollpercent_avg) + "%");
            //$("#scroll-bar").css("top", (scrollpercent_avg) + "%");
            $("#scroll-bar").css("width", scrollpercent_avg + "%");
            
            if(!busy)
            if(scrollpercent_bottom >= 100 + (percentgap))
            {
                busy = true;
                //set next chapter (next chapter already loaded if 100+%)
                //console.log("set next chapter");
                focus_chapter++;

                //get chapter info
                let new_chapter_url = toc_urls[start_chapter + focus_chapter];
                let new_chapter_html = await scrape(new_chapter_url);
                let new_ctitle = await get_chapter_title(new_chapter_url, new_chapter_html, _selectors);

                //change chapter title
                $(".chapter_title").text(new_ctitle);
                $(".chapter_title").attr("title", new_ctitle);

                //change reading percent
                let new_chap_index = toc_urls.indexOf(new_chapter_url);
                let progress = (((new_chap_index) / (toc_urls.length - 1)) * 100);
                progress = (parseInt(progress * 100)) / 100;
                $(".reading_progress").text(`${progress}%`);

                //update novel in DB(if in library)
                if(logged_in){
                    //check if in DB
                    if(check_novel_in_library(logged_in.uuid, novel_url)){
                        //update novel
                        let res = await update_novel(logged_in.uuid, novel_url, new_chapter_url, new_chap_index);
                        //console.log(res)
                    }
                }
                ci = new_chap_index;

                //change chapter cookie
                //var new_chapter_url_aes = await encrypt(new_chapter_url);
                let old_url = window.location.href;
                let new_url = old_url.replace(`cu=${cu}`, `cu=${new_chapter_url}`);
                window.history.pushState({}, null, new_url);
                cu = new_chapter_url;
                //await encryptCookie("chapter_url", new_chapter_url, 100); 

                busy = false;
            }
            else if(scrollpercent_bottom >= 50)//check if scrolled through most chapter
            {
                busy = true;
                //check if new chapter needs to be loaded in
                if(focus_chapter == loaded_chapter){
                    //load in new chapter
                    //console.log("load new chapter");
                    loaded_chapter++;
                    //get new chapter content/info
                    let next_chapter_url = toc_urls[start_chapter + loaded_chapter];
                    let next_chapter_html = await scrape(next_chapter_url);
                    let next_ctitle = await get_chapter_title(next_chapter_url, next_chapter_html, _selectors);
                    let next_chapter_content = await get_chapter_content(next_chapter_url, next_chapter_html, _selectors);
                    //console.log(next_chapter_content)

                    //clean up content
                    next_chapter_content = $("<div></div>").append(next_chapter_content);
                    $(next_chapter_content).find("*").each(function () {
                        const child = this;
                        var inner = $(child).html().replace(/\s+/g, ' ').trim();

                        var next_ctitle1 = next_ctitle.replace(/\s+/g, ' ').trim();
                        //console.log(next_ctitle1)
                        if (inner == "" || inner == null) {
                            //console.log($(next_chapter_content).find(child).get(0))
                            $(next_chapter_content).find(child).remove();
                        }
                        else if (inner.toLowerCase().includes(next_ctitle1.toLowerCase())) {
                            //console.log($(next_chapter_content).find(child).get(0))
                            $(next_chapter_content).find(child).remove();
                        }
                    });
                    //console.log(next_chapter_content.get(0))

                    //create next chapter container markup
                    next_chapter_content = $(next_chapter_content).html();
                    next_chapter_content = decode_unicode(next_chapter_content);
                    let next_ch_title_markup = `<div class="chapter-sep"></div><div class="ch-title"><h3>${next_ctitle}</h3></div>`;
                    let next_container_markup = `<div class="chapter-container" id="loaded-chap-${loaded_chapter}">${next_ch_title_markup}${next_chapter_content}</div>`;
                    //append new markup
                    $("#page-in").append(next_container_markup);

                }            
                busy = false;
            }
            else if(scrollpercent_top <= 0 - (percentgap))//check if scrolled back to previous chapter
            {
                busy = true;
                //go back 1 chapter
                //console.log("set previous chapter");
                focus_chapter--;

                //get chapter info
                let new_chapter_url = toc_urls[start_chapter + focus_chapter];
                let new_chapter_html = await scrape(new_chapter_url);
                let new_ctitle = await get_chapter_title(new_chapter_url, new_chapter_html, _selectors);

                //change chapter title
                $(".chapter_title").text(new_ctitle);
                $(".chapter_title").attr("title", new_ctitle);

                //change reading percent
                let new_chap_index = toc_urls.indexOf(new_chapter_url);
                let progress = (((new_chap_index) / (toc_urls.length - 1)) * 100);
                progress = (parseInt(progress * 100)) / 100;
                $(".reading_progress").text(`${progress}%`);

                //update novel in DB(if in library)
                if(logged_in){
                    //check if in DB
                    if(check_novel_in_library(logged_in.uuid, novel_url)){
                        //update novel
                        let res = await update_novel(logged_in.uuid, novel_url, new_chapter_url, new_chap_index);
                        //console.log(res)
                    }
                }
                ci = new_chap_index;

                //change chapter cookie
                //var new_chapter_url_aes = await encrypt(new_chapter_url);
                let old_url = window.location.href;
                let new_url = old_url.replace(`cu=${cu}`, `cu=${new_chapter_url}`);
                window.history.pushState({}, null, new_url);
                cu = new_chapter_url;
                //await encryptCookie("chapter_url", new_chapter_url, 100); 
                
                busy = false;
            }
            /*
            //round percent and change size of scrollbar
            scrollPercent = (parseInt(scrollPercent * 100)) / 100;
            $("#scroll-bar").css("height", (100 - scrollPercent) + "%");
            $("#scroll-bar").css("top", (scrollPercent) + "%");
            */

            //check if scrolled back
            /*
            if(!busy)
            if (scrollPercent >= 92 ) {
                if(start_chapter + loaded_chapter < toc_urls.length)
                {
                    //console.log("focus " + focus_chapter);
                    //console.log("loaded " + loaded_chapter);
                    focus_chapter++;
                    busy = true;

                    //load in new chapter
                    var next_chapter_url = toc_urls[start_chapter + loaded_chapter];
                    //load in new chapter title
                    let next_chapter_html = await scrape(next_chapter_url);
                    let next_ctitle = await get_chapter_title(next_chapter_url, next_chapter_html);

                    //check if new chapter needs to be loaded in
                    if(loaded_chapter == focus_chapter - 1){
                        loaded_chapter++;
                        //load in new chapter content
                        let next_chapter_content = await get_chapter_content(next_chapter_url, next_chapter_html);

                        //remove chapter title from chapter content
                        next_chapter_content = $("<div></div>").append(next_chapter_content);
                        $(next_chapter_content).children().each(function () {
                            const child = this;
                            var inner = $(child).html().replace(/\s+/g, ' ').trim();

                            var next_ctitle1 = next_ctitle.replace(/\s+/g, ' ').trim();
                            if (inner == "" || inner == null) {
                                $(next_chapter_content).find(child).remove();
                            }
                            else if (inner.toLowerCase().includes(next_ctitle1.toLowerCase())) {
                                $(next_chapter_content).find(child).remove();
                            }
                        })
                        //create next chapter container markup
                        next_chapter_content = $(next_chapter_content).html();
                        next_chapter_content = decode_unicode(next_chapter_content);
                        let next_ch_title_markup = `<div class="chapter-sep"></div><div class="ch-title"><h3>${next_ctitle}</h3></div>`;
                        //append new markup
                        $("#page-in").append(`<div class="chapter-container" id="loaded-chap-${loaded_chapter}">${next_ch_title_markup}${next_chapter_content}</div>`);
                    }
                    //change chapter title
                    $(".chapter_title").text(next_ctitle);
                    $(".chapter_title").attr("title", next_ctitle);

                    //change reading percent
                    let next_chap_index = toc_urls.indexOf(next_chapter_url);
                    let progress = (((next_chap_index) / toc_urls.length) * 100);
                    progress = (parseInt(progress * 100)) / 100;
                    $(".reading_progress").text(`${progress}%`);
                    //console.log(`${next_chap_index} / ${toc_urls.length}`);
                    busy = false;

                    //update chapter url cookie
                    var next_chapter_url_aes = await encrypt(next_chapter_url);
                    setCookie("chapter_url", next_chapter_url_aes, 100);
                }
            }
            else if(scrollPercent <= -80){
                busy = true;
                //go back 1 chapter
                console.log("scroll back")
                //change chapter title

                //change reading percent

                //update chapter url cookie

                busy = false;
            }*/
        });
    }

    //add next/previous chapter click events
    if(!autoscroll){
        $("#page").on('click', '.prev-chapter', async function(){
            //change to the previous chapter
            if(chap_index >= 1)
            {
                //load previous chapter
                chap_index--;
                //get new chapter content/info
                let next_chapter_url = toc_urls[chap_index];
                let next_chapter_html = await scrape(next_chapter_url);
                let next_ctitle = await get_chapter_title(next_chapter_url, next_chapter_html, _selectors);

                //update titles and progress
                //change chapter title
                $(".chapter_title").text(next_ctitle);
                $(".chapter_title").attr("title", next_ctitle);

                //change reading percent
                let next_chap_index = toc_urls.indexOf(next_chapter_url);
                let progress = (((next_chap_index) / (toc_urls.length - 1)) * 100);
                progress = (parseInt(progress * 100)) / 100;
                $(".reading_progress").text(`${progress}%`);

                //update novel in DB(if in library)
                if(logged_in){
                    //check if in DB
                    if(check_novel_in_library(logged_in.uuid, novel_url)){
                        //update novel
                        let res = await update_novel(logged_in.uuid, novel_url, next_chapter_url, next_chap_index);
                        //console.log(res)
                    }
                }
                ci = next_chap_index;

                //change chapter cookie
                //var new_chapter_url_aes = await encrypt(new_chapter_url);
                let old_url = window.location.href;
                let new_url = old_url.replace(`cu=${cu}`, `cu=${next_chapter_url}`);
                window.history.pushState({}, null, new_url);
                cu = next_chapter_url;
                //await encryptCookie("chapter_url", next_chapter_url, 100); 

                //change content
                let next_chapter_content = await get_chapter_content(next_chapter_url, next_chapter_html, _selectors);

                //clean up content
                next_chapter_content = $("<div></div>").append(next_chapter_content);
                $(next_chapter_content).find("*").each(function () {
                    const child = this;
                    var inner = $(child).html().replace(/\s+/g, ' ').trim();

                    var next_ctitle1 = next_ctitle.replace(/\s+/g, ' ').trim();
                    if (inner == "" || inner == null) {
                        $(next_chapter_content).find(child).remove();
                    }
                    else if (inner.toLowerCase().includes(next_ctitle1.toLowerCase())) {
                        $(next_chapter_content).find(child).remove();
                    }
                });

                //create next chapter container markup
                next_chapter_content = $(next_chapter_content).html();
                next_chapter_content = decode_unicode(next_chapter_content);
                let next_ch_title_markup = `<div class="ch-title"><h3>${next_ctitle}</h3></div>`;
                let buttons_markup = ``;
                if(!autoscroll){
                    buttons_markup = `<div class="chapter-end-buttons"><div class="wrapper font1"><a class="prev-chapter full"><strong class="full">Prev Chapter</strong></a><a class="next-chapter full"><strong class="full">Next Chapter</strong></a></div></div>`;
                    buttons_markup = `<div class="chapter-sep"></div>` + buttons_markup;
                }
                let next_container_markup = `<div class="chapter-container" id="loaded-chap-${loaded_chapter}">${next_ch_title_markup}${next_chapter_content}${buttons_markup}</div>`;
                //append new markup
                $("#page-in").html(next_container_markup);

                //check for empty chapter end buttons{
                if(next_chap_index <= 0){
                    //prev chapter empty
                    $(".prev-chapter").removeClass("full").addClass("empty");
                    $(".prev-chapter").find("strong").removeClass("full").addClass("empty");
                }
                else if(next_chap_index >= toc_urls.length - 1)
                {
                    //next chap empty
                    $(".next-chapter").removeClass("full").addClass("empty");
                    $(".next-chapter").find("strong").removeClass("full").addClass("empty");
                }

                //reset scroll
                window.scrollTo(0,0);
            }
            else
            {
                console.log("min")
            }
        });
        $("#page").on('click', '.next-chapter', async function(){
            //change to the next chapter
            if(chap_index < toc_urls.length - 1)
            {
                //load previous chapter
                chap_index++;
                //get new chapter content/info
                let next_chapter_url = toc_urls[chap_index];
                let next_chapter_html = await scrape(next_chapter_url);
                let next_ctitle = await get_chapter_title(next_chapter_url, next_chapter_html, _selectors);

                //update titles and progress
                //change chapter title
                $(".chapter_title").text(next_ctitle);
                $(".chapter_title").attr("title", next_ctitle);

                //change reading percent
                let next_chap_index = toc_urls.indexOf(next_chapter_url);
                let progress = (((next_chap_index) / (toc_urls.length - 1)) * 100);
                progress = (parseInt(progress * 100)) / 100;
                $(".reading_progress").text(`${progress}%`);

                //update novel in DB(if in library)
                if(logged_in){
                    //check if in DB
                    if(check_novel_in_library(logged_in.uuid, novel_url)){
                        //update novel
                        let res = await update_novel(logged_in.uuid, novel_url, next_chapter_url, next_chap_index);
                        //console.log(res)
                    }
                }
                ci = next_chap_index;
                
                //change chapter cookie
                //var new_chapter_url_aes = await encrypt(new_chapter_url);
                let old_url = window.location.href;
                let new_url = old_url.replace(`cu=${cu}`, `cu=${next_chapter_url}`);
                window.history.pushState({}, null, new_url);
                cu = next_chapter_url;
                //await encryptCookie("chapter_url", next_chapter_url, 100); 

                //change content
                let next_chapter_content = await get_chapter_content(next_chapter_url, next_chapter_html, _selectors);

                //clean up content
                next_chapter_content = $("<div></div>").append(next_chapter_content);
                $(next_chapter_content).find("*").each(function () {
                    const child = this;
                    var inner = $(child).html().replace(/\s+/g, ' ').trim();

                    var next_ctitle1 = next_ctitle.replace(/\s+/g, ' ').trim();
                    if (inner == "" || inner == null) {
                        $(next_chapter_content).find(child).remove();
                    }
                    else if (inner.toLowerCase().includes(next_ctitle1.toLowerCase())) {
                        $(next_chapter_content).find(child).remove();
                    }
                });

                //create next chapter container markup
                next_chapter_content = $(next_chapter_content).html();
                next_chapter_content = decode_unicode(next_chapter_content);
                let next_ch_title_markup = `<div class="ch-title"><h3>${next_ctitle}</h3></div>`;
                let buttons_markup = ``;
                if(!autoscroll){
                    buttons_markup = `<div class="chapter-end-buttons"><div class="wrapper font1"><a class="prev-chapter full"><strong class="full">Prev Chapter</strong></a><a class="next-chapter full"><strong class="full">Next Chapter</strong></a></div></div>`;
                    buttons_markup = `<div class="chapter-sep"></div>` + buttons_markup;
                }
                let next_container_markup = `<div class="chapter-container" id="loaded-chap-${loaded_chapter}">${next_ch_title_markup}${next_chapter_content}${buttons_markup}</div>`;
                //append new markup
                $("#page-in").html(next_container_markup);

                //check for empty chapter end buttons{
                if(next_chap_index <= 0){
                    //prev chapter empty
                    $(".prev-chapter").removeClass("full").addClass("empty");
                    $(".prev-chapter").find("strong").removeClass("full").addClass("empty");
                }
                else if(next_chap_index >= toc_urls.length - 1)
                {
                    //next chap empty
                    $(".next-chapter").removeClass("full").addClass("empty");
                    $(".next-chapter").find("strong").removeClass("full").addClass("empty");
                }

                //reset scroll
                window.scrollTo(0,0);
            }
            else
            {
                console.log("max")
            }
        });
    }
    /*$(".chapter-container p").hover(function(){
        $(this).css("background-color", "black")
    }, function(){
        $(this).css("background-color", "inherit")
    });*/

    //remove loading icon
});

function decode_unicode(text) {
    text = text.replaceAll("\\u003c", "&lt;");
    text = text.replaceAll("\\u003e", "&gt;");
    return text
 }

 function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function get_base_url(_url) {
    //remove http
    var url = _url.toLowerCase().replace("https://", "");
    url = url.replace("http://", "");

    url = url.replace("//", "");
    //remove after .com, .net, etc
    url = url.substring(0, url.indexOf('/'));
    //remove prefifx
    if(url.split('.').length - 1 >= 2){
        url = url.substring(url.indexOf('.') + 1)
    }
    //console.log(url)
    return url;
}

async function toc_goto(chapter_url){
    //set db
    //update novel in DB(if in library)
    let next_chap_index = toc_urls.indexOf(chapter_url);
    if(logged_in){
        //check if in DB
        if(check_novel_in_library(logged_in.uuid, nu)){
            //update novel
            let res = await update_novel(logged_in.uuid, nu, chapter_url, next_chap_index);
            //console.log(res)
        }
    }
    //change page
    let old_url = window.location.href;
    let new_url = old_url.replace(`cu=${cu}`, `cu=${chapter_url}`);
    window.location.href = new_url;
    //cu = chapter_url;
    //await encryptCookie('chapter_url', chapter_url, 100);
    //location.reload();
}

/*const toc_goto = async (...args) => {
    let result = await navigate(args);
    console.log(result);
    // do something
}*/
  