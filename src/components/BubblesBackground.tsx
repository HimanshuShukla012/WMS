// components/BubblesBackground.tsx
import React from "react";

const BubblesBackground = () => {
  const bubbles = Array.from({ length: 30 });

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {bubbles.map((_, i) => (
        <span
          key={i}
          className="absolute bottom-0 w-2 h-2 bg-blue-500 rounded-full animate-bubble"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};

export default BubblesBackground;
