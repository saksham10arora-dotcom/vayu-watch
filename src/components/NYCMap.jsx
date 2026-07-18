import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

export default function NYCMap() {
  useEffect(() => {
    // Initialize map
    const map = L.map("map").setView([40.7128, -74.0060], 11);

    // Base layers
    const normalLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    );

    // Heatmap layer
    const heat = L.heatLayer([], { radius: 25 }).addTo(map);

    // Function to fetch data based on current map bounds
    const fetchData = () => {
      const bounds = map.getBounds();
      const minlat = bounds.getSouth();
      const maxlat = bounds.getNorth();
      const minlon = bounds.getWest();
      const maxlon = bounds.getEast();

      fetch(
        `http://localhost:8000/ground/?minlat=${minlat}&maxlat=${maxlat}&minlon=${minlon}&maxlon=${maxlon}&limit=300`
      )
        .then((res) => res.json())
        .then((data) => {
          // Convert data to [lat, lon, intensity] for heatmap
          const points = data.map((d) => [d.lat, d.lon, d.pm25]);
          heat.setLatLngs(points);
        })
        .catch((err) => console.error("Error fetching AQI data:", err));
    };

    // Initial fetch
    fetchData();

    // Re-fetch whenever map is moved or zoomed
    map.on("moveend", fetchData);

    // Layer controls
    L.control
      .layers(
        { Normal: normalLayer, Satellite: satelliteLayer },
        { "PM2.5 Heatmap": heat }
      )
      .addTo(map);

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
}
