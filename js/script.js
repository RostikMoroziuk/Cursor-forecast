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
    + DARKSKY_KEY + "/" + location.latitude + "," + location.longitude + "," + currentTimeInSecond + 
    "?units=auto&exclude=minutely,alerts,flags,daily,currently" + "&callback=renderWidget").attr("data-request", "data-request");
    $("body").append(jsonp);
  }

  //return day in seconds if day is defined, else return current day
  function getDate(day) {
    if(day) {
      //return time in second
      return (new Date(day).getTime()/1000);
    }

    return parseInt(Date.now()/1000);
  }

  function getFormatedDate(date) {
    return [date.getDate(), date.getMonth(), date.getFullYear()].join("/");
  }

  function renderWidget(weather) {
    var NIGHT = 3,
    MORNING = 9,
    AFTERNONN = 15,
    EVENING = 21;

    var hourly = weather.hourly.data;
    var summary = weather.hourly.summary;

    var date = new Date();

    var currently, currentlyPartOfDay; //current part of day
    if(date.getHours() < 6) {
      currently = hourly[NIGHT];
      currentlyPartOfDay = "night";
    } else if(date.getHours() < 12) {
      currently = hourly[MORNING];
      currentlyPartOfDay = "morning"
    } else if(date.getHours() < 18) {
      currently = hourly[AFTERNONN];
      currentlyPartOfDay = "afternoon"
    } else {
      currently = hourly[EVENING];
      currentlyPartOfDay = "evening"
    }

    //set header for current weather
    $("h2.weather").text(currently.summary);

    $(".weather-icon .icon").attr("src", "img/" + currently.icon + ".svg");
    $(".weather-description").text(summary);

    $(".city").text(location.city);
    $(".date").text(getFormatedDate(date) + " " + currentlyPartOfDay);

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