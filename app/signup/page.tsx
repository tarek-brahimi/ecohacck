'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandLogo } from '@/components/brand-logo';
import Link from 'next/link';
import { fadeInUp, pageTransition } from '@/components/ui/motion';

type AgeGroup = 'teen' | 'young-adult';
type ActivityCategory = 'sports' | 'arts' | 'tech' | 'social' | 'outdoor' | 'music' | 'other';

const INTERESTS: { value: ActivityCategory; label: string }[] = [
  { value: 'sports', label: 'Sports' },
  { value: 'arts', label: 'Arts & Design' },
  { value: 'tech', label: 'Technology' },
  { value: 'social', label: 'Social' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'music', label: 'Music' },
];

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    ageGroup: 'teen' as AgeGroup,
    interests: [] as ActivityCategory[],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.fullName);
      router.push('/dashboard/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestToggle = (interest: ActivityCategory) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

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
            <BrandLogo imageClassName="size-8" />
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
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground">Join shabeb and discover activities</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Age Group</label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                >
                  <option value="teen">13-17 years</option>
                  <option value="young-adult">18-24 years</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Interests (optional)</label>
                <div className="space-y-2">
                  {INTERESTS.map(interest => (
                    <div key={interest.value} className="flex items-center gap-2">
                      <Checkbox
                        id={interest.value}
                        checked={formData.interests.includes(interest.value)}
                        onCheckedChange={() => handleInterestToggle(interest.value)}
                        disabled={isLoading}
                      />
                      <label htmlFor={interest.value} className="text-sm cursor-pointer text-foreground">
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
