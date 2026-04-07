import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Invitación de Boda - Fernanda & Benjamín",
  description: "Únete a la celebración de nuestra boda. Confirma tu asistencia y elige tu regalo especial.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Invitación de Boda - Fernanda & Benjamín",
    description: "Únete a la celebración de nuestra boda. Confirma tu asistencia y elige tu regalo especial.",
    image: "/logo.png",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://invitacion-boda.vercel.app",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
