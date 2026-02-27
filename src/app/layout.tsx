import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YE — Music Player",
  description: "An immersive music player inspired by the visual universe of Kanye West. Dark, luxurious, futuristic.",
  keywords: ["Kanye West", "music player", "ye", "hip-hop", "luxury"],
  openGraph: {
    title: "YE — Music Player",
    description: "Immersive music experience",
    type: "music.song",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
