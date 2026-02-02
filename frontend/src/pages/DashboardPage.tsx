
import { useState } from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import { Box, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "../components/ui/button"

export default function DashboardPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar onFileUpload={setUploadedFile} uploadedFile={uploadedFile} />

        <main className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full min-h-[500px] flex flex-col">
            {/* Viewer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-medium text-gray-700">3D Viewer</h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 flex items-center justify-center p-8">
              {uploadedFile ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                    <Box className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{uploadedFile.name}</h3>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    3D Preview will render here
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Box className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-medium text-gray-600 mb-1">No Model Loaded</h3>
                  <p className="text-sm text-gray-400">
                    Upload a 3D file to preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}