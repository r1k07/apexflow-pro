import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'month'>('month');

  // Load events from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('calendar-events');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEvents(parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date)
        })));
      } catch {
        // ignore parsing errors
      }
    } else {
      // Default events
      const defaultEvents = [
        {
          id: "1",
          title: "Team Meeting",
          description: "Weekly team sync",
          date: new Date()
        },
        {
          id: "2", 
          title: "Project Review",
          description: "Quarterly project review meeting",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        }
      ];
      setEvents(defaultEvents);
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!newEventTitle.trim()) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle.trim(),
      description: newEventDescription.trim() || undefined,
      date: selectedDate || new Date()
    };

    setEvents(prev => [...prev, event]);
    setNewEventTitle("");
    setNewEventDescription("");
    setIsDialogOpen(false);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your events and schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-secondary/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow-blue hover-lift">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="gradient-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Event title..."
                    className="mt-1 bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    placeholder="Event description..."
                    className="mt-1 bg-secondary/50 border-border resize-none"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={addEvent} 
                  className="w-full shadow-glow-blue hover-lift"
                  disabled={!newEventTitle.trim()}
                >
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'month' ? (
        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
                className="hover:bg-secondary/50 border-border hover-lift"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
                className="hover:bg-secondary/50 border-border hover-lift"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground border-b border-border/50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                return (
                  <div
                    key={index}
                    className={`p-3 min-h-[100px] rounded-lg border transition-all duration-200 cursor-pointer group hover-lift ${
                      isToday(day) 
                        ? "bg-primary/10 border-primary shadow-glow-blue" 
                        : isCurrentMonth
                        ? "bg-card/50 border-border hover:bg-secondary/30 hover:border-primary/30"
                        : "bg-muted/20 border-border/50 opacity-50"
                    } ${selectedDate && isSameDay(day, selectedDate) ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday(day) 
                        ? "text-primary" 
                        : isCurrentMonth 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    }`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <Badge
                          key={event.id}
                          variant="outline"
                          className="text-xs truncate block bg-electric-blue/10 text-electric-blue border-electric-blue/30 hover:bg-electric-blue/20 transition-colors"
                        >
                          {event.title}
                        </Badge>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground font-medium">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center justify-between">
              <span>Upcoming Events</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
                  className="hover:bg-secondary/50 border-border hover-lift"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
                  className="hover:bg-secondary/50 border-border hover-lift"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled</p>
                </div>
              ) : (
                events
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event) => (
                    <Card key={event.id} className="bg-secondary/30 border-border hover:bg-secondary/50 transition-colors hover-lift">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4 text-primary" />
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-electric-blue/10 text-electric-blue border-electric-blue/30">
                            {format(new Date(event.date), "MMM d")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Calendar;