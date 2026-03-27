import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image_file") as File
    const backgroundColor = formData.get("background_color") as string || "transparent"
    const newBgUrl = formData.get("new_bg_url") as string

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      )
    }

    const apiKey = process.env.REMOVEBG_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Build request body for remove.bg
    const params: Record<string, string> = {
      image_file_b64: buffer.toString("base64"),
      size: "auto",
      format: "png",
    }

    // Add background color or new background URL
    if (newBgUrl) {
      params.new_bg_url = newBgUrl
    } else if (backgroundColor !== "transparent") {
      params.background_color = backgroundColor
    }

    // Call remove.bg API
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: new URLSearchParams(params),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Remove.bg API error:", errorText)
      return NextResponse.json(
        { success: false, error: "Failed to change background" },
        { status: 500 }
      )
    }

    // Convert response to base64
    const resultBuffer = await response.arrayBuffer()
    const resultBase64 = Buffer.from(resultBuffer).toString("base64")
    const dataUrl = `data:image/png;base64,${resultBase64}`

    return NextResponse.json({
      success: true,
      image: dataUrl,
    })
  } catch (error) {
    console.error("Change background error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
