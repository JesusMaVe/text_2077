import { useState, useCallback } from 'react';
import type { Particle, ParticleConfig } from '../types/particle';
import { textToPoints, pointsToParticles } from '../utils/textRasterizer';

const DEFAULT_CONFIG: ParticleConfig = {
  particleCount: 800,
  baseSize: 2,
  sizeVariation: 2,
  speed: 0.3,
  glowIntensity: 15,
  colors: ['#e0e7ff', '#c7d2fe', '#818cf8', '#f8fafc']
};

export function useTextToParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const generateParticles = useCallback((text: string, canvas: HTMLCanvasElement | null) => {
    if (!canvas || !text.trim()) {
      setParticles([]);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Convertir texto a puntos
    const points = textToPoints(text, ctx, 72, 2);
    
    if (points.length === 0) {
      setParticles([]);
      return;
    }
    
    // Generar partículas desde puntos
    const newParticles = pointsToParticles(points, {
      particleCount: DEFAULT_CONFIG.particleCount,
      baseSize: DEFAULT_CONFIG.baseSize,
      sizeVariation: DEFAULT_CONFIG.sizeVariation,
      colors: DEFAULT_CONFIG.colors,
      centerX: canvas.width / 2,
      centerY: canvas.height / 2
    });
    
    setParticles(newParticles);
  }, []);
  
  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);
  
  return {
    particles,
    generateParticles,
    clearParticles,
    config: DEFAULT_CONFIG
  };
}