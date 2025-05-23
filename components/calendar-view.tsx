"use client"
import { io, Socket } from "socket.io-client"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../src/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { EventDialog } from "@/components/event-dialog"
import { EventDetails } from "@/components/event-details"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Event = {
  id: string
  title: string
  date: Date
  time: string
  description: string
}

function parseDate(date: any): Date {
  if (date instanceof Date) return date
  if (typeof date === "string" || typeof date === "number") {
    const parsed = new Date(date)
    if (!isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const { toast } = useToast()
  const auth = useContext(AuthContext)
  const isAdmin = !!(auth && auth.isAdmin)

  const convertToIST = (serverDate: any) => {
    const date = parseDate(serverDate)
    const offsetIST = 5.5 * 60 * 60 * 1000
    return new Date(date.getTime() + offsetIST)
  }

  useEffect(() => {
    let isMounted = true

    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events")
        if (!res.ok) throw new Error("Failed to fetch events")
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error("Invalid events data")
        if (isMounted) {
          setEvents(
            data.map((event: any) => ({
              ...event,
              id: event._id || event.id || "",
              date: convertToIST(event.date),
              title: event.title || "",
              time: event.time || "",
              description: event.description || "",
            }))
          )
        }
      } catch {
        if (isMounted) setEvents([])
      }
    }

    fetchEvents()

    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000")
    socket.on("eventsUpdated", fetchEvents)

    return () => {
      isMounted = false
      socket.disconnect()
    }
  }, [])

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleAddEvent = async (event: Omit<Event, "id">) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })
      if (!res.ok) throw new Error("Failed to add event")
      const newEvent = await res.json()
      setEvents((prev) => [
        ...prev,
        {
          ...newEvent,
          id: newEvent._id || newEvent.id || "",
          date: convertToIST(newEvent.date),
          title: newEvent.title || "",
          time: newEvent.time || "",
          description: newEvent.description || "",
        },
      ])
      toast({
        title: "Event added",
        description: `${event.title} has been added to the calendar.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to add event.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      const res = await fetch(`/api/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      })
      if (!res.ok) throw new Error("Failed to update event")
      const event = await res.json()
      setEvents((prev) =>
        prev.map((e) =>
          e.id === (event._id || event.id)
            ? {
                ...event,
                id: event._id || event.id || "",
                date: convertToIST(event.date),
                title: event.title || "",
                time: event.time || "",
                description: event.description || "",
              }
            : e
        )
      )
      toast({
        title: "Event updated",
        description: `${updatedEvent.title} has been updated.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update event.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete event")
      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setIsDetailsOpen(false)
      toast({
        title: "Event deleted",
        description: "The event has been removed from the calendar.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsDetailsOpen(false)
    setIsEventDialogOpen(true)
  }

  const handleDateClick = (date: Date) => {
    const targetIST = convertToIST(date)
    const eventsOnDate = events.filter((event) => {
      const eventIST = convertToIST(event.date)
      return (
        eventIST.getDate() === targetIST.getDate() &&
        eventIST.getMonth() === targetIST.getMonth() &&
        eventIST.getFullYear() === targetIST.getFullYear()
      )
    })

    if (eventsOnDate.length > 0) {
      setSelectedEvent(eventsOnDate[0])
      setIsDetailsOpen(true)
    } else if (isAdmin) {
      setEditingEvent({
        id: "",
        title: "",
        date: targetIST,
        time: "12:00",
        description: "",
      })
      setIsEventDialogOpen(true)
    }
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()

    // Total days in the month
    const daysInMonth = lastDay.getDate()

    // Calendar array
    const calendarDays = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day))
    }

    return calendarDays
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    if (!date) return []
    const targetIST = convertToIST(date)

    return events.filter(
      (event) =>
        event.date.getDate() === targetIST.getDate() &&
        event.date.getMonth() === targetIST.getMonth() &&
        event.date.getFullYear() === targetIST.getFullYear(),
    )
  }

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const calendarDays = generateCalendarDays()
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{formatMonthYear(currentDate)}</h2>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingEvent(null)
                setIsEventDialogOpen(true)
              }}
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Event
            </Button>
          )}
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {weekdays.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const eventsForDay = day ? getEventsForDate(day) : []
              const today = new Date()
              const isToday =
                day &&
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear()

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] border-b border-r p-2 last:border-r-0 md:min-h-[120px]",
                    day ? "cursor-pointer hover:bg-muted/50" : "bg-muted/20",
                  )}
                  onClick={() => day && handleDateClick(day)}
                >
                  {day && (
                    <>
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                          isToday && "bg-primary text-primary-foreground",
                        )}
                      >
                        {day.getDate()}
                      </div>
                      <div className="mt-1 space-y-1">
                        {eventsForDay.map((event, idx) => (
                          <div
                            key={event.id || `${event.title}-${event.time}-${idx}`}
                            className="rounded bg-primary/10 px-1 py-0.5 text-xs font-medium"
                          >
                            {event.title} • {event.time}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Dialog for adding/editing events */}
      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSave={(eventData) => {
          if (editingEvent && editingEvent.id) {
            handleUpdateEvent({ ...eventData, id: editingEvent.id })
          } else {
            handleAddEvent(eventData)
          }
        }}
        initialData={editingEvent}
      />

      {/* Event Details Dialog */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          isAdmin={isAdmin}
          onEdit={() => handleEditEvent(selectedEvent)}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
        />
      )}
    </div>
  )
}
