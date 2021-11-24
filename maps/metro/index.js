
const stationRadius = 1 * 1.6 * 1000; // meters

function initMap() {
  // Create the map.
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 45.508889, lng: -73.654167 }
  });

  for (var name of ['blue', 'green', 'orange']) {
    addMetroLineToMap(metroLines[name], map);
  }
}

function addMetroLineToMap(line, map) {

  var metroline = [];
  var metro_turf_circles = [];

  for (const name of line.stationNames) {
    const station = metroStationsMap[name];

    console.log(name);

    metroline.push({lat: station.center[0], lng: station.center[1]});

    metro_turf_circles.push(
     geoCircle(station.center[0], station.center[1], stationRadius, 20)
    );
  }






  var metro_zone = metro_turf_circles[0];

  for (var i = 1; i < metro_turf_circles.length; i++) {
    metro_zone = turf.union(metro_zone, metro_turf_circles[i]);
  }

  var metro_boundary = [];
  for (const p of metro_zone.geometry.coordinates[0]) {
    metro_boundary.push({lat: p[0], lng: p[1]});
  }


  const metroLine = new google.maps.Polyline({
    path: metroline,
    geodesic: true,
    strokeColor: line.color,
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map
  });  

  // Add the circle for this city to the map.
  const metroBoundary = new google.maps.Polygon({
    paths: metro_boundary,
    strokeColor: line.color,
    strokeOpacity: 0.4,
    strokeWeight: 1,
    fillColor: line.color,
    fillOpacity: 0.2,
    map: map
  });
}




function geoCircle(lat, lng, dist, steps) {
  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    var bearing = (i * -360) / steps;

    destVincenty(lat, lng, bearing, dist, function(lat2, lng2, bearing2) {
      coordinates.push([lat2, lng2]);
    });
  }

  return turf.polygon([coordinates]);
}

