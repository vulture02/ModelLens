import { Navigate } from "react-router-dom"
import type { JSX } from "react/jsx-runtime"

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("authToken")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  try {
    const payload = JSON.parse(atob(token))
    const currentTime = Date.now()

    if (payload.exp && currentTime > payload.exp) {
      // Token expired, clear it
      localStorage.removeItem("authToken")
      localStorage.removeItem("currentUser")
      return <Navigate to="/login" replace />
    }

    return children
  } catch {
    // Invalid token, clear it
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    return <Navigate to="/login" replace />
  }
}
