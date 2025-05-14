"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LogIn } from "lucide-react"

export function LoginButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    // Use the fixed credentials
    if (username === "admin@edc" && password === "tenure@2025") {
      setIsAdmin(true)
      setIsOpen(false)
      // Store admin status in localStorage for persistence
      localStorage.setItem("isAdmin", "true")
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new Event("adminStatusChanged"))
      toast({
        title: "Login successful",
        description: "You are now logged in as an admin.",
      })
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem("isAdmin")
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("adminStatusChanged"))
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
  }

  return (
    <>
      {isAdmin ? (
        <Button variant="outline" onClick={handleLogout}>
          Logout (Admin)
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <LogIn className="mr-2 h-4 w-4" />
          Admin Login
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>Enter the admin credentials to access management features.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Login</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
