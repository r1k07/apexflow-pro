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
    const colors = ["secondary", "muted", "accent"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Find a position that doesn't overlap with existing notes
    let position = { x: 50, y: 50 };
    let attempts = 0;
    while (attempts < 20) {
      const overlapping = notes.some(note => 
        Math.abs(note.position.x - position.x) < 120 && 
        Math.abs(note.position.y - position.y) < 80
      );
      if (!overlapping) break;
      position = { 
        x: Math.random() * 180 + 20, 
        y: Math.random() * 80 + 20 
      };
      attempts++;
    }
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: "New note...",
      color: randomColor,
      position,
      zIndex: highestZIndex + 1
    };

    setNotes(prev => [...prev, newNote]);
    setHighestZIndex(prev => prev + 1);
    setEditingNote(newNote.id);
    
    toast({
      title: "Note created",
      description: "Click to edit your new note",
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
    <Card className="gradient-card shadow-card relative overflow-hidden" style={{ minHeight: "280px" }}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-5 w-5" />
            Quick Notes
          </div>
          <Button size="sm" onClick={addNote} className="shadow-glow-blue">
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute cursor-move hover-lift transition-all duration-200 group"
            style={{
              left: `${note.position.x}px`,
              top: `${note.position.y}px`,
              zIndex: note.zIndex,
              transform: `rotate(${(parseInt(note.id) % 5) * 2 - 4}deg)`
            }}
            onClick={() => bringToFront(note.id)}
            onDragStart={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetX = e.clientX - rect.left;
              const offsetY = e.clientY - rect.top;
              e.dataTransfer.setData('text/plain', JSON.stringify({ id: note.id, offsetX, offsetY }));
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const data = JSON.parse(e.dataTransfer.getData('text/plain'));
              const rect = e.currentTarget.parentElement!.getBoundingClientRect();
              const x = e.clientX - rect.left - data.offsetX;
              const y = e.clientY - rect.top - data.offsetY;
              moveNote(data.id, { x: Math.max(0, Math.min(x, 250)), y: Math.max(0, Math.min(y, 120)) });
            }}
            draggable
          >
            <div
              className="w-40 h-24 p-3 rounded-lg shadow-card border border-border/30 relative bg-card/90 backdrop-blur-sm"
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-destructive hover:bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              >
                <X className="h-3 w-3 text-white" />
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
                  className="h-full resize-none border-none bg-transparent p-0 text-xs focus:ring-0"
                  autoFocus
                />
              ) : (
                <div 
                  className="h-full text-xs text-foreground cursor-text relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNote(note.id);
                  }}
                >
                  <p className="break-words line-clamp-3">{note.content}</p>
                  <Edit3 className="h-3 w-3 absolute bottom-1 right-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickNotes;