import { useState, useEffect } from "react";

const PixelArtWidget = () => {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const pixelArt = [
    // Frame 1
    [
      "████████████████████████████████",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓░█████░█████░███░░██░░█████░▓█",
      "█▓░░░██░░░░░██░███░░██░░░░██░░▓█",
      "█▓░███░░░███░░░░██░░██░░███░░░▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "████████████████████████████████"
    ],
    // Frame 2
    [
      "████████████████████████████████",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓░█████░█████░████░██░█████░▓█",
      "█▓░░░██░░░░░██░████░██░░░██░░▓█",
      "█▓░███░░░███░░░░███░██░███░░░▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "████████████████████████████████"
    ],
    // Frame 3
    [
      "████████████████████████████████",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓░█████░█████░█████░██░████░▓█",
      "█▓░░░██░░░░░██░█████░██░░██░░▓█",
      "█▓░███░░░███░░░░████░██░███░░▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "████████████████████████████████"
    ],
    // Frame 4
    [
      "████████████████████████████████",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓░█████░█████░██████░██░███░▓█",
      "█▓░░░██░░░░░██░██████░██░░██░▓█",
      "█▓░███░░░███░░░░█████░██░███░▓█",
      "█▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█",
      "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█",
      "████████████████████████████████"
    ]
  ];

  const renderPixel = (char: string, index: number) => {
    const colors: Record<string, string> = {
      '█': 'bg-primary',
      '▓': 'bg-electric-blue',
      '░': 'bg-cyan-bright',
      ' ': 'bg-transparent'
    };

    return (
      <div
        key={index}
        className={`w-2 h-2 ${colors[char] || 'bg-transparent'} transition-colors duration-300`}
        style={{
          backgroundColor: char === '█' ? 'hsl(var(--primary))' :
                          char === '▓' ? 'hsl(var(--electric-blue))' :
                          char === '░' ? 'hsl(var(--cyan-bright))' : 'transparent'
        }}
      />
    );
  };

  return (
    <div className="w-full mb-6 gradient-card shadow-card rounded-xl p-6 overflow-hidden">
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-32 gap-0 animate-pulse">
          {pixelArt[animationFrame].map((row, rowIndex) =>
            row.split('').map((pixel, pixelIndex) => 
              renderPixel(pixel, rowIndex * 32 + pixelIndex)
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PixelArtWidget;