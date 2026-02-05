import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Number */}
        <h1 className="text-8xl font-bold text-gray-900 mb-4">
          404
        </h1>

        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Need help?</p>
          <div className="flex gap-4 justify-center text-sm">
            <Link to="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}