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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const loadTasks = () => {
    try {
      const stored = localStorage.getItem('apexflow-tasks');
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        setTasks(parsed.map(t => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined })));
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
    }
  };

  const computeProgress = (completed: number, total: number) =>
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const loadProjects = () => {
    try {
      const stored = localStorage.getItem('apexflow-projects');
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        setProjects(parsed.map((p) => {
          const tasks = (p.tasks || []) as any[];
          const completed = tasks.filter((t: any) => t.completed).length;
          const progress = computeProgress(completed, tasks.length);
          return {
            ...p,
            dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
            progress,
          } as Project;
        }));
      } else {
        setProjects([]);
      }
    } catch {
      setProjects([]);
    }
  };

  useEffect(() => {
    loadTasks();
    loadProjects();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'apexflow-tasks') loadTasks();
      if (e.key === 'apexflow-projects') loadProjects();
    };
    const onTasksUpdated = () => loadTasks();
    const onProjectsUpdated = () => loadProjects();

    window.addEventListener('storage', onStorage);
    window.addEventListener('apexflow-tasks-updated', onTasksUpdated as EventListener);
    window.addEventListener('apexflow-projects-updated', onProjectsUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('apexflow-tasks-updated', onTasksUpdated as EventListener);
      window.removeEventListener('apexflow-projects-updated', onProjectsUpdated as EventListener);
    };
  }, []);

  const completionRate = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  const todayTasks = tasks.filter(t => !t.completed).length;

  const handleNewProject = () => {
    window.location.href = '/projects?new=1';
  };

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
            <Button size="sm" className="shadow-glow-blue hover-lift" onClick={handleNewProject}>
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
                    className={`w-3 h-3 rounded-full`}
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