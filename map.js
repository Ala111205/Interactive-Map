const map = L.map("map", {
    minZoom: 2,
    maxBounds: [[-85, -180], [85, 180]]
}).setView([12.9716, 77.5946], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    noWrap: true
}).addTo(map);

// Marker cluster
const cluster = L.markerClusterGroup();
map.addLayer(cluster);

const searchLayer = L.layerGroup().addTo(map);

// Locations
const locations = [
    { name: "Lalbagh Botanical Garden", lat: 12.9507, lng: 77.5848, category: "Park" },
    { name: "Cubbon Park", lat: 12.9763, lng: 77.5929, category: "Park" },
    { name: "India Gate", lat: 28.6129, lng: 77.2295, category: "Monument" },
    { name: "Red Fort", lat: 28.6562, lng: 77.2410, category: "Monument" },
    { name: "Gateway of India", lat: 18.9220, lng: 72.8347, category: "Monument" },
    { name: "Marine Drive", lat: 18.9430, lng: 72.8238, category: "Seaside" },
    { name: "Taj Mahal", lat: 27.1751, lng: 78.0421, category: "Monument" },
    { name: "Varanasi Ghats", lat: 25.3109, lng: 83.0104, category: "Religious" },
    { name: "Hawa Mahal", lat: 26.9239, lng: 75.8267, category: "Palace" },
    { name: "Jaisalmer Fort", lat: 26.9124, lng: 70.9120, category: "Fort" }
];

// Icon by category
function getIcon(category) {
    const icons = {
        Park: "🌳",
        Monument: "🏛️",
        Seaside: "🌊",
        Religious: "🛕",
        Palace: "🏰",
        Fort: "🧱"
    };
    return L.divIcon({
        html: icons[category] || "📍",
        className: "custom-marker"
    });
}

// Render markers
function renderMarkers(data) {
    cluster.clearLayers();

    if (data.length === 0) return;

    data.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], {
            icon: getIcon(loc.category)
        }).bindPopup(`<b>${loc.name}</b><br>${loc.category}`);

        cluster.addLayer(marker);
    });

    if (data.length === 1) {
        map.setView([data[0].lat, data[0].lng], 13);
    } else {
        map.fitBounds(data.map(d => [d.lat, d.lng]), { maxZoom: 14 });
    }
}

// Debounce
function debounce(fn, delay = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

async function searchRealLocation(query, viewbox = null) {
    if (!query || query.length < 3) return null;

    let url = `https://nominatim.openstreetmap.org/search?format=json&limit=10&q=${encodeURIComponent(query)}&extratags=1`;

    if (viewbox) {
        url += `&viewbox=${viewbox}&bounded=1`;
    }

    try {
        const res = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "User-Agent": "LeafletMapDemo/1.0"
            }
        });

        const data = await res.json();
        if (!data.length) return null;

        return data.map(p => ({
            name: p.display_name,
            lat: +p.lat,
            lng: +p.lon,
            type: p.type,
            class: p.class
        }));
    } catch (err) {
        console.error(err);
        return null;
    }
}

function isLikelyPlaceSearch(query) {
    return !query.includes(" ") && query.length >= 3;
}

// Filters
const searchInp = document.getElementById("searchinp");
const categoryFilter = document.getElementById("categoryFilter");

let lastSearchToken = 0;

async function applyFilters() {
    const token = ++lastSearchToken;
    const query = searchInp.value.trim().toLowerCase();
    const category = categoryFilter.value;

    cluster.clearLayers();
    searchLayer.clearLayers();

    /* =========================
       BROWSE MODE
    ========================== */
    if (!query && !category) {
        renderMarkers(locations);
        return;
    }

    /* =========================
       LOCAL CATEGORY
    ========================== */
    if (!query && category) {
        const filtered = locations.filter(l => l.category === category);
        renderMarkers(filtered);
        return;
    }

    /* =========================
       HARD STOP FOR REMOTE
    ========================== */
    if (query.length < 3) return;

    /* =========================
       PLACE RESOLUTION
    ========================== */
    const placePromise = searchRealLocation(query);

    // optimistic feedback
    searchLayer.clearLayers();
    cluster.clearLayers();

    const placeResults = await placePromise;

    if (token !== lastSearchToken) return;
    if (!placeResults || !placeResults.length) return;

    const place = placeResults[0];
    const placeLatLng = [place.lat, place.lng];

    /* =========================
       PLACE ONLY
    ========================== */
    if (!category) {
        L.marker(placeLatLng)
            .bindPopup(`<b>${place.name}</b>`)
            .addTo(searchLayer);

        map.setView(placeLatLng, 11);
        return;
    }

    /* =========================
       POI SEARCH
    ========================== */
    const categoryQueryMap = {
        Park: ["park"],
        Monument: ["monument"],
        Fort: ["fort"],
        Palace: ["palace"],
        Religious: ["temple", "church", "mosque"],
        Seaside: ["beach", "coast", "waterfront", "river", "lake"]
    };

    const keywords = categoryQueryMap[category];
    if (!keywords) return;

    // Immediate feedback for time
    L.marker(placeLatLng)
    .bindPopup(`<b>${place.name}</b><br>Searching nearby ${category}...`)
    .addTo(searchLayer);

    map.setView(placeLatLng, 12);

    const bounds = map.getBounds();
    const viewbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
    ].join(",");

    const seen = new Set();
    let latlngs = [];

    for (const k of keywords) {
        const places = await searchRealLocation(`${k} in ${place.name}`, viewbox);

        if (token !== lastSearchToken) return;
        if (!places || !places.length) continue;

        places.forEach(p => {
            const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
            if (seen.has(key)) return;

            seen.add(key);
            latlngs.push([p.lat, p.lng]);

            L.marker([p.lat, p.lng])
                .bindPopup(`<b>${p.name}</b>`)
                .addTo(searchLayer);
        });

        // allow UI paint
        await new Promise(r => setTimeout(r, 0));
    }

    if (latlngs.length) {
        map.fitBounds(latlngs, { maxZoom: 13 });
    }
}

const applyFiltersDebounced = debounce(applyFilters, 400);

searchInp.addEventListener("input", applyFiltersDebounced);
categoryFilter.addEventListener("change", applyFiltersDebounced);

// Locate user
document.getElementById("locateMe").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 13);

        cluster.addLayer(
            L.marker([latitude, longitude]).bindPopup("You are here")
        );
    });
});

// Restore state
const saved = JSON.parse(localStorage.getItem("mapState"));
if (saved) {
    searchInp.value = saved.query;
    categoryFilter.value = saved.category;
}

renderMarkers(locations);