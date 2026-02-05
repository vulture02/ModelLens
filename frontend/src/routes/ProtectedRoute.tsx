import { Navigate,useLocation } from "react-router-dom"
import type { JSX } from "react/jsx-runtime"

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("authToken")
  const location=useLocation()


  if (!token) {

    const redirectUrl=encodeURIComponent(
      location.pathname + location.search
    )
    return (
      <Navigate
          to={`/login?redirect_url=${redirectUrl}`}
          replace
       />
    )
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
