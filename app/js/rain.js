var weather = document.getElementById('weather-message');
var latitude, longitude, forecastURL, googleURL, locationName, rainStatus, rainOrNoRain;
var rainArray = ["rain", "sleet"];

function success(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;

  // Forecast.io weather data
  forecastURL = 'https://api.forecast.io/forecast/' + f + '/' + latitude + ',' + longitude;
  $.ajax({
    dataType: "jsonp",
    url: forecastURL,
    cache: false,
    success: function(data) {
      rainStatus = data.currently.icon;
      if($.inArray(rainStatus, rainArray) >= 0){
        // It's raining
        rainOrNoRain = {
          rain: "rain",
          icon: "#rain"
        };
      } else {
        // There's no rain (but there could be snow)
        rainOrNoRain = {
          rain: "no rain",
          icon: "#norain"
        };
      }
      // We know if it's raining or not, but where are they?
      getLocationName();
    }
  });
}

// Google Maps Geocoding location look up
function getLocationName(){
  googleURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&result_type=street_address&key=' + g;
  $.ajax({
    dataType: "json",
    url: googleURL,
    cache: false,
    success: function(data){
      locationName = data.results[0].address_components[2].short_name;
      showResults();
    }
  });
}

function error() {
  weather.innerHTML = "Unable to retrieve your location.";
}

function showResults(){
  $(rainOrNoRain.icon).show();
  weather.innerHTML = "There is currently " + rainOrNoRain.rain + " in " + locationName + ".";
}

$(function() {
  if (!navigator.geolocation) {
    weather.innerHTML = "Geolocation is not supported by your browser.";
    return;
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
});
