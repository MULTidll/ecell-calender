"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Edit, Trash2 } from "lucide-react"

type Event = {
  id: string
  title: string
  date: Date
  time: string
  description: string
}

type EventDetailsProps = {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}

export function EventDetails({ event, open, onOpenChange, isAdmin, onEdit, onDelete }: EventDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Date</td>
                <td className="py-2">{format(event.date, "EEEE, MMMM d, yyyy")}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Time</td>
                <td className="py-2">{event.time}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Description</td>
                <td className="py-2">{event.description}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
