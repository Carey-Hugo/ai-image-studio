import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPAI_API_KEY || "quickstart-udNWfk0Lv1UHLHDkN4rEWYWi"

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Call DeepAI ESRGAN API
    const form = new FormData()
    form.append("image", new Blob([buffer], { type: imageFile.type }), imageFile.name)

    const response = await fetch("https://api.deepai.org/api/esrgan", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
      },
      body: form,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("DeepAI API error:", errorText)
      return NextResponse.json(
        { success: false, error: "Failed to upscale image" },
        { status: 500 }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      image: result.output_url,
    })
  } catch (error) {
    console.error("Upscale error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
