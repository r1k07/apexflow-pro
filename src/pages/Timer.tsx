import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

const Timer = () => {
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
    const newTotal = minutes * 60;
    setTotalSeconds(newTotal);
    setSeconds(0);
  };

  const adjustMinutes = (increment: boolean) => {
    if (!isRunning) {
      const newMinutes = increment ? minutes + 1 : Math.max(1, minutes - 1);
      setMinutes(newMinutes);
      setTotalSeconds(newMinutes * 60);
      setSeconds(0);
    }
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((minutes * 60 - totalSeconds) / (minutes * 60)) * 100;

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
                className="text-8xl font-mono font-bold text-electric-blue mb-4"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatTime(Math.floor(totalSeconds / 60), totalSeconds % 60)}
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
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustMinutes(false)}
                  className="h-12 w-12 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-20 text-center">
                  {minutes} minutes
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustMinutes(true)}
                  className="h-12 w-12 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
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