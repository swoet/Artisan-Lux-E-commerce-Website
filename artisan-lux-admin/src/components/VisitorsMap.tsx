"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Point = { lat: number; lon: number; city?: string | null; country?: string | null; count?: number; visits?: number };

export default function VisitorsMap({ points }: { points: Point[] }) {
  const center = points.length ? [points[0].lat, points[0].lon] : [20, 0];
  return (
    <div style={{ height: 520 }}>
      <MapContainer center={center as any} zoom={2} style={{ height: "100%", borderRadius: "var(--radius)" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p, i) => {
          const cnt = (p.count ?? p.visits ?? 0) as number;
          return (
            <Marker key={i} position={[p.lat, p.lon] as any} icon={defaultIcon}>
              <Popup>
                <div className="text-sm">
                  <div><strong>{p.city || "Unknown"}</strong> {p.country ? `(${p.country})` : ""}</div>
                  <div>{cnt} visit{cnt === 1 ? "" : "s"}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
