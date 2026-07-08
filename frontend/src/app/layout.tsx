import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowEasy | CSV Importer',
  description:
    'Upload any lead export — Facebook, Google Ads, a real-estate CRM, or a hand-made spreadsheet. The AI maps its columns to the GrowEasy schema automatically.',
  keywords: ['CRM', 'CSV importer', 'lead management', 'AI extraction', 'GrowEasy'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
