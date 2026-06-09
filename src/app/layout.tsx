import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'B2B Portal',
  description: 'Veleprodajni portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className="h-full">
      <body className="h-full bg-white text-slate-800">{children}</body>
    </html>
  );
}
