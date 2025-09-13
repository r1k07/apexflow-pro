import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

const Timer = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(prev => {
          const newTotal = prev - 1;
          setMinutes(Math.floor(newTotal / 60));
          setSeconds(newTotal % 60);
          return newTotal;
        });
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsRunning(false);
      // Timer finished - could add notification here
    }

    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const newTotal = hours * 3600 + minutes * 60;
    setTotalSeconds(newTotal);
    setSeconds(0);
  };

  const adjustTime = (type: 'hours' | 'minutes', increment: boolean) => {
    if (!isRunning) {
      if (type === 'hours') {
        const newHours = increment ? hours + 1 : Math.max(0, hours - 1);
        setHours(newHours);
        setTotalSeconds(newHours * 3600 + minutes * 60);
      } else {
        const newMinutes = increment ? Math.min(59, minutes + 1) : Math.max(0, minutes - 1);
        setMinutes(newMinutes);
        setTotalSeconds(hours * 3600 + newMinutes * 60);
      }
      setSeconds(0);
    }
  };

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return h > 0 ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const initialTotal = hours * 3600 + minutes * 60;
  const progressPercent = initialTotal > 0 ? ((initialTotal - totalSeconds) / initialTotal) * 100 : 0;

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

            {/* Time Controls */}
            {!isRunning && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs text-muted-foreground">Hours</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime('hours', false)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-lg font-mono w-8 text-center">{hours.toString().padStart(2, '0')}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime('hours', true)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground">:</div>
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs text-muted-foreground">Minutes</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime('minutes', false)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-lg font-mono w-8 text-center">{minutes.toString().padStart(2, '0')}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime('minutes', true)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              <p className="text-sm text-muted-foreground">
                {totalSeconds === 0 ? "Time's up!" : 
                 isRunning ? "Timer running..." : "Timer paused"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Timer;