'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { fadeInUp, pageTransition } from '@/components/ui/motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock credentials for demo
  const demoAccounts = [
    { email: 'alex@example.com', password: 'password123' },
    { email: 'jordan@example.com', password: 'password123' },
  ];

  return (
    <motion.div
      className="min-h-screen bg-linear-to-b from-background via-background to-muted flex flex-col"
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      {/* Header */}
      <motion.header
        className="border-b border-border/40 bg-background/95"
        variants={fadeInUp}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Wakti</span>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Card className="w-full max-w-md">
            <div className="p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your Wakti account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or try demo accounts</span>
              </div>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((account, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  Demo: {account.email}
                </Button>
              ))}
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
