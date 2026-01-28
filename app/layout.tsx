import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VERSERTILE | Create. Earn. Own",
  description: "An AI-powered creative ecosystem where creators earn, audiences engage, and originality is rewarded.",
  icons: {
    icon: "/VERSERTILE/LOGO PNG.PNG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={openSans.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
