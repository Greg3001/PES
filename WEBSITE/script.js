console.log("NIMS Landing Page Ready");

// Mediterranean Sea boundaries
const MED_BOUNDS = {
    latMin: 30,
    latMax: 45,
    lngMin: -5,
    lngMax: 36
};

const map = L.map('map', {
    center: [37, 15],
    zoom: 5,
    interactive: false, 
    zoomControl: false,
});
let landPolygons = null;
let vessels = [];
let vesselMarkers = [];

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to check if a point is on land
function isOverLand(lat, lng) {
    if (!landPolygons || !landPolygons.features) {
        return false;
    }
    const pt = turf.point([lng, lat]);
    for (const feature of landPolygons.features) {
        if (turf.booleanPointInPolygon(pt, feature)) {
            return true; // Point is on land
        }
    }
    return false; // Point is in the water
}

// Function to generate a valid starting position (not on land)
function generateValidPosition() {
    let lat, lng;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    do {
        lat = MED_BOUNDS.latMin + Math.random() * (MED_BOUNDS.latMax - MED_BOUNDS.latMin);
        lng = MED_BOUNDS.lngMin + Math.random() * (MED_BOUNDS.lngMax - MED_BOUNDS.lngMin);
        attempts++;
        if (attempts >= maxAttempts) {
            console.warn("Max attempts reached for valid position, using fallback.");
            return { lat: 37, lng: 15 };
        }
    } while (isOverLand(lat, lng)); 

    return { lat, lng };
}

// Initialize vessels with positions, headings, and markers
function initializeVessels(count) {
    vessels = [];
    vesselMarkers.forEach(marker => map.removeLayer(marker));
    vesselMarkers = [];

    for (let i = 0; i < count; i++) {
        const pos = generateValidPosition();
        const heading = Math.random() * 360;
        const marker = L.circleMarker([pos.lat, pos.lng], {
            radius: 2,
            fillColor: 'red',
            color: 'red',
            fillOpacity: 1.0
        }).addTo(map);

        vessels.push({
            lat: pos.lat,
            lng: pos.lng,
            heading: heading,
            marker: marker   
        });
        vesselMarkers.push(marker);
    }
    console.log(`Initialized ${vessels.length} vessels.`);
}

// --- Animation Logic ---

const ANIMATION_INTERVAL = 100;
const VESSEL_SPEED = 0.05;

function animateVessels() {
    vessels.forEach(v => {
        // Calculate potential next position based on current heading and speed
        const radHeading = v.heading * (Math.PI / 180); // Convert heading to radians
        let nextLat = v.lat + VESSEL_SPEED * Math.cos(radHeading);
        let nextLng = v.lng + VESSEL_SPEED * Math.sin(radHeading);

        // --- Collision Detection ---
        if (isOverLand(nextLat, nextLng)) {
            // Collision detected! Change course.
            v.heading = (v.heading + 180 + (Math.random() * 90 - 45)) % 360; // Turn around +/- 45 degrees
            console.log(`Vessel at [${v.lat.toFixed(2)}, ${v.lng.toFixed(2)}] hit land, new heading: ${v.heading.toFixed(1)}`);

            // Recalculate next position with the new heading to avoid getting stuck
            const newRadHeading = v.heading * (Math.PI / 180);
            nextLat = v.lat + VESSEL_SPEED * Math.cos(newRadHeading);
            nextLng = v.lng + VESSEL_SPEED * Math.sin(newRadHeading);

             if (isOverLand(nextLat, nextLng)) {
                 v.heading = Math.random() * 360;
                 return;
             }
        }

        // --- Boundary Check (Mediterranean Sea) ---
        if (nextLat < MED_BOUNDS.latMin || nextLat > MED_BOUNDS.latMax || nextLng < MED_BOUNDS.lngMin || nextLng > MED_BOUNDS.lngMax) {
             // Hit the boundary, turn around
             v.heading = (v.heading + 180) % 360;
              console.log(`Vessel at [${v.lat.toFixed(2)}, ${v.lng.toFixed(2)}] hit boundary, new heading: ${v.heading.toFixed(1)}`);
             // Recalculate next position
             const newRadHeading = v.heading * (Math.PI / 180);
             nextLat = v.lat + VESSEL_SPEED * Math.cos(newRadHeading);
             nextLng = v.lng + VESSEL_SPEED * Math.sin(newRadHeading);

             // If still out of bounds after turning (e.g., corner case), stop it for this frame
             if (nextLat < MED_BOUNDS.latMin || nextLat > MED_BOUNDS.latMax || nextLng < MED_BOUNDS.lngMin || nextLng > MED_BOUNDS.lngMax) {
                return;
             }
        }
        v.lat = nextLat;
        v.lng = nextLng;

        v.marker.setLatLng([v.lat, v.lng]);
    });
}

