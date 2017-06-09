(function () {
  var DARKSKY_KEY = "6889ad9bcdd14db1daf8b52c8671228b";
  var GOOGLE_MAPS_KEY = "AIzaSyBj04NfRVvaX5WVGELYfRwGhGUJHT0KZ3s";

  //user location
  var location;
  //load weather
  function weatherLoad() {
    navigator.geolocation.getCurrentPosition(getCurrentLocation);
  }

  function getCurrentLocation(pos) {
    location = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    }
    getCity();
  }

  function makeWeatherRequest() {
    var currentTimeInSecond = getDate();
    console.log(currentTimeInSecond);
    var jsonp = $("<script></script>").attr("src", "https://api.darksky.net/forecast/"
    + DARKSKY_KEY + "/" + location.latitude + "," + location.longitude + currentTimeInSecond + 
    "?units=auto&exclude=minutely,alerts,flags,daily" + "&callback=renderWidget");
    $("body").append(jsonp);
  }

  //return day in seconds if day is defined, else return current day
  function getDate(day) {
    if(day) {
      //return time in second
      return new Date(day).getTime()/1000;
    }

    return Date.now();
  }

  function getFormatedDate(date) {
    return [date.getDate(), date.getMonth(), date.getFullYear()].join("/");
  }

  function renderWidget(weather) {
    console.log(weather);
    var currently = weather.currently;
    var hourly = weather.hourly;

    var currentDate = new Date(currently.time*1000);

    //set header for current weather
    $("h2.weather").text(currently.summary);

    $(".weather-icon .icon").attr("src", "img/" + currently.icon + ".svg");
    $(".weather-description").text(hourly.summary);

    $(".city").text(location.city);
    $(".date").text(getFormatedDate(currentDate));

    $(".hourly-weather .icon").attr("src", "img/temperature.svg");
    $(".hourly-weather .temperature").text(currently.temperature);

    $(".temperature .value").text(currently.temperature);
    $(".humidity .value").text(currently.humidity);
    $(".wind-speed .value").text(currently.windSpeed);
    $(".cloud-cover .value").text(currently.cloudCover);
  }

  //get city by geolocation
  function getCity() {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
    location.latitude + "," + location.longitude + "&key=" + GOOGLE_MAPS_KEY);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 3) {
        console.log("loading");
      } else if(xhr.readyState == xhr.DONE && xhr.status == 200) {
        parseCity(JSON.parse(xhr.responseText));
        makeWeatherRequest();
      }
    }
    xhr.send();
  }

  function parseCity(geocode) {
    var city = _.find(geocode.results[0].address_components, function(a) {
      //array of locality types
      return _.indexOf(a.types, "locality") !== -1;
    })
    console.log(city);
    location.city = city.long_name || "UNKNOWN";
  }

  //callback for darksky
  window.renderWidget = renderWidget;

  weatherLoad();
})()