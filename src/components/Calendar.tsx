import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");

  const [events] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Team Standup",
      description: "Daily team sync meeting",
      start: new Date(2024, 0, 9, 9, 0),
      end: new Date(2024, 0, 9, 9, 30),
      type: "meeting",
      color: "electric-blue"
    },
    {
      id: "2",
      title: "Design Review",
      description: "Review new dashboard designs",
      start: new Date(2024, 0, 9, 14, 0),
      end: new Date(2024, 0, 9, 15, 30),
      type: "meeting",
      color: "vibrant-orange"
    },
    {
      id: "3",
      title: "Code deadline",
      description: "Submit feature implementation",
      start: new Date(2024, 0, 9, 17, 0),
      end: new Date(2024, 0, 9, 17, 0),
      type: "task",
      color: "cyan-bright"
    },
    {
      id: "4",
      title: "Client presentation",
      description: "Present Q1 roadmap to stakeholders",
      start: new Date(2024, 0, 10, 10, 0),
      end: new Date(2024, 0, 10, 11, 30),
      type: "meeting",
      color: "purple-accent"
    }
  ]);

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
        <Button className="shadow-glow-blue">
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
    </div>
  );
};

export default Calendar;