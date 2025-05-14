import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Event from "@/models/Event"

export async function GET() {
  await connectToDatabase()
  const events = await Event.find({})
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  await connectToDatabase()
  const data = await req.json()
  const event = await Event.create(data)
  return NextResponse.json(event)
}