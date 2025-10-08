import type { Metadata } from "next";
import { Instrument_Sans,  } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  weight: ["400", "500", "600", "700",],
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "EduTrack - Educational Management System",
  description: "Comprehensive educational management system for learners, teachers, principals, and parents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={` ${instrumentSans.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
