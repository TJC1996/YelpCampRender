

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 5, // starting zoom
});

new mapboxgl.Marker({
    color: "#FFFFFF",
    draggable: true
    }).setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 5})
        .setHTML(
            `<h4>${campground.title}</h4><p>${campground.location}</p>`
        )
    )
    .addTo(map);


map.addControl(new mapboxgl.NavigationControl(), 'top-left');
