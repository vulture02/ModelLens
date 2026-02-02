
import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"

interface SidebarProps {
  onFileUpload: (file: File | null) => void
  uploadedFile: File | null
}

export default function Sidebar({ onFileUpload, uploadedFile }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    // Check file type
    const validTypes = [".obj", ".glb", ".gltf", ".fbx", ".stl"]
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    
    if (validTypes.includes(fileExt)) {
      onFileUpload(file)
      setUploadStatus("success")
    } else {
      setUploadStatus("error")
      setTimeout(() => setUploadStatus("idle"), 3000)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const removeFile = () => {
    onFileUpload(null)
    setUploadStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <aside className="w-full md:w-72 bg-white border-r border-gray-100 p-4">
      <h2 className="font-semibold text-gray-800 mb-4">Upload Model</h2>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300 bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".obj,.glb,.gltf,.fbx,.stl"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Upload className={`w-6 h-6 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
        </div>

        <p className="text-sm text-gray-600 mb-1">
          Drag & drop your file here
        </p>
        <p className="text-xs text-gray-400 mb-3">or</p>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          Browse Files
        </Button>

        <p className="text-xs text-gray-400 mt-3">
          Supported: OBJ, GLB, GLTF, FBX, STL
        </p>
      </div>

      {/* Status Messages */}
      {uploadStatus === "error" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Invalid file format</span>
        </div>
      )}

      {/* Uploaded File */}
      {uploadedFile && uploadStatus === "success" && (
        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Uploaded</span>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <File className="w-4 h-4 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">{uploadedFile.name}</p>
              <p className="text-xs text-gray-400">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Tips</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Max file size: 50MB</li>
          <li>• Use GLB for best performance</li>
          <li>• Optimize textures before upload</li>
        </ul>
      </div>
    </aside>
  )
}