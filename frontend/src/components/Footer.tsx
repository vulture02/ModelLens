
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-3 px-6">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>© 2025 3D Viewer</span>
        <span className="flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> 
        </span>
      </div>
    </footer>
  )
}