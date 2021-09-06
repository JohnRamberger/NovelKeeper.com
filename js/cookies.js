/*$(async function () {
    //check if dev
    let dev = await decryptCookie("dev");
    if(!dev && !document.location.href.toLowerCase().includes("under_construction.html"))
    {
        document.location.href = "under_construction.html";
    }
});*/

function setCookie(cname, cvalue, exhours) {
    var d = new Date();
    d.setTime(d.getTime() + (exhours*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function deleteCookie(cname){
    document.cookie = cname + "= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
}

async function encryptCookie(cname, cvalue, exhours){
    var aes = await encrypt(cvalue);
    setCookie(cname, aes, exhours);
}

async function decryptCookie(cname){
    return new Promise(async  (resolve, reject) => {
        let aes = getCookie(cname);
        var text = "";
        if (aes == "" || aes == null) {
            text = "";
        }
        else {
            text = await decrypt(aes);
        }
        resolve(text);
    });
}

async function decryptParam(url, param){
    return new Promise(async  (resolve, reject) => {

        let t_url = new URL(url);
        let t_b64 = t_url.searchParams.get(param);
        let t_aes = atob(t_b64);
        //console.log(t_aes)
        //let aes = getCookie(cname);
        var text = "";
        if (t_aes == "" || t_aes == null) {
            text = "";
        }
        else {
            text = await decrypt(t_aes);
        }
        resolve(text);
    });
}

async function encryptParam(param){
    return new Promise(async  (resolve, reject) => {
        let aes = await encrypt(param);
        let b64 = btoa(aes);
        resolve(b64);
    });
}