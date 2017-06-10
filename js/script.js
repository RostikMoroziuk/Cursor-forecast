(function () {
  var DARKSKY_KEY = "6889ad9bcdd14db1daf8b52c8671228b";
  var GOOGLE_MAPS_KEY = "AIzaSyBj04NfRVvaX5WVGELYfRwGhGUJHT0KZ3s";
  var NIGHT = 3,
    MORNING = 9,
    AFTERNONN = 15,
    EVENING = 21;

  //user location
  var location;
  //load weather
  function init() {
    navigator.geolocation.getCurrentPosition(getCurrentLocation, getDefaultLocation);
    $(".arrows .prev-time").click(prevTime);
    $(".arrows .next-time").click(nextTime);

    $(".prev").click(prevDate);
    $(".next").click(nextDate);
  }

  function prevTime() {
    if (!forecast.weather || forecast.current === 0) {
      return;
    }

    if (forecast.current === 3) {
      $(".arrows .next-time").removeClass("disabled")
    }

    var hour = forecast.PARTS[--forecast.current].hour;
    var part = forecast.PARTS[forecast.current].part;
    setData(forecast.weather.hourly.data[hour], part, forecast.date);

    if (forecast.current === 0) {
      $(".arrows .prev-time").addClass("disabled")
    }
  }

  function nextTime() {
    if (!forecast.weather || forecast.current === 3) {
      return;
    }

    if (forecast.current === 0) {
      $(".arrows .prev-time").removeClass("disabled")
    }

    var hour = forecast.PARTS[++forecast.current].hour;
    var part = forecast.PARTS[forecast.current].part;
    setData(forecast.weather.hourly.data[hour], part, forecast.date);

    if (forecast.current === 3) {
      $(".arrows .next-time").addClass("disabled")
    }
  }

  function prevDate() {
    if (!forecast.weather) {
      return;
    }

    //remove old request
    $("script[data-request]").remove();
    forecast.date.setDate(forecast.date.getDate() - 1);
    forecast.date.setHours(forecast.PARTS[forecast.current].hour);
    console.log(forecast.date);
    makeWeatherRequest(forecast.date);
  }

  function nextDate() {
    if (!forecast.weather) {
      return;
    }

    //remove old request
    $("script[data-request]").remove();
    forecast.date.setDate(forecast.date.getDate() + 1);
    forecast.date.setHours(forecast.PARTS[forecast.current].hour);
    console.log(forecast.date);
    makeWeatherRequest(forecast.date);
  }

  function getCurrentLocation(pos) {
    location = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    }
    getCity();
  }

  function getDefaultLocation(pos) {
    console.log("default");
    //default is kyiv
    location = {
      latitude: 50.439761,
      longitude: 30.528537,
      city: "Kyiv"
    }
    makeWeatherRequest(new Date);
  }

  function makeWeatherRequest(day) {
    var currentTimeInSecond = getDate(day.getTime());
    console.log(currentTimeInSecond);
    var jsonp = $("<script></script>").attr("src", "https://api.darksky.net/forecast/" +
      DARKSKY_KEY + "/" + location.latitude + "," + location.longitude + "," + currentTimeInSecond +
      "?units=auto&exclude=minutely,alerts,flags,daily,currently" + "&callback=renderWidget").attr("data-request", "data-request");
    $("body").append(jsonp);
  }

  //return day in seconds if day is defined, else return current day
  function getDate(day) {
    return parseInt(day / 1000);
  }

  function getFormatedDate(date) {
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join("/");
  }

  function renderWidget(weather) {
    forecast.weather = weather;

    var hourly = weather.hourly.data;
    var summary = weather.hourly.summary;

    var date;
    if (forecast.date) {
      date = forecast.date;
    } else {
      date = new Date();
    }

    var currently, currentlyPartOfDay; //current part of day
    if (date.getHours() < 6) {
      currently = hourly[NIGHT];
      currentlyPartOfDay = "night";
      forecast.current = 0;
    } else if (date.getHours() < 12) {
      currently = hourly[MORNING];
      currentlyPartOfDay = "morning";
      forecast.current = 1;
    } else if (date.getHours() < 18) {
      currently = hourly[AFTERNONN];
      currentlyPartOfDay = "afternoon";
      forecast.current = 2;
    } else {
      currently = hourly[EVENING];
      currentlyPartOfDay = "evening";
      forecast.current = 3;
    }

    forecast.date = date;

    //set header for current weather
    $(".weather-description").text(summary);
    setData(currently, currentlyPartOfDay, date);
  }

  function setData(currently, currentlyPartOfDay, date) {
    date = date;

    $("h2.weather").text(currently.summary);
    $(".weather-icon .icon").attr("src", "img/" + currently.icon + ".svg");

    $(".city").text(location.city);
    $(".date").text(getFormatedDate(date));
    $(".part-of-date").text(currentlyPartOfDay);

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
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 3) {
        console.log("loading");
      } else if (xhr.readyState == xhr.DONE && xhr.status == 200) {
        parseCity(JSON.parse(xhr.responseText));
        makeWeatherRequest(new Date());
      }
    }
    xhr.send();
  }

  function parseCity(geocode) {
    var city = _.find(geocode.results[0].address_components, function (a) {
      //array of locality types
      return _.indexOf(a.types, "locality") !== -1;
    })
    console.log(city);
    if (!city) {
      location.city = "UNKNOWN";
    } else {
      location.city = city.long_name
    }
  }

  //callback for darksky
  window.renderWidget = renderWidget;

  var forecast = {
    weather: null,
    current: null,
    date: null,
    PARTS: [{
        hour: NIGHT,
        part: "night"
      },
      {
        hour: MORNING,
        part: "morning"
      },
      {
        hour: AFTERNONN,
        part: "afternoon"
      },
      {
        hour: EVENING,
        part: "evening"
      }
    ]
  };

  init();
})()