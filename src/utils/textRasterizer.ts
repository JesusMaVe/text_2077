import type { Particle } from '../types/particle';

/**
 * Extrae puntos de píxeles de texto renderizado en canvas
 * Retorna array de posiciones (x, y) que forman el texto
 */
export function textToPoints(
  text: string,
  ctx: CanvasRenderingContext2D,
  fontSize: number = 64,
  sampleStep: number = 2
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  
  // Configurar fuente
  ctx.font = `${fontSize}px "Cormorant Garamond", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Medir texto
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;
  
  // Crear canvas temporal para extraer píxeles
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('Failed to get 2D context from temporary canvas');
  }
  tempCanvas.width = Math.ceil(textWidth) + fontSize;
  tempCanvas.height = textHeight * 2;
  
  // Renderizar texto
  tempCtx.font = `${fontSize}px "Cormorant Garamond", serif`;
  tempCtx.textAlign = 'center';
  tempCtx.textBaseline = 'middle';
  tempCtx.fillStyle = '#fff';
  tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);
  
  // Extraer píxeles
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  
  const centerX = tempCanvas.width / 2;
  const centerY = tempCanvas.height / 2;
  
  for (let y = 0; y < tempCanvas.height; y += sampleStep) {
    for (let x = 0; x < tempCanvas.width; x += sampleStep) {
      const i = (y * tempCanvas.width + x) * 4;
      const alpha = data[i + 3];
      
      // Si el píxel tiene contenido
      if (alpha > 128) {
        points.push({
          x: x - centerX,
          y: y - centerY
        });
      }
    }
  }
  
  return points;
}

/**
 * Convierte puntos de texto a partículas
 */
export function pointsToParticles(
  points: { x: number; y: number }[],
  config: {
    particleCount: number;
    baseSize: number;
    sizeVariation: number;
    colors: string[];
    centerX: number;
    centerY: number;
  }
): Particle[] {
  const particles: Particle[] = [];
  
  // Sampling para no overwhelmar
  const samplingRate = Math.max(1, Math.floor(points.length / config.particleCount));
  
  for (let i = 0; i < points.length; i += samplingRate) {
    if (particles.length >= config.particleCount) break;
    
    const point = points[i];
    const colorIndex = Math.floor(Math.random() * config.colors.length);
    
    particles.push({
      x: point.x + config.centerX,
      y: point.y + config.centerY,
      baseX: point.x + config.centerX,
      baseY: point.y + config.centerY,
      vx: 0,
      vy: 0,
      alpha: 0.6 + Math.random() * 0.4,
      size: config.baseSize + (Math.random() - 0.5) * config.sizeVariation,
      color: config.colors[colorIndex],
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5
    });
  }
  
  return particles;
}