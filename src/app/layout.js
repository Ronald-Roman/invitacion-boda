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
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png?v=1" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
