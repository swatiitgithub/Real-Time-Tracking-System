const socket = io()

if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position) => {
            const {latitude,longitude} = position.coords
            socket.emit('client_location_sned', {latitude,longitude})
        },
        (error) => {
            console.error('error getting user location',error);
        },
        {
        enableHighAccuracy : true,
        timeout : 5000,
        maximumAge : 0,

        }

    )
}

// create map

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


