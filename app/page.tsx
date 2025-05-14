import type React from "react"
import type { Metadata } from "next"
import { CalendarView } from "@/components/calendar-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginButton } from "@/components/login-button"

export const metadata: Metadata = {
  title: "E-Cell Calendar",
  description: "Event calendar for E-Cell club members",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            <h1 className="text-xl font-bold">E-Cell Calendar</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LoginButton />
          </div>
        </div>
      </header>
      <main className="container px-4 py-6 md:px-6 md:py-10">
        <CalendarView />
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} E-Cell. All rights reserved.
          </p>
          <p className="text-center text-sm">
            Made with <span className="text-blue-500">💙</span> WEB & TECH
          </p>
          <p className="text-center text-sm text-muted-foreground md:text-right">
            EDC - Building Future Leaders
          </p>
        </div>
      </footer>
    </div>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
