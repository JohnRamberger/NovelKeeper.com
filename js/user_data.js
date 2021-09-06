/*async function check_logon(){
    let uuid = await decryptCookie("uuid");
    if(uuid){
        let exists = await check_uuid_exists(uuid);
        //console.log(exists);
        return exists;
    }
    else
        return false;
    //check uuid exists
}*/

async function onSignIn(googleUser) 
{
    let logged_in = checkIfLoggedIn();
    var profile = googleUser.getBasicProfile();
    /*console.log('ID: ' + profile.getId()); 
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());*/
    //check if user is in DB
    let uuid = await insert_user_if_new(profile.getName(), profile.getEmail(), profile.getImageUrl());
    
    //set uuid cookie
    //await encryptCookie("uuid", uuid, 1000);

    var myUserEntity = {};
    myUserEntity.uuid = uuid;
    myUserEntity.username = profile.getName();
    myUserEntity.pfp_url = profile.getImageUrl();
    
    //Store the entity object in sessionStorage where it will be accessible from all pages of the site.
    sessionStorage.setItem('myUserEntity',JSON.stringify(myUserEntity));

    if(!logged_in){
        let type = $("#login").attr("data-type");
        if(type == "cover"){
            //reload page
            window.location.reload();
        }
        else if(type == "onaction"){
            //$(".require-login").removeClass("require-login");
            //$("#login-bg").hide("fade", 400);
            //$("#login").animate({bottom: "101vh"}, 600);
            //reload page
            window.location.reload();
        }
    }
}

function checkIfLoggedIn()
{
    if(sessionStorage.getItem('myUserEntity') == null){
        //Redirect to login page, no user entity available in sessionStorage
        return "";
    } else {
        //User already logged in
        var userEntity = {};
        userEntity = JSON.parse(sessionStorage.getItem('myUserEntity'));
        return userEntity;
    }
}

function signOut() {
    sessionStorage.clear();
    var auth2 = gapi.auth2.getAuthInstance();
    /*auth2.signOut().then(function () {
      console.log('User signed out.');
    });*/// <--- signs out of google account on all tabs
    //delete uuid cookie
    //deleteCookie("uuid");
    //redirect?
}

function signOut_all() {
    sessionStorage.clear();
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });// <--- signs out of google account on all tabs
    //delete uuid cookie
    //deleteCookie("uuid");
    //redirect?
}