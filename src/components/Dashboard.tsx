import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle, Clock, Plus, Search, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressCircle } from "./ProgressCircle";
import { QuickActions } from "./QuickActions";
import QuickNotes from "./QuickNotes";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  project: string;
  dueDate?: Date;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  color: string;
  totalTasks: number;
  completedTasks: number;
}

const Dashboard = () => {
  const [userDisplayName, setUserDisplayName] = useState<string>('');
  const [tasks] = useState<Task[]>([
    { id: "1", title: "Design new landing page", completed: false, priority: "high", project: "Website Redesign" },
    { id: "2", title: "Review user feedback", completed: false, priority: "medium", project: "User Research" },
    { id: "3", title: "Update documentation", completed: true, priority: "low", project: "Development" },
    { id: "4", title: "Plan sprint meeting", completed: false, priority: "high", project: "Management" },
  ]);

  const [projects] = useState<Project[]>([
    { id: "1", name: "Website Redesign", progress: 75, color: "electric-blue", totalTasks: 12, completedTasks: 9 },
    { id: "2", name: "Mobile App", progress: 45, color: "vibrant-orange", totalTasks: 8, completedTasks: 4 },
    { id: "3", name: "User Research", progress: 90, color: "cyan-bright", totalTasks: 10, completedTasks: 9 },
  ]);

  const completionRate = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  const todayTasks = tasks.filter(t => !t.completed).length;

  useEffect(() => {
    const loadUserName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        const name = profile?.display_name || 
                     session.user.user_metadata?.display_name || 
                     session.user.email?.split('@')[0] || 
                     'User';
        setUserDisplayName(name);
      }
    };

    loadUserName();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Good morning{userDisplayName ? `, ${userDisplayName}` : ''}! 🌟
          </h1>
          <p className="text-muted-foreground">
            You have {todayTasks} tasks to complete today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="hover-lift" onClick={() => alert('Search functionality coming soon!')}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="hover-lift" onClick={() => window.location.href = '/settings'}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-electric-blue" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <ProgressCircle 
                progress={completionRate} 
                size={60} 
                strokeWidth={4}
                color="electric-blue"
              />
              <div>
                <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
            <Calendar className="h-4 w-4 text-vibrant-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{projects.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tasks
            </CardTitle>
            <Clock className="h-4 w-4 text-cyan-bright" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayTasks}</div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {tasks.filter(t => t.completed).length}
            </div>
            <p className="text-xs text-muted-foreground">Tasks done</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center justify-between">
            Active Projects
            <Button size="sm" className="shadow-glow-blue" onClick={() => alert('New Project dialog coming soon!')}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-3 h-3 rounded-full bg-${project.color}`}
                    style={{ backgroundColor: `hsl(var(--${project.color}))` }}
                  />
                  <span className="font-medium text-foreground">{project.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {project.completedTasks}/{project.totalTasks}
                </span>
              </div>
              <Progress 
                value={project.progress} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Notes */}
      <QuickNotes />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;