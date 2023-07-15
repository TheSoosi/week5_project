import L from "leaflet";

import 'leaflet/dist/leaflet.css';

async function fetchData() {
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
    const res = await fetch(url);
    const data = await res.json();

    return data;
} 

async function fetchPosMigData() {
    const url = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f"
    const res = await fetch(url);
    const data = await res.json();

    return data;
}

async function fetchNegMigData() {
    const url = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e"
    const res = await fetch(url);
    const data = await res.json();

    return data;
}

async function initMap(data, migNegData, migPosData) {
    let map = L.map("map", {
        minZoom: -3,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    const geoJson = L.geoJSON(data, {
        onEachFeature: getFeature(migNegData, migPosData),
        weight: 2
    }).addTo(map);

    map.fitBounds(geoJson.getBounds());
}

const getFeature = (migNegData, migPosData) => (feature, layer) => {
    if (!feature.properties.name) return;
    const name = feature.properties.name;
    const munucipalityKey = "KU" + feature.properties.kunta;
    const indexPos = migPosData.dataset.dimension.Tuloalue.category.index[munucipalityKey];
    const indexNeg = migNegData.dataset.dimension.Lähtöalue.category.index[munucipalityKey];
    const valuePos = migPosData.dataset.value[indexPos];
    const valueNeg = migNegData.dataset.value[indexNeg];

    layer.bindPopup(`<ul>
        <li>Positive migration: ${valuePos}</li>
        <li>Negative migration: ${valueNeg}</li>
    </ul>`);
    layer.bindTooltip(name)

}

async function run() {
    const data = await fetchData();

    const migNegData = await fetchNegMigData();
    const migPosData = await fetchPosMigData();
    console.log(migNegData);

    await initMap(data, migNegData, migPosData);
}

run();