// --- Initialization ---

// Fetch land data first
fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson')
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error fetching land data! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Land data loaded successfully.");
        landPolygons = data;

        initializeVessels(100); 

        setInterval(animateVessels, ANIMATION_INTERVAL);
        console.log("Animation started.");

    })
    .catch(error => {
        console.error('Error loading or processing land data:', error);
    });


// --- Add Mediterranean Ports (static elements) ---
const ports = [
    { name: 'Barcelona', lat: 41.35, lng: 2.15 },
    { name: 'Marseille', lat: 43.3, lng: 5.37 },
    { name: 'Genoa', lat: 44.41, lng: 8.93 },
    { name: 'Valencia', lat: 39.46, lng: -0.38 },
    { name: 'Athens (Piraeus)', lat: 37.98, lng: 23.72 },
    { name: 'Naples', lat: 40.84, lng: 14.25 },
    { name: 'Algiers', lat: 36.76, lng: 3.06 },
    { name: 'Tunis', lat: 36.81, lng: 10.18 },
    { name: 'Alexandria', lat: 31.20, lng: 29.92 },
    { name: 'Izmir', lat: 38.42, lng: 27.14 },
    { name: 'Tangier', lat: 35.78, lng: -5.80 },
    { name: 'Livorno', lat: 43.55, lng: 10.31 },
    { name: 'Thessaloniki', lat: 40.64, lng: 22.94 },
    { name: 'Beirut', lat: 33.89, lng: 35.51 },
    { name: 'Haifa', lat: 32.82, lng: 34.99 },
    { name: 'Port Said', lat: 31.26, lng: 32.31 },
    { name: 'Malta (Valletta)', lat: 35.90, lng: 14.51 },
    { name: 'Dubrovnik', lat: 42.65, lng: 18.09 },
    { name: 'Split', lat: 43.51, lng: 16.44 },
    { name: 'Tripoli (Libya)', lat: 32.89, lng: 13.19 },
    { name: 'Limassol', lat: 34.68, lng: 33.04 },
    { name: 'Constanța', lat: 44.18, lng: 28.65 },
    { name: 'Almería', lat: 36.84, lng: -2.46 },
    { name: 'Alicante', lat: 38.35, lng: -0.48 },
    { name: 'Málaga', lat: 36.72, lng: -4.42 },
    { name: 'Tarragona', lat: 41.12, lng: 1.25 },
    { name: 'Palma de Mallorca', lat: 39.57, lng: 2.65 },
    { name: 'Cartagena (Spain)', lat: 37.60, lng: -0.98 },
    { name: 'Sète', lat: 43.40, lng: 3.70 },
    { name: 'Nice', lat: 43.70, lng: 7.26 },
    { name: 'Cagliari', lat: 39.22, lng: 9.11 },
    { name: 'Palermo', lat: 38.12, lng: 13.35 },
    { name: 'Messina', lat: 38.19, lng: 15.55 },
    { name: 'Durrës', lat: 41.32, lng: 19.45 },
    { name: 'Bari', lat: 41.12, lng: 16.87 },
    { name: 'Venice', lat: 45.44, lng: 12.32 },
    { name: 'Trieste', lat: 45.65, lng: 13.77 },
    { name: 'Rijeka', lat: 45.33, lng: 14.44 },
    { name: 'Koper', lat: 45.55, lng: 13.73 },
    { name: 'Pula', lat: 44.87, lng: 13.85 },
    { name: 'Zadar', lat: 44.12, lng: 15.23 },
    { name: 'Šibenik', lat: 43.73, lng: 15.89 }
    
];

ports.forEach(port => {
    L.circleMarker([port.lat, port.lng], {
        radius: 8,
        color: '#002855',   
        fillColor: '#4db8ff',
        fillOpacity: 0.9,
        weight: 2    
    }).addTo(map).bindPopup(`<b>${port.name}</b><br>Commercial Port`);
});
