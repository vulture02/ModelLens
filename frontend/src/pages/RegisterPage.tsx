import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { User, Mail, Lock, Eye, EyeOff, X, Shield } from "lucide-react"
import api from "../lib/api"

export default function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url")

  // Password strength calculation
  const getPasswordStrength = () => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++
    return strength
  }

  const strength = getPasswordStrength()

  const getStrengthLabel = () => {
    if (password.length === 0) return { text: "", color: "bg-gray-200" }
    if (strength <= 2) return { text: "Weak", color: "bg-red-500" }
    if (strength <= 3) return { text: "Fair", color: "bg-yellow-500" }
    if (strength <= 4) return { text: "Good", color: "bg-blue-500" }
    return { text: "Strong", color: "bg-green-500" }
  }

  const strengthInfo = getStrengthLabel()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Frontend validation
    const newErrors: Record<string, string> = {}
    
    // Check if name is empty
    if (!name.trim()) {
      newErrors.name = "Please enter your name"
    }
    
    // Check if email is empty
    if (!email.trim()) {
      newErrors.email = "Please enter your email"
    }
    
    // Check if password is empty
    if (!password) {
      newErrors.password = "Please enter a password"
    }
    
    // If there are validation errors, show them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)

    try {
      await api.post("/api/register", {
        name,
        email,
        password,
      })
      const loginRes = await api.post("/api/login", {
        email,
        password,
      })
      localStorage.setItem("authToken", loginRes.data.token)
      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl))
      } else {
        navigate("/dashboard")
      }
    } catch (err: any) {
      const response = err?.response?.data
      const errorDetail = response?.detail

      if (Array.isArray(errorDetail)) {
        const newErrors: Record<string, string> = {}
        errorDetail.forEach((error: any) => {
          const field = error.loc?.[1]
          const message = error.msg || "Invalid input"
          if (field === "email" || field === "password" || field === "name") {
            newErrors[field] = message
          }
        })
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
        } else {
          setErrors({ email: "Validation failed" })
        }
      } else if (typeof errorDetail === "string") {
        if (errorDetail.toLowerCase().includes("email")) {
          setErrors({ email: errorDetail })
        } else if (errorDetail.toLowerCase().includes("password")) {
          setErrors({ password: errorDetail })
        } else {
          setErrors({ email: errorDetail })
        }
      } else {
        setErrors({ email: response?.message || "Registration failed" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <Card className="relative w-full max-w-md shadow-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {/* Updated Logo */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
            <Shield className="w-8 h-8 text-white relative z-10" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Account
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Start your journey with us today
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    // Clear error when user starts typing
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: "" }))
                    }
                  }}
                  className={`pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-gray-900 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    // Clear error when user starts typing
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: "" }))
                    }
                  }}
                  className={`pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-gray-900 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    // Clear error when user starts typing
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: "" }))
                    }
                  }}
                  className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-gray-900 ${
                    errors.password ? "border-red-500" : ""
                  }`}
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

              {/* Strength Bar + Requirement Message */}
              <div className="space-y-1.5">
                {/* Strength Bar - Always visible when typing */}
                {password.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            level <= strength ? strengthInfo.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        strength <= 2
                          ? "text-red-500"
                          : strength <= 3
                          ? "text-yellow-600"
                          : strength <= 4
                          ? "text-blue-500"
                          : "text-green-500"
                      }`}
                    >
                      {strengthInfo.text}
                    </span>
                  </div>
                )}

                {/* Requirement Message - Always visible */}
                <p className="text-xs text-gray-400">
                  Must be at least 8 characters with uppercase, lowercase, number & special character
                </p>
              </div>

              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl mt-6 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-gray-900 hover:text-black font-semibold hover:underline"
            >
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}