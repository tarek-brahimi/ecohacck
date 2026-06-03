'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ActivityMap } from '@/components/activity-map';
import { BrandLogo } from '@/components/brand-logo';
import Link from 'next/link';
import { MapPin, Users, Zap } from 'lucide-react';
import { fadeInUp, pageTransition } from '@/components/ui/motion';
import { Activity } from '@/lib/types';
import { apiRequest, parseActivities } from '@/lib/api-client';

const EMPTY_ENROLLMENTS = new Set<string>();

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && isAuthenticated) {
      router.push('/dashboard/feed');
    }
  }, [isAuthenticated, isLoading, isMounted, router]);

  useEffect(() => {
    let isActive = true;

    apiRequest<Activity[]>('/api/activities')
      .then((activityData) => {
        if (!isActive) {
          return;
        }
        setActivities(parseActivities(activityData));
      })
      .catch(() => {
        if (isActive) {
          setActivities([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-linear-to-b from-background via-background to-muted"
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 border-b border-border/40 backdrop-blur-sm bg-background/95"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <BrandLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How It Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          className="text-center space-y-8"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            Discover Youth <span className="text-primary">Activities</span> Near You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Find exciting sports, arts, tech, and social activities. Connect with peers, earn points, and level up your skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">Start Exploring</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Learn More</Button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          className="mt-20 relative rounded-xl overflow-hidden border border-border bg-muted"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="p-4 bg-linear-to-br from-muted/80 via-muted to-muted/70">
            <ActivityMap
              activities={activities}
              selectedActivity={selectedActivity}
              onSelectActivity={setSelectedActivity}
              enrolledActivities={EMPTY_ENROLLMENTS}
            />
            <div className="mt-3 text-sm text-muted-foreground">
              {activities.length
                ? `${activities.length} approved activities are visible on this map.`
                : 'No public activities are available yet.'}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Why Choose shabeb?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Find Activities Near You',
                description: 'Browse activities by location, category, and difficulty level on an interactive map.',
              },
              {
                icon: Users,
                title: 'Connect With Peers',
                description: 'Meet like-minded youth who share your interests and join a vibrant community.',
              },
              {
                icon: Zap,
                title: 'Earn Points & Compete',
                description: 'Gain points for each activity, climb the leaderboard, and unlock achievements.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-8 rounded-lg border border-border bg-background hover:shadow-lg transition-all duration-300 ease-out"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.12 }}
                whileHover={{ y: -4 }}
              >
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="bg-primary rounded-2xl p-12 text-center space-y-8"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-primary-foreground">Ready to Start?</h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of young people discovering new passions and making meaningful connections.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-black text-white hover:bg-slate-900">Create Your Account</Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="border-t border-border bg-background/50"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 shabeb.</p>
        

        </div>
        
      </motion.footer>
    </motion.div>
    
  );
}
