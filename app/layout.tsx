import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Progress Tracker',
  description: 'Study tracker built with Next.js and TailwindCSS',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="rtl">
      <head>
        {/* fallback for browsers that ignore metadata.icons */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  );
}
