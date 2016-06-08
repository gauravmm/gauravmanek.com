<?php
$files = array("index_iPad.html", "display_canvas_iPad.js", "display_iPad.css", "game_v2.js", "touch.js", "main.css", "date.php", "add-to-homescreen.png"); 

header("Content-Type: text/cache-manifest");
?>
CACHE MANIFEST
# Manifest for Minesweeper3D
# Uses filemtime() to automatically change contents

<?php
foreach ($files as $fn)
	echo $fn."\n# Mod:".filemtime($fn)."\n\n";
?>