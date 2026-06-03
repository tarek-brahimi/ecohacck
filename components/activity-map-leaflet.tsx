"use client";

import { Fragment, useEffect, useMemo } from "react";
import type { LatLngTuple } from "leaflet";
import { LatLngBounds } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { Navigation, Zap } from "lucide-react";
import { Activity } from "@/lib/types";

interface ActivityMapProps {
  activities: Activity[];
  selectedActivity: string | null;
  onSelectActivity: (id: string) => void;
  enrolledActivities: Set<string>;
}

type MappedActivity = Activity & { mapPosition: LatLngTuple };

const CATEGORY_COLORS: Record<Activity["category"], string> = {
  sports: "#ef4444",
  arts: "#ec4899",
  tech: "#6366f1",
  social: "#f59e0b",
  outdoor: "#16a34a",
  music: "#a855f7",
  other: "#0ea5e9",
};

const DEFAULT_CENTER: LatLngTuple = [24.7136, 46.6753];

function FitBoundsToMarkers({ points }: { points: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 12, { animate: true });
      return;
    }

    const bounds = new LatLngBounds(points);
    map.fitBounds(bounds.pad(0.2), { animate: true });
  }, [map, points]);

  return null;
}

function FocusSelectedMarker({ position }: { position: LatLngTuple | null }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(position, Math.max(map.getZoom(), 12), {
      animate: true,
      duration: 0.6,
    });
  }, [map, position]);

  return null;
}

export function ActivityMapLeaflet({
  activities,
  selectedActivity,
  onSelectActivity,
  enrolledActivities,
}: ActivityMapProps) {
  const mappedActivities = useMemo<MappedActivity[]>(
    () =>
      activities
        .filter(
          (activity) =>
            Number.isFinite(activity.latitude) &&
            Number.isFinite(activity.longitude),
        )
        .map((activity) => ({
          ...activity,
          mapPosition: [activity.latitude, activity.longitude] as LatLngTuple,
        })),
    [activities],
  );

  const points = useMemo(
    () => mappedActivities.map((activity) => activity.mapPosition),
    [mappedActivities],
  );

  const selectedPosition = useMemo(() => {
    if (!selectedActivity) {
      return null;
    }

    return (
      mappedActivities.find((activity) => activity.id === selectedActivity)
        ?.mapPosition || null
    );
  }, [mappedActivities, selectedActivity]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="rounded-xl border border-border/60 overflow-hidden shadow-lg">
        <MapContainer
          center={points[0] || DEFAULT_CENTER}
          zoom={6}
          className="activity-map-container h-[500px] w-full"
          zoomControl={false}
          scrollWheelZoom
          dragging
          touchZoom
          doubleClickZoom
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
          />

          <FitBoundsToMarkers points={points} />
          <FocusSelectedMarker position={selectedPosition} />

          {mappedActivities.map((activity) => {
            const categoryColor = CATEGORY_COLORS[activity.category];
            const isSelected = activity.id === selectedActivity;
            const isEnrolled = enrolledActivities.has(activity.id);

            return (
              <Fragment key={activity.id}>
                {isEnrolled ? (
                  <CircleMarker
                    center={activity.mapPosition}
                    radius={isSelected ? 14 : 12}
                    pathOptions={{
                      color: "#16a34a",
                      fillOpacity: 0,
                      weight: 2,
                    }}
                    interactive={false}
                  />
                ) : null}
                <CircleMarker
                  center={activity.mapPosition}
                  radius={isSelected ? 10 : 8}
                  pathOptions={{
                    color: categoryColor,
                    fillColor: categoryColor,
                    fillOpacity: isSelected ? 0.95 : 0.78,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => onSelectActivity(activity.id),
                  }}
                >
                  <Popup>
                    <div className="space-y-1">
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-xs opacity-80">{activity.location}</p>
                      <p className="text-xs opacity-80 capitalize">
                        {activity.category} • {activity.difficultyLevel}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              </Fragment>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>{mappedActivities.length} activities</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-green-500" />
            <span>{enrolledActivities.size} enrolled</span>
          </div>
        </div>
        <span className="text-xs opacity-70">
          Drag to move • Scroll to zoom
        </span>
      </div>
    </div>
  );
}
