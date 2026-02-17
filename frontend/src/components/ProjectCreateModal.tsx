import { useState, useRef } from "react";
import { X, Upload, FileBox, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectCreateModal({ isOpen, onClose }: Props) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!projectName.trim()) {
      newErrors.projectName = "Please enter a project name";
    }
    if (!file) {
      newErrors.file = "Please upload a model file";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("description", description);
      formData.append("file", file!);

      const uploadRes = await api.post("/api/models/upload", formData);

      console.log("UPLOAD RESPONSE:", uploadRes.data);

      const projectsRes = await api.get("/api/projects", {
        params: { page: 1, limit: 1 },
      });

      const latestProject = projectsRes.data.projects[0];

      toast.success(`"${projectName}" created successfully`);
      
      handleClose();
      navigate(`/project/${latestProject.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project");
      setErrors({ general: "Upload failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName("");
    setDescription("");
    setFile(null);
    setErrors({});
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm border-gray-200 shadow-2xl">
          <CardHeader className="relative pb-2">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center mb-3">
              <FileBox className="w-6 h-6 text-white" />
            </div>

            <CardTitle className="text-xl font-bold text-gray-900">
              Create New Project
            </CardTitle>
            <CardDescription className="text-gray-500">
              Upload your 3D model and start collaborating
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="My Awesome Project"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (errors.projectName) {
                      setErrors((prev) => ({ ...prev, projectName: "" }));
                    }
                  }}
                  className={`h-11 bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-gray-900 ${
                    errors.projectName ? "border-red-500" : ""
                  }`}
                />
                {errors.projectName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.projectName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  placeholder="Describe your project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] bg-gray-50 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-gray-900 resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  3D Model File <span className="text-red-500">*</span>
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                    dragActive
                      ? "border-gray-900 bg-gray-100"
                      : errors.file
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-400 bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                      if (errors.file) {
                        setErrors((prev) => ({ ...prev, file: "" }));
                      }
                    }}
                    className="hidden"
                    accept=".glb,.gltf,.obj,.fbx,.stl"
                  />

                  <div className="flex flex-col items-center text-center">
                    {file ? (
                      <>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                          <FileBox className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="mt-2 text-xs text-red-600 hover:underline"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          Drop your file here or{" "}
                          <span className="text-gray-900 underline">
                            browse
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports: GLB, GLTF, OBJ, FBX, STL
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {errors.file && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.file}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 text-center">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Create & Upload
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}