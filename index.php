<?php
/*
 * Twig (PHP template engine) is used for creating templates, widgets and containers.
 * documentation: http://twig.sensiolabs.org/
 *
 * usage example:
 * renderTemplate('/_dev/pages/homepage.twig');
*/
require_once '_dev/includes/Twig-1.15.0/lib/Twig/Autoloader.php';


$rules = array(
    //examples:
    //'category'  => "/category/(?'category'[\w\-]+)",        // '/category/category-slug'
    //'page'      => "/page/(?'page'about|contact)",          // '/page/about', '/page/contact'
    'news'   => "/news/(?'text'[^/]+)/(?'id'\d+)",          // '/news/some-text/51'
    'homepage' => "/",
    'news-list' => "/news",
    'news-detail' => "/news/news-detail.php",
    'calendar-list' => "/calendar",
    'calendar-detail' => "/calendar/calendar-detail.php",
    'links' => "/links.php",
    'contact' => "/contact",
    'faq' => "/faq.php",
    'search' => "/search(\?.*)?",
    'wizard' => "/wizard(/\?.*)?",
    'kitchensink-forms' => "/kitchensink/forms.php",
    'kitchensink-type' => "/kitchensink/type.php",
    'kitchensink-modal-and-tooltip' => "/kitchensink/modal-and-tooltip.php",
    'kitchensink-equal-height' => "/kitchensink/equal-height.php"
);


$uri = rtrim( dirname($_SERVER["SCRIPT_NAME"]), '/' );
$uri = '/' . trim( str_replace( $uri, '', $_SERVER['REQUEST_URI'] ), '/' );
$uri = urldecode( $uri );


// adding <meta http-equiv="X-UA-Compatible" content="IE=edge" /> in the HTML doesn't work, it has issues when combined with the conditional comments in the <html> tag
// therefore, we add it server side
//  more info: http://stackoverflow.com/q
header("X-UA-Compatible: IE=Edge");


foreach ( $rules as $template => $rule ) {
    if ( preg_match( '~^'.$rule.'$~i', $uri, $params ) ) {
        /*
         * $action contains the Twig template name,
         * $params the querystring
         * */


        //render the template and output it
        Twig_Autoloader::register();
        $loader = new Twig_Loader_Filesystem(__DIR__); 	//use project root ("/ike") as basepath to templates. This way, PHP Storm autocompleting in .twig fiels works correctly
        $twig = new Twig_Environment($loader, array(
            'cache' => false,							//path to cache OR false
        ));

        //create a request object, that will expose the GET and POST to twig
        $request = array("GET" => $_GET, "POST" => $_POST);

        $twig->addGlobal("request", $request);
        $twig->addGlobal("currentUrl", strtok($_SERVER["REQUEST_URI"],'?'));
        $twig->display('/_dev/pages/' . $template . '.twig');

        // exit to avoid the 404 message
        exit();

    }
}

echo('No template specified for url "'. $uri . '". Please specify it in the $rules array in index.php');

