import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Event from "@/models/Event"
import mongoose from "mongoose"

function isValidObjectId(id: any) {
  return mongoose.Types.ObjectId.isValid(id)
}

export async function PUT(req, { params }) {
  await connectToDatabase()
  const { id } = params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }
  const data = await req.json()
  const updated = await Event.findByIdAndUpdate(id, data, { new: true })
  if (global._io) {
    global._io.emit("eventsUpdated") // <-- emit after update
  }
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  await connectToDatabase()
  const { id } = params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }
  await Event.findByIdAndDelete(id)
  if (global._io) {
    global._io.emit("eventsUpdated") // <-- emit after delete
  }
  return NextResponse.json({ success: true })
}