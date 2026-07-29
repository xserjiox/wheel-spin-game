import { useEffect, useRef } from "react";

const COLORS = [
  "#ff7957",
  "#826ff2",
  "#f7c84b",
  "#63b9e8",
  "#68c99c",
  "#ef8eae",
  "#d7ff44",
];

type Particle = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
};

export function Confetti({
  durationMs = 4_000,
  particleCount = 130,
}: {
  durationMs?: number;
  particleCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;
    const startedAt = performance.now();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: particleCount }, (_, index) => ({
      x: width / 2 + (Math.random() - 0.5) * Math.min(width * 0.28, 180),
      y: Math.min(height * 0.42, height / 2) + (Math.random() - 0.5) * 50,
      velocityX: (Math.random() - 0.5) * 13,
      velocityY: -(5 + Math.random() * 9),
      size: 5 + Math.random() * 8,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.35,
      color: COLORS[index % COLORS.length],
    })) satisfies Particle[];

    const draw = (timestamp: number) => {
      const elapsed = timestamp - startedAt;
      const delta = Math.min(2, (timestamp - (lastFrame || timestamp)) / 16.67);
      lastFrame = timestamp;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = Math.min(1, Math.max(0, (durationMs - elapsed) / 500));

      particles.forEach((particle) => {
        particle.velocityY += 0.22 * delta;
        particle.velocityX *= 0.995;
        particle.x += particle.velocityX * delta;
        particle.y += particle.velocityY * delta;
        particle.rotation += particle.rotationSpeed * delta;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(
          -particle.size / 2,
          -particle.size / 3,
          particle.size,
          particle.size * 0.66,
        );
        context.restore();
      });

      if (elapsed < durationMs) {
        frameId = window.requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, width, height);
      }
    };

    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      context.clearRect(0, 0, width, height);
    };
  }, [durationMs, particleCount]);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
