import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: "meeting" | "task" | "reminder" | "event";
  color: string;
}

const Calendar = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "meeting" as CalendarEvent["type"]
  });

  useEffect(() => {
    // Load events from localStorage
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setEvents(parsed.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end)
      })));
    } else {
      // Default events
      const defaultEvents = [
        {
          id: "1",
          title: "Team Standup",
          description: "Daily team sync meeting",
          start: new Date(2024, 0, 9, 9, 0),
          end: new Date(2024, 0, 9, 9, 30),
          type: "meeting" as const,
          color: "electric-blue"
        },
        {
          id: "2",
          title: "Design Review",
          description: "Review new dashboard designs",
          start: new Date(2024, 0, 9, 14, 0),
          end: new Date(2024, 0, 9, 15, 30),
          type: "meeting" as const,
          color: "vibrant-orange"
        }
      ];
      setEvents(defaultEvents);
    }
  }, []);

  useEffect(() => {
    // Save events to localStorage whenever they change
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime) {
      toast({
        title: "Missing information",
        description: "Please fill in title, date, and start time.",
        variant: "destructive"
      });
      return;
    }

    const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const endDateTime = newEvent.endTime 
      ? new Date(`${newEvent.date}T${newEvent.endTime}`)
      : new Date(startDateTime.getTime() + 30 * 60 * 1000); // Default 30 min

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      start: startDateTime,
      end: endDateTime,
      type: newEvent.type,
      color: getColorForType(newEvent.type)
    };

    setEvents(prev => [...prev, event]);
    setNewEvent({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "meeting"
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Event created",
      description: "Your new event has been added to the calendar.",
    });
  };

  const getColorForType = (type: CalendarEvent["type"]) => {
    const colors = {
      meeting: "electric-blue",
      task: "cyan-bright",
      reminder: "yellow-warning",
      event: "vibrant-orange"
    };
    return colors[type];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      event.start.toDateString() === date.toDateString()
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(new Date(2024, 0, 9, hour, 0));
    }
    return slots;
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const timeSlots = generateTimeSlots();
  const todayEvents = getEventsForDay(currentDate);

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">{formatDate(currentDate)}</p>
        </div>
        <Button className="shadow-glow-blue" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Navigation and View Controls */}
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground">
                {currentDate.toLocaleDateString([], { 
                  month: 'long', 
                  year: 'numeric',
                  day: view === "day" ? 'numeric' : undefined
                })}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {["day", "week", "month"].map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView(viewType as any)}
                  className="capitalize"
                >
                  {viewType}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline View */}
        <div className="lg:col-span-2">
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Daily Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                {timeSlots.map((slot, index) => {
                  const slotEvents = events.filter(event => 
                    event.start.getHours() === slot.getHours() &&
                    event.start.toDateString() === currentDate.toDateString()
                  );

                  return (
                    <div key={index} className="flex items-start border-b border-border/30 pb-4 mb-4 last:border-b-0">
                      <div className="w-20 text-sm text-muted-foreground font-medium">
                        {formatTime(slot)}
                      </div>
                      <div className="flex-1 ml-4 space-y-2">
                        {slotEvents.length > 0 ? (
                          slotEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-3 rounded-lg hover-lift cursor-pointer transition-all duration-300"
                              style={{
                                background: `linear-gradient(135deg, hsl(var(--${event.color}) / 0.2) 0%, hsl(var(--${event.color}) / 0.05) 100%)`,
                                border: `1px solid hsl(var(--${event.color}) / 0.3)`
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground">{event.title}</h4>
                                <Badge 
                                  variant="outline"
                                  className="capitalize"
                                  style={{
                                    color: `hsl(var(--${event.color}))`,
                                    backgroundColor: `hsl(var(--${event.color}) / 0.1)`,
                                    borderColor: `hsl(var(--${event.color}) / 0.2)`
                                  }}
                                >
                                  {event.type}
                                </Badge>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="h-8 flex items-center text-muted-foreground/50 text-sm">
                            No events scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Summary */}
        <div className="space-y-6">
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Today's Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="p-4 rounded-lg border border-border/50 hover-lift cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--${event.color}) / 0.1) 0%, transparent 100%)`
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(var(--${event.color}))` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No events today</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Events</span>
                <span className="font-semibold text-foreground">{events.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Today</span>
                <span className="font-semibold text-foreground">{todayEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-semibold text-foreground">
                  {events.filter(e => {
                    const weekStart = new Date(currentDate);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return e.start >= weekStart && e.start <= weekEnd;
                  }).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
              />
            </div>
            
            <div>
              <Label htmlFor="event-description">Description (optional)</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="event-type">Type</Label>
                <Select value={newEvent.type} onValueChange={(value: CalendarEvent["type"]) => 
                  setNewEvent(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="end-time">End Time (optional)</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;