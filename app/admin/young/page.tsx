"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CalendarPlus, Trash2 } from "lucide-react";

export default function AdminYoungPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin — Youth Submissions</h1>
            <p className="text-muted-foreground mt-1">Static panel: youths can post events (frontend placeholder)</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Submitted Events (Static)</h2>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CalendarPlus className="w-4 h-4 mr-2" /> Create
                </Button>
                <Link href="/admin">
                  <Button size="sm" variant="ghost">Back</Button>
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-foreground">Fun Soccer Match</h3>
                <p className="text-sm text-muted-foreground">Posted by: alex@example.com • 2024-05-01</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-foreground">Art Workshop</h3>
                <p className="text-sm text-muted-foreground">Posted by: jordan@example.com • 2024-04-22</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" /> Manage Youths (placeholder)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
