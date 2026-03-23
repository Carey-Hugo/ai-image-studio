'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Download, Loader2, Image as ImageIcon } from "lucide-react"
import { useSession, signIn } from "next-auth/react"

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function RemoveBackgroundPage() {
  const { data: session } = useSession()
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPayPal, setShowPayPal] = useState(false)
  const [paid, setPaid] = useState(false)
  const [usedFreeTrial, setUsedFreeTrial] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const paypalContainerRef = useRef<HTMLDivElement>(null)

  // 检查是否使用过免费试用
  useEffect(() => {
    if (typeof window !== "undefined") {
      const used = localStorage.getItem("usedFreeTrial")
      setUsedFreeTrial(used === "true")
    }
  }, [])

  // PayPal 配置
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZg48xWP894n1INXw5q33pkmPdbiKEnD1HJ7mnv-mrzkuifPIDckfunYbomIUG_mFQZD1NCE5TBZfb14"
  const PRICE = "0.99"

  useEffect(() => {
    if (showPayPal && !paid) {
      // 动态加载 PayPal SDK
      const existingScript = document.getElementById("paypal-sdk")
      if (!existingScript) {
        const script = document.createElement("script")
        script.id = "paypal-sdk"
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`
        script.async = true
        script.onload = () => {
          renderPayPalButtons()
        }
        document.body.appendChild(script)
      } else {
        // SDK 已加载，直接渲染按钮
        setTimeout(() => renderPayPalButtons(), 100)
      }
    }
  }, [showPayPal, paid])

  const renderPayPalButtons = () => {
    const container = document.getElementById("paypal-container")
    if (container && window.paypal) {
      container.innerHTML = ""
      window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: PRICE }
            }]
          })
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture()
          console.log("Payment captured:", order)
          setPaid(true)
          setShowPayPal(false)
          alert("感谢支付！现在可以下载图片啦~ 🎉")
        },
        onError: (err: any) => {
          console.error("PayPal Error:", err)
          alert("支付失败，请重试")
        }
      }).render("#paypal-container")
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
      setResultImage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleProcess = async () => {
    if (!originalImage) return

    // 检查登录状态
    if (!session) {
      signIn("google")
      return
    }

    // 检查是否需要付费
    if (usedFreeTrial && !paid) {
      setShowPayPal(true)
      return
    }

    // 标记已使用免费试用
    if (!usedFreeTrial && !paid) {
      localStorage.setItem("usedFreeTrial", "true")
      setUsedFreeTrial(true)
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch(originalImage)
      const blob = await response.blob()
      const file = new File([blob], "image.png", { type: "image/png" })

      const formData = new FormData()
      formData.append("image_file", file)
      formData.append("size", "auto")

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        setResultImage(data.image)
      } else {
        setError(data.error || "Processing failed")
      }
    } catch (err) {
      setError("Processing failed, please try again")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultImage) return
    
    if (!paid) {
      setShowPayPal(true)
      return
    }
    
    const link = document.createElement("a")
    link.download = "removed-bg.png"
    link.href = resultImage
    link.click()
  }

  const handleReset = () => {
    setOriginalImage(null)
    setResultImage(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Background Remover
          </h1>
          <p className="text-gray-600">
            Upload an image and we'll automatically remove the background
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div
          className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="text-5xl mb-4">📁</div>
          <p className="text-gray-600 text-lg">
            Click or drag image here
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Supports PNG, JPG up to 10MB
          </p>
        </div>

        {(originalImage || resultImage) && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-center font-semibold text-gray-700 mb-3">Original</h3>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {originalImage ? (
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    Waiting for upload...
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-center font-semibold text-gray-700 mb-3">Result</h3>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {resultImage ? (
                  <img
                    src={resultImage}
                    alt="Result"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : isProcessing ? (
                  <div className="text-indigo-600 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 animate-spin mb-2" />
                    Processing...
                  </div>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    Waiting for processing...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {resultImage ? (
            <>
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex-1 max-w-xs mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "↻ Process Again"
                )}
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 max-w-xs mx-auto bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 w-5 h-5" />
                {paid ? "Download" : "💰 Download ($0.99)"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 max-w-xs mx-auto"
              >
                Upload New
              </Button>
            </>
          ) : (
            <Button
              onClick={handleProcess}
              disabled={!originalImage || isProcessing}
              className="flex-1 max-w-xs mx-auto bg-indigo-600 hover:bg-indigo-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : !session ? (
                "Sign In to Process"
              ) : (
                <>
                  <Upload className="mr-2 w-5 h-5" />
                  Remove Background
                </>
              )}
            </Button>
          )}
        </div>

        {!session && originalImage && !isProcessing && !resultImage && (
          <p className="text-center text-gray-500 mt-4">
            Please sign in to process images
          </p>
        )}

        {showPayPal && !paid && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 mb-3">💳 Pay $0.99 to continue</p>
            <div id="paypal-container"></div>
            <a href="/pricing" className="block mt-3 text-sm text-gray-400 hover:text-gray-600">
              View other plans
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
