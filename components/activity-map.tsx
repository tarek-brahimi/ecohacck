"use client";

import { useState } from "react";
import { Activity } from "@/lib/types";
import { MapPin, Navigation, Zap } from "lucide-react";

interface ActivityMapProps {
  activities: Activity[];
  selectedActivity: string | null;
  onSelectActivity: (id: string) => void;
  enrolledActivities: Set<string>;
}

export function ActivityMap({
  activities,
  selectedActivity,
  onSelectActivity,
  enrolledActivities,
}: ActivityMapProps) {
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);

  // Calculate bounds
  const bounds = activities.reduce(
    (acc, activity) => ({
      minLat: Math.min(acc.minLat, activity.latitude),
      maxLat: Math.max(acc.maxLat, activity.latitude),
      minLng: Math.min(acc.minLng, activity.longitude),
      maxLng: Math.max(acc.maxLng, activity.longitude),
    }),
    { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 },
  );

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;

  const width = 900;
  const height = 700;
  const padding = 60;

  const mapLat = height - padding * 2;
  const mapLng = width - padding * 2;

  const latToY = (lat: number) => {
    const normalized = (lat - bounds.minLat) / latRange;
    return padding + (1 - normalized) * mapLat;
  };

  const lngToX = (lng: number) => {
    const normalized = (lng - bounds.minLng) / lngRange;
    return padding + normalized * mapLng;
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sports: "#ff6b6b",
      arts: "#ee5a6f",
      tech: "#748ffc",
      social: "#ffd43b",
      outdoor: "#51cf66",
      music: "#da77f2",
      other: "#74c0fc",
    };
    return colors[category] || "#748ffc";
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Map Container */}
      <div className="flex-1 rounded-xl border border-border/50 bg-linear-to-br from-background via-card to-background overflow-hidden shadow-lg">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{ minHeight: "500px" }}
        >
          {/* Gradient Defs */}
          <defs>
            <linearGradient
              id="mapGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="var(--color-muted)"
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor="var(--color-muted)"
                stopOpacity="0.1"
              />
            </linearGradient>

            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width={width} height={height} fill="url(#mapGradient)" />

          {/* Title and Legend */}
          <text
            x={padding}
            y={padding / 2}
            fontSize="20"
            fontWeight="bold"
            fill="var(--color-foreground)"
          >
            📍 Activity Map
          </text>

          {/* Grid with improved styling */}
          {[...Array(6)].map((_, i) => {
            const x = padding + (mapLng * i) / 5;
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1={padding}
                x2={x}
                y2={height - padding}
                stroke="var(--color-border)"
                strokeWidth="1"
                opacity="0.15"
                strokeDasharray="4,4"
              />
            );
          })}
          {[...Array(5)].map((_, i) => {
            const y = padding + (mapLat * i) / 4;
            return (
              <line
                key={`h-${i}`}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="1"
                opacity="0.15"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Border */}
          <rect
            x={padding}
            y={padding}
            width={mapLng}
            height={mapLat}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            opacity="0.3"
            rx="8"
          />

          {/* Activity Points */}
          {activities.map((activity) => {
            const x = lngToX(activity.longitude);
            const y = latToY(activity.latitude);
            const isSelected = activity.id === selectedActivity;
            const isHovered = activity.id === hoveredActivity;
            const categoryColor = getCategoryColor(activity.category);
            const isEnrolled = enrolledActivities.has(activity.id);

            return (
              <g
                key={activity.id}
                onClick={() => onSelectActivity(activity.id)}
                onMouseEnter={() => setHoveredActivity(activity.id)}
                onMouseLeave={() => setHoveredActivity(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Glow effect for selected */}
                {(isSelected || isHovered) && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 28 : 24}
                      fill="none"
                      stroke={categoryColor}
                      strokeWidth="2"
                      opacity={isSelected ? 0.6 : 0.4}
                      style={{
                        animation: isSelected ? "pulse 2s infinite" : "none",
                      }}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 22 : 18}
                      fill="none"
                      stroke={categoryColor}
                      strokeWidth="1"
                      opacity={isSelected ? 0.4 : 0.2}
                    />
                  </>
                )}

                {/* Main circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 12 : isHovered ? 11 : 9}
                  fill={categoryColor}
                  opacity={isSelected ? 1 : isHovered ? 0.9 : 0.8}
                  className="transition-all"
                  filter={isSelected ? "url(#glow)" : undefined}
                />

                {/* Enrollment indicator */}
                {isEnrolled && (
                  <circle
                    cx={x}
                    cy={y}
                    r={13}
                    fill="none"
                    stroke="#51cf66"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                )}

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 90}
                      y={y - 50}
                      width="180"
                      height="45"
                      fill="var(--color-card)"
                      stroke="var(--color-border)"
                      strokeWidth="1"
                      rx="6"
                      filter="url(#blur)"
                    />
                    <text
                      x={x}
                      y={y - 30}
                      fontSize="12"
                      fontWeight="bold"
                      fill="var(--color-foreground)"
                      textAnchor="middle"
                    >
                      {activity.title.substring(0, 20)}
                    </text>
                    <text
                      x={x}
                      y={y - 12}
                      fontSize="10"
                      fill="var(--color-muted-foreground)"
                      textAnchor="middle"
                    >
                      {activity.category}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Compass */}
          <g transform={`translate(${width - 60}, ${padding + 30})`}>
            <circle
              cx="0"
              cy="0"
              r="20"
              fill="var(--color-card)"
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x="0"
              y="-3"
              fontSize="14"
              fontWeight="bold"
              fill="var(--color-primary)"
              textAnchor="middle"
            >
              N
            </text>
            <line
              x1="0"
              y1="5"
              x2="0"
              y2="15"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
          </g>

          {/* Legend */}
          <g transform={`translate(${padding}, ${height - padding + 20})`}>
            <text
              x="0"
              y="0"
              fontSize="12"
              fontWeight="bold"
              fill="var(--color-foreground)"
            >
              Legend:
            </text>
            {["sports", "arts", "tech", "social"].map((category, i) => (
              <g key={category} transform={`translate(${i * 140}, 15)`}>
                <circle cx="0" cy="0" r="4" fill={getCategoryColor(category)} />
                <text
                  x="12"
                  y="4"
                  fontSize="11"
                  fill="var(--color-muted-foreground)"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Stats and Actions */}
      <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>{activities.length} Activities</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-green-500" />
            <span>{enrolledActivities.size} Enrolled</span>
          </div>
        </div>
        <span className="text-xs opacity-60">
          Click on markers to view details
        </span>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
            r: 28;
          }
          50% {
            opacity: 0.4;
            r: 32;
          }
        }
      `}</style>
    </div>
  );
}
