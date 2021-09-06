<?php
require_once 'simple_html_dom.php';
require_once 'curl.php';

function scrape_webpage($url){
    //$dom = file_get_html($url, false);
    $dom = curlWeb($url);
    return $dom;
}
/*
//get html content from the site.
$dom = file_get_html('https://www.imdb.com/title/tt4154756/reviews?ref_=tt_ql_3', false);
//collect all user’s reviews into an array
$answer = array();
if(!empty($dom)) {
    $divClass = $title ='';$i = 0;
    foreach($dom->find('.review-container') as $divClass) {
        //title
        foreach($divClass->find('.title') as $title ) {
            $answer[$i]['title'] = $title->plaintext;
        }
        //ipl-ratings-bar
        foreach($divClass->find('.ipl-ratings-bar') as $ipl_ratings_bar ) {
            $answer[$i]['rate'] = trim($ipl_ratings_bar->plaintext);
        }
        //content
        foreach($divClass->find('div[class=text show-more__control]') as $desc) {
            $text = html_entity_decode($desc->plaintext);
            $text = preg_replace('/\&#39;/', "'", $text);
            $answer[$i]['content'] = html_entity_decode($text);
        }
        $i++;
    }
}
//function definition to convert array to xml
function array_to_xml($array, &$xml_user_info) {
    foreach($array as $key => $value) {
        if(is_array($value)) {
            $subnode = $xml_user_info->addChild("Review$key");
            foreach ($value as $k=>$v) {
            $xml_user_info->addChild("$k", $v);
            }
        }else {
            $xml_user_info->addChild("$key",htmlspecialchars("$value"));
        }
    }
    return $xml_user_info->asXML();
}
//creating object of SimpleXMLElement
$xml_user_info = new SimpleXMLElement("<?xml version=\"1.0\"?><root></root>");
//function call to convert array to xml and return whole xml content with tag
$xmlContent = array_to_xml($answer,$xml_user_info);
// Create a xml file
$my_file = 'AvengersMovieReview.xml';
$handle = fopen($my_file, 'w') or die('Cannot open file: '.$my_file);
//success and error message based on xml creation
if(fwrite($handle, $xmlContent)) {
echo 'XML file have been generated successfully.';
}
else{
echo 'XML file generation error.';
}*/
?>