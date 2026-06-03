'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, LayoutDashboard, Users, ActivitySquare, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { fadeInUp } from '@/components/ui/motion';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/activities', label: 'Activities', icon: ActivitySquare },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Admin access required</h1>
          <p className="text-muted-foreground">
            You are signed in as <span className="font-medium text-foreground">{user.email}</span> with
            role <span className="font-medium text-foreground">{user.role}</span>. Only admin accounts
            can use this panel.
          </p>
          <p className="text-sm text-muted-foreground">
            Sign in with an admin account (e.g. after running <code className="text-xs">pnpm db:seed</code>, use{' '}
            <code className="text-xs">admin@example.com</code> / <code className="text-xs">password123</code>),
            or ask an admin to set your role in Admin → Users.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/dashboard/feed">
              <Button variant="outline">Back to Feed</Button>
            </Link>
            <Button
              variant="default"
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              Sign in as admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-card border border-border"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-card border-r border-border p-6 transition-transform duration-500 ease-out z-40 flex flex-col`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2 mb-8 hover:opacity-80 transition">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Wakti</span>
        </Link>

        {/* Admin Badge */}
        <div className="mb-8 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Admin Panel</p>
          <p className="text-xs text-muted-foreground mt-2">{user.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {ADMIN_NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-background"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Link href="/dashboard/feed" className="block">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            >
              Back to App
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => {
              logout();
              router.push('/');
            }}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Main Content */}
      <motion.main
        className="flex-1 overflow-auto pt-16 md:pt-0"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.main>
    </div>
  );
}
