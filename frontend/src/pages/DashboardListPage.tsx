import { useEffect, useState } from "react";
import api from "../lib/api";
import ProjectCreateModal from "../components/ProjectCreateModal";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Trash2, Eye, ExternalLink, FolderOpen, Layers, Calendar, FileBox } from "lucide-react";
import toast from "react-hot-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  path?: string;
  config?: any;
}

export default function DashboardListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/api/projects");
      console.log("PROJECT LIST:", res.data);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch projects");
    }
  };

  const deleteProject = async (id: string, projectName: string) => {
    if (!confirm("Delete this project?")) return;

    try {
      await api.delete(`/api/projects/${id}`);
      toast.success(`"${projectName}" deleted successfully`);
       setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your 3D projects and models
            </p>
          </div>
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-black hover:bg-gray-800 text-white rounded-xl h-11 px-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {projects.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Models
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {projects.filter((p) => p.path).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileBox className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Nodes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {projects.reduce(
                      (acc, p) => acc + (p.config?.nodes?.length || 0),
                      0
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {
                      projects.filter((p) => {
                        const date = new Date(p.created_at);
                        const now = new Date();
                        return (
                          date.getMonth() === now.getMonth() &&
                          date.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Projects
          </h2>

          {projects.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 border-dashed shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500 text-center max-w-sm mb-6">
                  Get started by creating your first 3D project. Upload models and collaborate with your team.
                </p>
                <Button
                  onClick={() => setOpenModal(true)}
                  className="bg-black hover:bg-gray-800 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all hover:bg-white group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                        <FileBox className="w-5 h-5 text-white" />
                      </div>
                      {project.config?.nodes && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {project.config.nodes.length} nodes
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 mt-3 group-hover:text-gray-700 transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-gray-500 line-clamp-2">
                      {project.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    <Button
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg h-9"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>

                    {project.path && (
                      <Button
                        variant="outline"
                        asChild
                        className="h-9 rounded-lg border-gray-200 hover:bg-gray-100"
                      >
                        <a
                          href={project.path}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => deleteProject(project.id, project.name)}
                      className="h-9 rounded-lg border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Project Create Modal */}
      <ProjectCreateModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchProjects();
        }}
      />
    </div>
  );
}