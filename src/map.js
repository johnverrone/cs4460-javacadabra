var mapboxAccessToken = 'pk.eyJ1Ijoiam9obnZlcnJvbmUiLCJhIjoiY2lmOGsxbDY2MjA5N3N2bHpxcjVtZmZ2OSJ9.gphOQXqdvWHWEXNfQ8dZdA';
var mapboxId = 'johnverrone.cif8k1jxe208tsllzszskrpsm';

var map = L.map('map').setView([18, -45], 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.streets',
    accessToken: mapboxAccessToken,
    maxZoom: 7,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
}).addTo(map);