import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
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

interface ProjectFormProps {
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'progress'>) => void;
  initialProject?: Project | null;
}

const ProjectForm = ({ onClose, onSave, initialProject }: ProjectFormProps) => {
  const [name, setName] = useState(initialProject?.name || "");
  const [description, setDescription] = useState(initialProject?.description || "");
  const [tasks, setTasks] = useState<Omit<ProjectTask, 'id' | 'completed'>[]>(
    initialProject?.tasks && initialProject.tasks.length > 0
      ? initialProject.tasks.map(t => ({ title: t.title }))
      : [{ title: "" }]
  );

  const addTask = () => {
    setTasks([...tasks, { title: "" }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, title: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { title };
    setTasks(newTasks);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    const projectTasks: ProjectTask[] = tasks
      .filter(task => task.title.trim())
      .map((task, index) => ({
        id: `task-${index + 1}`,
        title: task.title.trim(),
        completed: initialProject?.tasks[index]?.completed || false
      }));

    onSave({
      name: name.trim(),
      description: description.trim() || "Add a description...",
      color: initialProject?.color || "electric-blue",
      tasks: projectTasks,
      team: initialProject?.team || [],
      dueDate: initialProject?.dueDate
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl gradient-card shadow-elevated animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">
            {initialProject ? "Edit Project" : "Create New Project"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description..."
              className="bg-secondary/50 border-border resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Tasks</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={task.title}
                    onChange={(e) => updateTask(index, e.target.value)}
                    placeholder={`Task ${index + 1}...`}
                    className="bg-secondary/50 border-border flex-1"
                  />
                  {tasks.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={addTask}
              className="w-full border-dashed border-border hover:bg-secondary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="shadow-glow-blue"
            >
              {initialProject ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectForm;
