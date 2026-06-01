import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cedar Training Center | English in Cotonou, Benin",
  description: "English language training from beginner to advanced. Cedar Training Center, Cotonou, Benin.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang={locale} className="light" style={{ colorScheme: "light" }}>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        {isDev && (
          <div className="dev-bar" style={{ position:"fixed", bottom:0, left:0, right:0, background:"#1e293b", padding:"6px 16px", display:"flex", gap:"12px", zIndex:9999, fontSize:"12px", alignItems:"center" }}>
            <span style={{ color:"#64748b", fontWeight:600 }}>Dev:</span>
            <a href="/admin">Admin</a>
            <a href="/student">Student</a>
            <a href="/staff">Staff</a>
            <a href="/parent">Parent</a>
            <a href="/">Public</a>
          </div>
        )}
      </body>
    </html>
  );
}
