import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";

type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

const Pomodoro = () => {
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60); // 25 minutes work
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const phases = {
    work: { duration: 25 * 60, label: 'Focus Time', color: 'electric-blue', icon: BookOpen },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'green-success', icon: Coffee },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'vibrant-orange', icon: Coffee }
  };

  useEffect(() => {
    setTotalSeconds(phases[phase].duration);
  }, [phase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(prev => prev - 1);
      }, 1000);
    } else if (totalSeconds === 0 && isRunning) {
      setIsRunning(false);
      handlePhaseComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  const handlePhaseComplete = () => {
    if (phase === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Every 4 pomodoros, take a long break
      if (newCount % 4 === 0) {
        setPhase('longBreak');
      } else {
        setPhase('shortBreak');
      }
    } else {
      setPhase('work');
    }
  };

  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalSeconds(phases[phase].duration);
  };

  const handleSkip = () => {
    setIsRunning(false);
    handlePhaseComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((phases[phase].duration - totalSeconds) / phases[phase].duration) * 100;
  const currentPhase = phases[phase];
  const PhaseIcon = currentPhase.icon;

  return (
    <Layout>
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <PhaseIcon className="h-6 w-6" style={{ color: `hsl(var(--${currentPhase.color}))` }} />
              <CardTitle className="text-2xl font-bold text-foreground">
                {currentPhase.label}
              </CardTitle>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Badge 
                variant="outline"
                style={{
                  color: `hsl(var(--${currentPhase.color}))`,
                  backgroundColor: `hsl(var(--${currentPhase.color}) / 0.1)`,
                  borderColor: `hsl(var(--${currentPhase.color}) / 0.2)`
                }}
              >
                Session {completedPomodoros + 1}
              </Badge>
              <Badge variant="secondary">
                {completedPomodoros} completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Time Display */}
            <div className="text-center">
              <div 
                className="text-8xl font-mono font-bold mb-4"
                style={{ 
                  fontVariantNumeric: 'tabular-nums',
                  color: `hsl(var(--${currentPhase.color}))`
                }}
              >
                {formatTime(totalSeconds)}
              </div>
              
              {/* Progress Circle */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="hsl(var(--border))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke={`hsl(var(--${currentPhase.color}))`}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 72}`}
                    strokeDashoffset={`${2 * Math.PI * 72 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <PhaseIcon 
                      className="h-8 w-8 mx-auto mb-2" 
                      style={{ color: `hsl(var(--${currentPhase.color}))` }}
                    />
                    <div className="text-xs text-muted-foreground">
                      {Math.round(progressPercent)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <Button
                onClick={handleStart}
                size="lg"
                className="shadow-glow-blue min-w-24"
                disabled={totalSeconds === 0}
                style={{
                  boxShadow: `0 0 20px hsl(var(--${currentPhase.color}) / 0.3)`
                }}
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
                className="min-w-24"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                size="lg"
                className="min-w-24 text-muted-foreground"
              >
                Skip
              </Button>
            </div>

            {/* Phase Navigation */}
            <div className="flex justify-center space-x-2">
              {(Object.keys(phases) as PomodoroPhase[]).map((phaseKey) => (
                <Button
                  key={phaseKey}
                  variant={phase === phaseKey ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!isRunning) {
                      setPhase(phaseKey);
                    }
                  }}
                  disabled={isRunning}
                  className="text-xs"
                >
                  {phases[phaseKey].label}
                </Button>
              ))}
            </div>

            {/* Status */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {totalSeconds === 0 ? `${currentPhase.label} complete!` : 
                 isRunning ? `${currentPhase.label} in progress...` : `${currentPhase.label} ready to start`}
              </p>
              {completedPomodoros > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Next long break after {4 - (completedPomodoros % 4)} more pomodoros
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Pomodoro;