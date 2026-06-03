"use client";

import dynamic from "next/dynamic";

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

const LocationMapPickerLeaflet = dynamic(
  () =>
    import("@/components/location-map-picker-leaflet").then(
      (module) => module.LocationMapPickerLeaflet,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] rounded-lg border border-border bg-muted/40 flex items-center justify-center text-sm text-muted-foreground">
        Loading map picker...
      </div>
    ),
  },
);

export function LocationMapPicker(props: LocationMapPickerProps) {
  return <LocationMapPickerLeaflet {...props} />;
}
