import '../styles/globals.css';

export const metadata = {
  title: 'Student Progress Tracker',
  description: 'Study tracker built with Next.js and TailwindCSS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
