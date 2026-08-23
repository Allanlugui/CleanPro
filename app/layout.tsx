import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CleanPro Client PWA | Professional Cleaning Services',
  description: 'Book and track verified professional cleaning services with real-time status updates, checklists, inspection photos, and digital sign-off.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CleanPro'
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  openGraph: {
    title: 'CleanPro Client PWA',
    description: 'Real-time cleaning service booking, photo audits & live order tracking.',
    type: 'website',
  }
};

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}

