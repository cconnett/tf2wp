<?php
$db = mysql_pconnect("mysql.connett.net", "alphachannel", "smackdog");
if (!$db) {
  die('Could not connect to database: '. mysql_error());
 }
mysql_select_db("tf2wp");

$point = $_GET["point"];
$attackers = "Blue";
$defenders = "Red";
$o = "b";
$d = "r";
if ($point < 3) {
  $point = (6 - $point);
  $attackers = "Red";
  $defenders = "Blue";
  $o = "r";
  $d = "b";
 }

$arr = array("fightsWon" => 0, "roundsWon" => 0, "sampleSize" => 0);
for($i = 0; $i < 2; $i += 1) {
  $query = "select " .
    "sum(fightsWon) fightsWon, " .
    "sum(roundsWon) roundsWon, " .
    "sum(sampleSize) sampleSize " .
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
  if (mysql_error()) {
    var_dump(mysql_error());
  }
  if ($result) {
    $row = mysql_fetch_array($result);
	print "<!--"; var_dump($row); print "-->";
	if ($i == 0) {
      $arr["fightsWon"] += $row["fightsWon"];
      $arr["roundsWon"] += $row["roundsWon"];
      $arr["sampleSize"] += $row["sampleSize"];
	} else {
      $arr["fightsWon"] += $row["sampleSize"] - $row["fightsWon"];
      $arr["roundsWon"] += $row["sampleSize"] - $row["roundsWon"];
      $arr["sampleSize"] += $row["sampleSize"];
	}
  }

  if ($point == 3) {
    $o = "r"; $d = "b";
	if ($i == 1 &&
            $_GET[$o . "1"] == $_GET[$d . "1"] &&
            $_GET[$o . "2"] == $_GET[$d . "2"] &&
            $_GET[$o . "4"] == $_GET[$d . "4"] &&
            $_GET[$o . "7"] == $_GET[$d . "7"] &&
            $_GET[$o . "c"] == $_GET[$d . "c"]) {
      $arr["fightsWon"] /= 2;
      $arr["roundsWon"] /= 2;
      $arr["sampleSize"] /= 2;
    }
  } else {
    break;
  }
}
if ($arr["sampleSize"]) {
  $fwp = (int)round($arr["fightsWon"] / $arr["sampleSize"] * 100, 0);
  $rwp = (int)round($arr["roundsWon"] / $arr["sampleSize"] * 100, 0);
  $dfwp = 100 - $fwp;
  $drwp = 100 - $rwp;
  $moe = (int)round(0.82/sqrt($arr["sampleSize"]) * 100, 0);
  if ($moe == 0) {
    $moe = "< 0.5";
  }
  //$moe = $arr["sampleSize"];
} else {
  $fwp = "No data";
  $rwp = "No data";
  $dfwp = "No data";
  $drwp = "No data";
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
    <td class="wp"><?php print $dfwp;?>%</td>
    <td class="moe">&plusmn;<?php print $moe;?>%</td>
  </tr>
  <tr>
    <td class="label">P(<?php print $defenders ?> Wins Round):</td>
    <td class="wp"><?php print $drwp;?>%</td>
    <td class="moe">&plusmn;<?php print $moe;?>%</td>
  </tr>
</tbody>
</table>

<?php mysql_close($db); ?>
