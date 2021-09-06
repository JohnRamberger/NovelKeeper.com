<?php
function encrypt_aes($plaintext, $database = false){
    //$key previously generated safely, ie: openssl_random_pseudo_bytes
    $key_cookie = 'G-KaPdSgUkXp2s5v8y/B?E(H+MbQeThW';
    $key_database = 'cQfTjWnZq4t7w!z%C*F-JaNdRgUkXp2s';
    $key = $key_cookie;
    if($database == true)
        $key = $key_database;

    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = openssl_random_pseudo_bytes($ivlen);
    $ciphertext_raw = openssl_encrypt($plaintext, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    $hmac = hash_hmac('sha256', $ciphertext_raw, $key, $as_binary=true);
    $ciphertext = base64_encode( $iv.$hmac.$ciphertext_raw );

    return $ciphertext;
}
function decrypt_aes($ciphertext, $database = false){
    //decrypt later....
    $key_cookie = 'G-KaPdSgUkXp2s5v8y/B?E(H+MbQeThW';
    $key_database = 'cQfTjWnZq4t7w!z%C*F-JaNdRgUkXp2s';
    $key = $key_cookie;
    if($database == true)
        $key = $key_database;

    $c = base64_decode($ciphertext);
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = substr($c, 0, $ivlen);
    $hmac = substr($c, $ivlen, $sha2len=32);
    $ciphertext_raw = substr($c, $ivlen+$sha2len);
    $original_plaintext = openssl_decrypt($ciphertext_raw, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    $calcmac = hash_hmac('sha256', $ciphertext_raw, $key, $as_binary=true);
    if (hash_equals($hmac, $calcmac))//PHP 5.6+ timing attack safe comparison
    {
        return $original_plaintext;
    }
}

function hash_password($plaintext){
    return password_hash($plaintext, PASSWORD_DEFAULT);
}

function compare_hash($plaintext, $hash){
    if (password_verify($plaintext, $hash)) {
        return true;
    } else {
        return false;
    }
}
