import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { User, Mail, Lock, Eye, EyeOff, Check, X } from "lucide-react"
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
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  // Password validation checks
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  }

  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
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
      console.log("Full error:", err)
      console.log("Error response:", err?.response)
      console.log("Error response data:", err?.response?.data)

      const response = err?.response?.data
      const errorDetail = response?.detail

      // Handle validation errors (array format from Pydantic)
      if (Array.isArray(errorDetail)) {
        const newErrors: Record<string, string> = {}

        errorDetail.forEach((error: any) => {
          const field = error.loc?.[1] // Get field name from ["body", "password"]
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
      }
      // Handle object error format (like {success: false, message: "..."})
      else if (errorDetail && typeof errorDetail === "object") {
        const backendMessage =
          errorDetail.message ||
          errorDetail.msg ||
          response?.message ||
          "Registration failed"

        console.log("Extracted backend message:", backendMessage)

        // Decide where to show error based on content
        if (backendMessage.toLowerCase().includes("email")) {
          setErrors({ email: backendMessage })
        } else if (backendMessage.toLowerCase().includes("domain")) {
          setErrors({ email: backendMessage })
        } else if (backendMessage.toLowerCase().includes("password")) {
          setErrors({ password: backendMessage })
        } else if (backendMessage.toLowerCase().includes("name")) {
          setErrors({ name: backendMessage })
        } else {
          setErrors({ email: backendMessage })
        }
      }
      // Handle string error
      else if (typeof errorDetail === "string") {
        if (errorDetail.toLowerCase().includes("email")) {
          setErrors({ email: errorDetail })
        } else if (errorDetail.toLowerCase().includes("password")) {
          setErrors({ password: errorDetail })
        } else if (errorDetail.toLowerCase().includes("name")) {
          setErrors({ name: errorDetail })
        } else {
          setErrors({ email: errorDetail })
        }
      }
      // Fallback - check status text
      else {
        const statusCode = err?.response?.status
        if (statusCode === 422) {
          setErrors({ email: "Validation error. Please check your inputs." })
        } else if (statusCode === 400) {
          setErrors({ email: response?.message || "Registration failed" })
        } else {
          setErrors({ email: "Registration failed. Please try again." })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <User className="w-7 h-7 text-white" />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-800">
            Create Account
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Start your journey with us today
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
              {errors.name && (
                <div className="flex items-start gap-1 mt-1">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errors.name}</p>
                </div>
              )}
            </div>

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
                  className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <div className="flex items-start gap-1 mt-1">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errors.email}</p>
                </div>
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
                  onFocus={() => setShowPasswordRequirements(true)}
                  className={`pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
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

              {/* Password Requirements */}
              {showPasswordRequirements && password.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1.5">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Password must contain:
                  </p>
                  <PasswordRequirement
                    met={passwordChecks.minLength}
                    text="At least 8 characters"
                  />
                  <PasswordRequirement
                    met={passwordChecks.hasUppercase}
                    text="One uppercase letter"
                  />
                  <PasswordRequirement
                    met={passwordChecks.hasLowercase}
                    text="One lowercase letter"
                  />
                  <PasswordRequirement
                    met={passwordChecks.hasNumber}
                    text="One number"
                  />
                  <PasswordRequirement
                    met={passwordChecks.hasSpecial}
                    text="One special character (@$!%*?&)"
                  />
                </div>
              )}

              {errors.password && (
                <div className="flex items-start gap-1 mt-1">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span
        className={`text-xs ${
          met ? "text-green-700 font-medium" : "text-gray-600"
        }`}
      >
        {text}
      </span>
    </div>
  )
}