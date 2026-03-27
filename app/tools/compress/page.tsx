'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Download, Loader2, Image as ImageIcon, Settings } from "lucide-react"
import imageCompression from "browser-image-compression"

export default function CompressPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [maxSizeMB, setMaxSizeMB] = useState(1)
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1920)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    setError(null)
    setOriginalSize(file.size)
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
      setResultImage(null)
      setResultSize(0)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleCompress = async () => {
    if (!originalImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch(originalImage)
      const blob = await response.blob()
      const file = new File([blob], "image.png", { type: blob.type })

      const options = {
        maxSizeMB: maxSizeMB,
        maxWidthOrHeight: maxWidthOrHeight,
        useWebWorker: true,
        fileType: blob.type,
      }

      const compressedFile = await imageCompression(file, options)
      const resultDataUrl = await imageCompression.getDataUrlFromFile(compressedFile)
      
      setResultImage(resultDataUrl)
      setResultSize(compressedFile.size)
    } catch (err) {
      setError("Compression failed, please try again")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultImage) return
    const link = document.createElement("a")
    link.download = "compressed.png"
    link.href = resultImage
    link.click()
  }

  const handleReset = () => {
    setOriginalImage(null)
    setOriginalSize(0)
    setResultImage(null)
    setResultSize(0)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const compressionRatio = originalSize && resultSize
    ? Math.round((1 - resultSize / originalSize) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Compressor
          </h1>
          <p className="text-gray-600">
            Reduce image file size without significant quality loss
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
            Supports PNG, JPG, WebP up to 10MB
          </p>
        </div>

        {/* Settings panel */}
        <div className="mt-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <Settings className="w-4 h-4" />
            Compression Settings
          </button>
          
          {showSettings && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max File Size (MB): {maxSizeMB}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={maxSizeMB}
                  onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Width/Height (px): {maxWidthOrHeight}
                </label>
                <input
                  type="range"
                  min="800"
                  max="4096"
                  step="100"
                  value={maxWidthOrHeight}
                  onChange={(e) => setMaxWidthOrHeight(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {(originalImage || resultImage) && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-center font-semibold text-gray-700 mb-3">Original</h3>
              <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {originalImage ? (
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-w-full max-h-64 object-contain"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center py-12">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    Waiting for upload...
                  </div>
                )}
              </div>
              {originalSize > 0 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  {formatSize(originalSize)}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-center font-semibold text-gray-700 mb-3">Compressed</h3>
              <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {resultImage ? (
                  <img
                    src={resultImage}
                    alt="Result"
                    className="max-w-full max-h-64 object-contain"
                  />
                ) : isProcessing ? (
                  <div className="text-indigo-600 flex flex-col items-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin mb-2" />
                    Processing...
                  </div>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center py-12">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    Waiting for compression...
                  </div>
                )}
              </div>
              {resultSize > 0 && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mt-2">
                    {formatSize(resultSize)}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    {compressionRatio}% smaller
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {resultImage ? (
            <>
              <Button
                onClick={handleCompress}
                disabled={isProcessing}
                className="flex-1 max-w-xs mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "↻ Compress Again"
                )}
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 max-w-xs mx-auto bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 w-5 h-5" />
                Download
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
              onClick={handleCompress}
              disabled={!originalImage || isProcessing}
              className="flex-1 max-w-xs mx-auto bg-indigo-600 hover:bg-indigo-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 w-5 h-5" />
                  Compress Image
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
