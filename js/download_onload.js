var cover_load = 0;
var started = 0;

$(document).ready(async () => {

    if($(window).width() > 820)
        $(".draggable").draggable();

    //console_bold("starting novel conversion");
    set_title(`0%`);

    //setup slider
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 100,
        values: [0, 100],
        slide: function (event, ui) {
            //$("#wrapper .panel .settings .slider-desc").text(`chapter range: ${ui.values[0]} - ${ui.values[1]}`);
        }
    });
    

    let t_url = new URL(window.location.href);
    //t = t_url.searchParams.get('t');
    nu = t_url.searchParams.get('nu');
    

    if(nu){
        const _url = nu;
        const baseurl = await get_base_url(_url);
        const _html = await scrape(_url);
    
        //console.log(_html)
    
        let json = await load_json("../json/selectors.json");
        let _selectors = json.find(x => x.domain == baseurl);
        if(_selectors){
            console_bold("gathering novel info");
            //get and set novel info
            let title = await get_novel_title(_url, _html, _selectors);
            if(title){
                console_log(`title: ${title}`);
            }else{
                console_warn(`title not found`);
                title = "N/A";
            }
            
            
            //console.log(title);
            let author = await get_novel_author(_url, _html, _selectors);
            if(author){
                console_log(`author: ${author}`);
            }else{
                console_warn(`author not found`);
                author = "N/A";
            }
            
            //console.log(author);
            /*let summary = await get_novel_summary(_url, _html, _selectors);
            if(summary != null && summary.includes('\\n'))
                summary = summary.replaceAll("\\n", "<br><br>")*/
    
            //console.log(summary);
            //let genres = await get_novel_genres(_url, _html, _selectors);
            //console.log(genres);
            let cover = await get_novel_cover(_url, _html, _selectors);
            if(!cover){
                console_warn(`cover not found`);
                //cover = "N/A";
            }else{
                console_log(`cover: <img class="cover" src="${cover}" /> <a href="${cover}" target="_blank">src</a>`)
                //console.log($("#wrapper .panel .console img.cover").get(0))
                $("#wrapper .panel .console img.cover").get(0).onload = async function(e){
                    //console_log(1)
                    cover_load++;
                }
                $("#wrapper .panel .console img.cover").get(0).onerror = async function(e){
                    console_warn(`error loading cover`);
                    cover = "";
                    cover_load++;
                }
            }

            let checkloaded = setInterval(async () => {
                if(cover_load != 0){
                    clearInterval(checkloaded);
                    //set_title(`1%`);


                    let toc_all = await get_novel_toc_urls(_url, _html, _selectors);
                    //console.log(toc_all);
                    let toc_urls = toc_all[1];

                    console_log(`total chapter count: ${numberWithCommas(toc_urls.length)}`);
                    //check for chapter download range
                    $("#wrapper .panel .settings .slider-desc .first").val(1);
                    $("#wrapper .panel .settings .slider-desc .last").val(toc_urls.length);
                    $("#slider-range").slider({
                        range: true,
                        min: 1,
                        max: toc_urls.length,
                        values: [1, toc_urls.length],
                        slide: function (event, ui) {
                            //$("#wrapper .panel .settings .slider-desc").text(`chapter range: ${ui.values[0]} - ${ui.values[1]}`);
                            $("#wrapper .panel .settings .slider-desc .first").val(ui.values[0]);
                            $("#wrapper .panel .settings .slider-desc .last").val(ui.values[1]);
                            //console.log(ui.values[0] + " - " + ui.values[1]);
                        }
                    });

                    $("#wrapper .panel .settings .slider-desc .first").on('input', function(){
                        let val = parseInt($(this).val());
                        //get upper val
                        let upper_val = parseInt($("#slider-range").slider("values", 1));
                        if(val < 1){
                            //$("#wrapper .panel .settings .slider-desc .first").val(1);
                            //$("#slider-range").slider("values", 0, 1);
                        }else if(val > upper_val){
                            //$("#wrapper .panel .settings .slider-desc .first").val(upper_val);
                            //$("#slider-range").slider("values", 0, upper_val);
                        }else if(val){
                            //update slider
                            $("#slider-range").slider("values", 0, val);
                        }
                    });

                    $("#wrapper .panel .settings .slider-desc .first").on('blur', function(){
                        let v = parseInt($("#slider-range").slider("values", 0));
                        $(this).val(v);
                    });

                    $("#wrapper .panel .settings .slider-desc .last").on('input', function(){
                        let val = parseInt($(this).val());
                        //get lower val
                        let lower_val = parseInt($("#slider-range").slider("values", 0));
                        if(val > toc_urls.length){
                            //$("#wrapper .panel .settings .slider-desc .last").val(toc_urls.length);
                            //$("#slider-range").slider("values", 1, toc_urls.length);
                        }else if(val < lower_val){
                            //$("#wrapper .panel .settings .slider-desc .last").val(lower_val);
                            //$("#slider-range").slider("values", 1, lower_val);
                        }else if(val){
                            //update slider
                            $("#slider-range").slider("values", 1, val);
                        }
                    });

                    $("#wrapper .panel .settings .slider-desc .last").on('blur', function(){
                        let v = parseInt($("#slider-range").slider("values", 1));
                        //console.log($("#slider-range").slider("values", 1))
                        $(this).val(v);
                    });

                    //enable settings
                    $("#wrapper .panel .settings").addClass("_enabled");

                    //$("#amount").val("$" + $("#slider-range").slider("values", 0) +
                        //" - $" + $("#slider-range").slider("values", 1));

                    console_log(`select chapter range from above to begin.`);
                    
                    let wait_for_start = setInterval(async () => {
                        if(started != 0){
                            clearInterval(wait_for_start);

                            //disable settings
                            $("#wrapper .panel .settings").removeClass("_enabled");

                            //begin download
                            if(toc_urls.length > 0){

                                let chap_start = parseInt($("#slider-range").slider("values", 0));
                                let chap_end = parseInt($("#slider-range").slider("values", 1));


                                console_log(`download chapter count: ${chap_end - chap_start + 1}`);
                                
                                toc_urls = toc_urls.slice(chap_start - 1, chap_end);
                                let toc_names = toc_all[0].slice(chap_start - 1, chap_end);
                                //let chapter_count = toc_urls.length;
                                let toc_content = [];
                                
                                var progress = 0;
                                var goal = toc_urls.length;
                                console_bold("gathering chapter content")
        
                                let perfor = [];
        
                                for(var nov_url of toc_urls){
                                    try{
                                        let t0 = performance.now();
        
                                        let chap1_html = await scrape(nov_url);
                                        let chap1_content = await get_chapter_content(nov_url, chap1_html, _selectors);
                                        
                                        let t1 = performance.now();
                                        perfor.push(t1-t0);
        
                                        //perfor = filterOutliers(perfor);
        
                                        let av = average(perfor);
                                        let timeleft = Math.round(((goal - progress - 1) * av) / 1000);
                                        //check if time not equal to current
                                        let currtime =  parseInt($("#wrapper .panel .time-left").attr("data-time-left"));
                                        //console.log(currtime / timeleft)
                                        if(currtime != timeleft){
                                            $("#wrapper .panel .time-left").attr("data-time-left", timeleft);
                                            let mins = parseInt(timeleft / 60);
                                            let seconds = timeleft % 60;
                                            $("#wrapper .panel .time-left").text(`approx. time left: ${mins}m ${seconds}s`);
                                            //console.log(`approx. time left: ${mins}m ${seconds}s`);
                                        }
        
                                        toc_content.push(fixjson(chap1_content));
        
                                        console_log(`content loaded for chapter ${chap_start + progress}`);
                                        progress++;
        
                                        //change progress bar
                                        update_progress(progress, goal);
        
                                        //change title
                                        let p = Math.round(get_percent(progress + 1, goal + (goal / 15)));
                                        set_title(`${p}%`);
                                    }catch(ex){
                                        console.error(ex);
                                        console_error(ex);
                                    }
                                }
        
                                var clean_names = [];
                                for(const name of toc_names){
                                    clean_names.push(fixjson(name));
                                }
        
                                console_bold("waiting for server to generate epub...");
                                
                                //console.log(`${title}, ${author}, ${cover}`)
                                //console.log(clean_names);
                                //console.log(toc_content);
                                //title="a";
                                //author="b";
                                title = title.replace(":", "").trim();
        
                                let res = await compile_epub(fixjson(title), fixjson(author), fixjson(cover), clean_names, toc_content, chap_start, chap_end);
                                //console.log(res)
        
                                if(res.result == "success"){
                                    console_success("complete");
        
                                    //set download button and enable
                                    let download_url = res.url;
                                    
                                    $("#wrapper .panel .but").attr("href", download_url);
                                    $("#wrapper .panel .but").addClass("_enabled");
        
                                    console_log(`download your epub by clicking the button below.`);
                                }else{
                                    console_error("error generating epub");
                                }
        
                                
                            }else{
                                console_error(`no chapters found`);
                            }  
                        }else{
                            //waiting for start
                        }
                    }, 500);

                }else{
                    console.log("waiting for cover load/error")
                }
            }, 100);
            //console.log("test")
                      
        }
    }else{
        console_error("novel parameters missing from url.")
    }
    
});

