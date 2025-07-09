"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const userData = localStorage.getItem("user")
        if (userData && userData !== "undefined" && userData !== "null") {
          const parsedUser = JSON.parse(userData)
          if (parsedUser && typeof parsedUser === "object") {
            setUser(parsedUser)
          } else {
            // Clear invalid data
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        } else {
          // Clear invalid data
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Failed to parse user data:", error)
        // Clear corrupted data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    if (data.token) {
      localStorage.setItem("token", data.token)

      // Handle user object from API response
      let userData = data.user
      if (!userData) {
        // Create fallback user object if API doesn't return one
        userData = {
          id: Date.now().toString(),
          email: email,
        }
      }

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } else {
      throw new Error("No token received from server")
    }
  }

  const register = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    if (data.token) {
      localStorage.setItem("token", data.token)

      // Handle user object from API response
      let userData = data.user
      if (!userData) {
        // Create fallback user object if API doesn't return one
        userData = {
          id: Date.now().toString(),
          email: email,
        }
      }

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } else {
      throw new Error("No token received from server")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
