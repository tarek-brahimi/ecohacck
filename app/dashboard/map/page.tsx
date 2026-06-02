'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockActivities, mockEnrollments } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';

export default function MapPage() {
  const { user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [enrolledActivities, setEnrolledActivities] = useState(
    new Set(mockEnrollments.filter(e => e.userId === user?.id).map(e => e.activityId))
  );

  const activities = Object.values(mockActivities);
  const selectedActivityData = selectedActivity ? mockActivities[selectedActivity] : null;

  // Find bounds for all activities
  const bounds = activities.reduce(
    (acc, activity) => ({
      minLat: Math.min(acc.minLat, activity.latitude),
      maxLat: Math.max(acc.maxLat, activity.latitude),
      minLng: Math.min(acc.minLng, activity.longitude),
      maxLng: Math.max(acc.maxLng, activity.longitude),
    }),
    { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
  );

  // Calculate center point
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;

  // Simple SVG-based map visualization
  const width = 800;
  const height = 600;
  const padding = 40;

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

  const handleEnroll = (activityId: string) => {
    setEnrolledActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Activity Map</h1>
          <p className="text-muted-foreground mt-1">Find activities near you</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-4 bg-background border border-border">
              <div className="flex items-center justify-center overflow-auto bg-muted rounded-lg p-4 min-h-96">
                <svg width="100%" height="600" viewBox={`0 0 ${width} ${height}`} className="max-w-full">
                  {/* Background */}
                  <rect width={width} height={height} fill="var(--color-muted)" />

                  {/* Grid */}
                  {[...Array(5)].map((_, i) => {
                    const x = padding + (mapLng * i) / 4;
                    return (
                      <line
                        key={`v-${i}`}
                        x1={x}
                        y1={padding}
                        x2={x}
                        y2={height - padding}
                        stroke="var(--color-border)"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    );
                  })}
                  {[...Array(4)].map((_, i) => {
                    const y = padding + (mapLat * i) / 3;
                    return (
                      <line
                        key={`h-${i}`}
                        x1={padding}
                        y1={y}
                        x2={width - padding}
                        y2={y}
                        stroke="var(--color-border)"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    );
                  })}

                  {/* Activity Points */}
                  {activities.map(activity => {
                    const x = lngToX(activity.longitude);
                    const y = latToY(activity.latitude);
                    const isSelected = activity.id === selectedActivity;

                    return (
                      <g
                        key={activity.id}
                        onClick={() => setSelectedActivity(activity.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 14 : 10}
                          fill="var(--color-primary)"
                          opacity={isSelected ? 1 : 0.7}
                          className="transition-all"
                        />

                        {/* Outer ring for selected */}
                        {isSelected && (
                          <circle
                            cx={x}
                            cy={y}
                            r={20}
                            fill="none"
                            stroke="var(--color-primary)"
                            strokeWidth="2"
                            opacity="0.3"
                            className="animate-pulse"
                          />
                        )}

                        {/* Hover area */}
                        <circle cx={x} cy={y} r={14} fill="transparent" />
                      </g>
                    );
                  })}

                  {/* Axis labels */}
                  <text x={padding / 2} y={padding / 2} fontSize="12" fill="var(--color-muted-foreground)" textAnchor="end">
                    N
                  </text>
                </svg>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Click on activity markers to view details
              </p>
            </Card>
          </div>

          {/* Activity Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedActivityData ? (
              <Card className="p-6 space-y-4 sticky top-24">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{selectedActivityData.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedActivity(null)}
                    className="h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">{selectedActivityData.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{selectedActivityData.location}</span>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="text-foreground">{selectedActivityData.date.toLocaleDateString()} at {selectedActivityData.date.toLocaleTimeString()}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Difficulty</p>
                    <p className="text-foreground capitalize">{selectedActivityData.difficultyLevel}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Enrolled</p>
                    <p className="text-foreground">{selectedActivityData.enrollmentCount} people</p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={enrolledActivities.has(selectedActivityData.id) ? 'outline' : 'default'}
                  onClick={() => handleEnroll(selectedActivityData.id)}
                >
                  {enrolledActivities.has(selectedActivityData.id) ? 'Enrolled' : 'Enroll Now'}
                </Button>
              </Card>
            ) : (
              <Card className="p-6 text-center space-y-4 sticky top-24">
                <div className="text-4xl">📍</div>
                <p className="text-sm text-muted-foreground">
                  Click on a marker on the map to view activity details.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
