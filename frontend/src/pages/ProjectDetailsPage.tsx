import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { ModelProvider, useModel } from "../three/context/ModelContext";
import ModelViewer from "../three/viewer/ModelViewer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProjectCreateModal from "../components/ProjectCreateModal";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
} from "lucide-react";
import toast from "react-hot-toast";


interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface ModelViewerHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
}

function ProjectContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const { setModel } = useModel();
  const viewerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<ModelViewerHandle>(null);

  useEffect(() => {
    if (id) {
      loadProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/projects/${id}`);
      console.log("PROJECT DETAILS:", res.data);

      const projectData: Project = res.data.project;
      setProject(projectData);

      if (projectData.path) {
        const pathParts = projectData.path.split(".");
        const ext =
          pathParts.length > 1
            ? pathParts[pathParts.length - 1].toLowerCase()
            : "";
        if (ext) {
          setModel(projectData.path, ext);
        }
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      toast.error("Failed to load project");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await viewerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      toast.error("Fullscreen is not supported");
    }
  };

  const handleZoomIn = () => {
    modelViewerRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    modelViewerRef.current?.zoomOut();
  };

  const handleRotateLeft = () => {
    modelViewerRef.current?.rotateLeft();
  };

  const handleRotateRight = () => {
    modelViewerRef.current?.rotateRight();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <Navbar onCreateProject={() => setOpenModal(true)} />

      {/* Main Content - 3D Viewer */}
      <main className="relative flex-1 overflow-hidden  ">
        <Card
          ref={viewerRef}
          className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl h-full flex flex-col rounded-xl overflow-hidden"
        >
          {/* Viewer Header */}
          <div className="flex items-center justify-between  border-b border-gray-100 bg-white/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">3D Model Viewer</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 hover:bg-gray-100 rounded-lg"
                title="Zoom In"
                onClick={handleZoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 hover:bg-gray-100 rounded-lg"
                title="Zoom Out"
                onClick={handleZoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 hover:bg-gray-100 rounded-lg"
                title="Rotate Left"
                onClick={handleRotateLeft}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 hover:bg-gray-100 rounded-lg"
                title="Rotate Right"
                onClick={handleRotateRight}
              >
                <RotateCw className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-200 mx-2" />

              <Button
                className="h-9 px-4 bg-black hover:bg-gray-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                title="Fullscreen"
                onClick={handleFullscreen}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                <span>Fullscreen</span>
              </Button>
            </div>
          </div>

          {/* Viewer Content */}
          <div className="flex-1 relative overflow-hidden">
            <ModelViewer ref={modelViewerRef} />
          </div>
        </Card>
      </main>

      <Footer />

      {/* Project Create Modal */}
      <ProjectCreateModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
      />
    </div>
  );
}

export default function ProjectDetailsPage() {
  return (
    <ModelProvider>
      <ProjectContent />
    </ModelProvider>
  );
}