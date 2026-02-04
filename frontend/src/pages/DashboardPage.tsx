// pages/DashboardPage.tsx
import { useState, useRef } from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { ModelProvider } from "../three/context/ModelContext"
import ModelViewer from "../three/viewer/ModelViewer"

export default function DashboardPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const viewerRef = useRef<HTMLDivElement>(null)
  const modelViewerRef = useRef<any>(null)

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleZoomIn = () => {
    modelViewerRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    modelViewerRef.current?.zoomOut()
  }

  const handleRotateLeft = () => {
    modelViewerRef.current?.rotateLeft()
  }

  const handleRotateRight = () => {
    modelViewerRef.current?.rotateRight()
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
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Zoom Out"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Rotate Left"
                    onClick={handleRotateLeft}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Rotate Right"
                    onClick={handleRotateRight}
                  >
                    <RotateCw className="w-4 h-4" />
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
                <ModelViewer ref={modelViewerRef} />
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </ModelProvider>
  )
}