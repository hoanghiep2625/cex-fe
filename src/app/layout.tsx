import { Roboto, Be_Vietnam_Pro } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SymbolProvider } from "@/context/SymbolContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { ClientLayout } from "./client-layout";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={`${beVietnamPro.variable} antialiased`}>
        <ClientLayout>
          <WebSocketProvider>
            <SymbolProvider>
              <Toaster position="bottom-right" />
              {children}
            </SymbolProvider>
          </WebSocketProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
