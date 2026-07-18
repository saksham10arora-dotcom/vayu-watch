import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";

// Component to track map movements and fetch new data
function MapEventHandler({ setData }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const minlat = bounds.getSouth();
      const maxlat = bounds.getNorth();
      const minlon = bounds.getWest();
      const maxlon = bounds.getEast();

      fetch(`http://localhost:8000/ground/?minlat=${minlat}&maxlat=${maxlat}&minlon=${minlon}&maxlon=${maxlon}&limit=200`)
        .then((res) => res.json())
        .then((json) => setData(json));
    },
  });

  return null;
}

export default function AqiMap() {
  const [data, setData] = useState([]);

  // initial fetch for first render
  useEffect(() => {
    fetch("http://localhost:8000/ground/?limit=100")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  return (
    <MapContainer
      center={[40.7, -74.0]}
      zoom={11}
      className="h-[600px] w-full rounded-2xl shadow-lg"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* handle map pan/zoom */}
      <MapEventHandler setData={setData} />

      {/* draw AQI markers */}
      {data.map((point, i) => (
        <CircleMarker
          key={i}
          center={[point.lat, point.lon]}
          radius={6}
          pathOptions={{ color: point.pm25 > 35 ? "red" : "green" }}
        >
          <Popup>
            <b>Time:</b> {point.timestamp}<br />
            <b>PM2.5:</b> {point.pm25}<br />
            <b>NO₂:</b> {point.no2}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
