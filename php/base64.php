<?php

require_once 'curl.php';

//$b64 = tob64("https://static.lightnovelworld.com/bookcover/300x400/00707-my-vampire-system-wnovel.jpg");
//echo '<img src="'.$b64.'"/>';

function tob64($img_file)
{
    $imgData = base64_encode(curlWeb($img_file));
    //$src = 'data: '.mime_content_type($img_file).';base64,'.$imgData;
    $src = 'data:image;base64,'.$imgData;

    return $src;
}

?>