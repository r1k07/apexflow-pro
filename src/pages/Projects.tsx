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

interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  color: string;
  tasks: ProjectTask[];
  dueDate?: Date;
  team: string[];
}

const Projects = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete overhaul of the company website with modern design",
      progress: 0,
      color: "electric-blue",
      team: ["John Doe", "Jane Smith", "Mike Johnson"],
      dueDate: new Date("2024-02-15"),
      tasks: [
        { id: "1", title: "Design new landing page", completed: true },
        { id: "2", title: "Create component library", completed: true },
        { id: "3", title: "Implement responsive design", completed: true },
        { id: "4", title: "Add dark mode support", completed: false },
        { id: "5", title: "Optimize for mobile", completed: false },
        { id: "6", title: "User testing", completed: false }
      ]
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Native mobile app for iOS and Android platforms",
      progress: 0,
      color: "vibrant-orange",
      team: ["Sarah Wilson", "Alex Chen"],
      dueDate: new Date("2024-03-30"),
      tasks: [
        { id: "1", title: "Setup React Native project", completed: true },
        { id: "2", title: "Design app navigation", completed: true },
        { id: "3", title: "Implement user authentication", completed: false },
        { id: "4", title: "Create main screens", completed: false },
        { id: "5", title: "Add push notifications", completed: false },
        { id: "6", title: "App store submission", completed: false }
      ]
    },
    {
      id: "3",
      name: "User Research Project",
      description: "Comprehensive study of user behavior and preferences",
      progress: 0,
      color: "cyan-bright",
      team: ["Emma Davis", "Tom Brown"],
      dueDate: new Date("2024-01-25"),
      tasks: [
        { id: "1", title: "Design survey questions", completed: true },
        { id: "2", title: "Recruit participants", completed: true },
        { id: "3", title: "Conduct interviews", completed: true },
        { id: "4", title: "Analyze survey data", completed: true },
        { id: "5", title: "Create user personas", completed: true },
        { id: "6", title: "Present findings", completed: false }
      ]
    }
  ].map((p) => ({
    ...p,
    progress: p.tasks.length ? Math.round((p.tasks.filter(t => t.completed).length / p.tasks.length) * 100) : 0
  })));

  // Load & persist projects
  useEffect(() => {
    const stored = localStorage.getItem('apexflow-projects');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any[];
        setProjects(parsed.map(p => {
          const tasks = (p.tasks || []).map((t: any) => ({ ...t }));
          const completed = tasks.filter((t: any) => t.completed).length;
          const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
          return {
            ...p,
            dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
            tasks,
            progress
          } as Project;
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apexflow-projects', JSON.stringify(projects));
    // Notify other parts of the app
    window.dispatchEvent(new Event('apexflow-projects-updated'));
  }, [projects]);
 
  const toggleTask = (projectId: string, taskId: string) => {
    setProjects(prev => {
      const updated = prev.map(project => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          const completedTasks = updatedTasks.filter(task => task.completed).length;
          const progress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
          const updatedProject = { ...project, tasks: updatedTasks, progress };
          
          // Update selected project immediately if it's the one being modified
          if (selectedProject && selectedProject.id === projectId) {
            setSelectedProject(updatedProject);
          }
          
          return updatedProject;
        }
        return project;
      });
      
      // Persist to localStorage immediately
      localStorage.setItem('apexflow-projects', JSON.stringify(updated));
      window.dispatchEvent(new Event('apexflow-projects-updated'));
      
      return updated;
    });
  };

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'progress'>) => {
    if (editingProject) {
      // Update existing project
      const updatedProjects = projects.map(p =>
        p.id === editingProject.id
          ? { ...projectData, id: p.id, progress: p.progress }
          : p
      );
      setProjects(updatedProjects);
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject({ ...projectData, id: editingProject.id, progress: editingProject.progress });
      }
      toast.success("Project updated successfully");
    } else {
      // Create new project
      const newProject: Project = {
        id: Date.now().toString(),
        ...projectData,
        progress: 0,
      };
      setProjects(prev => [...prev, newProject]);
      setSelectedProject(newProject);
      toast.success("Project created successfully");
    }
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
    toast.success("Project deleted successfully");
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      setShowProjectForm(true);
      params.delete('new');
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

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
                <h1 className="text-3xl font-bold text-foreground">{selectedProject.name}</h1>
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
              <Badge variant="outline" className="text-cyan-bright bg-cyan-bright/10">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedProject.dueDate?.toLocaleDateString()}
              </Badge>
              <Badge variant="outline" className="text-green-success bg-green-success/10">
                <User className="h-3 w-3 mr-1" />
                {selectedProject.team.length} members
              </Badge>
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
              {selectedProject.tasks.map((task) => (
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
              ))}
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
                    <CardTitle className="text-foreground">{project.name}</CardTitle>
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
                  <span>{project.team.length} members</span>
                </div>

                {project.dueDate && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due {project.dueDate.toLocaleDateString()}
                  </Badge>
                )}
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

export default Projects;
