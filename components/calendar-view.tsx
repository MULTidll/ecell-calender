"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { EventDialog } from "@/components/event-dialog"
import { EventDetails } from "@/components/event-details"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Mock data for initial events
const initialEvents = [
  {
    id: "1",
    title: "Startup Workshop",
    date: new Date(2025, 4, 20),
    time: "14:00",
    description: "Learn how to build your startup from scratch.",
  },
  {
    id: "2",
    title: "Pitch Competition",
    date: new Date(2025, 4, 25),
    time: "16:00",
    description: "Present your business idea and win prizes.",
  },
]

type Event = {
  id: string
  title: string
  date: Date
  time: string
  description: string
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isAdmin, setIsAdmin] = useState(false) // In a real app, this would come from auth
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const { toast } = useToast()

  // Check if user is admin
  useEffect(() => {
    // Check localStorage for admin status
    const adminStatus = localStorage.getItem("isAdmin") === "true"
    setIsAdmin(adminStatus)

    // Add event listener to detect changes in localStorage
    const handleStorageChange = () => {
      setIsAdmin(localStorage.getItem("isAdmin") === "true")
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for a custom event that we'll dispatch from login-button.tsx
    window.addEventListener("adminStatusChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("adminStatusChanged", handleStorageChange)
    }
  }, [])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleAddEvent = (event: Omit<Event, "id">) => {
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substring(2, 9),
    }
    setEvents([...events, newEvent])
    toast({
      title: "Event added",
      description: `${event.title} has been added to the calendar.`,
    })
  }

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
    toast({
      title: "Event updated",
      description: `${updatedEvent.title} has been updated.`,
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
    setIsDetailsOpen(false)
    toast({
      title: "Event deleted",
      description: "The event has been removed from the calendar.",
    })
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsDetailsOpen(false)
    setIsEventDialogOpen(true)
  }

  const handleDateClick = (date: Date) => {
    const eventsOnDate = events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )

    if (eventsOnDate.length > 0) {
      // Show the first event on this date
      setSelectedEvent(eventsOnDate[0])
      setIsDetailsOpen(true)
    } else if (isAdmin) {
      // If admin and no events, open dialog to add new event
      setEditingEvent({
        id: "",
        title: "",
        date: date,
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

    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
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
              const isToday =
                day &&
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear()

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
                        {eventsForDay.map((event) => (
                          <div key={event.id} className="rounded bg-primary/10 px-1 py-0.5 text-xs font-medium">
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
