import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useModel, type ModelType } from "../three/context/ModelContext";
import api from "../lib/api";

interface SidebarProps {
  onFileUpload: (file: File | null) => void;
  uploadedFile: File | null;
}

export default function Sidebar({ onFileUpload, uploadedFile }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] =
    useState<"idle" | "uploading" | "success" | "error">("idle");

  const { setModel, clearModel } = useModel();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validTypes = ["obj", "glb", "gltf", "fbx", "stl"];

    if (!ext || !validTypes.includes(ext)) {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
      return;
    }

    try {
      // Set uploading status to disable UI
      setUploadStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/models/upload", formData);

      // ✅ Backend confirmation
      console.log("Upload success:", response.data.success);
      console.log("Backend Model ID:", response.data.modelId);
      console.log("Uploaded file name:", file.name);

      // persist last model
      localStorage.setItem("lastModelId", response.data.modelId);
      localStorage.setItem("lastModelExt", ext);

      onFileUpload(file);

      // local preview (temporary)
      const url = URL.createObjectURL(file);
      setModel(url, ext as ModelType);

      setUploadStatus("success");
    } catch (error) {
      console.error("Backend upload failed:", error);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Don't allow drag if uploading
    if (uploadStatus !== "uploading") {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Don't allow drop if uploading
    if (uploadStatus === "uploading") return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const removeFile = () => {
    onFileUpload(null);
    clearModel();
    setUploadStatus("idle");
    localStorage.removeItem("lastModelId");
    localStorage.removeItem("lastModelExt");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploading = uploadStatus === "uploading";
  const isDisabled = isUploading || uploadStatus === "success";

  return (
    <aside className="w-full md:w-72 bg-white border-r border-gray-100 p-4">
      <h2 className="font-semibold text-gray-800 mb-4">Upload Model</h2>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDisabled
            ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
            : isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".obj,.glb,.gltf,.fbx,.stl"
          onChange={handleFileChange}
          disabled={isDisabled}
          className="hidden"
        />

        {isUploading ? (
          <Loader2 className="w-10 h-10 mx-auto mb-3 text-blue-500 animate-spin" />
        ) : (
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
        )}

        <p className="text-sm text-gray-600 mb-2">
          {isUploading ? "Uploading and processing..." : "Drag & drop your file here"}
        </p>

        {!isUploading && <p className="text-xs text-gray-400 mb-4">or</p>}

        <Button
          onClick={() => !isDisabled && fileInputRef.current?.click()}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-md ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          }`}
        >
          {isUploading ? "Processing..." : "Browse Files"}
        </Button>

        {!isUploading && (
          <p className="text-xs text-gray-400 mt-4">
            Supported: OBJ, GLB, GLTF, FBX, STL
          </p>
        )}
      </div>

      {/* Uploading Progress */}
      {isUploading && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700 font-medium">
              Uploading to server...
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Please wait while we process your 3D model
          </p>
        </div>
      )}

      {/* Error */}
      {uploadStatus === "error" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Invalid file format or upload failed</span>
        </div>
      )}

      {/* Success */}
      {uploadedFile && uploadStatus === "success" && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Uploaded
              </span>
            </div>
            <button onClick={removeFile} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-700 truncate mt-2">
            {uploadedFile.name}
          </p>
        </div>
      )}
    </aside>
  );
}