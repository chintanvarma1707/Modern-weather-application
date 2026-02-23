<?php
header('Content-Type: application/json');

if (!isset($_GET['city'])) {
    echo json_encode(['error' => 'City parameter is missing']);
    exit;
}

$city = urlencode($_GET['city']);

// 1. Get Coordinates using Open-Meteo Geocoding API
$geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name={$city}&count=1&language=en&format=json";

$geo_ch = curl_init();
curl_setopt($geo_ch, CURLOPT_URL, $geoUrl);
curl_setopt($geo_ch, CURLOPT_RETURNTRANSFER, true);
$geoResponse = curl_exec($geo_ch);
curl_close($geo_ch);

if (!$geoResponse) {
    echo json_encode(['error' => 'Failed to reach Geocoding API']);
    exit;
}

$geoData = json_decode($geoResponse, true);

if (!isset($geoData['results']) || count($geoData['results']) === 0) {
    echo json_encode(['error' => 'City not found']);
    exit;
}

$lat = $geoData['results'][0]['latitude'];
$lon = $geoData['results'][0]['longitude'];
$cityName = $geoData['results'][0]['name'];
$country = $geoData['results'][0]['country'];

// 2. Fetch Weather Data (Current, Hourly, and 10-Day Daily)
// Hourly includes temperature and weather code for today's scroll
// Daily includes min/max temp and weather code for next 10 days
$weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude={$lat}&longitude={$lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=0&forecast_days=10";

$weather_ch = curl_init();
curl_setopt($weather_ch, CURLOPT_URL, $weatherUrl);
curl_setopt($weather_ch, CURLOPT_RETURNTRANSFER, true);
$weatherResponse = curl_exec($weather_ch);
curl_close($weather_ch);

if (!$weatherResponse) {
    echo json_encode(['error' => 'Failed to reach Weather API']);
    exit;
}

$weatherData = json_decode($weatherResponse, true);

// Combine location info with weather info
$result = [
    'location' => [
        'name' => $cityName,
        'country' => $country,
        'timezone' => $weatherData['timezone'] ?? ''
    ],
    'weather' => $weatherData
];

echo json_encode($result);
?>
