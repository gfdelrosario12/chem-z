export function drawUnsaturated(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Water solvent background
  ctx.fillStyle = "#a2d5f2";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Dissolving NaCl crystals → ions
  for (let i = 0; i < 20; i++) {
    const x = (i * 30 + frame * 2) % ctx.canvas.width;
    const y = 100 + Math.sin((i + frame) / 10) * 15;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "orange" : "cyan"; // Na⁺ or Cl⁻
    ctx.fill();
  }
}

export function drawSaturation(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Water background
  ctx.fillStyle = "#a2d5f2";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Dissolved ions moving
  for (let i = 0; i < 25; i++) {
    const x = (i * 25 + frame * 2) % ctx.canvas.width;
    const y = 120 + Math.sin((i + frame) / 8) * 20;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "orange" : "cyan";
    ctx.fill();
  }

  // Excess crystals at bottom
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.rect(50 + i * 40, ctx.canvas.height - 20, 10, 10);
    ctx.fillStyle = "gray";
    ctx.fill();
  }

  // Saturated label
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Saturated", ctx.canvas.width - 150, 30);
}

export function drawSupersaturation(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#a2d5f2";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Ions moving
  for (let i = 0; i < 25; i++) {
    const x = (i * 20 + frame * 3) % ctx.canvas.width;
    const y = 100 + Math.sin((i + frame) / 6) * 25;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "orange" : "cyan";
    ctx.fill();
  }

  // Seed added → crystal cloud
  if (frame % 100 > 50) {
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(300 + Math.sin(i + frame / 5) * 50, 200 + Math.cos(i + frame / 5) * 30, 7, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }
  }

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Supersaturated", ctx.canvas.width - 200, 30);
}

export function drawTempEffect(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#a2d5f2";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Show solubility dots
  const temps = [25, 40, 60];
  temps.forEach((t, idx) => {
    const x = 100 + idx * 150;
    const y = ctx.canvas.height - (t * 2); // higher T = higher y position
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  });

  ctx.fillStyle = "black";
  ctx.font = "18px Arial";
  ctx.fillText("Solubility Curve", ctx.canvas.width - 180, 30);
}

export function drawMolalityMolarity(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#a2d5f2";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Show calculator
  ctx.fillStyle = "white";
  ctx.fillRect(200, 150, 200, 100);
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("M = 0.50 M", 220, 180);
  ctx.fillText("m = 0.50 m", 220, 210);
  ctx.fillText("Calculator", 250, 250);
}
