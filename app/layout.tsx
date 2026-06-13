import type { Metadata } from "next";
import { Toaster } from "sonner";
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
      <body>
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
