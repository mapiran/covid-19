const ConvertToArabicNumbers = (num) => {
    const arabicNumbers = '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9';
   return new String(num).replace(/[0123456789]/g, (d)=>{return arabicNumbers[d]});
  }

var lang = 'fa';
var num_provinces = 31; 
var country = []; 
var iran_lat = 32.637; 
var iran_lng = 54.272; 
var default_zoom = 4; 
var mymap = L.map('mapid').setView([iran_lat, iran_lng], default_zoom);
mymap.setMaxBounds(mymap.getBounds());

L.tileLayer('', {
  minZoom: default_zoom,
    maxZoom: default_zoom + 3,
    attribution: '' ,
    tileSize: 32,
    zoomOffset: 0
}).addTo(mymap);

function getMeta(feature, lang) {
    b = "<b>";
    sb = "</b>";
    br = "<br>";
    if (lang == 'fa') {
        name = feature["properties"]["fa"];
        conf = "مبتلایان: ";
    }
    else {
        name = feature["properties"]["en"]; 
        conf = "confirmed";
    }
    message = b + name + sb + br + conf + feature["properties"]["cases"].toString();
    return message;
}

var center = [
    [34.639944, 50.875942], 
    [35.500370, 51.806030], 
    [36.088132, 49.854727],
    [32.654628, 51.667983],
    [37.471035, 57.101319], 
    [36.029111, 59.106445],
    [31.961435, 50.845632],
    [30.843289, 50.778809], 
    [37.280900, 49.592400], 
    [36.501819, 48.398819], 
    [36.226239, 52.531860],
    [35.225559, 54.434214],
    [32.517564, 59.104176],
    [35.996047, 50.928925],
    [34.612300, 49.854700],
    [27.529991, 60.582068],
    [28.923384, 50.820314], 
    [38.356734, 48.098145], 
    [37.903573, 46.268211], 
    [31.436015, 49.041312],
    [27.447352, 56.359863], 
    [37.820632, 44.956055],  
    [34.314167, 47.065000], 
    [34.937734, 48.559570], 
    [35.726447, 47.065430], 
    [33.557418, 48.295898], 
    [33.227201, 46.691895],
    [37.280609, 54.975586],  
    [30.086919, 57.183838], 
    [32.043005, 54.536133], 
    [29.505354, 53.206787], 
];

var confirmed_1217 = [668, 1539, 178, 484, 23, 135, 16, 6, 494, 52, 606, 138, 18, 305, 265, 34, 8, 41, 77, 64, 30, 33, 31, 34, 44, 107, 15, 162, 40, 81, 95];
var confirmed_1218 = [685, 1805, 207, 564, 24, 154, 21, 9, 496, 53, 620, 175, 44, 307, 335, 34, 10, 50, 107, 69, 35, 40, 33, 60, 63, 144, 15, 175, 41, 87, 104];

confirmed = confirmed_1218;

function onEachFeature(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(getMeta(feature, lang));
    }
}

for (let i = 0; i < num_provinces; i++) {
    geojsonLayer["features"][i]["properties"]["lat"] = center[i][0];
    geojsonLayer["features"][i]["properties"]["lng"] = center[i][1];
    geojsonLayer["features"][i]["properties"]["cases"] = confirmed[i];
}

L.geoJSON(geojsonLayer, {
    style: {"color": "#777777"},  
    onEachFeature: onEachFeature
}).addTo(mymap);

var total_confirmed = 0;
mess = "";
for (let i = 0; i < num_provinces; i++) {
    addCircle(i);
    total_confirmed += confirmed[i];
}

function addCircle(i) {
    lat = geojsonLayer["features"][i]["properties"]["lat"]; 
    lng = geojsonLayer["features"][i]["properties"]["lng"]; 
    conf = geojsonLayer["features"][i]["properties"]["cases"];
    var cir = L.circle([lat, lng], {
        weight: 2,
        color: '#d9ca29',
        fillColor: '#ffee33', 
        fillOpacity: 0.7,
        radius: Math.sqrt(conf)*1000
    }).addTo(mymap);
    cir.bindPopup(getMeta(geojsonLayer["features"][i], lang));
}

if (lang == 'fa') {
    document.getElementById("total-confirmed").innerHTML= ConvertToArabicNumbers(total_confirmed.toString());
    document.getElementById("total-confirmed").align = "right";
}
else {
    document.getElementById("total-confirmed").innerHTML= "Confirmed: " + total_confirmed.toString();
}

// chartjs 
var ctx = document.getElementById('timeChart').getContext('2d');
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['11/30', '12/01', '12/02', '12/03', '12/04', '12/05', '12/06', '12/07', '12/08', '12/09', '12/10', '12/11', '12/12', '12/13', '12/14', '12/15', '12/16', '12/17'],
        datasets: [
            {
            label: 'تاییدی',
            fill: 'false', 
            backgroundColor: '#ffee33',
            borderColor: '#d9ca29',
            data: [2, 5, 18, 28, 43, 61, 95, 141, 245, 388, 593, 978, 1501, 2336, 2922, 3513, 4747, 5823, 6566]
        }, 
        {
            label: 'فوتی',
            fill: 'false', 
            backgroundColor: '#F93114',
            borderColor: '#DD321A',
            data: [2, 2, 4, 5, 8, 12, 15, 22, 26, 38, 43, 54, 66, 77, 92, 107, 124, 145, 194]
        }]
    },
    options: {
        plugins: {filler: {fill: false}},
        animation: {duration: 0}, hover: {animationDuration: 0}, responsiveAnimationDuration: 0}, 
        scales: {
            yAxes: [{
                gridLines: {color: "#FFFFFF"}
                }]
            }
});
