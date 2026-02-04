import { useState, useRef } from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import { RotateCcw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { ModelProvider } from "../three/context/ModelContext"
import ModelViewer from "../three/viewer/ModelViewer"

export default function DashboardPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <ModelProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <div className="flex flex-1 flex-col md:flex-row">
          <Sidebar onFileUpload={setUploadedFile} uploadedFile={uploadedFile} />

          <main className="flex-1 p-6">
            <div
              ref={viewerRef}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full min-h-[500px] flex flex-col overflow-hidden"
            >
              {/* Viewer Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h2 className="font-medium text-gray-700">3D Viewer</h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Reset View"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Fullscreen"
                    onClick={handleFullscreen}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1">
                <ModelViewer />
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </ModelProvider>
  )
}