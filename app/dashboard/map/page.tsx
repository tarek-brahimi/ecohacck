'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockActivities, mockEnrollments } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ActivityMap } from '@/components/activity-map';
import { MapPin, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export default function MapPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [enrolledActivities, setEnrolledActivities] = useState(
    new Set(mockEnrollments.filter(e => e.userId === user?.id).map(e => e.activityId))
  );

  const activities = Object.values(mockActivities);
  const selectedActivityData = selectedActivity ? mockActivities[selectedActivity] : null;

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
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity Map</h1>
            <p className="text-muted-foreground mt-1">Find activities near you on the interactive map</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-background border border-border/50 shadow-xl overflow-hidden">
              <ActivityMap
                activities={activities}
                selectedActivity={selectedActivity}
                onSelectActivity={setSelectedActivity}
                enrolledActivities={enrolledActivities}
              />
            </Card>
          </div>

          {/* Activity Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedActivityData ? (
              <Card className="p-6 space-y-4 sticky top-24 shadow-xl border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedActivityData.title}</h3>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full capitalize">
                      {selectedActivityData.category}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedActivity(null)}
                    className="h-6 w-6 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{selectedActivityData.description}</p>

                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{selectedActivityData.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Difficulty</p>
                      <p className="text-foreground font-medium capitalize mt-1">{selectedActivityData.difficultyLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Participants</p>
                      <p className="text-foreground font-medium mt-1">{selectedActivityData.enrollmentCount}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Date & Time</p>
                    <p className="text-foreground font-medium mt-1">
                      {selectedActivityData.date.toLocaleDateString()}
                    </p>
                    <p className="text-foreground text-xs">
                      {selectedActivityData.date.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  variant={enrolledActivities.has(selectedActivityData.id) ? 'outline' : 'default'}
                  onClick={() => handleEnroll(selectedActivityData.id)}
                >
                  {enrolledActivities.has(selectedActivityData.id) ? '✓ Enrolled' : '+ Enroll Now'}
                </Button>
              </Card>
            ) : (
              <Card className="p-8 text-center space-y-4 sticky top-24 shadow-xl border-border/50">
                <div className="text-5xl">📍</div>
                <h3 className="text-lg font-semibold text-foreground">Select an Activity</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a marker on the map to view activity details and enroll.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
