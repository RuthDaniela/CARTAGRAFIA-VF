<?php
	session_start();
	$lengcodiOrigen=$_GET["lengcodiOrigen"];
	$lengcodiDestino=$_GET["lengcodiDestino"];
	$text=$_GET["texto"];
	// --------------------------------------
	$apiKey = 'AIzaSyBKwQ5osKQcZIsLnqoY7Wn8DLRdzPiibFM';
  $url = 'https://www.googleapis.com/language/translate/v2?key=' . $apiKey . '&q=' . rawurlencode($text) . '&source=' . $lengcodiOrigen . '&target=' . $lengcodiDestino;
	//echo $url;
	//exit();
  $handle = curl_init($url);
  curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($handle);
  $responseDecoded = json_decode($response, true);
  curl_close($handle);
  echo $responseDecoded['data']['translations'][0]['translatedText'];
?>
