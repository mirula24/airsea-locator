import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirSea Locator',
  description: 'Real-time node tracking via MQTT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}