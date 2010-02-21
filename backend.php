<?php
$db = mysql_pconnect("mysql.connett.net", "alphachannel", "smackdog");
if (!$db) {
  die('Could not connect to database: '. mysql_error());
 }
mysql_select_db("tf2wp");

$point = $_GET["point"];
$attackers = "Red";
$defenders = "Blue";
$o = "r";
$d = "b";
if ($point < 3) {
  $point = (6 - $point);
  $attackers = "Blue";
  $defenders = "Red";
  $o = "b";
  $d = "r";
 }

$arr = array("fightsWon" => 0, "roundsWon" => 0, "sampleSize" => 0);
$query = "select fightsWon, roundsWon, sampleSize " .
  "from wpSummary " .
  "where o1 = '" . mysql_real_escape_string($_GET[$o . "1"]) .
  "' and o2 = '" . mysql_real_escape_string($_GET[$o . "2"]) .
  "' and o4 = '" . mysql_real_escape_string($_GET[$o . "4"]) .
  "' and o7 = '" . mysql_real_escape_string($_GET[$o . "7"]) .
  "' and oc = '" . mysql_real_escape_string($_GET[$o . "c"]) .
  "' and d1 = '" . mysql_real_escape_string($_GET[$d . "1"]) .
  "' and d2 = '" . mysql_real_escape_string($_GET[$d . "2"]) .
  "' and d4 = '" . mysql_real_escape_string($_GET[$d . "4"]) .
  "' and d7 = '" . mysql_real_escape_string($_GET[$d . "7"]) .
  "' and dc = '" . mysql_real_escape_string($_GET[$d . "c"]) .
  "' and map like '" . mysql_real_escape_string($_GET["map"]) .
  "' and point = '" . mysql_real_escape_string($point) . "'";
  $result = mysql_query($query, $db);

if ($result) {
  $row = mysql_fetch_array($result);
  $arr["fightsWon"] += $row["fightsWon"];
  $arr["roundsWon"] += $row["roundsWon"];
  $arr["sampleSize"] += $row["sampleSize"];
 }

if ($arr["sampleSize"]) {
  $fwp = (int)round($arr["fightsWon"] / $arr["sampleSize"] * 100, 0);
  $rwp = (int)round($arr["roundsWon"] / $arr["sampleSize"] * 100, 0);
  $moe = (int)round(0.82/sqrt($arr["sampleSize"]) * 100, 0);
  if ($moe == 0) {
    $moe = "< 0.5";
  }
  //$moe = $arr["sampleSize"];
} else {
  $fwp = "No data";
  $rwp = "No data";
  $moe = "No data";
}
?>
<table>
<tbody>
  <tr>
    <td class="label">P(<?php print $attackers ?> Caps):</td>
    <td class="wp"><?php print $fwp; ?>%</td>
    <td class="moe">&plusmn;<?php print $moe;?>%</td>
  </tr>
  <tr>
    <td class="label">P(<?php print $attackers ?> Wins Round):</td>
    <td class="wp"><?php print $rwp;?>%</td>
    <td class="moe">&plusmn;<?php print $moe;?>%</td>
  </tr>
</tbody>
<tbody>
  <tr>
    <td class="label">P(<?php print $defenders ?> Caps):</td>
    <td class="wp"><?php print 100-$fwp;?>%</td>
    <td class="moe">&plusmn;<?php print $moe;?>%</td>
  </tr>
  <tr>
    <td class="label">P(<?php print $defenders ?> Wins Round):</td>
    <td class="wp"><?php print 100-$rwp;?>%</td>
    <td class="moe">&plusmn;<?php print $moe;?>%</td>
  </tr>
</tbody>
</table>

<?php mysql_close($db); ?>
