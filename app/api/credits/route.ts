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
}

export async function GET(request: NextRequest, { env }: { env: Env }) {
  const userId = request.nextUrl.searchParams.get("userId")
  
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }
  
  try {
    const result = await env.DB.prepare(
      "SELECT credits FROM users WHERE id = ? OR email = ?"
    ).bind(userId, userId).first()
    
    return NextResponse.json({ 
      userId, 
      credits: result?.credits || 0 
    })
  } catch (error) {
    console.error("Credits GET error:", error)
    return NextResponse.json({ userId, credits: 0 })
  }
}

export async function POST(request: NextRequest, { env }: { env: Env }) {
  try {
    const { userId, amount, transactionId, action } = await request.json()
    
    if (!userId || amount === undefined) {
      return NextResponse.json({ error: "userId and amount required" }, { status: 400 })
    }
    
    // Use email as user identifier if we have it
    const userIdentifier = userId.includes('@') ? userId : userId
    
    if (action === "add") {
      // Try to find user, if not exist create one
      let user = await env.DB.prepare(
        "SELECT * FROM users WHERE id = ? OR email = ?"
      ).bind(userIdentifier, userIdentifier).first()
      
      if (!user) {
        // Create new user
        await env.DB.prepare(
          "INSERT INTO users (id, email, credits) VALUES (?, ?, 0)"
        ).bind(userIdentifier, userIdentifier).run()
        user = { id: userIdentifier, email: userIdentifier, credits: 0 }
      }
      
      // Add credits
      const newCredits = (user.credits || 0) + amount
      
      await env.DB.prepare(
        "UPDATE users SET credits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR email = ?"
      ).bind(newCredits, userIdentifier, userIdentifier).run()
      
      // Record in credits history
      const historyId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await env.DB.prepare(
        "INSERT INTO credits_history (id, user_id, amount, action, reason, transaction_id) VALUES (?, ?, ?, 'add', 'paypal_payment', ?)"
      ).bind(historyId, userIdentifier, amount, transactionId || null).run()
      
      // Record transaction if provided
      if (transactionId) {
        const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await env.DB.prepare(
          "INSERT INTO transactions (id, user_id, amount, type) VALUES (?, ?, ?, 'completed')"
        ).bind(txId, userIdentifier, amount, transactionId).run()
      }
      
      console.log(`Added ${amount} credits to user ${userIdentifier}. New balance: ${newCredits}`)
      return NextResponse.json({ 
        success: true, 
        userId: userIdentifier, 
        credits: newCredits,
        transactionId 
      })
      
    } else if (action === "deduct") {
      const user = await env.DB.prepare(
        "SELECT credits FROM users WHERE id = ? OR email = ?"
      ).bind(userIdentifier, userIdentifier).first()
      
      if (!user || user.credits < amount) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
      }
      
      const newCredits = user.credits - amount
      await env.DB.prepare(
        "UPDATE users SET credits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR email = ?"
      ).bind(newCredits, userIdentifier, userIdentifier).run()
      
      return NextResponse.json({ 
        success: true, 
        userId: userIdentifier, 
        credits: newCredits 
      })
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    
  } catch (error) {
    console.error("Credits error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
