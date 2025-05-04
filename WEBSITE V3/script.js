
console.log("NIMS Landing Page Ready");

// Mediterranean Sea boundaries
const MED_BOUNDS = {
    latMin: 30,
    latMax: 45,
    lngMin: -5,
    lngMax: 36
};

const map = L.map('map', {
    center: [40, 15],
    zoom: 4.5,
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
            radius: 1,
            fillColor: 'red',
            color: 'red',
            fillOpacity: 0.7
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
    console.log("Vessels animated.");
}

// --- Atmosphere Map ---
const atmosphereMap = L.map('atmosphere-map', {
    center: [40, 15],
    zoom: 4.5,
    interactive: false,
    zoomControl: false,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(atmosphereMap);

let heatmapLayer;
let heatmapLayer2;
let heatmapLayer3;

function generateAtmosphereData(points = 1000, intensity = 0.5) {
    const data = [];
    for (let i = 0; i < points; i++) {
        const lat = Math.random() * 70;
        const lng = -20 + Math.random() * 80;
        const value = Math.random() * intensity;
        data.push([lat, lng, value]);
    }
    return data;
}

function initializeAtmosphere() {
    const initialAtmosphereData = generateAtmosphereData(10000, 0.5);
    const initialAtmosphereData2 = generateAtmosphereData(8000, 0.6);
    const initialAtmosphereData3 = generateAtmosphereData(6000, 0.7);

    heatmapLayer = L.heatLayer(initialAtmosphereData, {
        radius: 40,
        blur: 25,
        gradient: {
            0.0: 'rgba(0, 0, 0, 0)',
            0.1: 'rgba(0, 0, 255, 0.4)',
            0.3: 'rgba(0, 255, 255, 0.6)',
            0.5: 'rgba(0, 255, 0, 0.7)',
            0.7: 'rgba(255, 255, 0, 0.8)',
            0.9: 'rgba(255, 128, 0, 0.9)',
            1.0: 'rgba(255, 0, 0, 1.0)'
        }
    }).addTo(atmosphereMap);

    heatmapLayer2 = L.heatLayer(initialAtmosphereData2, {
        radius: 30, 
        blur: 20, 
        gradient: {
            0.0: 'rgba(0, 0, 0, 0)',
            0.1: 'rgba(0, 255, 0, 0.3)',  
            0.3: 'rgba(0, 255, 100, 0.5)',
            0.5: 'rgba(200, 255, 0, 0.6)',
            0.7: 'rgba(255, 200, 0, 0.7)',
            0.9: 'rgba(255, 100, 0, 0.8)',
            1.0: 'rgba(255, 0, 100, 0.9)'
        }
    }).addTo(atmosphereMap);

    heatmapLayer3 = L.heatLayer(initialAtmosphereData3, {
        radius: 20,
        blur: 15,
        gradient: {
            0.0: 'rgba(0, 0, 0, 0)',
            0.1: 'rgba(255, 0, 255, 0.2)',
            0.3: 'rgba(255, 100, 255, 0.4)',
            0.5: 'rgba(200, 100, 255, 0.5)',
            0.7: 'rgba(200, 200, 255, 0.6)',
            0.9: 'rgba(100, 200, 255, 0.7)',
            1.0: 'rgba(0, 0, 255, 0.8)'
        }
    }).addTo(atmosphereMap);
}

function animateAtmosphereHeatmap() {
    const newData = generateAtmosphereData(10000, 0.5);
    const newData2 = generateAtmosphereData(8000, 0.6);
    const newData3 = generateAtmosphereData(6000, 0.7);

    // Clear and re-add the layers (more robust update)
    atmosphereMap.removeLayer(heatmapLayer);
    atmosphereMap.removeLayer(heatmapLayer2);
    atmosphereMap.removeLayer(heatmapLayer3);

    heatmapLayer = L.heatLayer(newData, {
        radius: 40,
        blur: 25,
        gradient: {
            0.0: 'rgba(0, 0, 0, 0)',
            0.2: 'rgba(0, 0, 255, 0.4)',
            0.4: 'rgba(0, 255, 255, 0.6)',
            0.6: 'rgba(0, 255, 0, 0.7)',
            0.7: 'rgba(255, 255, 0, 0.8)',
            0.8: 'rgba(255, 128, 0, 0.9)',
            1.0: 'rgba(255, 0, 0, 1.0)'
        }
    }).addTo(atmosphereMap);

    heatmapLayer2 = L.heatLayer(newData2, {
        radius: 30,
        blur: 20,
        gradient: {
            0.0: 'rgba(0, 0, 0, 0)',
            0.2: 'rgba(0, 255, 0, 0.3)',
            0.4: 'rgba(0, 255, 100, 0.5)',
            0.6: 'rgba(200, 255, 0, 0.6)',
            0.7: 'rgba(255, 200, 0, 0.7)',
            0.8: 'rgba(255, 100, 0, 0.8)',
            1.0: 'rgba(255, 0, 100, 0.9)'
        }
    }).addTo(atmosphereMap);

    heatmapLayer3 = L.heatLayer(newData3, {
        radius: 20,
        blur: 15,
        gradient: {
            0.0: 'rgba(0, 0, 0, 0)',
            0.2: 'rgba(255, 0, 255, 0.2)',
            0.4: 'rgba(255, 100, 255, 0.4)',
            0.6: 'rgba(200, 100, 255, 0.5)',
            0.7: 'rgba(200, 200, 255, 0.6)',
            0.8: 'rgba(100, 200, 255, 0.7)',
            1.0: 'rgba(0, 0, 255, 0.8)'
        }
    }).addTo(atmosphereMap);
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

        initializeVessels(200);

        setInterval(animateVessels, ANIMATION_INTERVAL);
        console.log("Animation started.");

        initializeAtmosphere();
        setInterval(animateAtmosphereHeatmap, 2000);
    })
    .catch(error => {
        console.error('Error loading or processing land data:', error);
    });


// --- Add Mediterranean Ports ---
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
    { name: 'Šibenik', lat: 43.73, lng: 15.89 },
    { name: 'Porto (Portugal)', lat: 41.16, lng: -8.68 },
    { name: 'Ceuta (Spain)', lat: 35.88, lng: -5.31 }, 
    { name: 'Oran (Algeria)', lat: 35.69, lng: -0.64 }, 
    { name: 'Annaba (Algeria)', lat: 36.90, lng: 7.76 },
    { name: 'Benghazi (Libya)', lat: 32.11, lng: 20.07 },
    { name: 'Ashdod (Israel)', lat: 31.82, lng: 34.64 },
    { name: 'Mersin (Turkey)', lat: 36.80, lng: 34.63 },
    { name: 'Taranto (Italy)', lat: 40.40, lng: 17.24 },
    { name: 'Catania (Italy)', lat: 37.51, lng: 15.07 },
    { name: 'Heraklion (Greece)', lat: 35.34, lng: 25.13 },
    { name: 'Patras (Greece)', lat: 38.24, lng: 21.73 },
    { name: 'Volos (Greece)', lat: 39.36, lng: 22.94 },
    { name: 'Izola (Slovenia)', lat: 45.54, lng: 13.66 },
    { name: 'Bar (Montenegro)', lat: 42.10, lng: 19.09 },
    { name: 'Durres (Albania)', lat: 41.32, lng: 19.45 },
    { name: 'Skikda (Algeria)', lat: 36.87, lng: 6.90 },
    { name: 'Bizerte (Tunisia)', lat: 37.27, lng: 9.87 },
    { name: 'Sfax (Tunisia)', lat: 34.73, lng: 10.76 },
    { name: 'Misrata (Libya)', lat: 32.37, lng: 15.09 },
    { name: 'Tobruk (Libya)', lat: 32.08, lng: 23.97 },
    { name: 'Alexandria (Egypt)', lat: 31.20, lng: 29.92 },
    { name: 'Port Said (Egypt)', lat: 31.26, lng: 32.31 },
    { name: 'Damietta (Egypt)', lat: 31.41, lng: 31.81 },
    { name: 'Latakia (Syria)', lat: 35.53, lng: 35.77 },
    { name: 'Tripoli (Lebanon)', lat: 34.44, lng: 35.84 },
    { name: 'Antalya (Turkey)', lat: 36.88, lng: 30.70 },
    { name: 'Iskenderun (Turkey)', lat: 36.58, lng: 36.17 }
];

ports.forEach(port => {
    L.circleMarker([port.lat, port.lng], {
        radius: 7,
        color: '#002855',
        fillColor: '#4db8ff',
        fillOpacity: 0.9,
        weight: 2
    }).addTo(map).bindPopup(`<b>${port.name}</b><br>Commercial Port`);
});

// --- Simulated Pollution Data (CSV format) ---
const simulatedCsvData = `Port,Date,SO4,CO2,NO2,CH4
Barcelona,2024-01-01,215.2,410.5,135.1,1.8
Barcelona,2024-01-02,214.8,412.1,134.9,1.95
Barcelona,2024-01-03,216.5,408.9,137.2,1.7
Barcelona,2024-01-04,214.0,415.3,133.0,2.1
Barcelona,2024-01-05,217.1,410.2,138.5,1.8
Barcelona,2024-01-06,215.8,413.5,136.1,2.0
Barcelona,2024-01-07,218.0,409.1,139.8,1.75
Barcelona,2024-01-08,214.5,416.8,134.2,2.2
Barcelona,2024-01-09,217.5,411.5,139.0,1.9
Barcelona,2024-01-10,216.2,414.0,137.5,2.05
Marseille,2024-01-01,218.5,415.3,140.2,2.1
Marseille,2024-01-02,219.8,417.0,141.5,2.25
Marseille,2024-01-03,217.0,413.8,138.5,1.9
Marseille,2024-01-04,220.5,419.1,143.0,2.4
Marseille,2024-01-05,218.2,415.0,140.1,2.05
Marseille,2024-01-06,221.0,420.5,144.5,2.5
Marseille,2024-01-07,219.0,416.2,141.8,2.15
Marseille,2024-01-08,222.5,422.0,146.0,2.6
Marseille,2024-01-09,220.1,418.5,143.5,2.3
Marseille,2024-01-10,223.0,423.5,147.5,2.7
Genoa,2024-01-01,217.0,412.1,137.8,1.95
Genoa,2024-01-02,218.2,413.5,138.8,2.0
Genoa,2024-01-03,216.5,411.0,136.5,1.85
Genoa,2024-01-04,219.5,415.0,140.1,2.15
Genoa,2024-01-05,217.8,412.2,138.0,1.98
Genoa,2024-01-06,220.0,416.5,141.5,2.2
Genoa,2024-01-07,218.5,413.0,139.0,2.05
Genoa,2024-01-08,221.5,418.0,143.0,2.35
Genoa,2024-01-09,219.0,414.5,140.5,2.1
Genoa,2024-01-10,222.0,419.5,44.0,2.4
Valencia,2024-01-01,214.0,408.5,133.5,1.7
Valencia,2024-01-02,215.5,409.8,135.0,1.8
Valencia,2024-01-03,213.0,407.5,132.0,1.6
Valencia,2024-01-04,216.0,410.5,136.5,1.9
Valencia,2024-01-05,214.2,408.8,133.8,1.75
Valencia,2024-01-06,216.8,411.2,137.0,1.95
Valencia,2024-01-07,213.5,407.0,131.5,1.55
Valencia,2024-01-08,217.0,412.0,138.0,2.0
Valencia,2024-01-09,214.8,409.0,134.2,1.82
Valencia,2024-01-10,217.2,413.0,138.5,2.02
Athens (Piraeus),2024-01-01,220.1,420.5,145.2,2.5
Athens (Piraeus),2024-01-02,221.5,422.0,146.5,2.6
Athens (Piraeus),2024-01-03,219.0,418.0,143.0,2.4
Athens (Piraeus),2024-01-04,223.0,424.0,148.0,2.75
Athens (Piraeus),2024-01-05,220.5,420.1,145.5,2.5
Athens (Piraeus),2024-01-06,224.0,425.5,149.5,2.8
Athens (Piraeus),2024-01-07,221.0,421.0,144.0,2.45
Athens (Piraeus),2024-01-08,225.5,427.0,151.0,2.9
Athens (Piraeus),2024-01-09,222.0,422.5,146.5,2.55
Athens (Piraeus),2024-01-10,226.0,428.5,152.0,3.0
Naples,2024-01-01,219.5,418.0,143.0,2.3
Naples,2024-01-02,220.8,419.5,144.5,2.4
Naples,2024-01-03,218.0,416.5,141.5,2.2
Naples,2024-01-04,222.0,421.0,146.0,2.55
Naples,2024-01-05,219.8,418.2,143.5,2.3
Naples,2024-01-06,223.0,422.5,147.5,2.6
Naples,2024-01-07,220.5,417.0,142.0,2.25
Naples,2024-01-08,224.5,424.0,149.0,2.7
Naples,2024-01-09,221.0,419.0,145.0,2.35
Naples,2024-01-10,225.0,425.5,150.0,2.8
`;

// --- CSV Parsing Function ---
function parseCsvData(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index].trim();
        });
        // Convert numeric values to numbers
        row['SO4'] = parseFloat(row['SO4']);
        row['CO2'] = parseFloat(row['CO2']);
        row['NO2'] = parseFloat(row['NO2']);
        row['CH4'] = parseFloat(row['CH4']);
        data.push(row);
    }
    return data;
}

