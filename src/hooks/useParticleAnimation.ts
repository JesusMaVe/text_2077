import { useCallback, useRef } from 'react';
import type { Particle } from '../types/particle';
import { globalNoise } from '../utils/noise';

interface AnimationConfig {
  speed: number;
  noiseScale: number;
  noiseStrength: number;
  driftY: number;
}

const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  speed: 3,
  noiseScale: 0.015,
  noiseStrength: 12,
  driftY: -0.5
};

export function useParticleAnimation() {
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  
  const animate = useCallback((
    canvas: HTMLCanvasElement | null,
    particles: Particle[],
    config: AnimationConfig = DEFAULT_ANIMATION_CONFIG
  ) => {
    if (!canvas || particles.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    timeRef.current += 0.08 * config.speed;
    const t = timeRef.current;
    
    // Clear con trail effect
    ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y renderizar cada partícula
    for (const particle of particles) {
      // Movimiento con ruido Perlin
      const noiseX = globalNoise.noise(
        particle.baseX * config.noiseScale + t,
        particle.baseY * config.noiseScale
      ) * config.noiseStrength;
      
      const noiseY = globalNoise.noise(
        particle.baseX * config.noiseScale,
        particle.baseY * config.noiseScale + t
      ) * config.noiseStrength;
      
      // Actualizar posición
      particle.x = particle.baseX + noiseX;
      particle.y = particle.baseY + noiseY + (t * particle.phase * config.driftY);
      
      // Oscilación de alpha (pulsante sutil)
      particle.alpha = 0.4 + Math.sin(t * particle.speed + particle.phase) * 0.3 + 0.3;
      
      // Renderizar partícula con glow
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      
      gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
      gradient.addColorStop(0.3, `rgba(224, 231, 255, ${particle.alpha * 0.6})`);
      gradient.addColorStop(0.6, `rgba(129, 140, 248, ${particle.alpha * 0.2})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, []);
  
  const startAnimation = useCallback((
    canvas: HTMLCanvasElement | null,
    particles: Particle[],
    config: AnimationConfig = DEFAULT_ANIMATION_CONFIG
  ) => {
    const loop = () => {
      animate(canvas, particles, config);
      animationRef.current = requestAnimationFrame(loop);
    };
    
    if (particles.length > 0) {
      timeRef.current = 0;
      loop();
    }
  }, [animate]);
  
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);
  
  return {
    animate,
    startAnimation,
    stopAnimation
  };
}