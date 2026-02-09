import { Navigate, useLocation } from "react-router-dom"
import type { JSX } from "react/jsx-runtime"

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("authToken")
  const location = useLocation()
  console.log("ProtectedRoute token:", token)

  if (!token) {
    const redirectUrl = encodeURIComponent(
      location.pathname + location.search
    )

    return (
      <Navigate
        to={`/login?redirect_url=${redirectUrl}`}
        replace
      />
    )
  }

  return children
}
