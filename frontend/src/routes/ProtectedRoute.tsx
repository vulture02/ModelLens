import { Navigate, useLocation } from "react-router-dom"
import type { JSX } from "react/jsx-runtime"

interface JwtPayload {
  exp?: number
  sub?: string
}

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("authToken")
  const location = useLocation()

  if (!token) {
    const redirectUrl = encodeURIComponent(
      location.pathname + location.search
    )
    return <Navigate to={`/login?redirect_url=${redirectUrl}`} replace />
  }

  try {
    const payloadBase64 = token.split(".")[1]
    if (!payloadBase64) throw new Error("Invalid token")

    const payload: JwtPayload = JSON.parse(atob(payloadBase64))
    const currentTime = Math.floor(Date.now() / 1000)

    if (payload.exp && currentTime > payload.exp) {
      localStorage.removeItem("authToken")
      localStorage.removeItem("currentUser")
      return <Navigate to="/login?expired=true" replace />
    }
  } catch {
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    return <Navigate to="/login" replace />
  }

  return children
}
