import mongoose from "mongoose"

const EventSchema = new mongoose.Schema({
  title: String,
  date: Date,
  time: String,
  description: String,
})

export default mongoose.models.Event || mongoose.model("Event", EventSchema)