// Creates the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

// Create satellite tile layer
var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
});

// Create street tile layer
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "streets-v11",
    accessToken: API_KEY
});


// Url for GeoJSON from USGS for All Earthquakes in Past 7 Days
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Url for GeoJSON from tectonicplates Github repository
const plate_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

/************************************/
// Pull json data from both urls using d3.js
d3.json(url).then((quakeData) => {
    d3.json(plate_url).then((plateData) => {
    
    // Initialize empty list for earthquake circle markers
    var quakeMarks = [];
    // Grab list of earthquakes
    var quakes = quakeData.features;

    // Loop through list of earthquakes
    quakes.forEach(item => {
        // Grab location of earthquake 
        var place = item.properties.place;

        // Grab latitude and longitude coordinates of earthquake
        var lat = item.geometry.coordinates[1];
        var lng = item.geometry.coordinates[0];

        // Grab magnitude of earthquake
        var mag = item.properties.mag;

        // Grab depth of earthquake
        var depth = item.geometry.coordinates[2];

        // Create circle marker for earthquake
        // Depth represented by color
        // Magnitude represented by radius of circle
        // Push in quakeMarks list
        // Popup text bound to circle marker
        quakeMarks.push(
            L.circle([lat,lng], {
                color: "black",
                weight: 1,
                fillColor: pickColor(depth),
                fillOpacity: 1,
                radius: mag*30000
            }).bindPopup(`<h3>${place}</h3>
                           <h3>Magnitude: ${mag}</h3>
                           <h3>Depth: ${depth} km</h3>`));
    });
    
    // Initialize empty list for tectonic plate lines
    var plateLines = [];

    // Grab list of tectonic plate lines
    var plates = plateData.features;


    // Loop through plates list
    plates.forEach(item => {
        var latlngs = item.geometry.coordinates;

        // Initialize new coordinate list and flip lat and lng
        var realCoord = [];
        latlngs.forEach(item2 => {
            var coords = [item2[1],item2[0]];
            realCoord.push(coords);
        })

        // Create polyline using flipped coordinates
        // (the coordinates in the original list were flipped,
        // causing the resulting lines to be out of place)
        var polyline = L.polyline(realCoord, {color:'orange'})

        // Push polyline to plateLines list
        plateLines.push(polyline);
    });

    // Add all the quakeMarks to a new layer group
    var quakerLayer = L.layerGroup(quakeMarks); 

    // Creates the map with our layers
    var myMap = L.map("mapid", {
        center: [50, -50],
        zoom: 3,
        layers: [lightmap, quakerLayer]
    });

    // Add all the plateLines to a new layer group
    var plateLayer = L.layerGroup(plateLines);
   
    // Creates legend for earthquake map
    var legend = L.control({
    position: "bottomright"
    });

    // Layer control added
    legend.onAdd = function() {

    // Create div to contain legend
    var div = L.DomUtil.create("div", "legend");
    // Colors to categorize earthquake depths
    var depths = ["-10-10","10-30","30-50","50-70","70-90","90+"];
    depthCategory = [pickColor(0),pickColor(10),pickColor(30),pickColor(50),pickColor(70),pickColor(90)];
    var labels = [];

    // Attaching depth colors and text to legend
    var legendInfo = "<ul>";

    // Loop through depthCategory
    for (i=0;i<depthCategory.length;i++) {
      // Append li with respective background color and depth description
      // According to index i
      labels.push(`<div class="rectangle" style="background-color:${depthCategory[i]}"><div class="text">
                   <li>${depths[i]}</li></div></div>`);
    }

    // Add legendInfo into HTML for div
    div.innerHTML = legendInfo + labels.join("") + "</ul>";

    // Return finished div tag for legend
    return div;
    };

    // Add legend to map
    legend.addTo(myMap);

    // Create base maps layer to be added to controls later
    var baseMaps = {
        "Light": lightmap,
        "Satellite": satmap,
        "Street": streetmap
    };

    // Create overlays layer to be added to controls later 
    var overlayMaps = {
        "Earthquakes": quakerLayer,
        "Tectonic Plates": plateLayer
    };

    // Pass map layers into layer control
    // Add layer control to map
    L.control.layers(baseMaps,overlayMaps, {collapsed: false}).addTo(myMap);
    
  })   
});



/************************************/
// Function that picks color based on depth
function pickColor(depthNum) {
  // Declares variable for color
  var color;

  // Checks if depth is above or equal to 90
  if (depthNum >= 90) {
    color = "#FF4019";
  }

  // Checks if depth is above or equal to 70
  else if (depthNum >= 70) {
    color = "#FF8C19";
  }

  // Checks if depth is above or equal to 50
  else if (depthNum >= 50) {
    color = "#FFB319";
  }

  // Checks if depth is above or equal to 30
  else if (depthNum >= 30) {
    color = "#FFD919";
  }

  // Checks if depth is above or equal to 10
  else if (depthNum >= 10) {
    color = "#B3FF19";
  }

  // Default if depth is less than 10
  else {
    color = "#66FF19";
  }

  // Returns chosen color
  return color;
}



