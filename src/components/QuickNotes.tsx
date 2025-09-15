import { useState, useEffect } from "react";
import { StickyNote, Plus, X, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  zIndex: number;
}

const QuickNotes = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(1);

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('quick-notes');
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes);
      setNotes(parsed.notes || []);
      setHighestZIndex(parsed.highestZIndex || 1);
    } else {
      // Default notes
      const defaultNotes = [
        {
          id: "1",
          content: "Welcome to Quick Notes!",
          color: "secondary",
          position: { x: 20, y: 20 },
          zIndex: 1
        }
      ];
      setNotes(defaultNotes);
    }
  }, []);

  useEffect(() => {
    // Save notes to localStorage whenever they change
    localStorage.setItem('quick-notes', JSON.stringify({ notes, highestZIndex }));
  }, [notes, highestZIndex]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      color: "secondary",
      position: { x: 0, y: 0 },
      zIndex: highestZIndex + 1,
    };

    setNotes(prev => [...prev, newNote]);
    setHighestZIndex(prev => prev + 1);
    setEditingNote(newNote.id);

    toast({
      title: "Note created",
      description: "Start typing your note",
    });
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast({
      title: "Note deleted",
      description: "The note has been removed",
    });
  };

  const updateNote = (id: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, content } : note
    ));
  };

  const bringToFront = (id: string) => {
    const newZIndex = highestZIndex + 1;
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, zIndex: newZIndex } : note
    ));
    setHighestZIndex(newZIndex);
  };

  const moveNote = (id: string, position: { x: number; y: number }) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, position } : note
    ));
  };

  return (
    <Card className="shadow-card" style={{ minHeight: "280px" }}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-5 w-5" />
            Quick Notes
          </div>
          <Button size="sm" onClick={addNote}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((note) => (
            <div key={note.id} className="p-3 rounded-md border border-border bg-card">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  aria-label="Delete note"
                >
                  <X className="h-3 w-3" />
                </Button>

                {editingNote === note.id ? (
                  <Textarea
                    value={note.content}
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    onBlur={() => setEditingNote(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        setEditingNote(null);
                      }
                    }}
                    className="h-24 resize-none border-none bg-transparent p-0 text-sm focus:ring-0"
                    autoFocus
                  />
                ) : (
                  <div 
                    className="min-h-[96px] text-sm text-foreground cursor-text"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(note.id);
                    }}
                  >
                    <p className="break-words whitespace-pre-wrap">{note.content || "Tap to add a note"}</p>
                    <Edit3 className="h-3 w-3 absolute bottom-1 right-1 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickNotes;