"use client";

import React, { useEffect, useRef } from "react";

interface AsciiTreeProps {
  imageSrc?: string;
  dotSize?: number;
  gap?: number;
  className?: string;
}

export const AsciiTree: React.FC<AsciiTreeProps> = ({
  imageSrc = "@/assets/tree.png",
  dotSize = 4,
  gap = 3,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const width = (canvas.width = img.width);
      const height = (canvas.height = img.height);

      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      const offCtx = offscreenCanvas.getContext("2d");
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, width, height);
      const imgData = offCtx.getImageData(0, 0, width, height).data;

      ctx.clearRect(0, 0, width, height);

      // Degradado lineal diagonal (de x:0, y:0 a x:width, y:height)
      const gradient = ctx.createLinearGradient(height, width, 0, 0);
      gradient.addColorStop(0.08, "#315601");
      gradient.addColorStop(0.32, "#CCDD99");
      gradient.addColorStop(0.75, "#6CBC02");

      ctx.fillStyle = gradient;

      const step = dotSize + gap;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = imgData[index + 3];

          if (alpha > 20) {
            const red = imgData[index];
            const green = imgData[index + 1];
            const blue = imgData[index + 2];

            const brightness = (red + green + blue) / 3 / 255;
            const currentRadius = Math.max(1.2, (dotSize / 2) * (0.4 + brightness * 0.6));

            ctx.save();
            ctx.globalAlpha = (alpha / 255) * 0.9;
            ctx.beginPath();
            ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }
    };
  }, [imageSrc, dotSize, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
    />
  );
};