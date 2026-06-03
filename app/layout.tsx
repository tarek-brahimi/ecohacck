import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'shabeb - Discover Youth Activities',
  description: 'Discover and join exciting youth activities in your area',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/image.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/image.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/image.png',
        type: 'image/png',
      },
    ],
    apple: '/image.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
