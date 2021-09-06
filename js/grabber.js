var blacklisted_content = [
    "If you find any errors ( broken links, non-standard content, etc.. ), Please let us know &lt; report chapter &gt; so we can fix it as soon as possible.",
    "ChapterMid();",
    "lightnovelworld[.]com",
    "If you find any errors ( broken links, non-standard content, etc.. ), Please let us know < report chapter > so we can fix it as soon as possible.",
]
var whitelisted_tags = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "li",
    "ul",
    "em",

    //"table",
    //"thead",
    //"tr",
    //"th"
]
var blacklisted_tags = [
    "pirate",
    "script",
    "iframe",
    "img"
]
async function get_novel_chapter_count(_url, _html, _selectors){
    try{
        var toc_count = 0;
        var hrefs = [];

        var url = await get_base_url(_url);
        if(url == "webnovel.com"){
            _url += "/catalog";
            _html = await scrape(_url);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        //find chapter urls based on site
        //check for paginator
        if(_selectors.paginator){
            //go through all pages
            var cont = true;
            var page = 1;
            var page_url = _url;
            
            while(cont) {
                //var t0 = performance.now();
                var page_html = await scrape(page_url);
                //var t1 = performance.now();
                //console.log(`time in loop for page(${page}) ${ (t1 - t0) / 1000} s | ${t1 - t0} ms`);
                const page_doc = parser.parseFromString(page_html, "text/html");
                const chapter_list = $(page_doc).find(_selectors.chapter_list);
                var page_toc = [];
                var chapter_titles = [];
                let count_a = $(chapter_list).find("a[href*='/']").length;
                let first_url = $($(chapter_list).find("a[href*='/']")[0]).attr("href");
                /*.each(function(){
                    var x = this;
                    let href = $(x).attr("href");
                    if(href)
                    if (href.toLowerCase().includes("chapter") || href.toLowerCase().includes("chap") || href.toLowerCase().includes("volume") || href.toLowerCase().includes("vol")){
                        if(href.includes(url))
                            page_toc.push(href);
                        else
                            page_toc.push("https://" + url + href);

                        var title = $(x).find(_selectors.chapter_titles).html();
                        chapter_titles.push(title);
                    }
                });*/

                var old_page = hrefs.includes(first_url);
                if (!old_page) {
                    toc_count += count_a;
                    hrefs.push(first_url);
                }
                else{
                    cont = false;
                    break;
                }
                //get next page url
                var paginator_next = $(page_doc).find(_selectors.paginator_next)[0];
                var new_page_url = "";
                $(paginator_next).find("a").each(function(){
                    const a = this;
                    let href = $(a).attr("href");
                    if(href)
                    if(href.includes(url)){
                        page_url = href;
                    }
                    else{
                        page_url = "https://" + url + href;
                    }
                });
                /*if(new_page_url.toLowerCase() != page_url.toLowerCase()){
                    //new page
                    toc_count += count_a;
                    page_url = new_page_url;
                    //hrefs.push(first_url);
                }
                else{
                    cont = false;
                    break;
                }*/
                page++;
            }
            
            //console.log(toc)
        }
        else{
            //get all base urls
            const chapter_list = $(doc).find(_selectors.chapter_list);
            //console.log(chapter_list.html());
            let count_a = $(chapter_list).find("a[href*='/']").length;
            if(url == "webnovel.com"){
                //remove locked chapters
                let count_svg = $(chapter_list).find("a[href*='/'] svg").length;
                //console.log(`count a = ${count_a}, count svg = ${count_svg} count total = ${count_a - count_svg}`);
                count_a -= count_svg;
            }
            /*.each(function (){
                const x = this;
                let href = $(x).attr("href");
                var title = $(x).text();
                if(_selectors.chapter_titles)
                    title = $(x).find(_selectors.chapter_titles).html();
                //console.log(title + " | " + href)
                if(title && href){
                    //check if chapter locked
                    //body > div > div.g_wrap.det-con.mb32.j_catalog_wrap > div.fs16.det-con-ol.oh.j_catalog_list > div:nth-child(2) > ol > li:nth-child(234) > a > svg
                    if(url != "webnovel.com" || $(x).find("svg").length <= 0){
                        if(href.includes(url)){
                            if(href.includes("http"))
                                toc_urls.push(href);
                            else{
                                let y = "https://" + href.substring(href.indexOf(url))
                                toc_urls.push(y);
                            }
                        }       
                        else
                            toc_urls.push("https://" + url + href);

                        toc.push(title);
                    }
                }
            });*/
            toc_count = count_a;
        }

        return toc_count;
    }
    catch(ex){
        console.warn(ex);
    }
}
async function get_novel_toc_urls(_url, _html, _selectors) {
    try{
        var toc_urls = [];
        var toc = [];

        var url = await get_base_url(_url);
        if(url == "webnovel.com"){
            _url += "/catalog";
            _html = await scrape(_url);
        }
        if(url == "readnovelfull.com"){
            if(_url.includes("#")){
                _url = _url.split("#")[0] + '#tab-chapters-title';
            }else{
                _url += '#tab-chapters-title';
            }
            _html = await scrape(_url);
        }

        //console.log(_html);
        const baseurl = await get_base_url(_url);

        let json = await load_json("./json/selectors.json");

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        //find chapter urls based on site
        if(_selectors.paginator){
            //go through all pages
            var cont = true;
            var page = 1;
            var page_url = _url;
            while(cont) {
                var page_html = await scrape(page_url);
                //console.log(page_html)
                const page_doc = parser.parseFromString(page_html, "text/html");
                const chapter_list = $(page_doc).find(_selectors.chapter_list);
                //console.log(chapter_list.get(0))
                var page_toc = [];
                var chapter_titles = [];
                $(chapter_list).find("*").each(function(){
                    var x = this;
                    //console.log(x)
                    let href = $(x).attr("href");
                    //console.log(href)
                    if(href){
                    //if (href.toLowerCase().includes("chapter") || href.toLowerCase().includes("chap") || href.toLowerCase().includes("volume") || href.toLowerCase().includes("vol")){
                        if(href.includes(url))
                            page_toc.push(href);
                        else
                            page_toc.push("https://" + url + href);

                        var title = $(x).find(_selectors.chapter_titles).html();
                        if(!title){
                            title = $(x).text();
                        }
                        if(title){
                            title = title.replaceAll("\n", "");
                            title = title.replaceAll("\t", "");
                            title = title.trim();
                        }
                        chapter_titles.push(title);
                    }
                });
                var old_page = page_toc.every((r) => {
                    return toc_urls.indexOf(r) !== -1;
                });
                //console.log(page_toc);
                //console.log(chapter_titles)
                if (!old_page) {
                    toc_urls = toc_urls.concat(page_toc);
                    toc = toc.concat(chapter_titles);
                }
                else{
                    cont = false;
                    break;
                }
                //get next page url
                var paginator_next = $(page_doc).find(_selectors.paginator_next)[0];
                //console.log(paginator_next)
                if($(paginator_next).children().length > 0){
                    $(paginator_next).find("*").each(function(){
                        const a = this;
                        let href = $(a).attr("href");
                        if(href)
                        if(href.includes(url)){
                            page_url = href;
                        }
                        else{
                            //check if chapters are from diff source
                            let burl = get_base_url(page_url);
                            if(burl){
                                let _selectors = json.find(x => x.domain == burl);
                                if(!_selectors){
                                    page_url = "https://" + url + href;
                                    //console.log(1)
                                }else{
                                    page_url = "https://" + burl + href;
                                    //console.log(2)
                                }
                            }else{
                                page_url = "https://" + url + href;
                                //console.log(3)
                            }
                        }
                        if(baseurl == "freenovelsreadonline.com"){
                            if(page_url.includes('?page=')){
                                page_url = page_url.replace('?page=', "/")
                            }
                        }
                        //console.log(page_url)
                    });
                }else{
                    $(paginator_next).each(function(){
                        const a = this;
                        let href = $(a).attr("href");
                        if(href)
                        if(href.includes(url)){
                            page_url = href;
                        }
                        else{
                            //check if chapters are from diff source
                            let burl = get_base_url(page_url);
                            if(burl){
                                let _selectors = json.find(x => x.domain == burl);
                                if(!_selectors){
                                    page_url = "https://" + url + href;
                                    //console.log(1)
                                }else{
                                    page_url = "https://" + burl + href;
                                    //console.log(2)
                                }
                            }else{
                                page_url = "https://" + url + href;
                                //console.log(3)
                            }
                        }
                        if(baseurl == "freenovelsreadonline.com"){
                            if(page_url.includes('?page=')){
                                page_url = page_url.replace('?page=', "/")
                            }
                        }
                        //console.log(page_url)
                    });
                }
                page++;
            }
            //console.log(toc)
        }
        else{
            //get all base urls
            const chapter_list = $(doc).find(_selectors.chapter_list);
            //console.log(chapter_list.get(0))
            //console.log(chapter_list.html());
            $(chapter_list).find("a").each(function (){
                const x = this;
                let href = $(x).attr("href");
                var title = $(x).text();
                if(_selectors.chapter_titles)
                    title = $(x).find(_selectors.chapter_titles).html();
                //console.log(title + " | " + href)
                if(title && href){
                    //check if chapter locked
                    if(url != "webnovel.com" || $(x).find("svg").length <= 0){
                        if(href.includes(url)){
                            if(href.includes("http"))
                                toc_urls.push(href);
                            else{
                                let y = "https://" + href.substring(href.indexOf(url))
                                toc_urls.push(y);
                            }
                        }       
                        else{
                            //check if chapters are from diff source
                            let burl = get_base_url(href);
                            //console.log(burl)
                            if(burl){
                                let _selectors = json.find(x => x.domain == burl);
                                if(!_selectors){
                                    href = "https://" + url + href;
                                    //console.log(1)
                                }else{
                                    //href = "https://" + burl + href;
                                    //console.log(2)
                                }
                            }else{
                                href = "https://" + url + href;
                                //console.log(2)
                            }
                            toc_urls.push(href);
                        }

                        title = title.replaceAll("\n", "");
                        title = title.replaceAll("\t", "");

                        toc.push(title.trim());
                    }
                }
            });
            if(_selectors.use_in_chapter_paginator){
                
                let start_url = toc_urls[toc_urls.length-1]
                let curr_url = start_url;
                while(curr_url != ""){
                    let page_html = await scrape(curr_url);

                    const page_parser = new DOMParser();
                    const page_doc = page_parser.parseFromString(page_html, "text/html");

                    //get title
                    let title = await get_chapter_title(start_url, page_html, _selectors);
                    
                    //get next chapter url
                    let next_url = $(page_doc).find(_selectors.in_page_paginator).attr("href");
                    if(next_url){
                        if(!next_url.includes(baseurl)){
                            if(next_url.split('')[0] != "/"){
                                next_url = "/" + next_url;
                            }
                            next_url = baseurl + next_url;
                        }
                        curr_url = next_url;
                    }else{
                        curr_url = "";
                    }
                    toc.push(title.trim());
                    toc_urls.push(next_url);
                }
            }
        }        
        if(_selectors.use_in_chaper_select){
            var chap_url = toc_urls[0];
            var chap_html = await scrape(chap_url);
            let chap_baseurl = get_base_url(chap_url);
            let _chap_selectors = json.find(x => x.domain == chap_baseurl);
            //console.log(page_html)
            const chap_doc = parser.parseFromString(chap_html, "text/html");

            const chapter_list = $(chap_doc).find(_chap_selectors.in_chapter_select);
            let new_toc = [];
            let new_toc_urls = [];
            $(chapter_list).find("*").each(function (){
                const x = this;
                let href = $(x).attr("value");
                //console.log(href)
                var title = $(x).text();
                if(_selectors.chapter_titles)
                    title = $(x).find(_selectors.chapter_titles).html();
                //console.log(title + " | " + href)
                if(title && href){
                    //check if chapter locked
                    if(url != "webnovel.com" || $(x).find("svg").length <= 0){
                        if(href.includes(url)){
                            if(href.includes("http"))
                                toc_urls.push(href);
                            else{
                                let y = "https://" + href.substring(href.indexOf(url))
                                toc_urls.push(y);
                            }
                        }       
                        else{
                            //check if chapters are from diff source
                            let burl = get_base_url(href);
                            //console.log(burl)
                            if(burl){
                                let _selectors = json.find(x => x.domain == burl);
                                if(!_selectors){
                                    href = "https://" + url + href;
                                }else{
                                    //href = "https://" + burl + href;
                                }
                            }else{
                                href = "https://" + url + href;
                            }

                            if(chap_baseurl == "wuxiaworldsite.co"){
                                href = href.replaceAll("-chapter-", "/chapter-")
                            }
                            new_toc_urls.push(href);
                        }

                        title = title.replaceAll("\n", "");
                        title = title.replaceAll("\t", "");

                        new_toc.push(title.trim());
                    }
                }
            });
            if(new_toc.length > toc.length && new_toc_urls.length > toc_urls.length){
                toc = new_toc;
                toc_urls = new_toc_urls;
            }
        }

        if(_selectors.reverse_chapters){
            //reverse toc order
            toc = toc.reverse();
            toc_urls = toc_urls.reverse();
        }


        return [toc, toc_urls];
    }
    catch(ex){
        console.warn(ex);
    }
}

async function get_novel_title(_url, _html, _selectors) {
    try{
        if(!_selectors.title)
            return "N/A";
        var url = await get_base_url(_url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        const body = doc.body;
        //find chapter title based on site
        let title = $(doc).find(_selectors.title)[0];
        $(title).children().remove();
        title = $(title).html();

        //title = title.replaceAll( /(<([^>]+)>)/ig, '');
        return title.trim();
    }
    catch(ex){
        console.warn(ex);
    }
}

async function get_novel_author(_url, _html, _selectors) {
    try{
        if(!_selectors.author)
            return "N/A";
        var authors = [];
        var url = await get_base_url(_url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        const body = doc.body;
        //find chapter author based on site
        var author_a = $(doc).find(_selectors.author);
        //console.log(author_a.get(0));
        author_a.each(function () {
            const a = this;
            if(/\S/.test($(a).text()) && !$(a).text().toLowerCase().includes('author'))
                authors.push($(a).text().trim());
        });
        return authors.join(', ');
    }
    catch(ex){
        console.warn(ex);
    }
}

async function get_novel_genres(_url, _html, _selectors) {
    try{
        if(!_selectors.genres)
            return "N/A";
        var genres = [];
        var url = await get_base_url(_url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        const body = doc.body;
        //find chapter genres based on site
        var genres_a = $(doc).find(_selectors.genres);
        //console.log(genres_a.get(0))
        //console.log(genres_a.get(0))
        $(genres_a).find("*").each(function(){
            const genre = this;
            let text = $(genre).text().replaceAll("#", "");
            if(text != "")
            if(!text.toLowerCase().includes("genre"))
                genres.push(text.replace(/\s+/g, ' ').trim());
        })
        //console.log(genres)
        genres = [...new Set(genres)];
        var genres = genres.filter(function (el) {
            return el != "";
        });
        //console.log(genres)
        //console.log(genres);
        return genres.join(", ");
    }
    catch(ex){
        console.warn(ex);
    }
}

async function get_novel_summary(_url, _html, _selectors) {
    try{
        if(!_selectors.summary)
            return "N/A";
        var summary = "";

        var url = await get_base_url(_url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        const body = doc.body;
        //find chapter summary based on site
        var desc = $(doc).find(_selectors.summary)[0];
        $(desc).find("a").remove();
        $(desc).find("ul").remove();
        $(desc).find("*").removeAttr("style");
        $(desc).find("*").removeAttr("class");

        summary = $(desc).html();


        return summary.trim();
    }
    catch(ex){
        console.warn(ex);
    }
}

async function get_novel_cover(_url, _html, _selectors) {
    try{
        if(!_selectors.cover)
            return "N/A";
        var cover_url = "";

        var url = await get_base_url(_url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        const body = doc.body;
        //find chapter cover based on site
        var cover = $(body).find(_selectors.cover)[0];
        //console.log($(body).find(_selectors.cover))
        //console.log(cover)
        //console.log(cover)
        var src = $(cover).attr("src");

        if(url == "panda-novel.com"){
            //console.log(1)
            src = $(cover).attr("style").split("url(")[1].split(')')[0];
        }

        if(url == "novelgate.net"){
            src = $(cover).attr("data-original");
        }
        //console.log(src)
        

        if(!src || url == "noveltrench.com" || url == "novelhd.com"){
            src = $(cover).attr("data-src");
        }

        if(url == "supernovel.net"){
            src = $(cover).attr("data-src");
            src = "https://supernovel.net" + src.split("https://supernovel.net")[1];
        }

        var temp = await get_base_url(src);

        if(src && temp.split('.').length >= 2){
            cover_url = src;
        }else{
            cover_url = "https://" + url + src;
        }
        //cover_url = src;
        //console.log(cover_url)
        while(cover_url.split("")[0] == "/"){
            cover_url = cover_url.substr(1);
            //console.log(cover_url)
        }

        if(!cover_url.includes('https://')){
            cover_url = "https://" + cover_url;
        }
        

        //console.log(cover_url)
        return cover_url;
    }
    catch(ex){
        console.warn(ex);
    }
}

function get_base_url(_url) {
    //remove http
    if(!_url)
        return "";
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

async function remove_url_prefix(_url){
    let baseurl = await get_base_url(_url);

    //remove http
    var url = _url.toLowerCase().replace("https://", "");
    url = url.replace("http://", "");

    url = "https://" + baseurl + url.substring(url.indexOf('/'));
    return url;
}

async function get_chapter_content(_url, _html, _selectors) {
    try{
        //console.log(_html);
        var chapter_content = "";
        var url = await get_base_url(_url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        const body = doc.body;
        //find chapter content based on site
        chapter_content = $(doc).find(_selectors.chapter_content);
        //console.log(chapter_content.text())
        //remove all scripts
        //chapter_content.find("script").remove();
        //remove ins elements
        //chapter_content.find("ins").remove();

        //place content in tags if not already in them
        /*var a = $(chapter_content).first().contents().filter(function() {
            return this.nodeType == 3;
        }).text();
        console.log(a)*/
        //.replace(/\s+/g, ' ').trim();

        //remove blacklisted tags
        /*.forEach(bltag => {
            chapter_content.find(bltag).remove();
        });*/
        if(_selectors.standalone_text)
        {
            var newhtml = $("<div></div>");

            //fix <br><br>
            chapter_content.html(chapter_content.html().replaceAll("<br><br>", "<br>"))

            var textArray = $(chapter_content).contents().filter(function() { return (this.nodeType === 3 )}).get();
            textArray = $.map(textArray, function(e) {
                var text = $.trim(e.textContent.replace(/\n/g, ""));
                return (text)? text : null;
            });
            //console.log(textArray)
            //var newhtml = "";
            if($(chapter_content).html().includes("<br>")){
                //console.log(1)
                $(chapter_content).html().split("<br>").forEach(block => {
                    if(url == "supernovel.net"){
                        block = block.replaceAll(`\\'`, `'`);
                        block = block.replaceAll(`\\"`, `"`);
                    }
                    /*if(block.split(``)[0] == `"`){
                        block = block.slice(1);
                    }
                    if(block.split(``)[block.split(``).length - 1] == `"`){
                        block = block.slice(0, block.split(``).length);
                    }*/

                    block = block.trim();

                    var p = $("<p></p>");
                    p = p.html(block);
                    //remove blacklisted tags
                    p.find("*").each(function(){
                        var a = this;
                        let tag = $(a).prop("tagName");
                        if(!whitelisted_tags.includes(tag.toLowerCase())){
                            $(a).remove();
                        }
                    })
                    //console.log(p.get(0))
                    newhtml = newhtml.append(p)
                });
                newhtml = newhtml.html();
            }else{
                console.log(2)
                textArray.forEach(text => {
                    if(url == "supernovel.net"){
                        text = text.replaceAll(`\\'`, `'`);
                        text = text.replaceAll(`\\"`, `"`);
                        block = block.trim();
                    }

                    var p = $("<p></p>");
                    p = p.text(text);
                    //console.log(p.get(0))
                    newhtml = newhtml.append(p);
                });
                newhtml = newhtml.html();
                //console.log(url)
            }
            //console.log(newhtml)
            return newhtml;
        }
        
        //remove blacklisted content
        let set = $("<div></div>");
        chapter_content.find("*").each(function(){
            const child = this;
            var inner = $(child).text().replace(/\s+/g, ' ').trim();
            /*if(url == "lightnovelworld.com"){
                if($(child).hasClass())
                {
                    chapter_content.find(child).remove();
                }
            }*/
            let tag = $(child).prop("tagName");
            //console.log(tag)
            if(whitelisted_tags.includes(tag.toLowerCase())){
                //console.log(child)
                //console.log(child)
                $(child).find(blacklisted_tags.join(", ")).remove();
                set.append(child);
            }
            /*chapter_content = set;
            //console.log(inner)
            blacklisted_content.forEach(bl => {
                if(inner.includes(bl.replace(/\s+/g, ' ').trim())){
                    chapter_content.find(child).remove();
                }
            });*/
        });
        //console.log(set.get(0))
        $(set).find("*").each(function(){
            $(this).attr("style", "")
        });
        //get output html
        var html = set.html();
        //console.log(html);
        //remove comements
        //html = html.replaceAll(/<\!--.*?-->/g, "");
        //console.log(html);*/
        

        //console.log(html)
        return html;
    }
    catch(ex){
        console.warn(ex);
    }
}

async function get_chapter_title(_url, _html, _selectors){
    try{
        var chapter_title = "";

        var url = await get_base_url(_url);

        const parser = new DOMParser();
        const doc = parser.parseFromString(_html, "text/html");
        const body = doc.body;
        //find chapter cover based on site
        chapter_title = $(body).find(_selectors.chapter_title)//.text();
        if(chapter_title.length > 1){
            chapter_title = chapter_title[0];
        }
        chapter_title = $(chapter_title).text();
        if(url == "readlightnovel.org"){
            let obj = $(body).find(_selectors.chapter_title);
            obj.find("*").remove();
            chapter_title = obj.text().replace("-", "").replace( /(<([^>]+)>)/ig, ' ');
        }
        if(chapter_title)
            chapter_title = chapter_title.replace( /(<([^>]+)>)/ig, '');
        //console.log($(body).find(_selectors.chapter_title))
        //console.log(chapter_title)
        if(!chapter_title){
            chapter_title = "N/A";
        }
        return chapter_title.trim();
    }
    catch(ex){
        console.warn(ex);
    }
}

async function load_json(file){
    //console.log(file)
    return new Promise(async (resolve, reject) => {
        $.getJSON(file, function(json) {
            resolve(json);
        }).fail(function(error){
            //console.error(error);
            reject(error);
        });
    });
}

async function get_novel_info() {

    const _url = $("#url-input").val();
    let baseurl = await get_base_url(_url);
    var _html = await scrape(_url);
    //console.log(_html)

    let json = await load_json("./json/selectors.json");
    let _selectors = json.find(x => x.domain == baseurl);
    
    if(_selectors){

    let title = await get_novel_title(_url, _html, _selectors);
    $(".novel-title").text("Title: " + title);
    let author = await get_novel_author(_url, _html, _selectors);
    $(".novel-author").text("Author: " + author);
    let summary = await get_novel_summary(_url, _html, _selectors);
    $(".novel-summary").html(summary);
    let genres = await get_novel_genres(_url, _html, _selectors);
    $(".novel-genres").text("Genres: " + genres);
    let cover = await get_novel_cover(_url, _html, _selectors);
    //$(".novel-cover").attr("src", cover);
    let t0 = performance.now();
    let toc_all = await get_novel_toc_urls(_url, _html, _selectors);
    let t1 = performance.now();
    //console.log(toc_all)
    let toc = toc_all[0];
    console.log(`${toc.length} - time for toc_all ${(t1 - t0) / 1000} s | ${t1 - t0} ms`);
    let toc_urls = toc_all[1];
    let chap1_html = await scrape(toc_urls[0]);
    let chap1_content = await get_chapter_content(toc_urls[0], chap1_html, _selectors);
    //console.log(chap1_content)
    //console.log(chap1_content)
    $(".novel-chapter-count").text("Chapters: " + toc_urls.length);

    let t2 = performance.now();
    let chapter_count = await get_novel_chapter_count(_url, _html, _selectors);
    let t3 = performance.now();
    console.log(`${chapter_count} - time for chapter_count ${(t3 - t2) / 1000} s | ${t3 - t2} ms`);

    //var novel_url_aes = await encrypt(_url);
    await encryptCookie("novel_url", _url, 100);
    //var chapter_url_aes = await encrypt(toc_urls[0]);
    await encryptCookie("chapter_url", toc_urls[0], 100);
    //var title_aes = await encrypt(title);
    await encryptCookie("title", title, 100);

    /*console.log(_html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(_html, "text/html");
    const body = doc.body;*/
    }
    else{
        alert("invalid provider")
    }
}