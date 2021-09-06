<?php
//include 'encrypt.php';
//uuid
function generate_uuid($identifier){
    //$uuid = uniqid("", false);
    $uuid = hash("sha512", $identifier);
    return $uuid;
}
//user
function uuid_exists($uuid){
    //check the database to see if user exists
    $myPDO = new PDO('sqlite:../db/database.db');
    $result = $myPDO->query("SELECT COUNT(*) FROM users WHERE uuid = '$uuid'");
    $count = $result->fetch(PDO::FETCH_NUM)[0];
    //return $count;
    if($count >= 1){
        return true;
    } else {
        return false;
    }
}
function insert_user($uuid, $email, $username, $pfp_url = ""){
    //encrypt all data
    //$uuid = hash_password($uuid);//hash to prevent stealing data through debugger
    $email = encrypt_aes($email, true);
    $username = encrypt_aes($username, true);
    $pfp_url = encrypt_aes($pfp_url, true);

    //insert user into database
    $myPDO = new PDO('sqlite:../db/database.db');
    $data = [
        'uuid' => $uuid,
        'email' => $email,
        'username' => $username,
        'pfp_url' => $pfp_url
    ];
    $sql = "INSERT INTO users (uuid, email, username, pfp_url) VALUES (:uuid, :email, :username, :pfp_url)";
    $myPDO->prepare($sql)->execute($data);
}
function select_user($uuid){
    //get user from database
    $myPDO = new PDO('sqlite:../db/database.db');
    $result = $myPDO->query("SELECT * FROM users WHERE uuid = '$uuid'");
    $obj = $result->fetch(PDO::FETCH_OBJ);
    
    //decrypt all data
    //$obj->uuid = decrypt_aes($obj->uuid, true);
    $obj->email = decrypt_aes($obj->email, true);
    $obj->username = decrypt_aes($obj->username, true);
    $obj->pfp_url = decrypt_aes($obj->pfp_url, true);

    return $obj;
}

//library
function insert_library($uuid, $novel_uuid, $novel_url, $novel_title, $novel_cover_url, $current_chapter_url, $current_chapter_index){
    //encrypt all data
    //$uuid = hash_password($uuid);//hash to prevent stealing data through debugger
    $novel_url = encrypt_aes($novel_url, true);
    $novel_title = encrypt_aes($novel_title, true);
    $novel_cover_url = encrypt_aes($novel_cover_url, true);
    $current_chapter_url = encrypt_aes($current_chapter_url, true);
    $current_chapter_index = encrypt_aes($current_chapter_index, true);

    //insert user into database
    $myPDO = new PDO('sqlite:../db/database.db');
    $data = [
        'uuid' => $uuid,
        'novel_uuid' => $novel_uuid,
        'novel_url' => $novel_url,
        'novel_title' => $novel_title,
        'novel_cover_url' => $novel_cover_url,
        'current_chapter_url' => $current_chapter_url,
        'current_chapter_index' => $current_chapter_index
    ];
    $sql = "INSERT INTO library (uuid, novel_uuid, novel_url, novel_title, novel_cover_url, current_chapter_url, current_chapter_index, last_modified) VALUES (:uuid, :novel_uuid, :novel_url, :novel_title, :novel_cover_url, :current_chapter_url, :current_chapter_index, datetime('now'))";
    $myPDO->prepare($sql)->execute($data);
}
function update_library($uuid, $novel_uuid, $current_chapter_url, $current_chapter_index){
    //encrypt all data
    //$uuid = hash_password($uuid);//hash to prevent stealing data through debugger
    $current_chapter_url = encrypt_aes($current_chapter_url, true);
    $current_chapter_index = encrypt_aes($current_chapter_index, true);

    //insert user into database
    $myPDO = new PDO('sqlite:../db/database.db');
    $data = [
        'uuid' => $uuid,
        'novel_uuid' => $novel_uuid,
        'current_chapter_url' => $current_chapter_url,
        'current_chapter_index' => $current_chapter_index
    ];
    $sql = "UPDATE library SET current_chapter_url = :current_chapter_url, current_chapter_index = :current_chapter_index, last_modified = datetime('now') WHERE uuid = :uuid AND novel_uuid = :novel_uuid";
    $myPDO->prepare($sql)->execute($data);
}
function select_library($uuid){
    //get user from database
    $myPDO = new PDO('sqlite:../db/database.db');
    $result = $myPDO->query("SELECT * FROM library WHERE uuid = '$uuid' ORDER BY last_modified DESC");
    $arr = $result->fetchAll(PDO::FETCH_ASSOC);
    
    //decrypt all data
    //$obj->uuid = decrypt_aes($obj->uuid, true);
    $res = [];
    foreach($arr as $row){
        $row['novel_url'] = decrypt_aes($row['novel_url'], true);
        $row['novel_title'] = decrypt_aes($row['novel_title'], true);
        $row['novel_cover_url'] = decrypt_aes($row['novel_cover_url'], true);
        $row['current_chapter_url'] = decrypt_aes($row['current_chapter_url'], true);
        $row['current_chapter_index'] = decrypt_aes($row['current_chapter_index'], true);
        array_push($res, $row);
    }
    

    return $res;
}
function select_novel($uuid, $novel_uuid){
    //get user from database
    $myPDO = new PDO('sqlite:../db/database.db');
    $result = $myPDO->query("SELECT * FROM library WHERE uuid = '$uuid' AND novel_uuid = '$novel_uuid'");
    $row = $result->fetchObject();
    
    //decrypt all data
    //$obj->uuid = decrypt_aes($obj->uuid, true);
    $row->novel_url = decrypt_aes($row->novel_url, true);
    $row->novel_title = decrypt_aes($row->novel_title, true);
    $row->novel_cover_url = decrypt_aes($row->novel_cover_url, true);
    $row->current_chapter_url = decrypt_aes($row->current_chapter_url, true);
    $row->current_chapter_index = decrypt_aes($row->current_chapter_index, true);
    

    return $row;
}
function remove_novel_from_library($uuid, $novel_uuid){
    //encrypt all data

    //insert user into database
    $myPDO = new PDO('sqlite:../db/database.db');
    $data = [
        'uuid' => $uuid,
        'novel_uuid' => $novel_uuid,
    ];
    $sql = "DELETE FROM library WHERE uuid = :uuid AND novel_uuid = :novel_uuid";
    $myPDO->prepare($sql)->execute($data);
}
function novel_exists($uuid, $novel_uuid){
    //check the database to see if user exists
    $myPDO = new PDO('sqlite:../db/database.db');
    $result = $myPDO->query("SELECT COUNT(*) FROM library WHERE uuid = '$uuid' AND novel_uuid = '$novel_uuid'");
    $count = $result->fetch(PDO::FETCH_NUM)[0];
    //return $count;
    if($count >= 1){
        return true;
    } else {
        return false;
    }
}
//request provider
function request_provider($provider, $url){

    //insert user into database
    $myPDO = new PDO('sqlite:../db/database.db');
    $data = [
        'provider' => $provider,
        'url' => $url
    ];
    $sql = "INSERT INTO requested_providers (provider, url) values (:provider, :url)";
    $myPDO->prepare($sql)->execute($data);
}
//test
function test123($test){
    $myPDO = new PDO('sqlite:../db/database.db');
    $result = $myPDO->query("INSERT INTO test (Field1) values ('asjkldjlasd') ");
}
/*foreach($result as $row)
{
    print $row['Field1'] . "\n";
}*/
?>