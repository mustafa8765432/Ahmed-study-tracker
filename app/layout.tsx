import '../styles/globals.css';

export const metadata = {
  title: 'Student Progress Tracker',
  description: 'Study tracker built with Next.js and TailwindCSS',
  icons: {
    icon: '/logo.svg', // ✅ your favicon/logo
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="rtl"> {/* ✅ added RTL support since your app is Arabic */}
      <body className="bg-gray-900 text-white">{children}</body> {/* ✅ keeps your theme consistent */}
    </html>
  );
}
