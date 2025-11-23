import { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";

type Note = Tables<"notes">;

const NotesSupabase = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    content: ""
  });

  useEffect(() => {
    if (!user) return;
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading notes: " + error.message);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSaveNote = async () => {
    if (!formData.content.trim() || !user) return;
    
    if (editingNote) {
      const { error } = await supabase
        .from("notes")
        .update({
          content: formData.content,
        })
        .eq("id", editingNote.id);

      if (error) {
        toast.error("Error updating note: " + error.message);
      } else {
        toast.success("Note updated successfully");
        await loadNotes();
      }
    } else {
      const { error } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          content: formData.content,
        });

      if (error) {
        toast.error("Error creating note: " + error.message);
      } else {
        toast.success("Note created successfully");
        await loadNotes();
      }
    }

    setFormData({ content: "" });
    setEditingNote(null);
    setIsDialogOpen(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      content: note.content || ""
    });
    setIsDialogOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      toast.error("Error deleting note: " + error.message);
    } else {
      toast.success("Note deleted successfully");
      await loadNotes();
    }
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

  return (
    <Layout>
      <div className="min-h-screen p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notes</h1>
            <p className="text-muted-foreground">
              {notes.length} notes saved
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="shadow-glow-blue"
                onClick={() => {
                  setEditingNote(null);
                  setFormData({ content: "" });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] gradient-card">
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note here..."
                    className="min-h-[200px] bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote}>
                    {editingNote ? "Update" : "Create"} Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="gradient-card shadow-card hover-lift transition-all duration-300 break-inside-avoid mb-6"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className="text-electric-blue bg-electric-blue/10 border-electric-blue/20"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Note
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditNote(note)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-6 mb-4 whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : 'recently'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card className="gradient-card shadow-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No notes found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Create your first note to get started"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default NotesSupabase;
