import { Navigate } from "react-router-dom"
import type { JSX } from "react/jsx-runtime"

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn")
  return isLoggedIn ? children : <Navigate to="/register" replace />
}
