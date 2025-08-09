// Initialize the map
const map = L.map('map', {
    minZoom: 2, // prevent zooming too far in
    maxBounds: [
        [-85, -180], // Southwest corner
        [85, 180]    // Northeast corner
    ]
}).setView([12.9716, 77.5946], 13);

// Add Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  noWrap: true
}).addTo(map);

// Location Data
const locations = [
    // Karnataka
    { name: "Lalbagh Botanical Garden", lat: 12.9507, lng: 77.5848, category: "Park" },
    { name: "Cubbon Park", lat: 12.9763, lng: 77.5929, category: "Park" },

    // Delhi
    { name: "India Gate", lat: 28.6129, lng: 77.2295, category: "Monument" },
    { name: "Red Fort", lat: 28.6562, lng: 77.2410, category: "Monument" },

    // Maharashtra
    { name: "Gateway of India", lat: 18.9220, lng: 72.8347, category: "Monument" },
    { name: "Marine Drive", lat: 18.9430, lng: 72.8238, category: "Seaside" },

    // Uttar Pradesh
    { name: "Taj Mahal", lat: 27.1751, lng: 78.0421, category: "Monument" },
    { name: "Varanasi Ghats", lat: 25.3109, lng: 83.0104, category: "Religious" },

    // Rajasthan
    { name: "Hawa Mahal", lat: 26.9239, lng: 75.8267, category: "Palace" },
    { name: "Jaisalmer Fort", lat: 26.9124, lng: 70.9120, category: "Fort" }
];

let markers=[];

function displayMarkers(data){
    markers.forEach(marker=>map.removeLayer(marker));
    markers=[];

    data.forEach(loc=>{
        const marker = L.marker([loc.lat, loc.lng]).addTo(map)
        .bindPopup(`<b>${loc.name}</b><br>${loc.category}`)
        markers.push(marker)
    })

    
    if (data.length > 0) {
        if (data.length === 1) {
            // single marker — keep default zoom
            map.setView([data[0].lat, data[0].lng], 13);
        } else {
            const bounds = L.latLngBounds(data.map(loc => [loc.lat, loc.lng]));
            map.fitBounds(bounds, { maxZoom: 14 });
        }
    }
};

document.querySelector(".searchbtn").addEventListener("click", ()=>{
    const query = document.getElementById("searchinp").value.toLowerCase();

    if(!query){
        displayMarkers([]);
        return;
    }

    const filtered = locations.filter(loc=>{
        const matchName = loc.name.toLowerCase().includes(query);
        const matchCategory = loc.category.toLowerCase() === query;
        return matchName || matchCategory;
    });

    if(filtered.length>0){
        map.setView([filtered[0].lat, filtered[0].lng], 15);
    }

    displayMarkers(filtered);
});

// Prevent dragging outside world boundaries
map.on('drag', function () {
    map.panInsideBounds([
        [-85, -180],
        [85, 180]
    ], { animate: false });
});
