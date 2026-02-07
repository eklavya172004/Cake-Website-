import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartButton } from "@/components/cart/CartButton";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import MainNavbar from "@/components/common/MainNavbar";
import FooterWrapper from "@/components/common/FooterWrapper";
import { HideNavbarProvider } from "@/components/HideNavbarProvider";
import { CartWrapper } from "@/components/cart/CartWrapper";
import { Toaster } from "react-hot-toast";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Purble Palace - Order Custom Cakes Online",
  description: "Order delicious custom cakes from local cake makers. Fast delivery, best prices, and endless flavors.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased`}
      >
        <Toaster position="top-center" />
        <HideNavbarProvider>
          <AuthSessionProvider>
            <CartProvider>
              <MainNavbar />
              <main>
                {children}
              </main>
              <CartWrapper>
                <CartButton />
                <CartSidebar />
              </CartWrapper>
            </CartProvider>
            <FooterWrapper />
          </AuthSessionProvider>
        </HideNavbarProvider>
      </body>
    </html>
  );
}
