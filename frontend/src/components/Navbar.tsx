import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, Shield, ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface NavbarProps {
  onCreateProject?: () => void;
}

export default function Navbar({ onCreateProject }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a project details page
  const isProjectPage = location.pathname.includes("/project/");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="flex-shrink-0 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 relative z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Meshmind</span>
        </Link>

        {/* Center Actions (only on project page) */}
        {isProjectPage && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="h-10 px-4 rounded-lg border-gray-200 hover:bg-gray-100 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>

            {onCreateProject && (
              <Button
                onClick={onCreateProject}
                className="h-10 px-4 bg-black hover:bg-gray-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </Button>
            )}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-10 px-4 rounded-lg border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
