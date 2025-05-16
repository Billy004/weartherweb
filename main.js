const api = {
  key: "50ef793c38da69bcfa40418ea5523ee0",
  baseurl: "https://api.openweathermap.org/data/2.5/"
};

const searchbox = document.querySelector('.search-box');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const loadingSpinner = document.querySelector('.loading-spinner');
const errorMessage = document.querySelector('.error-message');
const unitBtns = document.querySelectorAll('.unit-btn');

let currentUnit = 'celsius';
let lastWeather = null;

// Event Listeners
searchbox.addEventListener('keypress', setQuery);
searchBtn.addEventListener('click', () => getResults(searchbox.value));
locationBtn.addEventListener('click', getCurrentLocation);
unitBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    unitBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentUnit = btn.dataset.unit;
    if (lastWeather) {
      displayResults(lastWeather);
    }
  });
});

function getCurrentLocation() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      error => {
        console.log('Error getting location:', error);
        showError();
        hideLoading();
      }
    );
  } else {
    showError();
  }
}

// Get user's location when the page loads
window.addEventListener('load', getCurrentLocation);

function setQuery(evt) {
  if (evt.keyCode === 13) {
    getResults(searchbox.value);
  }
}

function getWeatherByCoords(lat, lon) {
  showLoading();
  fetch(`${api.baseurl}weather?lat=${lat}&lon=${lon}&units=metric&appid=${api.key}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      return response.json();
    })
    .then(weather => {
      lastWeather = weather;
      displayResults(weather);
      hideLoading();
    })
    .catch(error => {
      showError();
      hideLoading();
    });
}

function getResults(query) {
  if (!query) return;
  
  showLoading();
  fetch(`${api.baseurl}weather?q=${query}&units=metric&appid=${api.key}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('City not found');
      }
      return response.json();
    })
    .then(weather => {
      lastWeather = weather;
      displayResults(weather);
      hideLoading();
    })
    .catch(error => {
      showError();
      hideLoading();
    });
}

function displayResults(weather) {
  let city = document.querySelector('.location .city');
  city.innerText = `${weather.name}, ${weather.sys.country}`;

  let now = new Date();
  let date = document.querySelector('.location .date');
  date.innerText = dateBuilder(now);

  let temp = document.querySelector('.current .temp');
  let tempValue = weather.main.temp;
  if (currentUnit === 'fahrenheit') {
    tempValue = (tempValue * 9/5) + 32;
  }
  temp.innerHTML = `${Math.round(tempValue)}<span>°${currentUnit === 'celsius' ? 'c' : 'f'}</span>`;

  let weather_el = document.querySelector('.current .weather');
  weather_el.innerText = weather.weather[0].main;

  let hilow = document.querySelector('.hi-low');
  let minTemp = weather.main.temp_min;
  let maxTemp = weather.main.temp_max;
  if (currentUnit === 'fahrenheit') {
    minTemp = (minTemp * 9/5) + 32;
    maxTemp = (maxTemp * 9/5) + 32;
  }
  hilow.innerText = `${Math.round(minTemp)}°${currentUnit === 'celsius' ? 'c' : 'f'} / ${Math.round(maxTemp)}°${currentUnit === 'celsius' ? 'c' : 'f'}`;

  // Update weather icon
  const weatherIcon = document.querySelector('.weather-icon i');
  weatherIcon.className = getWeatherIcon(weather.weather[0].id);

  // Update additional weather details
  document.querySelector('.wind').textContent = `${Math.round(weather.wind.speed * 3.6)} km/h`;
  document.querySelector('.humidity').textContent = `${weather.main.humidity}%`;
  document.querySelector('.pressure').textContent = `${weather.main.pressure} hPa`;
}

function getWeatherIcon(code) {
  if (code >= 200 && code < 300) return 'fas fa-bolt';
  if (code >= 300 && code < 400) return 'fas fa-cloud-rain';
  if (code >= 500 && code < 600) return 'fas fa-cloud-showers-heavy';
  if (code >= 600 && code < 700) return 'fas fa-snowflake';
  if (code >= 700 && code < 800) return 'fas fa-smog';
  if (code === 800) return 'fas fa-sun';
  if (code > 800) return 'fas fa-cloud';
  return 'fas fa-cloud';
}

function dateBuilder(d) {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day} ${date} ${month} ${year}`;
}

function showLoading() {
  loadingSpinner.classList.remove('hidden');
  errorMessage.classList.add('hidden');
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

function showError() {
  errorMessage.classList.remove('hidden');
}
