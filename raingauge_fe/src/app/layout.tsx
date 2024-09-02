import type { Metadata } from "next";
import { Inter } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.css';
import "./globals.css";

import BootstrapClient from '@/components/BootstrapClient.js';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rain Gauge by Alex Symonds",
  description: "Rain gauge time series visualisation (with a map) by Alex Symonds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <BootstrapClient />
      </body>
    </html>
  );
}
