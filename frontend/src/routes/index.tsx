import { Routes, Route, Navigate } from "react-router-dom"
import MeshPOCPage from "../pages/MeshPOCPage"

import ProtectedRoute from "./ProtectedRoute"
import DashboardPage from "../pages/DashboardPage"
import RegisterPage from "../pages/RegisterPage"
import NotFoundPage from "../pages/NotFoundPage"
import LoginPage from "../pages/LoginPage"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage />} />

      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* NEW ROUTE */}
      <Route
        path="/mesh-poc"
        element={
          <ProtectedRoute>
            <MeshPOCPage />
          </ProtectedRoute>
        }
      />



      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
