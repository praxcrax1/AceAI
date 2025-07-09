"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Brain, ArrowRight, Mail, Lock, Eye, EyeOff, BookOpen, MessageSquare, Zap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-3 p-2 bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AceAI</h1>
                <p className="text-sm text-muted-foreground">AI Study Companion</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground leading-tight">
                Transform your
                <span className="block text-primary">study experience</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Upload PDFs, ask questions, and get instant AI-powered answers. Join thousands of students studying
                smarter with AceAI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: MessageSquare, title: "Chat with Documents", desc: "Ask questions and get instant answers" },
              { icon: BookOpen, title: "Smart Summaries", desc: "Generate key insights automatically" },
              { icon: Zap, title: "Lightning Fast", desc: "Get results in seconds, not hours" },
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Mobile Header */}
                <div className="lg:hidden text-center space-y-4">
                  <div className="inline-flex items-center space-x-2 p-2 bg-primary rounded-xl">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                    <span className="text-lg font-bold text-primary-foreground">AceAI</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                    <p className="text-muted-foreground">Sign in to your account</p>
                  </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
                  <p className="text-muted-foreground">Sign in to continue your learning journey</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10 h-12 focus:ring-2 focus:ring-ring focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-12 focus:ring-2 focus:ring-ring focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 font-medium shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                      Sign up for free
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}