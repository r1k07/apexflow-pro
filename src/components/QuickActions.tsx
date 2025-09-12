import { Calendar, CheckSquare, FileText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
  const navigate = useNavigate();
  const quickActions = [
    {
      title: "Add Task",
      description: "Create a new task",
      icon: CheckSquare,
      color: "electric-blue",
      action: () => navigate("/tasks")
    },
    {
      title: "New Note",
      description: "Quick note taking",
      icon: FileText,
      color: "vibrant-orange",
      action: () => navigate("/notes")
    },
    {
      title: "Schedule Event",
      description: "Add to calendar",
      icon: Calendar,
      color: "cyan-bright",
      action: () => navigate("/calendar")
    },
    {
      title: "Create Project",
      description: "Start new project",
      icon: Sparkles,
      color: "purple-accent",
      action: () => navigate("/projects")
    }
  ];

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover-lift transition-all duration-300 border-border/50 hover:border-primary/50"
              onClick={action.action}
              style={{
                background: `linear-gradient(135deg, hsl(var(--${action.color}) / 0.1) 0%, transparent 100%)`
              }}
            >
              <action.icon 
                className="h-6 w-6" 
                style={{ color: `hsl(var(--${action.color}))` }}
              />
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">
                  {action.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};