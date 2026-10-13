import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const mapElement = document.querySelector('#map');

if (mapElement) {
  const map = L.map(mapElement, {
    zoomControl: false,
    scrollWheelZoom: true,
  }).setView([50.8, 10.5], 5.5);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);
}
