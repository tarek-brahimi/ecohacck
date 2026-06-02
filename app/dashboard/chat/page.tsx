'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockActivities } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Mock activity recommendation logic
const generateRecommendations = (userQuery: string, userInterests: string[]) => {
  const activities = Object.values(mockActivities);
  
  // Simple keyword matching
  const lowerQuery = userQuery.toLowerCase();
  const keywords = userQuery.split(/\s+/);
  
  let recommendedActivities = activities.filter(activity => {
    const matchScore =
      keywords.filter(k =>
        activity.title.toLowerCase().includes(k) ||
        activity.description.toLowerCase().includes(k) ||
        activity.category.toLowerCase().includes(k)
      ).length || 0;
    
    const interestMatch = userInterests.includes(activity.category) ? 2 : 0;
    
    return matchScore + interestMatch > 0;
  });

  // If no matches, return easy activities as default
  if (recommendedActivities.length === 0) {
    recommendedActivities = activities.filter(a => a.difficultyLevel === 'easy').slice(0, 3);
  } else {
    recommendedActivities = recommendedActivities.slice(0, 3);
  }

  return recommendedActivities;
};

const generateChatResponse = (userQuery: string, recommendations: typeof mockActivities[string][]): string => {
  const intro = `Based on your interest in "${userQuery}", I found ${recommendations.length} activities that match:`;
  
  const activityList = recommendations
    .map(a => `• **${a.title}** - ${a.category} (${a.difficultyLevel} difficulty) at ${a.location}`)
    .join('\n');

  const closing = recommendations.length > 0
    ? '\n\nWould you like to enroll in any of these activities? Head to the Feed page to explore more!'
    : '\n\nI couldn\'t find exact matches for that query. Try searching for different keywords or browse all activities in the Feed!';

  return `${intro}\n\n${activityList}${closing}`;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your Wakti activity assistant. Tell me what kind of activities you're interested in, and I'll recommend the perfect ones for you! You can ask me about sports, arts, tech, music, outdoor activities, social events, or anything else.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const recommendations = generateRecommendations(input, user?.interests || []);
      const response = generateChatResponse(input, recommendations);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  const suggestedQueries = [
    'Show me sports activities',
    'I love music',
    'Tech and coding workshops',
    'Easy activities for beginners',
  ];

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Activity Assistant</h1>
          </div>
          <p className="text-muted-foreground">Get personalized activity recommendations powered by AI</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6">
        {/* Messages */}
        <div className="flex-1 space-y-4 min-h-96">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card border border-border text-foreground rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        {messages.length <= 1 && !isLoading && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Try asking about:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQueries.map((query, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleSuggestedQuery(query)}
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask about activities you're interested in..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This AI assistant will help you discover activities that match your interests.
          </p>
        </form>
      </div>
    </div>
  );
}
