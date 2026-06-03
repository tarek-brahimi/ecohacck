"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckSquare, XSquare } from "lucide-react";

export default function AdminHousePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin — Youth Centers</h1>
            <p className="text-muted-foreground mt-1">Static panel: review requests from youth centers (frontend placeholder)</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Pending Center Requests</h2>
              <div className="flex items-center gap-2">
                <Link href="/admin">
                  <Button size="sm" variant="ghost">Back</Button>
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-foreground">Maison des Jeunes — La Rivière</h3>
                <p className="text-sm text-muted-foreground">Contact: maison@example.com • 2024-04-28</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm"><Mail className="w-4 h-4 mr-2" />Message</Button>
                  <Button variant="outline" size="sm"><CheckSquare className="w-4 h-4" />Accept</Button>
                  <Button variant="destructive" size="sm"><XSquare className="w-4 h-4" />Reject</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-foreground">Maison des Jeunes — Nord</h3>
                <p className="text-sm text-muted-foreground">Contact: nord@example.com • 2024-03-12</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm"><Mail className="w-4 h-4 mr-2" />Message</Button>
                  <Button variant="outline" size="sm"><CheckSquare className="w-4 h-4" />Accept</Button>
                  <Button variant="destructive" size="sm"><XSquare className="w-4 h-4" />Reject</Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Quick Info</h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">These are static placeholders — backend will handle real requests.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
