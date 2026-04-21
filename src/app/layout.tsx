import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BitBingo Event Platform",
  description:
    "Cyber-flat realtime bingo board for competitive coding events powered by Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
