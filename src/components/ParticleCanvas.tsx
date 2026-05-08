import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useParticleAnimation } from '../hooks/useParticleAnimation';
import type { Particle } from '../types/particle';

interface ParticleCanvasProps {
  text: string;
}

const ANIMATION_CONFIG = {
  speed: 2,
  noiseScale: 0.012,
  noiseStrength: 8,
  driftY: -0.2
};

// Seeded random for deterministic values
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Pre-generate star positions with deterministic values
function generateStars(count: number): Array<{ left: number; top: number; width: number; height: number; animationDuration: number; animationDelay: number; color: string }> {
  return [...Array(count)].map((_, i) => ({
    left: seededRandom(i * 1.1) * 100,
    top: seededRandom(i * 2.2) * 100,
    width: seededRandom(i * 3.3) * 2 + 1,
    height: seededRandom(i * 4.4) * 2 + 1,
    animationDuration: 2 + seededRandom(i * 5.5) * 3,
    animationDelay: seededRandom(i * 6.6) * 2,
    color: i % 3 === 0 ? '#818cf8' : '#e0e7ff'
  }));
}

export function ParticleCanvas({ text }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasShownText, setHasShownText] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const previousTextRef = useRef<string>('');
  const { startAnimation, stopAnimation } = useParticleAnimation();

  // Memoize star positions to avoid regenerating on render
  const stars = useMemo(() => generateStars(20), []);

  // Handle text change - use useCallback with proper dependencies
  const handleTextChange = useCallback(async (currentText: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prevText = previousTextRef.current;

    // If text was cleared, fade out first
    if (!currentText.trim() && prevText.trim()) {
      setIsFadingOut(true);
      setTimeout(() => {
        setParticles([]);
        setIsFadingOut(false);
        setHasShownText(false);
      }, 600);
      return;
    }

    // If no new text, clear
    if (!currentText.trim()) {
      setParticles([]);
      previousTextRef.current = '';
      return;
    }

    // Skip if text hasn't changed
    if (currentText === prevText) return;

    previousTextRef.current = currentText;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dynamic import
    const { textToPoints, pointsToParticles } = await import('../utils/textRasterizer');
    const points = textToPoints(currentText, ctx, 72, 2);

    if (points.length === 0) {
      setParticles([]);
      return;
    }

    // Generate particles with seeded random for target values
    const seed = currentText.length;
    const animatedParticles = pointsToParticles(points, {
      particleCount: 1200,
      baseSize: 2.5,
      sizeVariation: 2,
      colors: ['#e0e7ff', '#c7d2fe', '#818cf8', '#f8fafc'],
      centerX: canvas.width / 2,
      centerY: canvas.height / 2
    }).map((p, idx) => ({
      ...p,
      targetAlpha: 0.6 + seededRandom(seed + idx) * 0.4,
      targetSize: p.size
    }));

    setParticles(animatedParticles);
    setHasShownText(true);
  }, []); // Empty deps - function is stable

  // Store latest text in ref to avoid stale closures
  const textRef = useRef(text);

  // Update ref when text changes (outside render)
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Effect to trigger text change handler
  useEffect(() => {
    const currentText = textRef.current;
    if (currentText !== previousTextRef.current || (currentText && previousTextRef.current === '')) {
      handleTextChange(currentText);
    }
  }, [text, handleTextChange]);
  
  // Iniciar animación continua - include particles in deps
  useEffect(() => {
    const canvas = canvasRef.current;

    if (particles.length > 0 && !isFadingOut) {
      startAnimation(canvas, particles, ANIMATION_CONFIG);
    } else {
      stopAnimation();
    }

    return () => stopAnimation();
  }, [particles, isFadingOut, startAnimation, stopAnimation]);
  
  // Clear canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);
  
  // Estado vacío con estrellas (usar valores pre-generados)
  if (!hasShownText && !text) {
    return (
      <div className="particle-empty-state">
        {stars.map((star, i) => (
          <span
            key={i}
            className="particle-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.width}px`,
              height: `${star.height}px`,
              background: star.color,
              animationDuration: `${star.animationDuration}s`,
              animationDelay: `${star.animationDelay}s`
            }}
          />
        ))}

        <h2 className="particle-empty-title">
          Text Visualizer
        </h2>
        <p className="particle-empty-subtitle">
          Escribe y mira tu texto convertirse en luz
        </p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className={`particle-canvas ${hasShownText ? '' : 'hidden'}`}
    />
  );
}