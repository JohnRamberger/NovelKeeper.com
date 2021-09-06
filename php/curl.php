<?php
# curl.php
//curlWeb("https://lightnovelworld.com");
function curlWeb($url){

    $ua = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13';
    // Initialize a connection with cURL (ch = cURL handle, or "channel")
    $ch = curl_init();

    // Set the URL
    curl_setopt($ch, CURLOPT_URL, $url);

    // Set the HTTP method
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

    // Return the response instead of printing it out
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    //follow redirect
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

    //curl_setopt($ch, CURLOPT_KEEP_SENDING_ON_ERROR	, true);
    curl_setopt($ch, CURLOPT_USERAGENT, $ua);
    curl_setopt($ch, CURLOPT_AUTOREFERER, true);

    // Send the request and store the result in $response
    $response = curl_exec($ch);

    // Close cURL resource to free up system resources
    curl_close($ch);
    
    return $response;

    //echo 'HTTP Status Code: ' . curl_getinfo($ch, CURLINFO_HTTP_CODE) . PHP_EOL;
    //echo 'Response Body: ' . $response . PHP_EOL;

    
}
?>