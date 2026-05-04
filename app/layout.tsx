import type { Metadata } from"next";
import { Geist, Geist_Mono } from"next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import"./globals.css";

const geistSans = Geist({
  variable:"--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable:"--font-geist-mono",
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

  return (
    <html lang={locale} className="light" style={{ colorScheme:"light" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