const pollutionData = parseCsvData(simulatedCsvData);

// --- Pollution Chart Section ---

// Get references to the select and canvas elements
const portSelect = document.getElementById('port-select');
const pollutionChartCanvas = document.getElementById('pollutionChart');

let pollutionChart; // Variable to hold the chart instance

// Function to update the chart based on selected port
function updatePollutionChart() {
    const selectedPortName = portSelect.value;

    if (!selectedPortName) {
        if (pollutionChart) {
            pollutionChart.destroy();
            pollutionChart = null;
        }
        return;
    }

    // Filter the parsed data for the selected port
    const dataForSelectedPort = pollutionData.filter(row => row.Port === selectedPortName);

    // Sort data by date to ensure correct time series display
    dataForSelectedPort.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    // Extract labels (dates) and pollutant values
    const labels = dataForSelectedPort.map(d => d.Date);
    const so4Values = dataForSelectedPort.map(d => d.SO4);
    const co2Values = dataForSelectedPort.map(d => d.CO2);
    const no2Values = dataForSelectedPort.map(d => d.NO2);
    const ch4Values = dataForSelectedPort.map(d => d.CH4);


    const datasets = [
        {
            label: 'SO4',
            data: so4Values,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            tension: 0.1
        },
        {
            label: 'CO2',
            data: co2Values,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,
            tension: 0.1
        },
        {
            label: 'NO2',
            data: no2Values,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: false,
            tension: 0.1
        },
        {
            label: 'CH4',
            data: ch4Values,
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            fill: false,
            tension: 0.1
        }
    ];

    // If chart already exists, update its data
    if (pollutionChart) {
        pollutionChart.data.labels = labels;
        pollutionChart.data.datasets = datasets;
         pollutionChart.options.plugins.title.text = `Pollutant Evolution for ${selectedPortName}`;
        pollutionChart.update();
    } else {
        // Otherwise, create a new chart
        pollutionChart = new Chart(pollutionChartCanvas, {
            type: 'line', // Use line chart for temporal evolution
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow chart to resize based on container
                scales: {
                    x: {
                        type: 'category', // Use category scale for dates
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Concentration (Simulated Units)'
                        },
                        beginAtZero: true // Start Y-axis at zero
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: {
                        display: true,
                        text: `Pollutant Evolution for ${selectedPortName}`
                    }
                }
            }
        });
    }
}

// Add event listener to the select dropdown
portSelect.addEventListener('change', updatePollutionChart);

// Optional: Populate port select only with ports available in the simulated data
const portsInSimulatedData = [...new Set(pollutionData.map(row => row.Port))];
function populatePortSelectFromSimulatedData() {
    portsInSimulatedData.forEach(portName => {
        const option = document.createElement('option');
        option.value = portName;
        option.textContent = portName;
        portSelect.appendChild(option);
    });
}


// Call this function instead of populatePortSelect() if you only want ports from the CSV
populatePortSelectFromSimulatedData();

// Trigger the initial chart display after the ports are loaded
if (portsInSimulatedData.length > 0) {
    updatePollutionChart();
}
