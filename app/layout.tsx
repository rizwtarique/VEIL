import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veil | Threat Intelligence",
  description: "Real-time AI security incident monitoring and risk intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
