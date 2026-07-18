import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function FlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 11, { duration: 1.2 });
  }, [lat, lon, map]);
  return null;
}

const DefaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const getMarkerIcon = (aqi: number) => {
  let color = "#10B981";
  if (aqi > 200) color = "#a855f7";
  else if (aqi > 150) color = "#ef4444";
  else if (aqi > 100) color = "#f97316";
  else if (aqi > 50)  color = "#f59e0b";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:bold;">${Math.round(aqi)}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

type MapLayer = "street" | "satellite";

interface Props {
  lat?: number;
  lon?: number;
  city?: string;
  aqi?: number | null;
}

export default function InteractiveMap({ lat, lon, city, aqi }: Props) {
  const [mapLayer, setMapLayer] = useState<MapLayer>("street");

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-950">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ position: "relative", zIndex: 0 }}
      >
        {mapLayer === "street" ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri & contributors"
          />
        )}

        {lat && lon && <FlyTo lat={lat} lon={lon} />}

        {lat && lon && city && (
          <Marker position={[lat, lon]} icon={getMarkerIcon(aqi ?? 0)}>
            <Popup>
              <strong>{city}</strong>
              <br />
              {aqi != null ? `US AQI: ${Math.round(aqi)}` : "AQI loading..."}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-[1000]">
        <Button
          variant="outline"
          className={cn(
            "rounded-full px-6 shadow-lg",
            mapLayer === "street" && "bg-blue-600 text-white hover:bg-blue-500 border-blue-600"
          )}
          onClick={() => setMapLayer("street")}
        >
          Street View
        </Button>
        <Button
          variant="outline"
          className={cn(
            "rounded-full px-6 shadow-lg",
            mapLayer === "satellite" && "bg-blue-600 text-white hover:bg-blue-500 border-blue-600"
          )}
          onClick={() => setMapLayer("satellite")}
        >
          Satellite View
        </Button>
      </div>

      {!city && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
          <div className="bg-black/70 backdrop-blur text-white text-sm px-5 py-3 rounded-xl border border-gray-700">
            Search a city above to fly to its location
          </div>
        </div>
      )}
    </div>
  );
}
