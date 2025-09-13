import { useState, useEffect } from "react";

const PixelArtWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="w-full mb-6 gradient-card shadow-card rounded-xl p-6 overflow-hidden relative h-24">
      <div className="flex items-center justify-between h-full">
        <div>
          <h2 className="text-xl font-bold text-foreground">ApexFlow</h2>
          <p className="text-sm text-muted-foreground">Your productivity dashboard</p>
        </div>
        
        {/* Digital Clock */}
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-electric-blue">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelArtWidget;