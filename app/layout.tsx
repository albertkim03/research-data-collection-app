import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Research Data Collection",
  description: "UNSW Research Study",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        {/* ⬇️ Global Navbar — appears on all pages */}
        <Navbar />

        {/* ⬇️ Page content */}
        <main>{children}</main>

        {/* ⬇️ Global Footer — appears on all pages */}
        <Footer />
      </body>
    </html>
  )
}
