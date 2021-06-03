// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data.features);
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>" + 'Magnitude:  ' + feature.properties.mag + "</p>" +
      "</h3><p>" + 'Depth:  ' + feature.geometry.coordinates[2] + "</p>");
  }


  // Create functions for circle size
  function circleSize(magnitude) {

    return magnitude * 4;
  }

  // Create a function for color
  function color(depth) {

    // if (depth <= -10) {
    //   return '#FFA07A'; 
    // }
    if (depth <= 10) {
      return '#32CD32';  // LimeGreen
    }
    if (depth <= 30) {
      return '#ADFF2F';  // GreenYellow
    }
    if (depth <= 50) {
      return '#FFD700';  // Gold
    }
    if (depth <= 70) {
      return '#FFA500';  // Orange
    }
    if (depth <= 90) {
      return '#FF4500';  // OrangeRed
    }
    else {
      return '#B22222';  // FireBrick
    }
  }

  // Create Circles
  function circlelayer(feature, latlng) {
    var circle = L.circleMarker(latlng, {
      stroke: true,
      fillOpacity: 1,
      color: color(feature.geometry.coordinates[2]),
      fillColor: color(feature.geometry.coordinates[2]),
      radius: circleSize(feature.properties.mag)
    });
    return circle
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: circlelayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Create a legend
  colors_for_legend = ['#32CD32', '#ADFF2F', '#FFD700', '#FFA500', '#FF4500', '#B22222',]

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
      depth = [-10, 10, 30, 50, 70, 90,],
      colors = colors_for_legend;


    // Loop through
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);

}