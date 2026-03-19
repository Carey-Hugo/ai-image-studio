'use client'

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { User, Image, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view your dashboard
          </h1>
          <Button onClick={() => signIn("google")} className="bg-indigo-600 hover:bg-indigo-700">
            Sign In with Google
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <img
            src={session.user?.image || "/placeholder-avatar.png"}
            alt={session.user?.name || "User"}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">{session.user?.name}</h2>
            <p className="text-gray-500">{session.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Images Today</p>
              <p className="text-2xl font-bold">1 / 3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Member Since</p>
              <p className="text-2xl font-bold">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Current Plan</p>
              <p className="text-2xl font-bold">Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/tools/remove-background">
            <Button variant="outline" className="w-full justify-start h-12">
              <Image className="mr-2 w-5 h-5" />
              Remove Background
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="w-full justify-start h-12">
              <CreditCard className="mr-2 w-5 h-5" />
              Upgrade Plan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
