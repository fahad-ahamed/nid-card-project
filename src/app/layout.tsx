import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Kalpurush font */}
        <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet" />
        {/* Nikosh font */}
        <link href="https://sonnetdp.github.io/nikosh/css/nikosh.css" rel="stylesheet" type="text/css" />
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v6.1.1/css/all.css"
        />
        {/* Bootstrap 5 CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
        />
        {/* Favicon */}
        <link href="https://surokkha.gov.bd/favicon.png" rel="icon" />
        {/* Original CSS */}
        <link rel="stylesheet" href="/assets/CSS/tx1337.css" />
      </head>
      <body className="antialiased">
        {children}
        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
        />
        {/* html2canvas */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          strategy="lazyOnload"
        />
        {/* jsPDF */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="lazyOnload"
        />
        {/* PDF417 barcode scripts */}
        <Script src="/assets/JavaScript/bcmath-min.js" strategy="lazyOnload" />
        <Script src="/assets/JavaScript/pdf417-min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
