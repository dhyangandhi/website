// Weather widget for 7-day local forecast using Open-Meteo (no API key required)
// Fetches forecast, computes a "bike score", and renders a grid

(function () {
    const forecastContainer = document.getElementById('weather-forecast');
    const locationEl = document.getElementById('weather-location');
    const errorEl = document.getElementById('weather-error');

    if (!forecastContainer) return;

    const geocodeReverse = async (lat, lon) => {
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed reverse geocoding');
            const data = await res.json();
            const place = data?.results?.[0];
            const parts = [place?.name, place?.admin1, place?.country].filter(Boolean);
            return parts.join(', ') || 'Your location';
        } catch (_) {
            return 'Your location';
        }
    };

    const fetchForecast = async (lat, lon) => {
        // Daily variables: temp min/max, precipitation probability, wind speed, weather code
        const params = new URLSearchParams({
            latitude: String(lat),
            longitude: String(lon),
            daily: [
                'temperature_2m_max',
                'temperature_2m_min',
                'precipitation_probability_max',
                'windspeed_10m_max',
                'weathercode'
            ].join(','),
            forecast_days: '7',
            timezone: 'auto'
        });
        const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed fetching forecast');
        return res.json();
    };

    const computeBikeScore = (tMax, tMin, precipProb, windMax) => {
        // Simple heuristic: prefer mild temps (18-26C), low precip, moderate wind
        const tempMid = (tMax + tMin) / 2;
        let tempScore = 100 - Math.min(Math.abs(tempMid - 22) * 8, 100);
        let precipScore = 100 - (precipProb ?? 0); // lower is better
        let windScore = 100 - Math.max(0, windMax - 10) * 5; // penalize wind >10 km/h
        tempScore = Math.max(0, Math.min(100, tempScore));
        precipScore = Math.max(0, Math.min(100, precipScore));
        windScore = Math.max(0, Math.min(100, windScore));
        // Weighted average
        return Math.round(tempScore * 0.45 + precipScore * 0.4 + windScore * 0.15);
    };

    const wmoToEmoji = (code) => {
        // Minimal mapping for quick readability
        if ([0].includes(code)) return '☀️';
        if ([1, 2].includes(code)) return '🌤️';
        if ([3].includes(code)) return '☁️';
        if ([45, 48].includes(code)) return '🌫️';
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
        if ([56, 57, 66, 67].includes(code)) return '🌧️❄️';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
        if ([95, 96, 99].includes(code)) return '⛈️';
        return '🌡️';
    };

    const render = (daily) => {
        const dates = daily.time;
        const tMax = daily.temperature_2m_max;
        const tMin = daily.temperature_2m_min;
        const precip = daily.precipitation_probability_max || [];
        const wind = daily.windspeed_10m_max || [];
        const weatherCode = daily.weathercode || [];

        const days = dates.map((d, i) => {
            const score = computeBikeScore(tMax[i], tMin[i], precip[i], wind[i]);
            return {
                date: d,
                score,
                tMax: Math.round(tMax[i]),
                tMin: Math.round(tMin[i]),
                precip: precip[i] ?? 0,
                wind: Math.round(wind[i] ?? 0),
                code: weatherCode[i]
            };
        });

        const best = days.reduce((a, b) => (b.score > a.score ? b : a), days[0]);

        forecastContainer.innerHTML = days.map(day => {
            const dateObj = new Date(day.date);
            const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const isBest = day.date === best.date;
            return `
                <div class="weather-card${isBest ? ' best' : ''}" tabindex="0" aria-label="${dayName} ${dateStr} bike score ${day.score}">
                    <div class="weather-day">${dayName}</div>
                    <div class="weather-date">${dateStr}</div>
                    <div class="weather-icon">${wmoToEmoji(day.code)}</div>
                    <div class="weather-temps">
                        <span class="tmax">${day.tMax}°</span>
                        <span class="tmin">${day.tMin}°</span>
                    </div>
                    <div class="weather-meta">
                        <span class="precip" title="Precipitation probability">💧${day.precip}%</span>
                        <span class="wind" title="Max wind">💨${day.wind} km/h</span>
                    </div>
                    <div class="bike-score" title="Bike score">${day.score}</div>
                    ${isBest ? '<div class="badge">Best</div>' : ''}
                </div>
            `;
        }).join('');
    };

    const setError = (message) => {
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.hidden = false;
    };

    const init = async () => {
        try {
            let lat, lon;
            // Try browser geolocation
            const getPosition = () => new Promise((resolve, reject) => {
                if (!('geolocation' in navigator)) return reject(new Error('Geolocation not supported'));
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
            });

            try {
                const pos = await getPosition();
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
            } catch (_) {
                // Fallback: IP-based geolocation via Open-Meteo (no key)
                const res = await fetch('https://ipapi.co/json/');
                if (!res.ok) throw new Error('Failed IP geolocation');
                const data = await res.json();
                lat = data.latitude;
                lon = data.longitude;
            }

            if (locationEl) {
                const name = await geocodeReverse(lat, lon);
                locationEl.textContent = name;
            }

            const data = await fetchForecast(lat, lon);
            render(data.daily);
        } catch (err) {
            setError('Unable to load weather. Please try again later.');
        }
    };

    init();
})();

