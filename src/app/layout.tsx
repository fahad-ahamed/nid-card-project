import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "জাতীয় পরিচয় পত্র | National Identity Card - Bangladesh",
  description: "Bangladesh National Identity Card (NID) Maker - জাতীয় পরিচয় পত্র তৈরি ও পরিচালনা ব্যবস্থা",
  keywords: ["NID", "Bangladesh", "National Identity Card", "জাতীয় পরিচয় পত্র"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
