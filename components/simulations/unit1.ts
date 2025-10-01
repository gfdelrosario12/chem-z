export function drawSolid(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let x = 50; x < ctx.canvas.width; x += 50) {
    for (let y = 50; y < ctx.canvas.height; y += 50) {
      const offset = Math.sin(frame / 10) * 2; // vibration
      ctx.beginPath();
      ctx.arc(x + offset, y + offset, 5, 0, Math.PI * 2);
      ctx.fillStyle = "blue";
      ctx.fill();
    }
  }
}

export function drawLiquid(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < 50; i++) {
    const x = (i * 20 + frame * 2) % ctx.canvas.width;
    const y = 100 + Math.sin((i + frame) / 10) * 20;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
  }
}

export function drawGas(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() * ctx.canvas.width + frame * 5) % ctx.canvas.width;
    const y = (Math.random() * ctx.canvas.height + frame * 5) % ctx.canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }
}
