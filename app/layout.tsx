import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Header } from "@/components/layout/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Image Studio - AI Powered Image Editing",
  description: "Remove background, enhance photos, enlarge images with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {children}
          </main>
          <footer className="py-6 text-center text-gray-500 text-sm">
            © 2026 AI Image Studio. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  )
}
