import { NextRequest, NextResponse } from "next/server"

// D1 Database binding type
interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface D1PreparedStatement {
  bind(...params: any[]): D1PreparedStatement
  first(): Promise<any>
  run(): Promise<D1Result>
}

interface D1Result {
  success: boolean
  error?: string
}

interface Env {
  DB: D1Database
  PAYPAL_WEBHOOK_ID?: string
  PAYPAL_API_URL?: string
  PAYPAL_CLIENT_ID?: string
  PAYPAL_CLIENT_SECRET?: string
}

// PayPal Webhook verification
async function verifyPayPalWebhook(
  headers: Record<string, string | null>,
  body: string,
  webhookId: string,
  env: Env
): Promise<boolean> {
  const paypalApiUrl = env.PAYPAL_API_URL || "https://api-m.paypal.com"
  
  const verifyPayload = {
    auth_algo: headers["paypal-auth-algo"],
    cert_url: headers["paypal-cert-url"],
    transmission_id: headers["paypal-transmission-id"],
    transmission_sig: headers["paypal-transmission-sig"],
    transmission_time: headers["paypal-transmission-time"],
    webhook_id: webhookId,
    webhook_event: JSON.parse(body),
  }

  try {
    // Get access token
    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    })
    
    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    
    if (!accessToken) {
      console.error("Failed to get PayPal access token")
      return false
    }

    // Verify webhook signature
    const response = await fetch(`${paypalApiUrl}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verifyPayload),
    })

    const result = await response.json()
    return result.verification_status === "SUCCESS"
  } catch (error) {
    console.error("PayPal webhook verification error:", error)
    return false
  }
}

// Handle PAYMENT.CAPTURE.COMPLETED event
async function handlePaymentCaptureCompleted(event: any, env: Env) {
  const resource = event.resource
  
  // Extract order details from the payment
  const orderId = event.resource.supplementary_data?.related_ids?.order_id
  const customId = resource.custom_id // User identifier passed during order creation
  const amount = parseFloat(resource.amount?.value) || 0
  const currency = resource.amount?.currency_code || 'USD'
  const transactionId = resource.id
  
  console.log("Payment completed:", {
    orderId,
    customId,
    amount,
    currency,
    transactionId,
  })

  if (!customId || customId === 'anonymous') {
    console.error("No user identifier in payment, cannot credit")
    return { success: false, error: "No custom_id" }
  }

  // Convert payment to credits (configurable rate)
  // For now: $1 = 1 credit
  const creditsToAdd = Math.floor(amount) 
  
  if (creditsToAdd <= 0) {
    console.error("Invalid amount for credits:", amount)
    return { success: false, error: "Invalid amount" }
  }

  // Use D1 directly to add credits
  try {
    // Find or create user
    let user = await env.DB.prepare(
      "SELECT * FROM users WHERE id = ? OR email = ?"
    ).bind(customId, customId).first()
    
    if (!user) {
      // Create new user
      await env.DB.prepare(
        "INSERT INTO users (id, email, credits) VALUES (?, ?, 0)"
      ).bind(customId, customId).run()
      user = { id: customId, email: customId, credits: 0 }
    }
    
    // Add credits
    const newCredits = (user.credits || 0) + creditsToAdd
    
    await env.DB.prepare(
      "UPDATE users SET credits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR email = ?"
    ).bind(newCredits, customId, customId).run()
    
    // Record in credits history
    const historyId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await env.DB.prepare(
      "INSERT INTO credits_history (id, user_id, amount, action, reason, transaction_id) VALUES (?, ?, ?, 'add', 'paypal_payment', ?)"
    ).bind(historyId, customId, creditsToAdd, transactionId).run()
    
    // Record transaction
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await env.DB.prepare(
      "INSERT INTO transactions (id, user_id, amount, paypal_capture_id, status) VALUES (?, ?, ?, ?, 'completed')"
    ).bind(txId, customId, amount, transactionId).run()
    
    console.log(`Added ${creditsToAdd} credits to user ${customId}. New balance: ${newCredits}`)
    return { success: true, creditsAdded: creditsToAdd, newBalance: newCredits }
    
  } catch (error) {
    console.error("Failed to add credits:", error)
    return { success: false, error: "Failed to add credits" }
  }
}

export async function POST(request: NextRequest, { env }: { env: Env }) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const headers: Record<string, string | null> = {
      "paypal-auth-algo": request.headers.get("paypal-auth-algo"),
      "paypal-cert-url": request.headers.get("paypal-cert-url"),
      "paypal-transmission-id": request.headers.get("paypal-transmission-id"),
      "paypal-transmission-sig": request.headers.get("paypal-transmission-sig"),
      "paypal-transmission-time": request.headers.get("paypal-transmission-time"),
    }

    // Verify webhook signature in production
    const webhookId = env.PAYPAL_WEBHOOK_ID
    if (webhookId) {
      const isValid = await verifyPayPalWebhook(headers, body, webhookId, env)
      if (!isValid) {
        console.error("Invalid PayPal webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Parse the event
    const event = JSON.parse(body)
    const eventType = event.event_type

    console.log(`Received PayPal webhook: ${eventType}`)

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(event, env)
        break
      
      case "PAYMENT.CAPTURE.DENIED":
        console.log("Payment denied:", event.resource?.id)
        break

      case "CHECKOUT.ORDER.APPROVED":
        console.log("Order approved:", event.resource?.id)
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("PayPal webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
