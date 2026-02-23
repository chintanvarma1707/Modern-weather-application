const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const weatherContent = document.getElementById('weather-content');

// Elements to update
const cityNameEl = document.getElementById('city-name');
const weatherDescEl = document.getElementById('weather-desc');
const currentDateEl = document.getElementById('current-date');
const currentTempEl = document.getElementById('current-temp');
const currentIconEl = document.getElementById('current-icon');

const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const feelsLikeEl = document.getElementById('feels-like');

const hourlyContainer = document.getElementById('hourly-container');
const dailyContainer = document.getElementById('daily-container');
const suggestionsList = document.getElementById('suggestions');

// Weather Code Mapping for Icons and Descriptions (WMO codes)
const weatherCodeMap = {
    0: { desc: 'Clear sky', icon: 'sun.png', isDayOnly: true },
    1: { desc: 'Mainly clear', icon: 'cloud-sun.png', isDayOnly: true },
    2: { desc: 'Partly cloudy', icon: 'cloud-sun.png', isDayOnly: true },
    3: { desc: 'Overcast', icon: 'cloud.png' },
    45: { desc: 'Fog', icon: 'fog.png' },
    48: { desc: 'Depositing rime fog', icon: 'fog.png' },
    51: { desc: 'Light drizzle', icon: 'drizzle.png' },
    53: { desc: 'Moderate drizzle', icon: 'drizzle.png' },
    55: { desc: 'Dense drizzle', icon: 'drizzle.png' },
    61: { desc: 'Slight rain', icon: 'rain.png' },
    63: { desc: 'Moderate rain', icon: 'rain.png' },
    65: { desc: 'Heavy rain', icon: 'rain.png' },
    71: { desc: 'Slight snow fall', icon: 'snow.png' },
    73: { desc: 'Moderate snow fall', icon: 'snow.png' },
    75: { desc: 'Heavy snow fall', icon: 'snow.png' },
    77: { desc: 'Snow grains', icon: 'snow.png' },
    80: { desc: 'Slight rain showers', icon: 'rain.png' },
    81: { desc: 'Moderate rain showers', icon: 'rain.png' },
    82: { desc: 'Violent rain showers', icon: 'rain.png' },
    85: { desc: 'Slight snow showers', icon: 'snow.png' },
    86: { desc: 'Heavy snow showers', icon: 'snow.png' },
    95: { desc: 'Thunderstorm', icon: 'thunderstorm.png' },
    96: { desc: 'Thunderstorm with slight hail', icon: 'thunderstorm.png' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'thunderstorm.png' }
};

// Map icons to reliable URLs or local assets. Using direct URLs for simplicity here.
function getIconUrl(code, isDay = 1) {
    // Open-Meteo doesn't provide icons, so we map WMO codes to generic visual representations.
    // For a production app, you'd have local SVGs. Here we'll map to simple unicode emojis or font-awesome classes if we wanted, 
    // but the request asked for premium. Let's use some nice external placeholder images for the weather app.

    // We will use standard icons from OpenWeatherMap since they are public and easy for mapping
    const owmMap = {
        0: isDay ? '01d' : '01n', // Clear
        1: isDay ? '02d' : '02n', // Mainly clear
        2: isDay ? '03d' : '03n', // Partly cloudy
        3: '04d',                 // Overcast (same day/night usually)
        45: '50d',                // Fog
        48: '50d',                // Fog
        51: '09d',                // Drizzle
        53: '09d',
        55: '09d',
        61: '10d',                // Rain
        63: '10d',
        65: '10d',
        71: '13d',                // Snow
        73: '13d',
        75: '13d',
        77: '13d',
        80: '09d',                // Showers
        81: '09d',
        82: '09d',
        85: '13d',
        86: '13d',
        95: '11d',                // Thunderstorm
        96: '11d',
        99: '11d'
    };

    const iconCode = owmMap[code] || (isDay ? '01d' : '01n');
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

// --- Autocomplete Suggestions Logic ---

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Fetch suggestions
async function fetchSuggestions(query) {
    if (!query) {
        suggestionsList.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            renderSuggestions(data.results);
        } else {
            suggestionsList.classList.add('hidden');
        }
    } catch (err) {
        console.error('Error fetching suggestions:', err);
    }
}

