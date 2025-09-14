import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";

const Timer = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(300);
  const [inputHours, setInputHours] = useState("0");
  const [inputMinutes, setInputMinutes] = useState("5");

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(prev => {
          const newTotal = prev - 1;
          setHours(Math.floor(newTotal / 3600));
          setMinutes(Math.floor((newTotal % 3600) / 60));
          setSeconds(newTotal % 60);
          return newTotal;
        });
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  // Handle input changes
  const handleTimeInput = () => {
    if (isRunning) return;
    
    const h = Math.max(0, Math.min(23, parseInt(inputHours) || 0));
    const m = Math.max(0, Math.min(59, parseInt(inputMinutes) || 0));
    
    setHours(h);
    setMinutes(m);
    setSeconds(0);
    
    const newTotal = h * 3600 + m * 60;
    setTotalSeconds(newTotal);
    setInitialTime(newTotal);
    
    // Save to localStorage
    localStorage.setItem('timer-settings', JSON.stringify({ hours: h, minutes: m }));
  };

  useEffect(() => {
    // Load saved timer settings
    const saved = localStorage.getItem('timer-settings');
    if (saved) {
      const { hours: savedH, minutes: savedM } = JSON.parse(saved);
      setInputHours(savedH.toString());
      setInputMinutes(savedM.toString());
      setHours(savedH);
      setMinutes(savedM);
      const newTotal = savedH * 3600 + savedM * 60;
      setTotalSeconds(newTotal);
      setInitialTime(newTotal);
    }
  }, []);

  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalSeconds(initialTime);
    setHours(Math.floor(initialTime / 3600));
    setMinutes(Math.floor((initialTime % 3600) / 60));
    setSeconds(initialTime % 60);
  };

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return h > 0 
      ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialTime > 0 ? ((initialTime - totalSeconds) / initialTime) * 100 : 0;

  return (
    <Layout>
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Time Display */}
            <div className="text-center">
              <div 
                className="text-6xl font-mono font-bold text-electric-blue mb-4"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatTime(totalSeconds)}
              </div>
              
              {/* Progress Circle */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--border))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--electric-blue))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
              </div>
            </div>

            {/* Timer Input Controls */}
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="hours" className="text-sm text-muted-foreground">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={inputHours}
                  onChange={(e) => setInputHours(e.target.value)}
                  onBlur={handleTimeInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleTimeInput()}
                  disabled={isRunning}
                  className="w-20 text-center bg-secondary/50 border-border/50"
                />
              </div>
              
              <div className="flex items-center justify-center text-3xl font-bold text-foreground pt-6">
                :
              </div>

              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="minutes" className="text-sm text-muted-foreground">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  onBlur={handleTimeInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleTimeInput()}
                  disabled={isRunning}
                  className="w-20 text-center bg-secondary/50 border-border/50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleStart}
                size="lg"
                className="shadow-glow-blue min-w-32"
                disabled={totalSeconds === 0}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                size="lg"
                className="min-w-32"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>

            {/* Status */}
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                {totalSeconds === 0 ? "Time's up!" : 
                 isRunning ? "Timer running..." : "Timer paused"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Timer;