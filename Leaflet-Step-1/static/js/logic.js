// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

// Create the map with our layers
var myMap = L.map("mapid", {
    center: [50, -120],
    zoom: 4,
  });

// Add light tile layer to map
lightmap.addTo(myMap);

// Url for GeoJSON for All Earthquakes in Past 7 Days
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


/************************************/
d3.json(url).then((data) => {
    // Grab list of earthquakes
    var quakes = data.features;

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
        var circ = L.circle([lat,lng], {
                     color: "black",
                     weight: 1,
                     fillColor: pickColor(depth),
                     fillOpacity: 1,
                     radius: mag*30000
                     }).addTo(myMap);

                     
        // Popup text bound to circle marker
        circ.bindPopup(`<h3>${place}</h3>
                        <h3>Magnitude: ${mag}</h3>
                        <h3>Depth: ${depth} km</h3>`)
   });
   
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
      
});

/************************************/
// Function that picks color based on depth
function pickColor(depthNum) {

  // Declare color variable
  var color;

  // Check if depth is greater than or equal to 90
  if (depthNum >= 90) {
    color = "#FF4019";
  }

  // Check if depth is greater than or equal to 70
  else if (depthNum >= 70) {
    color = "#FF8C19";
  }
  
  // Check if depth is greater than or equal to 50
  else if (depthNum >= 50) {
    color = "#FFB319";
  }
  
  // Check if depth is greater than or equal to 30
  else if (depthNum >= 30) {
    color = "#FFD919";
  }

  // Check if depth is greater than or equal to 10
  else if (depthNum >= 10) {
    color = "#B3FF19";
  }

  // Default if depth is less than 10
  else {
    color = "#66FF19";
  }

  // Return the chosen color
  return color;
}



