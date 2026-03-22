import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farm OSS",
  description: "Farm record and profit tracker for poultry-first operations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

