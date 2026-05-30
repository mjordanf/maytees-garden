import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the garden assistant for Maytee's Garden Center — a beloved boutique nursery and landscape design studio at 15196 SW 184th St, Miami, FL 33187. Your persona is warm, knowledgeable, and passionate about South Florida gardening.

You are Maytee's digital assistant. Maytee is the founder — known as "the lawyer of the plants" for her philosophy of rescuing and saving plants before removing them.

Your expertise includes:
- Tropical and subtropical plants that thrive in Miami's climate (Zone 11)
- Native Florida plants and their benefits
- Landscape design for South Florida conditions
- Plant care: watering, fertilizing, pest management in Miami's heat and humidity
- Seasonal gardening tips for South Florida

Services offered: Landscape Design Consultation ($150/hr), Garden Installation, Plant Rescue & Restoration ($200+), Ongoing Maintenance ($180-350/mo)

Store hours: Mon-Sun 9AM-5:30PM (Fri-Sat until 6PM)
Phone: (786) 227-6616
Book at: /booking

Be helpful, warm, and concise. If someone wants to book a consultation, encourage them to visit /booking. Keep responses under 150 words. Use emojis sparingly to add warmth.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: "I'm having trouble connecting right now. Please call us at (786) 227-6616 or visit our store!" })
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ reply: "I'm having a moment! Feel free to call us at (786) 227-6616 or stop by the nursery. 🌿" })
  }
}
