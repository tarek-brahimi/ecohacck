"use client";

import type { LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";

const DEFAULT_CENTER: LatLngTuple = [24.7136, 46.6753];

interface LocationMapPickerLeafletProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

function MapClickHandler({
  onChange,
}: {
  onChange: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export function LocationMapPickerLeaflet({
  latitude,
  longitude,
  onChange,
}: LocationMapPickerLeafletProps) {
  const hasPosition =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const center: LatLngTuple = hasPosition
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  const position: LatLngTuple | null = hasPosition
    ? [latitude, longitude]
    : null;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <p className="px-3 py-2 text-xs text-muted-foreground bg-muted/40 border-b border-border">
        Click the map to set latitude and longitude
      </p>
      <MapContainer
        center={center}
        zoom={hasPosition ? 12 : 6}
        className="activity-map-container h-[220px] w-full"
        scrollWheelZoom
        dragging
        touchZoom
        doubleClickZoom
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        <MapClickHandler onChange={onChange} />
        {position ? (
          <CircleMarker
            center={position}
            radius={9}
            pathOptions={{
              color: "#6366f1",
              fillColor: "#6366f1",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
