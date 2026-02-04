import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}

    if (!email) errs.email = "Email is required"
    if (!password) errs.password = "Password is required"

    setErrors(errs)

    if (Object.keys(errs).length === 0) {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password)

      if (user) {
      // Generate dummy JWT-like token
      const token = btoa(JSON.stringify({
        userId: user.id,
        email: user.email,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }))

      console.log("Generated JWT Token:", token)
      console.log("Decoded Token Payload:", JSON.parse(atob(token)))

      localStorage.setItem("authToken", token)
      localStorage.setItem("currentUser", JSON.stringify(user))
        navigate("/dashboard")
      } else {
        setErrors({ general: "Invalid email or password" })
      }

      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
            <LogIn className="w-7 h-7 text-white" />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-800">
            Welcome Back
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-red-500 text-center">{errors.general}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <a href="/register" className="text-green-600 hover:underline font-medium">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
