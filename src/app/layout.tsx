import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireU Intake | Collaborative Candidate Forms",
  description: "Real-time collaborative intake forms for recruitment teams",
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
