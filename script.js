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
mymap.setZoom(5); 
var geojson; 

L.tileLayer('', {
  minZoom: default_zoom,
    maxZoom: default_zoom + 2,
    attribution: '' ,
    tileSize: 32,
    zoomOffset: 0
}).addTo(mymap);

var geojson_path = 'data/provinces.geojson';
var data_path = 'data/behdasht-provincial.csv';

function loadData() {
    var obj = "";
    d3.json(geojson_path)
    .then(function(data) {
        obj = data;
        loadCovidData(obj); 
        document.getElementById("loading").style.visibility = "hidden";
    }).catch(function(error){
        console.log(error);
    });
}

function loadCovidData(obj) {
    d3.csv(data_path)
    .then(function(data) {
        var chart_labels = data.map(function(d) {return d.date});
        var confirmed = data.map(function(d) {return d.Total});
        var death = data.map(function(d) {return d.death});
        var recovered = data.map(function(d) {return d.reco});
        var test = data.map(function(d) {return d.test});
        plotChart(chart_labels, confirmed, death, recovered, test, obj, data);
        for (let i = 0; i < num_provinces; i++) {
            var name = obj.features[i].name;
            var province_confirmed = data.map(function(d) {return d[name]});
            // var today_cases = province_confirmed[province_confirmed.length - 1];
            var today_cases = province_confirmed[32]; // corresponding to 01/03 which is the last day that provincial data are available. 
            obj.features[i].properties.cases = Number(today_cases);
        }
        populateMap(obj);
        populateTotals(confirmed[confirmed.length - 1], recovered[recovered.length - 1], death[death.length - 1], test[test.length - 1]);
    }).catch(function(error){
        console.log(error);
    });
}

function getMeta(feature, lang) {
    var b = "<b>";
    var sb = "</b>";
    var br = "<br>";
    if (lang == 'fa') {
        var name = feature["properties"]["fa"];
        var conf = "مبتلا: ";
    }
    else {
        var name = feature["properties"]["en"]; 
        var conf = "confirmed: ";
    }
    var message = b + name + sb + br + conf + feature["properties"]["cases"].toString();
    return message;
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        dashArray: '',
        fillOpacity: 0.3
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
    layer.bindPopup(getMeta(feature, lang));
}

function populateMap(obj){
    geojson = L.geoJSON(obj, {
        style: {"color": "#888888", "weight": "0.3"},  
        onEachFeature: onEachFeature
    }).addTo(mymap);
    for (let i = 0; i < num_provinces; i++) {
        addCircle(obj.features[i]);
    }
} 

function addCircle(feature) {
    factor = 1000;
    rad = Math.sqrt(feature.properties.cases)*factor;
    var cir = L.circle(feature.properties.center, {
        weight: 1,
        color: 'rgb(21, 127, 251)',
        fillColor: 'rgb(21, 127, 251)', 
        fillOpacity: 0.2,
        radius: rad
    }).addTo(mymap);
    cir.bindPopup(getMeta(feature, lang));
}

function populateTotals(confirmed, recovered, death, test) {
        document.getElementById("confirmed").innerHTML= ConvertToArabicNumbers(confirmed.toString());
        document.getElementById("recovered").innerHTML= ConvertToArabicNumbers(recovered.toString());
        document.getElementById("death").innerHTML= ConvertToArabicNumbers(death.toString());
        document.getElementById("test").innerHTML= ConvertToArabicNumbers(test.toString());
        document.getElementById("confirmed").align = "right";
        document.getElementById("recovered").align = "right";
        document.getElementById("death").align = "right";
        document.getElementById("test").align = "right";
}

