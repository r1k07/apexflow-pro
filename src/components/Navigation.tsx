import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Settings, 
  Menu,
  X,
  Sparkles,
  Folder,
  Timer,
  Clock,
  Moon,
  Sun,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("AU");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const setFromSession = async (session: any) => {
      const user = session.user;
      setEmail(user.email ?? null);
      // Try to get profile display_name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();
      const name = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || null;
      setDisplayName(name);
      const nameForInitials = name || user.email || 'AU';
      const parts = nameForInitials.split(/[\s@._-]+/).filter(Boolean);
      const init = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
      setInitials(init || 'AU');
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      if (session?.user) {
        setTimeout(() => setFromSession(session), 0);
      } else {
        setDisplayName(null);
        setEmail(null);
        setInitials('AU');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      if (session?.user) setFromSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/projects", icon: Folder, label: "Projects" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/notes", icon: FileText, label: "Notes" },
    { to: "/timer", icon: Timer, label: "Timer" },
    { to: "/pomodoro", icon: Clock, label: "Pomodoro" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden shadow-card"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <nav className={cn(
        "fixed top-0 left-0 h-full w-64 gradient-card shadow-elevated z-40 transform transition-transform duration-300 ease-in-out",
        "md:translate-x-0 md:relative md:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-blue">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ApexFlow</h1>
              <p className="text-xs text-muted-foreground">Productivity Suite</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover-lift",
                  isActive(item.to)
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-glow-blue"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="space-y-2 pt-4 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 mr-3" /> : <Moon className="h-4 w-4 mr-3" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </Button>
            {authenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogIn className="h-4 w-4 mr-3" />
                <span>Sign Out</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/auth'}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogIn className="h-4 w-4 mr-3" />
                <span>Sign In</span>
              </Button>
            )}
          </div>

          {/* User Profile */}
          {authenticated && (
            <div className="pt-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;