import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white">404</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-600 text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  )
}
