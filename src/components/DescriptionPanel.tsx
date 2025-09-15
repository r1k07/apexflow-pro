import { useState, useEffect } from "react";
import { Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DescriptionPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");

  // Load description from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('apexflow-description');
    if (saved) {
      setDescription(saved);
    } else {
      setDescription("Welcome to your personal workspace! 🚀\n\nThis is your description panel where you can add notes, thoughts, or reminders about your current projects and goals.\n\nClick the edit button to customize this space and make it your own.");
    }
  }, []);

  // Save description to localStorage
  const saveDescription = () => {
    localStorage.setItem('apexflow-description', description);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    const saved = localStorage.getItem('apexflow-description');
    if (saved) {
      setDescription(saved);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed left-4 top-20 z-40">
      <Card className={`gradient-card shadow-card transition-all duration-300 ease-in-out hover-lift ${
        isExpanded ? 'w-80' : 'w-12'
      }`}>
        {!isExpanded ? (
          <div 
            className="p-3 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <Edit3 className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </div>
        ) : (
          <>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Description</CardTitle>
              <div className="flex items-center space-x-1">
                {!isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsExpanded(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-green-success hover:bg-green-success/10"
                      onClick={saveDescription}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      onClick={cancelEdit}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {isEditing ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none bg-secondary/50 border-border text-sm"
                  rows={8}
                  placeholder="Add your description here..."
                />
              ) : (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {description}
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default DescriptionPanel;