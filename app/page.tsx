import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Shield, Maximize2, Minimize2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Image Editing
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Remove Backgrounds in
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Seconds</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Professional AI image editing tools that work in your browser. 
          No download required, no professional skills needed.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/tools/remove-background">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Start Editing Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Edit Images
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/tools/remove-background">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Remove Background</h3>
              <p className="text-gray-600">
                AI automatically detects and removes backgrounds from any image in seconds.
                Perfect for product photos, portraits, and more.
              </p>
            </div>
          </Link>
          
          <Link href="/tools/enhance">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enhance Photos</h3>
              <p className="text-gray-600">
                Transform blurry photos into crystal clear images with AI enhancement.
                Restore old photos or fix out-of-focus shots.
              </p>
            </div>
          </Link>
          
          <Link href="/tools/enlarge">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Maximize2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upscale Images</h3>
              <p className="text-gray-600">
                Enlarge images using AI super-resolution. Increase resolution without losing quality.
              </p>
            </div>
          </Link>
          
          <Link href="/tools/change-background">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Change Background</h3>
              <p className="text-gray-600">
                Replace or remove image backgrounds with solid colors. Perfect for creating custom scenes.
              </p>
            </div>
          </Link>
          
          <Link href="/tools/compress">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Minimize2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compress Images</h3>
              <p className="text-gray-600">
                Reduce image file size without significant quality loss. Optimize for web and storage.
              </p>
            </div>
          </Link>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600">
              Your images are automatically deleted after processing. 
              We never use your photos for AI training.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Join thousands of users who trust AI Image Studio for their image editing needs.
            Start for free, upgrade when you need more.
          </p>
          <Link href="/tools/remove-background">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Try It Now - It's Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
