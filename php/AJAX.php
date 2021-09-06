<?php
header("Content-Type: application/json", true);
include 'scrape.php';
include 'encrypt.php';
include 'database.php';
include 'base64.php';

if(isset($_POST["action"])){
    switch($_POST["action"]){
        case 'test':
            test();
            break;
        case 'scrape':
            scrape();
            break;
        case 'base64':
            tobase64();
            break;
        case 'encrypt':
            encrypt();
            break;
        case 'decrypt':
            decrypt();
            break;
        case 'check_uuid_exists':
            check_uuid_exists();
            break;
        case 'get_library':
            get_library();
            break;
        case 'insert_user_if_new':
            insert_user_if_new();
            break;
        case 'check_novel_in_library':
            check_novel_in_library();
            break;
        case 'insert_novel':
            insert_novel();
            break;
        case 'delete_novel':
            delete_novel();
            break;
        case 'update_novel':
            update_novel();
            break;
        case 'requestprovider':
            requestprovider();
            break;
        default:
            null();
            break;
    }
}
function clean($text){
    $text = trim($text);
    $text = htmlspecialchars($text);
    return $text;
}
function format_html($html){
    $html = str_replace('<', "\,", $html);
    $html = str_replace('>', "\.", $html);
    return $html;
}
function null(){

}
function test(){
    $phrase = $_POST["phrase"];

    $result = null;
    if(isset($phrase))
    {
        $result = "10_" . $phrase . "_01";
    }
    else
    {
        $result = -1;
    }
    echo json_encode(array('result' => $result));
}
function scrape(){
    $url = $_POST["url"];

    $result = null;
    if(isset($url))
    {
        $result = format_html(scrape_webpage($url));
    }
    else
    {
        $result = -1;
    }
    echo json_encode(array('result' => $result));
}

function tobase64(){
    $cover_url = $_POST["cover_url"];

    $result = null;
    if(isset($cover_url))
    {
        $result = tob64($cover_url);
    }
    else
    {
        $result = -1;
    }
    echo json_encode(array('result' => $result));
}

function encrypt(){
    $plaintext = $_POST["plaintext"];

    $result = null;
    if(isset($plaintext))
    {
        $result = encrypt_aes($plaintext);
        $result = format_html($result);
    }
    else
    {
        $result = -1;
    }
    echo json_encode(array('result' => $result));
}

function decrypt(){
    $ciphertext = $_POST["ciphertext"];

    $result = null;
    if(isset($ciphertext))
    {
        $result = decrypt_aes($ciphertext);
        $result = format_html($result);
    }
    else
    {
        $result = -1;
    }
    echo json_encode(array('result' => $result));
}
function check_uuid_exists(){
    $uuid = $_POST["uuid"];

    $result = null;
    if(isset($uuid))
    {
        $result = uuid_exists($uuid);
    }
    else
    {
        $result = -1;
    }
    echo json_encode(array('result' => $result));
}

function get_library(){
    $uuid = $_POST["uuid"];
    
    $result = null;
    if(isset($uuid))
    {
        $result = select_library($uuid);
    }
    else
    {
        $result = -1;
    }
    echo json_encode(array('result' => $result));
}

function insert_user_if_new(){
    $username = $_POST["username"];
    $email = $_POST["email"];
    $pfp_url = $_POST["pfp_url"];

    $uuid = generate_uuid($email);
    
    $result = $uuid;
    if(isset($username) && isset($email) && isset($uuid))
    {
        if(uuid_exists($uuid) == false)
            insert_user($uuid, $email, $username, $pfp_url);
    }

    echo json_encode(array('result' => $result));
}

function check_novel_in_library(){
    $novel_url = $_POST["novel_url"];//for novel uuid
    $uuid = $_POST["uuid"];

    //$uuid = generate_uuid($email);

    $novel_uuid = generate_uuid($novel_url);
    
    $result = false;
    if(isset($uuid) && isset($novel_uuid) && uuid_exists($uuid))
    {
        $result = novel_exists($uuid, $novel_uuid);
    }
    //$result = $novel_uuid;
    echo json_encode(array('result' => $result));
}

function insert_novel(){
    $uuid = $_POST["uuid"];

    $novel_url = $_POST["novel_url"];//for novel uuid
    $novel_title = $_POST["novel_title"];
    $novel_cover_url = $_POST["novel_cover_url"];
    $current_chapter_url = $_POST["current_chapter_url"];
    $current_chapter_index = $_POST["current_chapter_index"];
    
    $novel_uuid = generate_uuid($novel_url);

    if(!isset($current_chapter_index)){
        $current_chapter_index = 0;
    }

    $result = 1;
    if(isset($uuid) && isset($novel_uuid) && isset($novel_url) && isset($novel_title) && isset($novel_cover_url) && isset($current_chapter_url) && uuid_exists($uuid) && !novel_exists($uuid, $novel_uuid))
    {   
        insert_library($uuid, $novel_uuid, $novel_url, $novel_title, $novel_cover_url, $current_chapter_url, $current_chapter_index);
        $result = 2;
    }

    echo json_encode(array('result' => $result));
}
function delete_novel(){
    $uuid = $_POST["uuid"];
    $novel_url = $_POST["novel_url"];//for novel uuid
    
    $novel_uuid = generate_uuid($novel_url);

    $result = 1;
    if(isset($uuid) && isset($novel_uuid) && uuid_exists($uuid) && novel_exists($uuid, $novel_uuid))
    {
        $result = 2;
        remove_novel_from_library($uuid, $novel_uuid);
    }
    $result = $novel_uuid;
    echo json_encode(array('result' => $result));
}

function update_novel(){
    $uuid = $_POST["uuid"];

    $novel_url = $_POST["novel_url"];//for novel uuid
    $current_chapter_url = $_POST["current_chapter_url"];
    $current_chapter_index = $_POST["current_chapter_index"];
    
    $novel_uuid = generate_uuid($novel_url);

    if(!isset($current_chapter_index)){
        $current_chapter_index = 0;
    }

    $result = 1;
    if(isset($uuid) && isset($novel_uuid) && isset($current_chapter_url) && uuid_exists($uuid) && novel_exists($uuid, $novel_uuid))
    {   
        update_library($uuid, $novel_uuid, $current_chapter_url, $current_chapter_index);
        $result = 2;
    }

    echo json_encode(array('result' => $result));
}

function requestprovider(){
    $provider = $_POST["provider"];
    $url = $_POST["url"];

    $result = 1;
    if(isset($provider) && isset($url))
    {   
        request_provider($provider, $url);
        $result = 2;
    }

    echo json_encode(array('result' => $result));
}

?>