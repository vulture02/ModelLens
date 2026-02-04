// components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { LogOut, Box } from "lucide-react"

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    navigate("/login")
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null")

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
      <Link to="/dashboard" className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Box className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-gray-800">ModelLens</span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome back, {currentUser?.name || "User"}!
        </span>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