function update_progress(progress, goal){
    let percent = get_percent(progress, goal);
    $("#wrapper .panel .progress-bar .fill").css("width", `${percent}%`);
}

function set_title(str){
    document.title = str;// + " | Download";
}

function get_percent(progress, goal){
    let percent = Math.round((progress / goal) * 10000) / 100;
    return percent;
}

function console_log(str){
    $("#wrapper .panel .console").append(`<span class="log">${str}</span>`);
    scroll_console();
}

function console_bold(str){
    $("#wrapper .panel .console").append(`<span class="log bold">${str}</span>`);
    scroll_console();
}

function console_error(str){
    $("#wrapper .panel .console").append(`<span class="error">${str}</span>`);
    scroll_console();
    set_title("error!");
}

function console_warn(str){
    $("#wrapper .panel .console").append(`<span class="warning">${str}</span>`);
    scroll_console();
}

function console_success(str){
    $("#wrapper .panel .console").append(`<span class="success bold">${str}</span>`);
    scroll_console();
    set_title("done!");
}

function scroll_console(){
    $("#wrapper .panel .console").scrollTop($("#wrapper .panel .console")[0].scrollHeight);
}

const average = (array) => array.reduce((a, b) => a + b) / array.length;

function filterOutliers (someArray) {
    if (someArray.length < 4) {
        return someArray;
    }

    let values = someArray.slice().sort((a, b) => a - b); // copy array fast and sort

    let q1 = getQuantile(values, 25);
    let q3 = getQuantile(values, 75);

    let iqr, maxValue, minValue;
    iqr = q3 - q1;
    maxValue = q3 + iqr * 1.5;
    minValue = q1 - iqr * 1.5;

    return values.filter((x) => (x >= minValue) && (x <= maxValue));
}

function getQuantile (array, quantile) {
    // Get the index the quantile is at.
    let index = quantile / 100.0 * (array.length - 1);

    // Check if it has decimal places.
    if (index % 1 === 0) {
        return array[index];
    } else {
        // Get the lower index.
        let lowerIndex = Math.floor(index);
        // Get the remaining.
        let remainder = index - lowerIndex;
        // Add the remaining to the lowerindex value.
        return array[lowerIndex] + remainder * (array[lowerIndex + 1] - array[lowerIndex]);
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fixjson(string){
    string = string.replaceAll("<", "\\,");
    string = string.replaceAll(">", "\\.");
    string = string.replaceAll(`"`, `\\[`);
    string = string.replaceAll(`'`, `\\]`);
    return string;
}

function checkslider(){
    let chap_start = parseInt($("#slider-range").slider("values", 0));
    let chap_end = parseInt($("#slider-range").slider("values", 1));
    if(chap_end - chap_start <= 0){
        console_warn(`cannot download 0 chapters`);
    }else{
        started = 1;
    }
}