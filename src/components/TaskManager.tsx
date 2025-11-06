import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Calendar, Flag, Plus, Search, Filter, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  project: string;
  dueDate?: Date;
  tags: string[];
  completedAt?: number;
}

const TaskManager = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design new dashboard layout",
      description: "Create wireframes and prototypes for the new dashboard",
      completed: false,
      priority: "high",
      project: "Website Redesign",
      dueDate: new Date("2024-01-15"),
      tags: ["design", "ui/ux"]
    },
    {
      id: "2",
      title: "Implement user authentication",
      description: "Set up secure login and registration system",
      completed: false,
      priority: "high",
      project: "Backend Development",
      dueDate: new Date("2024-01-20"),
      tags: ["backend", "security"]
    },
    {
      id: "3",
      title: "Write API documentation",
      description: "Document all endpoints and usage examples",
      completed: true,
      priority: "medium",
      project: "Documentation",
      tags: ["docs", "api"]
    },
    {
      id: "4",
      title: "Code review session",
      description: "Review pull requests from the team",
      completed: false,
      priority: "medium",
      project: "Code Quality",
      dueDate: new Date("2024-01-12"),
      tags: ["review", "teamwork"]
    },
    {
      id: "5",
      title: "Update package dependencies",
      description: "Ensure all packages are up to date and secure",
      completed: false,
      priority: "low",
      project: "Maintenance",
      tags: ["maintenance", "security"]
    }
  ]);

  // Load and persist tasks
  useEffect(() => {
    const stored = localStorage.getItem('apexflow-tasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any[];
        setTasks(parsed.map(t => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined })));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apexflow-tasks', JSON.stringify(tasks));
    // Notify other components (like Dashboard) to refresh
    window.dispatchEvent(new Event('apexflow-tasks-updated'));
  }, [tasks]);

  // Auto-delete completed tasks after 24 hours
  useEffect(() => {
    const checkExpiredTasks = () => {
      const now = Date.now();
      const updatedTasks = tasks.filter(task => {
        if (task.completed && task.completedAt) {
          const hoursElapsed = (now - task.completedAt) / (1000 * 60 * 60);
          return hoursElapsed < 24;
        }
        return true;
      });
      
      if (updatedTasks.length !== tasks.length) {
        setTasks(updatedTasks);
        toast({
          title: "Tasks auto-deleted",
          description: "Completed tasks older than 24 hours have been removed.",
        });
      }
    };

    // Check every hour
    const interval = setInterval(checkExpiredTasks, 1000 * 60 * 60);
    // Also check on mount
    checkExpiredTasks();

    return () => clearInterval(interval);
  }, [tasks, toast]);

  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
    project: "",
    dueDate: "",
    tags: ""
  });

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? Date.now() : undefined
          } 
        : task
    ));
  };

  const handleAddTask = () => {
    if (!formData.title.trim()) return;
    
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id
          ? {
              ...task,
              title: formData.title,
              description: formData.description || undefined,
              priority: formData.priority,
              project: formData.project || "General",
              dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
              tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
            }
          : task
      ));
      
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description || undefined,
        completed: false,
        priority: formData.priority,
        project: formData.project || "General",
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      };

      setTasks(prev => [newTask, ...prev]);
      
      toast({
        title: "Task created",
        description: "Your new task has been added successfully.",
      });
    }
    
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      project: "",
      dueDate: "",
      tags: ""
    });
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "Your task has been removed successfully.",
    });
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      project: task.project,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : "",
      tags: task.tags.join(", ")
    });
    setIsDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400 bg-red-400/10";
      case "medium": return "text-yellow-400 bg-yellow-400/10";
      case "low": return "text-green-400 bg-green-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getProjectColor = (project: string) => {
    const colors = [
      "electric-blue", "vibrant-orange", "cyan-bright", 
      "purple-accent", "green-success", "yellow-warning"
    ];
    const index = project.length % colors.length;
    return colors[index];
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "pending" && !task.completed) ||
      (filter === "completed" && task.completed);
    
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Manager</h1>
          <p className="text-muted-foreground">
            {tasks.filter(t => !t.completed).length} pending tasks
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTask(null);
            setFormData({
              title: "",
              description: "",
              priority: "medium",
              project: "",
              dueDate: "",
              tags: ""
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="shadow-glow-blue">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] gradient-card">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add task description..."
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as "high" | "medium" | "low" }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-secondary/50 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="Project name"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingTask(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, projects, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className={`gradient-card shadow-card hover-lift transition-all duration-300 ${
              task.completed ? "opacity-75" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 p-1 h-auto"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </Button>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-foreground ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTask(task)}
                        className="h-8 w-8 hover:bg-secondary/80"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTaskToDelete(task.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(task.priority)}
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="outline" className="text-cyan-bright bg-cyan-bright/10">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.dueDate.toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className={`text-sm text-muted-foreground ${
                      task.completed ? "line-through" : ""
                    }`}>
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        style={{
                          color: `hsl(var(--${getProjectColor(task.project)}))`,
                          backgroundColor: `hsl(var(--${getProjectColor(task.project)}) / 0.1)`,
                          borderColor: `hsl(var(--${getProjectColor(task.project)}) / 0.2)`
                        }}
                      >
                        {task.project}
                      </Badge>
                      {task.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs bg-secondary/50"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="gradient-card shadow-card">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tasks found
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Create your first task to get started"
              }
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskManager;