// Render suggestions
function renderSuggestions(results) {
    suggestionsList.innerHTML = '';

    results.forEach(result => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';

        let subText = result.country || '';
        if (result.admin1) {
            subText = `${result.admin1}, ` + subText;
        }

        li.innerHTML = `
            <span class="city">${result.name}</span>
            <span class="country">${subText}</span>
        `;

        li.addEventListener('click', () => {
            cityInput.value = result.name;
            suggestionsList.classList.add('hidden');
            form.dispatchEvent(new Event('submit'));
        });

        suggestionsList.appendChild(li);
    });

    suggestionsList.classList.remove('hidden');
}

// Input event listener for suggestions
cityInput.addEventListener('input', debounce((e) => {
    fetchSuggestions(e.target.value.trim());
}, 300));

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        suggestionsList.classList.add('hidden');
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    suggestionsList.classList.add('hidden');
    const city = cityInput.value.trim();
    if (!city) return;

    // UI State
    weatherContent.classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch(`api.php?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        updateUI(data);

        loading.classList.add('hidden');
        weatherContent.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        loading.classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
        // fallback text 
        document.querySelector('#error-message p').innerText = err.message || "Failed to fetch weather data.";
    }
});

function updateUI(data) {
    const loc = data.location;
    const current = data.weather.current;
    const daily = data.weather.daily;
    const hourly = data.weather.hourly;

    const weatherInfo = weatherCodeMap[current.weather_code] || { desc: 'Unknown' };

    // 1. Current Weather
    cityNameEl.textContent = `${loc.name}, ${loc.country}`;
    weatherDescEl.textContent = weatherInfo.desc;

    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    currentTempEl.textContent = Math.round(current.temperature_2m);
    currentIconEl.src = getIconUrl(current.weather_code, current.is_day);

    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;
    feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;

    // 2. Hourly Forecast (next 24 hours starting from current hour)
    hourlyContainer.innerHTML = '';

    // Find index of current hour in the hourly array
    const currentHourString = now.toISOString().slice(0, 13) + ":00"; // roughly matches open-meteo format format

    // Open meteo returns time as ["2023-10-25T00:00", ... ]
    let startIndex = hourly.time.findIndex(t => {
        const tDate = new Date(t);
        return tDate.getTime() >= now.getTime();
    });

    if (startIndex === -1) startIndex = 0; // fallback

    for (let i = startIndex; i < startIndex + 24; i++) {
        if (!hourly.time[i]) break; // prevent out of bounds

        const timestamp = new Date(hourly.time[i]);
        const hourLabel = i === startIndex ? 'Now' : timestamp.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

        const temp = Math.round(hourly.temperature_2m[i]);
        const code = hourly.weather_code[i];

        // simple day/night check for hourly based on hour (6am to 6pm day)
        const isD = (timestamp.getHours() > 6 && timestamp.getHours() < 18) ? 1 : 0;

        const markup = `
            <div class="hourly-item">
                <span>${hourLabel}</span>
                <img src="${getIconUrl(code, isD)}" alt="Icon">
                <span class="h-temp">${temp}°C</span>
            </div>
        `;
        hourlyContainer.insertAdjacentHTML('beforeend', markup);
    }

    // 3. Daily Forecast (10 days mapping)
    dailyContainer.innerHTML = '';
    for (let i = 0; i < daily.time.length; i++) {
        // Skip today if desired, but good to show full list
        const dateObj = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

        const code = daily.weather_code[i];
        const maxT = Math.round(daily.temperature_2m_max[i]);
        const minT = Math.round(daily.temperature_2m_min[i]);
        const desc = weatherCodeMap[code] ? weatherCodeMap[code].desc : 'Unknown';

        const markup = `
            <div class="daily-item">
                <span class="d-day">${dayName}</span>
                <img class="d-icon" src="${getIconUrl(code, 1)}" alt="${desc}" title="${desc}">
                <div class="d-temps">
                    <span class="max">${maxT}°</span>
                    <span class="min">${minT}°</span>
                </div>
            </div>
        `;
        dailyContainer.insertAdjacentHTML('beforeend', markup);
    }
}

// Default search on load (optional)
document.addEventListener('DOMContentLoaded', () => {
    cityInput.value = 'Ahmedabad';
    form.dispatchEvent(new Event('submit'));
});
