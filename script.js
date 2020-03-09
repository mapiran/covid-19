const ConvertToArabicNumbers = (num) => {
    const arabicNumbers = '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9';
   return new String(num).replace(/[0123456789]/g, (d)=>{return arabicNumbers[d]});
  }

var lang = 'fa';
var num_provinces = 31; 
var iran_lat = 32.637; 
var iran_lng = 54.272; 
var default_zoom = 4; 
var mymap = L.map('mapid').setView([iran_lat, iran_lng], default_zoom);
mymap.setMaxBounds(mymap.getBounds());

L.tileLayer('', {
  minZoom: default_zoom,
    maxZoom: default_zoom + 2,
    attribution: '' ,
    tileSize: 32,
    zoomOffset: 0
}).addTo(mymap);

// load data 
d3.csv('https://raw.githubusercontent.com/mapiran/covid-19/master/data/behdasht-provincial.csv', function(data){
    var chart_labels = data.map(function(d) {return d.date});
    var total_confirmed = data.map(function(d) {return d.Total});
    var total_death = data.map(function(d) {return d.death});
    plotChart(chart_labels, total_confirmed, total_death);
    // add data to map
    for (i = 0; i < num_provinces; i++) {
        var name = geojsonLayer["features"][i]["name"];
        var cases = data.map(function(d) {return d[name]});
        var today_cases = cases[chart_labels.length - 1]; 
        // geojsonLayer["features"][i]["properties"]["cases"] = today_cases;
    }
    
});

function getMeta(feature, lang) {
    b = "<b>";
    sb = "</b>";
    br = "<br>";
    if (lang == 'fa') {
        name = feature["properties"]["fa"];
        conf = "تاییدی: ";
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

confirmed_today = [712,1945,247,601,34,183,26,9,524,68,633,220,37,307,389,34,11,72,129,73,52,69,44,60,66,151,31,175,36,90,133];
for (let i = 0; i < num_provinces; i++) {
    geojsonLayer["features"][i]["properties"]["lat"] = center[i][0];
    geojsonLayer["features"][i]["properties"]["lng"] = center[i][1];
    geojsonLayer["features"][i]["properties"]["cases"] = confirmed_today[i];
}

function onEachFeature(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(getMeta(feature, lang));
    }
}

L.geoJSON(geojsonLayer, {
    style: {"color": "#777777"},  
    onEachFeature: onEachFeature
}).addTo(mymap);

var total_confirmed = 0;
mess = "";
for (let i = 0; i < num_provinces; i++) {
    addCircle(i);
    total_confirmed += confirmed_today[i];
}

function addCircle(i) {
    lat = geojsonLayer["features"][i]["properties"]["lat"]; 
    lng = geojsonLayer["features"][i]["properties"]["lng"]; 
    conf = Number(geojsonLayer["features"][i]["properties"]["cases"]);
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

function plotChart(chart_labels, confirmed, death){
    var ctx = document.getElementById('timeChart').getContext('2d');
    var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: chart_labels,
        datasets: [
            {
            label: 'تاییدی',
            fill: 'false', 
            backgroundColor: '#ffee33',
            borderColor: '#d9ca29',
            data: confirmed
        }, 
        {
            label: 'فوتی',
            fill: 'false', 
            backgroundColor: '#F93114',
            borderColor: '#DD321A',
            data: death
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
}

