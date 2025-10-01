"use client";

import React, { useRef, useEffect } from "react";

interface CanvasProps {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, draw }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof draw !== "function") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    let animationFrameId: number;

    const render = () => {
      frameCount++;
      draw(ctx, frameCount);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: "1px solid black", display: "block", margin: "0 auto" }}
    />
  );
};

export default Canvas;
