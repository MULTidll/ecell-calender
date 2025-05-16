"use client"

import { useContext, useState } from "react"
import { AuthContext } from "../src/context/AuthContext"
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
  const auth = useContext(AuthContext)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    if (!auth || !auth.login) {
      toast({
        title: "Auth Error",
        description: "Auth context not available.",
        variant: "destructive",
      })
      return
    }
    const success = await auth.login(username, password)
    if (success) {
      setIsOpen(false)
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

  const handleLogout = async () => {
    if (!auth || !auth.logout) {
      toast({
        title: "Auth Error",
        description: "Auth context not available.",
        variant: "destructive",
      })
      return
    }
    await auth.logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <LogIn className="mr-2 h-4 w-4" />
        Admin Login
      </Button>

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
              <Button type="button" variant="outline" onClick={handleLogout}>
                Logout (Admin)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
