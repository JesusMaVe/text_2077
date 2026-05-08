export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  targetAlpha?: number;
  targetSize?: number;
}

export interface ParticleConfig {
  particleCount: number;
  baseSize: number;
  sizeVariation: number;
  speed: number;
  glowIntensity: number;
  colors: string[];
}