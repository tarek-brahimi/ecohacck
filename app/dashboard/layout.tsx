'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import Link from 'next/link';
import { Sparkles, LayoutGrid, MapPin, MessageSquare, Trophy, User, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { fadeInUp } from '@/components/ui/motion';

const NAV_ITEMS = [
  { href: '/dashboard/feed', label: 'Feed', icon: LayoutGrid },
  { href: '/dashboard/map', label: 'Map', icon: MapPin },
  { href: '/dashboard/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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

  if (!user) return null;

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
        <Link href="/dashboard/feed" className="flex items-center gap-2 mb-8 hover:opacity-80 transition">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Wakti</span>
        </Link>

        {/* User Info */}
        <div className="mb-8 p-4 rounded-lg bg-background border border-border/50">
          <p className="text-sm font-medium text-foreground">{user.fullName}</p>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Points</p>
            <p className="text-lg font-bold text-primary">{user.points}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map(item => (
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

        {/* Theme Toggle */}
        <div className="mb-4 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-background"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        {/* Logout Button */}
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
      </motion.aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
