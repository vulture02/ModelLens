import { Shield } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="container px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Meshmind</span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500 px 5">
            <span>© {currentYear} Meshmind. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}