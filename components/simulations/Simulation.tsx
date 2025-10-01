"use client";

import React from "react";
import Canvas from "../Canvas";

const Simulation: React.FC = () => {
  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Example: bouncing circle
    const radius = 30;
    const x = 50 + (frameCount % (ctx.canvas.width - radius * 2));
    const y = ctx.canvas.height / 2;

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "skyblue";
    ctx.fill();
    ctx.closePath();

    // Draw frame count
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`Frame: ${frameCount}`, 10, 20);
  };

  return <Canvas width={500} height={300} draw={draw} />;
};

export default Simulation;
