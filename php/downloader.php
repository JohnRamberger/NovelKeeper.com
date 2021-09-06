<?php
header("Content-Type: application/json", true);

require './TPEpubCreator.php';

$novel_title = $_POST["novel_title"];
$novel_author = $_POST["novel_author"];
$novel_cover = $_POST["novel_cover"];
$chapter_titles = $_POST["chapter_titles"];
$chapters_content = $_POST["chapters_content"];
$chapter_start = $_POST["chapter_start"];
$chapter_end = $_POST["chapter_end"];

if(!isset($novel_title) || $novel_title == ""){
    $novel_title = "N/A";
}
if(!isset($novel_author) || $novel_author == ""){
    $novel_author = "N/A";
}
foreach ($chapter_titles as &$str) {
    if(!isset($str) || $str == ""){
        $str = "N/A";
    }
    unset($str);
}
foreach ($chapters_content as &$str) {
    if(!isset($str) || $str == ""){
        $str = "N/A";
    }
    unset($str);
}

//undo json safety
$novel_title = fixstring($novel_title);
$novel_author = fixstring($novel_author);
//$novel_cover = fixstring($novel_cover);
$chapter_titles = fixarray($chapter_titles);
$chapters_content = fixarray($chapters_content);



function fixstring($str){
    $str = str_replace('\\.', '>', $str);
    $str = str_replace('\\,', '<', $str);
    $str = str_replace('\\]', `'`, $str);
    $str = str_replace('\\[', `"`, $str);
    $str = str_replace('/', `\/`, $str);
    return $str;
}

function fixjson($str){
    $str = str_replace('>', '\\.', $str);
    $str = str_replace('<', '\\,', $str);
    $str = str_replace(`'`, `\\]`, $str);
    $str = str_replace(`"`, `\\[`, $str);
    return $str;
}

function fixarray($arr){
    foreach ($arr as &$str) {
        $str = fixstring($str);
    }
    unset($str);
    return $arr;
}

$epub = new TPEpubCreator();

$dir = date("Y-m-d-h") . "/";


$epub->temp_folder = '../epubs/temp_folder/';
$epub->epub_file = '../epubs/' . $dir . '[' . $chapter_start . '-' . $chapter_end . '] ' . $novel_title . '.epub';// . ' - ' . $novel_author
//echo '../epubs/' . $dir . $novel_title . ' - ' . $novel_author . ' [' . count($chapters_content) . ' chaps]' . '.epub';
//make new directory

if (!file_exists('../epubs/' . $dir)) {
    mkdir('../epubs/' . $dir, 0777, true);
}

$epub->title = $novel_title;

// Add page from file
//$epub->AddPage( false, 'file.txt', 'Título (check accent)' );

// Add pages content directly
//$epub->AddPage( '<b>Test</b>', false, 'Title' );

for ($x = 0; $x < count($chapters_content); $x++) {
    //echo $x;
    $epub->AddPage( $chapters_content[$x], false, $chapter_titles[$x] );
}


// Add image cover
if(isset($novel_cover) && $novel_cover != ""){
    $epub->AddImage( $novel_cover, 'image', true );
}

//echo $novel_title;
//echo '\n';
//echo $novel_author;
//echo '\n';
//echo $novel_cover;
//echo '\n';
//print_r($chapter_titles);
//print_r($chapters_content);

// Create the EPUB
if ( ! $epub->error ) {
    $epub->CreateEPUB();
    
    if ( ! $epub->error ) {
        //echo 'Success: Download your book <a href="' . $epub->epub_file . '">here</a>.';
        $result = array('result' => 'success', 'url' => $epub->epub_file);
    }
    
} else {
    //echo $epub->error;
    $result = array('result' => 'error', 'error' => fixjson($epub->error));
}


/*if(isset($novel_title) && isset($novel_author) && isset($chapter_titles) && isset($chapters_content)){   
    $result = array('t' => $novel_title, 'a' => $novel_author, 'ts' => $chapter_titles, 'c' => $chapters_content);
}*/
//$result = array('result' => 'success', );

/*$result = $_SERVER['DOCUMENT_ROOT'].'/compile_epub_test/'.$epub->epub_file;
echo $result;
if (file_exists($result)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/force-download');
    header('Content-Disposition: attachment; filename='.basename($result));
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Content-Length: ' . filesize($result));
    ob_clean();
    flush();
    readfile($result);
    @unlink($result);
}*/

echo json_encode($result);

?>