function destVincenty(lat1, lon1, brng, dist, callback) {
  function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
  }

  function toDeg(Value) {
    /** Converts radians to numeric degrees */
    return Value * 180 / Math.PI;
  }

  var a = 6378137, b = 6356752.3142,  f = 1/298.257223563;  // WGS-84 ellipsiod
  var s = dist;
  var alpha1 = toRad(brng);
  var sinAlpha1 = Math.sin(alpha1);
  var cosAlpha1 = Math.cos(alpha1);

  var tanU1 = (1-f) * Math.tan(toRad(lat1));
  var cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1*cosU1;
  var sigma1 = Math.atan2(tanU1, cosAlpha1);
  var sinAlpha = cosU1 * sinAlpha1;
  var cosSqAlpha = 1 - sinAlpha*sinAlpha;
  var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
  var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
  var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

  var sigma = s / (b*A), sigmaP = 2*Math.PI;
  while (Math.abs(sigma-sigmaP) > 1e-12) {
    var cos2SigmaM = Math.cos(2*sigma1 + sigma);
    var sinSigma = Math.sin(sigma);
    var cosSigma = Math.cos(sigma);
    var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
      B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
    sigmaP = sigma;
    sigma = s / (b*A) + deltaSigma;
  }

  var tmp = sinU1*sinSigma - cosU1*cosSigma*cosAlpha1;
  var lat2 = Math.atan2(sinU1*cosSigma + cosU1*sinSigma*cosAlpha1,
      (1-f)*Math.sqrt(sinAlpha*sinAlpha + tmp*tmp));
  var lambda = Math.atan2(sinSigma*sinAlpha1, cosU1*cosSigma - sinU1*sinSigma*cosAlpha1);
  var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
  var L = lambda - (1-C) * f * sinAlpha *
      (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
  var lon2 = (toRad(lon1)+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

  var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing, if required

  var result = { lat: toDeg(lat2), lon: toDeg(lon2), finalBearing: toDeg(revAz) };

  if (callback !== undefined && callback instanceof Function) {
    if (callback.length === 3) {
      callback(result.lat, result.lon, result.finalBearing);
    }
    else {
      callback(result);
    }
  }

  return result;
}


const metroLines = {
  orange: {
    color: "#FF8800",
    stationNames: [
      "Côte-Vertu",
      "Du Collège",
      "De La Savane",
      "Namur",
      "Plamondon",
      "Côte-Sainte-Catherine",
      "Snowdon",
      "Villa-Maria",
      "Vendôme",
      "Place-Saint-Henri",
      "Lionel-Groulx",
      "Georges-Vanier",
      "Lucien-L'Allier",
      "Bonaventure",
      "Square-Victoria",
      "Place-d'Armes",
      "Champ-de-Mars",
      "Berri–UQAM",
      "Sherbrooke",
      "Mont-Royal",
      "Laurier",
      "Rosemont",
      "Beaubien",
      "Jean-Talon",
      "Jarry",
      "Crémazie",
      "Sauvé",
      "Henri-Bourassa",
    ]
  },
  green: {
    color: "#00AA00",
    stationNames: [
      "Angrignon",
      "Monk",
      "Jolicoeur",
      "Verdun",
      "De L'Église",
      "LaSalle",
      "Charlevoix",
      "Lionel-Groulx",
      "Atwater",
      "Guy–Concordia",
      "Peel",
      "McGill",
      "Place-des-Arts",
      "Saint-Laurent",
      "Berri–UQAM",
      "Beaudry",
      "Papineau",
      "Frontenac",
      "Préfontaine",
      "Joliette",
      "Pie-IX",
      "Viau",
      "Assomption",
      "Cadillac",
      "Langelier",
      "Radisson",
      "Honoré-Beaugrand",
    ]
  },
  blue: {
    color: "#4444FF",
    stationNames: [
      "Snowdon",
      "Côte-des-Neiges",
      "Université-de-Montréal",
      "Édouard-Montpetit",
      "Outremont",
      "Acadie",
      "Parc",
      "De Castelnau",
      "Jean-Talon",
      "Fabre",
      "D'Iberville",
      "Saint-Michel",
    ]
  }  
}

const metroStations = [
  // Mostly Orange Line

  {
    name: "Côte-Vertu",
    center: [ 45.514167, -73.683056 ],
  },
  {
    name: "Du Collège",
    center: [ 45.508889, -73.674167 ],
  },
  {
    name: "De La Savane",
    center: [ 45.500278, -73.661667 ],
  },
  {
    name: "Namur",
    center: [ 45.494722, -73.652778 ],
  },
  {
    name: "Plamondon",
    center: [ 45.495556, -73.640556 ],
  },
  {
    name: "Côte-Sainte-Catherine",
    center: [ 45.492222, -73.632778 ],
  },
  {
    name: "Snowdon",
    center: [ 45.485556, -73.628056 ],
  },
  {
    name: "Villa-Maria",
    center: [ 45.479444, -73.619722 ],
  },
  {
    name: "Vendôme",
    center: [ 45.473889, -73.603889 ],
  },
  {
    name: "Place-Saint-Henri",
    center: [ 45.477222, -73.586667 ],
  },
  {
    name: "Lionel-Groulx",
    center: [ 45.482778, -73.579722 ],
  },
  {
    name: "Georges-Vanier",
    center: [ 45.488889, -73.576667 ],
  },
  {
    name: "Lucien-L'Allier",
    center: [ 45.495000, -73.571111 ],
  },
  {
    name: "Bonaventure",
    center: [ 45.498056, -73.567222 ],
  },
  {
    name: "Square-Victoria",
    center: [ 45.501944, -73.563056 ],
  },
  {
    name: "Place-d'Armes",
    center: [ 45.506389, -73.559722 ],
  },
  {
    name: "Champ-de-Mars",
    center: [ 45.510000, -73.556389 ],
  },
  {
    name: "Berri–UQAM",
    center: [ 45.515278, -73.561111 ],
  },
  {
    name: "Sherbrooke",
    center: [ 45.518889, -73.568889 ],
  },
  {
    name: "Mont-Royal",
    center: [ 45.524444, -73.581667 ],
  },
  {
    name: "Laurier",
    center: [ 45.527222, -73.586667 ],
  },
  {
    name: "Rosemont",
    center: [ 45.531111, -73.597500 ],
  },
  {
    name: "Beaubien",
    center: [ 45.535556, -73.604444 ],
  },
  {
    name: "Jean-Talon",
    center: [ 45.538889, -73.614167 ],
  },
  {
    name: "Jarry",
    center: [ 45.543333, -73.628611 ],
  },
  {
    name: "Crémazie",
    center: [ 45.546111, -73.638333 ],
  },
  {
    name: "Sauvé",
    center: [ 45.550833, -73.656111 ],
  },
  {
    name: "Henri-Bourassa",
    center: [ 45.554444, -73.668611 ],
  },

  // Mostly Green Line

  {
    name: "Angrignon",
    center: [ 45.446111, -73.603611 ],
  },
  {
    name: "Monk",
    center: [ 45.451389, -73.593056 ],
  },
  {
    name: "Jolicoeur",
    center: [ 45.456667, -73.581944 ],
  },
  {
    name: "Verdun",
    center: [ 45.459444, -73.571667 ],
  },
  {
    name: "De L'Église",
    center: [ 45.462778, -73.566944 ],
  },
  {
    name: "LaSalle",
    center: [ 45.470833, -73.566389 ],
  },
  {
    name: "Charlevoix",
    center: [ 45.478333, -73.569444 ],
  },
  {
    name: "Atwater",
    center: [ 45.489722, -73.586111 ],
  },
  {
    name: "Guy–Concordia",
    center: [ 45.495000, -73.580000 ],
  },
  {
    name: "Peel",
    center: [ 45.500833, -73.574722 ],
  },
  {
    name: "McGill",
    center: [ 45.503889, -73.571667 ],
  },
  {
    name: "Place-des-Arts",
    center: [ 45.508056, -73.568611 ],
  },
  {
    name: "Saint-Laurent",
    center: [ 45.510833, -73.564722 ],
  },
  {
    name: "Beaudry",
    center: [ 45.518889, -73.555833 ],
  },
  {
    name: "Papineau",
    center: [ 45.523611, -73.552222 ],
  },
  {
    name: "Frontenac",
    center: [ 45.533333, -73.551944 ],
  },
  {
    name: "Préfontaine",
    center: [ 45.541667, -73.554444 ],
  },
  {
    name: "Joliette",
    center: [ 45.546944, -73.551389 ],
  },
  {
    name: "Pie-IX",
    center: [ 45.553889, -73.551667 ],
  },
  {
    name: "Viau",
    center: [ 45.561111, -73.547222 ],
  },
  {
    name: "Assomption",
    center: [ 45.569167, -73.546944 ],
  },
  {
    name: "Cadillac",
    center: [ 45.576944, -73.546667 ],
  },
  {
    name: "Langelier",
    center: [ 45.582778, -73.543056 ],
  },
  {
    name: "Radisson",
    center: [ 45.588889, -73.539444 ],
  },
  {
    name: "Honoré-Beaugrand",
    center: [ 45.596667, -73.535556 ],
  },

  // Mostly Blue Line

  {
    name: "Côte-des-Neiges",
    center: [ 45.496667, -73.623333 ],
  },
  {
    name: "Université-de-Montréal",
    center: [ 45.503333, -73.617500 ],
  },
  {
    name: "Édouard-Montpetit",
    center: [ 45.510000, -73.612500 ],
  },
  {
    name: "Outremont",
    center: [ 45.520278, -73.615000 ],
  },
  {
    name: "Acadie",
    center: [ 45.523333, -73.623333 ],
  },
  {
    name: "Parc",
    center: [ 45.530500, -73.623700 ],
  },
  {
    name: "De Castelnau",
    center: [ 45.535278, -73.620000 ],
  },
  {
    name: "Fabre",
    center: [ 45.547778, -73.607222 ],
  },
  {
    name: "D'Iberville",
    center: [ 45.553611, -73.601944 ],
  },
  {
    name: "Saint-Michel",
    center: [ 45.559722, -73.600000 ],
  },
];

var metroStationsMap = {};
for (const station of metroStations) {
  metroStationsMap[station.name] = station;
}
