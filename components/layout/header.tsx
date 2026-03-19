'use client'

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-800">AI Image Studio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/tools/remove-background" className="text-gray-600 hover:text-gray-900">
            Remove Background
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <img
                  src={session.user?.image || "/placeholder-avatar.png"}
                  alt={session.user?.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => signIn("google")}>
                Sign In
              </Button>
              <Button onClick={() => signIn("google")} className="bg-indigo-600 hover:bg-indigo-700">
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
