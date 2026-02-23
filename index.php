<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Weather App</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="background-animation">
        <div class="cloud cloud1"></div>
        <div class="cloud cloud2"></div>
        <div class="cloud cloud3"></div>
    </div>

    <div class="container">
        <!-- Search Section -->
        <header>
            <h1 class="app-title">Weather Application</h1>
            <form id="search-form">
                <div class="search-box">
                    <i class="fa-solid fa-location-dot location-icon"></i>
                    <input type="text" id="city-input" placeholder="Search a city..." autocomplete="off">
                    <button type="submit" id="search-btn"><i class="fa-solid fa-magnifying-glass"></i></button>
                    <!-- Suggestions Dropdown -->
                    <ul id="suggestions" class="suggestions-list hidden"></ul>
                </div>
            </form>
        </header>
 
        <!-- Loading State -->
        <div id="loading" class="hidden">
            <div class="spinner"></div>
            <p>Fetching weather data...</p>
        </div>

        <!-- Error State -->
        <div id="error-message" class="hidden">
            <p>City not found. Please try again.</p>
        </div>

        <!-- Weather Content (Initially Hidden) -->
        <main id="weather-content" class="hidden">
            <!-- Current Weather -->
            <section class="current-weather glass-panel">
                <div class="weather-main">
                    <img id="current-icon" src="" alt="Weather Icon">
                    <div class="temp">
                        <span id="current-temp">--</span>°C
                    </div>
                </div>
                <div class="weather-details">
                    <h1 id="city-name">--</h1>
                    <p id="weather-desc">--</p>
                    <p class="date" id="current-date">--</p>
                </div>
                <div class="weather-metrics">
                    <div class="metric">
                        <i class="fa-solid fa-water"></i>
                        <span id="humidity">--%</span>
                        <p>Humidity</p>
                    </div>
                    <div class="metric">
                        <i class="fa-solid fa-wind"></i>
                        <span id="wind-speed">-- km/h</span>
                        <p>Wind</p>
                    </div>
                    <div class="metric">
                        <i class="fa-solid fa-temperature-half"></i>
                        <span id="feels-like">--°C</span>
                        <p>Feels Like</p>
                    </div>
                </div>
            </section>

            <!-- Hourly Forecast (Today) -->
            <section class="hourly-forecast glass-panel">
                <h3>Today's Forecast</h3>
                <div class="forecast-scroll" id="hourly-container">
                    <!-- Hourly items dynamically injected here -->
                </div>
            </section>

            <!-- 10-Day Forecast -->
            <section class="daily-forecast glass-panel">
                <h3>10-Day Forecast</h3>
                <div class="daily-container" id="daily-container">
                    <!-- Daily items dynamically injected here -->
                </div>
            </section>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
