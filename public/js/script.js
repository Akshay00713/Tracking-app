const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("end-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
            alert("Error getting location: " + error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = {};
let initialLocationSet = false;

const updateMapBounds = () => {
    const bounds = L.latLngBounds(Object.values(markers).map(marker => marker.getLatLng()));
    map.fitBounds(bounds);
};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    if (!initialLocationSet) {
        map.setView([latitude, longitude], 16);
        initialLocationSet = true;
    }
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
    updateMapBounds();
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    updateMapBounds();
});
