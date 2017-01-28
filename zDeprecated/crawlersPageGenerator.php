<?php
/**
 * This file creates a static page for crawlers such as Facebook or Twitter bots that cannot evaluate JavaScript.
 *
 * Created by PhpStorm.
 * User: Michael
 * Date: 30/06/14
 * Time: 14:31
 */

//$SITE_ROOT = "http://localhost/app/";
$SITE_ROOT = "http://www.casapetrirosiamontana.ro/";


$jsonData = getData($SITE_ROOT);
makePage($jsonData, $SITE_ROOT);


function getData($siteRoot)
{
//    echo $_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
    if ($_GET['pageUrl'] != '') {
        $pageUrl = $_GET['pageUrl'];
    } else {
        $pageUrl = 'home';
    }

    $rawData = file_get_contents($siteRoot . 'content/en/' . $pageUrl . '.json');
    return json_decode($rawData);
}

function makePage($data, $siteRoot)
{
    $imageUrl = $siteRoot . $data->presentation->metaData->displayOnShareImg;
    $pageUrl = $siteRoot . $data->presentation->url->link;
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <title><?php echo $data->presentation->metaData->title; ?></title>

        <!-- Twitter summary card metadata -->
        <meta property="twitter:card" content=""/>
        <meta property="twitter:site" content=""/>
        <meta property="twitter:title" content="<?php echo $data->presentation->metaData->title; ?>"/>
        <meta property="twitter:description" content="<?php echo $data->presentation->metaData->description; ?>"/>
        <meta property="twitter:image" content="<?php echo $imageUrl; ?>"/>
        <meta property="twitter:url" content="<?php echo $pageUrl; ?>"/>

        <!-- Facebook, Pinterest, Google Plus and others make use of open graph metadata -->
        <meta property="og:title" content="<?php echo $data->presentation->metaData->title; ?>"/>
        <meta property="og:description" content="<?php echo $data->presentation->metaData->description; ?>"/>
        <meta property="og:image" content="<?php echo $imageUrl; ?>"/>
        <meta property="og:type" content="article"/>
        <meta property="og:site_name" content="My Favourite Albums"/>
        <meta property="og:url" content="<?php echo $pageUrl; ?>"/>

    </head>
    <body>
    <p><?php echo $data->presentation->metaData->description; ?></p>
    <img src="<?php echo $imageUrl; ?>">
    </body>
    </html>
    <?php
}
