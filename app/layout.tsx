import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import "./globals.css";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "OptiTime",
  description:
    "A smart planning manager that turns deadlines, availability, and constraints into a schedule you can actually follow."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable}`}>
      <body className="overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
