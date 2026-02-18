// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css"; // CSS import mat bhoolna!
import Providers from "@/components/Providers"; // Abhi jo file banayi uska path

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MailAI - Smart Email Assistant",
  description: "AI-powered email management dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Yahan humne Providers ko wrap kiya hai */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}