function plotChart(chart_labels, confirmed, death, recovered, test, obj, data){
    var new_confirmed = diff(confirmed);
    var new_recovered = diff(recovered);
    var new_death = diff(death);
    var type = 'linear';
    var ctx_cases = document.getElementById('casesChart').getContext('2d');
    var ctx_rate = document.getElementById('rateChart').getContext('2d');
    // var ctx_province = document.getElementById('provinceChart').getContext('2d');
    var chart_cases = new Chart(ctx_cases, {
        type: 'line',
        data: {
            labels: chart_labels,
            datasets: [ {
                label: 'آزمایش',
                showLine: false, 
                hidden: true,
                fill: 'false', 
                backgroundColor: 'rgb(245, 200, 66)',
                borderColor: 'rgb(252, 186, 3)',
                data: test
            }, {
                label: 'مبتلا',
                fill: 'false', 
                backgroundColor: 'rgb(210, 230, 254)',
                borderColor: 'rgb(21, 127, 251)',
                data: confirmed
            }, {
                label: 'بهبودی',
                fill: 'false', 
                backgroundColor: 'rgb(215, 237, 219)',
                borderColor: 'rgb(48, 166, 74)',
                data: recovered
            }, {
                label: 'فوتی',
                fill: 'false', 
                backgroundColor: '#DDDDDD',
                borderColor: '#777777',
                data: death
            }]
        },
        options: {
            legend: {
                position: 'bottom'
            }, 
            plugins: {filler: {fill: false}},
            animation: {duration: 0}, hover: {animationDuration: 0}, responsiveAnimationDuration: 0}
        });
    document.getElementById('logButton').addEventListener('click', function() {
        type = type === 'linear' ? 'logarithmic' : 'linear';
        if (type == 'linear'){
            document.getElementById('logButton').innerHTML = "لگاریتمی";
        }
        else {
            document.getElementById('logButton').innerHTML = "خطی";
        }
        chart_cases.options.scales.yAxes[0] = {
            type: type
        };
        chart_cases.update();
    });
    var chart_rate = new Chart(ctx_rate, {
        type: 'bar',
        data: {
            labels: chart_labels,
            datasets: [ {
                label: 'مبتلا', 
                backgroundColor: 'rgb(21, 127, 251)',
                borderColor: 'rgb(210, 230, 254)',
                data: new_confirmed
            }, {
                label: 'بهبودی', 
                backgroundColor: 'rgb(48, 166, 74)',
                borderColor: 'rgb(215, 237, 219)',
                data: new_recovered
            }, {
                label: 'فوتی', 
                backgroundColor: '#777777',
                borderColor: '#DDDDDD',
                data: new_death
            }]
        },
        options: {
            legend: {
                display: true, 
                position: 'bottom'
            }, 
            plugins: {filler: {fill: false}},
            animation: {duration: 0}, hover: {animationDuration: 0}, responsiveAnimationDuration: 0}
        });
    /* var dset = generate_province_dataset(obj, data);
    var chart_province = new Chart(ctx_province, {
        type: 'line',
        data: {
            labels: chart_labels,
            datasets: dset
        },
        options: {
            legend: {
                display: false
            }, 
            scales: {
                yAxes: [{type: 'logarithmic'}]
            },
            animation: {duration: 0}, hover: {animationDuration: 0}, responsiveAnimationDuration: 0}
        }); */
}

function rate(data) {
    var rate = [];
    rate.push("");
    for (let i = 1; i<data.length; i++) {
        var delta_today = data[i] - data[i-1]; 
        if (i == 1) {
            var delta_yesterday = data[i-1]; 
        }
        else {
            var delta_yesterday = data[i-1] - data[i-2]; 
        }
        if (delta_yesterday != 0) {
            d = (delta_today/delta_yesterday - 1)*100;
            rate.push(d.toFixed(2));
        }
        else {
            rate.push("");
        }
    }
    return rate;
}

function diff(data) {
    var diff = [];
    for (let i = 0; i<data.length; i++) {
        if (i == 0) {
            diff.push(data[i]);
        }
        else {
            diff.push(data[i] - data[i-1]);
        }
    }
    return diff;
}

function generate_province_dataset(obj, data) {
    var sets = [];
    for (let i=0; i<num_provinces; i++) {
        var name = obj.features[i].name;
        var province_confirmed = data.map(function(d) {return d[name]});
        var dataset = {
            label: obj.features[i].properties.fa, 
            fill: 'false', 
            backgroundColor: 'rgb(210, 230, 254)',
            borderColor: 'rgb(21, 127, 251)',
            data: province_confirmed
        };
        sets.push(dataset);
        }
    return sets;
}

loadData();