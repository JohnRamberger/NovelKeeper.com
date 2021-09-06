var AJAXurl = '../php/AJAX.php';

function AJAX_uni(data, callback){
    var _action = 'test';

    var data = {action: _action, phrase: _phrase};
    $.ajax({
        url:AJAXurl,
        type:"POST",
        dataType:'json',
        data: data,
        success: function(data){
            var res = data['result'];
            console.log("output: " + res);
        },
        error: function(xhr, status, error){
            //console.error(xhr.responseText);
            resolve("error")
        }
    });
}

function scrape(_url){
    var _action = 'scrape';

    var data = {action: _action, url: _url};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                res = res.replaceAll("\\,", "<");
                res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(error);
                resolve("error")
            }
        });
    });
}

function tobase64(_cover_url){
    var _action = 'base64';

    var data = {action: _action, cover_url: _cover_url};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                res = res.replaceAll("\\,", "<");
                res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(error);
                resolve("error")
            }
        });
    });
}

function encrypt(_plaintext){
    var _action = 'encrypt';

    var data = {action: _action, plaintext: _plaintext};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                res = res.replaceAll("\\,", "<");
                res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function decrypt(_ciphertext){
    var _action = 'decrypt';

    var data = {action: _action, ciphertext: _ciphertext};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                res = res.replaceAll("\\,", "<");
                res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function check_uuid_exists(_uuid){
    var _action = 'check_uuid_exists';

    var data = {action: _action, uuid: _uuid};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function get_library(_uuid){
    var _action = 'get_library';

    var data = {action: _action, uuid: _uuid};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                //console.log(data)
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function get_novel(_uuid, _novel_id){
    var _action = 'get_novel';

    var data = {action: _action, uuid: _uuid, novel_id: _novel_id};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function insert_user_if_new(_username, _email, _pfp_url = ""){
    var _action = 'insert_user_if_new';

    var data = {action: _action, username: _username, email: _email, pfp_url: _pfp_url};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function check_novel_in_library(_uuid, _novel_url){
    var _action = 'check_novel_in_library';

    var data = {action: _action, uuid: _uuid, novel_url: _novel_url};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function insert_novel(_uuid, _novel_url, _novel_title, _novel_cover_url, _current_chapter_url, _current_chapter_index){
    var _action = 'insert_novel';

    var data = {action: _action, uuid: _uuid, novel_url: _novel_url, novel_title: _novel_title, novel_cover_url: _novel_cover_url, current_chapter_url: _current_chapter_url, current_chapter_index: _current_chapter_index};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function delete_novel(_uuid, _novel_url){
    var _action = 'delete_novel';

    var data = {action: _action, uuid: _uuid, novel_url: _novel_url};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function update_novel(_uuid, _novel_url, _current_chapter_url, _current_chapter_index){
    var _action = 'update_novel';

    var data = {action: _action, uuid: _uuid, novel_url: _novel_url, current_chapter_url: _current_chapter_url, current_chapter_index: _current_chapter_index};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function request_provider(_provider, _url){
    var _action = 'requestprovider';

    var data = {action: _action, provider: _provider, url: _url};
    return new Promise((resolve, reject) => {
        $.ajax({
            url:AJAXurl,
            type:"POST",
            dataType:'json',
            data: data,
            async:true,
            success: function(data){
                var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                resolve(res);
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve("error")
            }
        });
    });
}

function compile_epub(_novel_title, _novel_author, _novel_cover, _chapter_titles, _chapters_content, _chapter_start, _chapter_end){
    var _action = 'requestprovider';

    var data = {novel_title: _novel_title, novel_author: _novel_author, novel_cover: _novel_cover, chapter_titles: _chapter_titles, chapters_content: _chapters_content, chapter_start: _chapter_start, chapter_end: _chapter_end};
    //console.log(data)
    return new Promise((resolve, reject) => {
        $.ajax({
            url:'../php/downloader.php',
            type:"POST",
            dataType:'json',
            //contentType: 'application/json',
            data: data,
            async:true,
            success: function(data){
                //var res = data['result'];
                //res = res.replaceAll("\\,", "<");
                //res = res.replaceAll("\\.", ">");
                //resolve(res);
                resolve(data)
            },
            error: function(xhr, status, error){
                //console.error(xhr.responseText);
                resolve(error);
                //resolve("error")
            }
        });
    });
}