//only on PC
var i = 0;
function send_notification(type, message, timeout = 10000){
    //let timeout = 10000;
    let timeout_script = `<script>
    setTimeout(() => {
        $("#notification-${i}").css("filter", "opacity(0)");
    }, ${timeout});
    </script>`;
    let notif_markup = `<div id="notification-${i}" class="notification">${i}${timeout_script}</div>`;
    switch(type.toLowerCase()){
        case "success": 
            notif_markup = `<div id="notification-${i}" class="notification success">${timeout_script}
            <div class="icon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check-circle" class="svg-inline--fa fa-check-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg></div>
            <h1 class="message">${message}</h1>
            <div class="close"><svg id="i-times" viewBox="0 0 1024 1024">
                <path d="M618.775 512l320.329-320.329c30.51-30.51 30.51-76.269 0-106.775s-76.269-30.51-106.775 0l-320.329 320.329-320.329-320.329c-30.51-30.51-76.269-30.51-106.775 0s-30.51 76.269 0 106.775l320.329 320.329-320.329 320.329c-30.51 30.51-30.51 76.269 0 106.775s76.269 30.51 106.775 0l320.329-320.329 320.329 320.329c30.51 30.51 76.269 30.51 106.775 0s30.51-76.269 0-106.775l-320.329-320.329z"></path>
            </svg></div>
            </div>`;
            break;
    }
    //append as first item
    i++;
    $("#notification-manager").prepend(notif_markup);
    return "success";
}