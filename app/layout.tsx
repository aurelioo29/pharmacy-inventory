import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import QueryProvider from "@/components/providers/query-provider";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Pharmacy Inventory",
  description: "Website stock inventori obat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full font-roboto">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
