import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Folder, Calendar, User, ArrowLeft, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProjectForm from "@/components/ProjectForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

interface ProjectWithTasks extends Project {
  tasks: ProjectTask[];
  progress: number;
  color: string;
  team: string[];
}

const ProjectsSupabase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithTasks | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading projects: " + error.message);
    } else {
      // Parse stored JSON data for tasks, team, and color
      const projectsWithData = (data || []).map(p => ({
        ...p,
        tasks: [],
        progress: 0,
        color: "electric-blue",
        team: []
      })) as ProjectWithTasks[];
      setProjects(projectsWithData);
    }
    setLoading(false);
  };

  const toggleTask = async (projectId: string, taskId: string) => {
    // This is a simplified version - in production you'd want tasks in a separate table
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const completedTasks = updatedTasks.filter(task => task.completed).length;
    const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
    
    const updatedProject = { ...project, tasks: updatedTasks, progress };
    
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(updatedProject);
    }
    
    setProjects(prev =>
      prev.map(p => p.id === projectId ? updatedProject : p)
    );
  };

  const handleCreateProject = async (projectData: any) => {
    if (!user) return;
    
    if (editingProject) {
      // Update existing project
      const { error } = await supabase
        .from("projects")
        .update({
          title: projectData.name,
          description: projectData.description,
        })
        .eq("id", editingProject.id);

      if (error) {
        toast.error("Error updating project: " + error.message);
      } else {
        toast.success("Project updated successfully");
        await loadProjects();
        if (selectedProject?.id === editingProject.id) {
          setSelectedProject(null);
        }
      }
    } else {
      // Create new project
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: projectData.name,
          description: projectData.description,
        })
        .select()
        .single();

      if (error) {
        toast.error("Error creating project: " + error.message);
      } else {
        toast.success("Project created successfully");
        await loadProjects();
      }
    }
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      toast.error("Error deleting project: " + error.message);
    } else {
      toast.success("Project deleted successfully");
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      await loadProjects();
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleEditProject = (project: ProjectWithTasks) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (selectedProject) {
    return (
      <Layout>
        <div className="min-h-screen p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedProject(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{selectedProject.title}</h1>
                <p className="text-muted-foreground">{selectedProject.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditProject(selectedProject)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProjectToDelete(selectedProject.id);
                  setDeleteDialogOpen(true);
                }}
                className="hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center justify-between">
                Project Progress
                <span className="text-2xl font-bold">{selectedProject.progress}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={selectedProject.progress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {selectedProject.tasks.filter(t => t.completed).length} of {selectedProject.tasks.length} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Task List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedProject.tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tasks yet</p>
              ) : (
                selectedProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={() => toggleTask(selectedProject.id, task.id)}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </Button>
                    <span
                      className={`flex-1 ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">
              Manage your ongoing projects and track progress
            </p>
          </div>
          <Button className="shadow-glow-blue" onClick={() => setShowProjectForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="gradient-card shadow-card hover-lift cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: `hsl(var(--${project.color}))` }}
                    />
                    <CardTitle className="text-foreground">{project.title}</CardTitle>
                  </div>
                  <Folder className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      {showProjectForm && (
        <ProjectForm
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
          onSave={handleCreateProject}
          initialProject={editingProject}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </Layout>
  );
};

export default ProjectsSupabase;
