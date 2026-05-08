# Text Visualizer - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una app de playground creativo donde el usuario escribe texto y este se convierte instantáneamente en partículas luminosas tipo humo/luz con estética Celestial/Ethereal.

**Architecture:** React + Canvas API nativa para rendering de partículas, con hooks para animación y sincronización de texto a partículas. Sin external libraries - todo nativo para máximo control y rendimiento 60fps.

**Tech Stack:** React 19, Canvas API nativa, TypeScript strict mode, Vite

---

## File Structure

```
src/
├── types/
│   └── particle.ts              # Tipos TypeScript para partículas
├── utils/
│   ├── noise.ts                # Funciones de ruido Perlin
│   └── textRasterizer.ts       # Convierte texto a puntos de píxeles
├── hooks/
│   ├── useTextToParticles.ts  # Hook para convertir texto → partículas
│   └── useParticleAnimation.ts # Hook para animación 60fps
├── components/
│   ├── ParticleCanvas.tsx      # Canvas principal con sistema de partículas
│   └── TextInput.tsx           # Campo de entrada minimalista
├── App.tsx                     # Componente principal
├── App.css                    # Estilos del componente
└── index.css                  # Estilos globales (diseño Celestial/Ethereal)
```

---

## Task 1: Project Setup - Global Styles (Celestial/Ethereal)

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.css`
- Modify: `src/index.html`: agregar fuentes

- [ ] **Step 1: Agregar fuentes de Google Fonts**

Agregar en `<head>` de `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Definir CSS variables Celestial/Ethereal**

Reemplazar `src/index.css` completo:
```css
:root {
  /* Colores - Celestial/Ethereal */
  --bg-deep: #030712;
  --bg-gradient-start: #0f172a;
  --bg-gradient-end: #1e1b4b;
  --particle-shine: #e0e7ff;
  --particle-pearl: #c7d2fe;
  --glow-violet: #818cf8;
  --text-primary: #f8fafc;
  --text-placeholder: #475569;
  
  /* Tipografía */
  --font-display: 'Cormorant Garamond', serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Espaciado */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;
  --space-2xl: 96px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-deep);
}

body {
  font-family: var(--font-mono);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(30, 27, 75, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(15, 23, 42, 0.4) 0%, transparent 50%),
    var(--bg-deep);
}

/* Cursor parpadeante suave */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.cursor-blink {
  animation: blink 1.2s ease-in-out infinite;
}
```

- [ ] **Step 3: Limpiar App.css minimalista**

Reemplazar `src/App.css`:
```css
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.canvas-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.input-wrapper {
  padding: var(--space-lg) var(--space-xl);
  display: flex;
  justify-content: center;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/App.css index.html
git commit -m "feat: add Celestial/Ethereal global styles and typography"
```

---

## Task 2: Tipos y Utilidades Core

**Files:**
- Create: `src/types/particle.ts`
- Create: `src/utils/noise.ts`
- Create: `src/utils/textRasterizer.ts`

- [ ] **Step 1: Definir tipos de Partícula**

Crear `src/types/particle.ts`:
```typescript
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
}

export interface ParticleConfig {
  particleCount: number;
  baseSize: number;
  sizeVariation: number;
  speed: number;
  glowIntensity: number;
  colors: string[];
}
```

- [ ] **Step 2: Implementar ruido Perlin**

Crear `src/utils/noise.ts`:
```typescript
// Implementación simple de ruido Perlin 2D
export class PerlinNoise {
  private permutation: number[];
  
  constructor(seed: number = Math.random() * 10000) {
    this.permutation = this.generatePermutation(seed);
  }
  
  private generatePermutation(seed: number): number[] {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    // Shuffle con seed
    let n = seed;
    for (let i = 255; i > 0; i--) {
      n = (n * 16807) % 2147483647;
      const j = n % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    // Duplicar para evitar overflow
    return [...p, ...p];
  }
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }
  
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }
  
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.permutation[X] + Y;
    const B = this.permutation[X + 1] + Y;
    
    return this.lerp(
      this.lerp(this.grad(this.permutation[A], x, y), this.grad(this.permutation[B], x - 1, y), u),
      this.lerp(this.grad(this.permutation[A + 1], x, y - 1), this.grad(this.permutation[B + 1], x - 1, y - 1), u),
      v
    );
  }
}

// Instancia global compartida
export const globalNoise = new PerlinNoise();
```

- [ ] **Step 3: Implementar textRasterizer**

Crear `src/utils/textRasterizer.ts`:
```typescript
import { Particle } from '../types/particle';

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
  const tempCtx = tempCanvas.getContext('2d')!;
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
```

- [ ] **Step 4: Commit**

```bash
git add src/types/particle.ts src/utils/noise.ts src/utils/textRasterizer.ts
git commit -m "feat: add particle types and utility functions"
```

---

## Task 3: Hooks de Lógica

**Files:**
- Create: `src/hooks/useTextToParticles.ts`
- Create: `src/hooks/useParticleAnimation.ts`

- [ ] **Step 1: Hook para convertir texto a partículas**

Crear `src/hooks/useTextToParticles.ts`:
```typescript
import { useState, useCallback, useMemo } from 'react';
import { Particle, ParticleConfig } from '../types/particle';
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
```

- [ ] **Step 2: Hook para animación de partículas**

Crear `src/hooks/useParticleAnimation.ts`:
```typescript
import { useCallback, useRef } from 'react';
import { Particle } from '../types/particle';
import { globalNoise } from '../utils/noise';

interface AnimationConfig {
  speed: number;
  noiseScale: number;
  noiseStrength: number;
  driftY: number;
}

const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  speed: 1,
  noiseScale: 0.01,
  noiseStrength: 8,
  driftY: -0.15
};

export function useParticleAnimation(
  canvas: HTMLCanvasElement | null,
  particles: Particle[],
  config: AnimationConfig = DEFAULT_ANIMATION_CONFIG
) {
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  
  const animate = useCallback(() => {
    if (!canvas || particles.length === 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    timeRef.current += 0.02 * config.speed;
    const t = timeRef.current;
    
    // Clear con trail effect
    ctx.fillStyle = 'rgba(3, 7, 18, 0.15)';
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
      gradient.addColorStop(0.2, particle.color.replace(')', `, ${particle.alpha * 0.8})`).replace('rgb', 'rgba'));
      gradient.addColorStop(0.5, particle.color.replace(')', `, ${particle.alpha * 0.3})`).replace('rgb', 'rgba'));
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [canvas, particles, config]);
  
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    timeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);
  
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);
  
  return {
    startAnimation,
    stopAnimation
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTextToParticles.ts src/hooks/useParticleAnimation.ts
git commit -m "feat: add particle animation hooks"
```

---

## Task 4: Componentes UI

**Files:**
- Create: `src/components/ParticleCanvas.tsx`
- Create: `src/components/TextInput.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear ParticleCanvas**

Crear `src/components/ParticleCanvas.tsx`:
```typescript
import { useRef, useEffect, useState } from 'react';
import { Particle } from '../types/particle';
import { useParticleAnimation } from '../hooks/useParticleAnimation';

interface ParticleCanvasProps {
  text: string;
}

export function ParticleCanvas({ text }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const initializedRef = useRef(false);
  
  // Generar partículas cuando cambia el texto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) {
      setParticles([]);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Import dinámico para evitar ciclo
    import('../utils/textRasterizer').then(({ textToPoints, pointsToParticles }) => {
      const points = textToPoints(text, ctx, 72, 2);
      
      if (points.length === 0) {
        setParticles([]);
        return;
      }
      
      const newParticles = pointsToParticles(points, {
        particleCount: 600,
        baseSize: 2,
        sizeVariation: 2,
        colors: ['#e0e7ff', '#c7d2fe', '#818cf8', '#f8fafc'],
        centerX: canvas.width / 2,
        centerY: canvas.height / 2
      });
      
      setParticles(newParticles);
    });
  }, [text]);
  
  // Animation hook
  const { startAnimation, stopAnimation } = useParticleAnimation(
    canvasRef.current,
    particles,
    { speed: 1, noiseScale: 0.008, noiseStrength: 6, driftY: -0.1 }
  );
  
  // Iniciar/detener animación
  useEffect(() => {
    if (particles.length > 0 && !initializedRef.current) {
      startAnimation();
      initializedRef.current = true;
    } else if (particles.length === 0) {
      stopAnimation();
      initializedRef.current = false;
    }
    
    return () => stopAnimation();
  }, [particles.length, startAnimation, stopAnimation]);
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '900px',
        display: 'block'
      }}
    />
  );
}
```

- [ ] **Step 2: Crear TextInput minimalista**

Crear `src/components/TextInput.tsx`:
```typescript
import { useRef, useEffect } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInput({ value, onChange, placeholder = 'Escribe aquí...' }: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus al montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '500px'
    }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(71, 85, 105, 0.4)',
          borderRadius: 0,
          padding: '12px 8px',
          fontSize: '18px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          outline: 'none',
          textAlign: 'center',
          transition: 'border-color 0.3s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--glow-violet)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
        }}
      />
      {/* Cursor parpadeante simulado */}
      <span
        className="cursor-blink"
        style={{
          position: 'absolute',
          right: value.length === 0 ? '8px' : 'auto',
          left: value.length === 0 ? '50%' : 'auto',
          width: '2px',
          height: '20px',
          background: 'var(--glow-violet)',
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
      <style>{`
        input::placeholder {
          color: var(--text-placeholder);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Actualizar App.tsx**

Reemplazar `src/App.tsx`:
```typescript
import { useState } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { TextInput } from './components/TextInput';
import './App.css';

function App() {
  const [text, setText] = useState('');
  
  return (
    <div className="app-container">
      <div className="canvas-wrapper">
        <ParticleCanvas text={text} />
      </div>
      
      <div className="input-wrapper">
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Escribe algo bello..."
        />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ParticleCanvas.tsx src/components/TextInput.tsx src/App.tsx
git commit -m "feat: add ParticleCanvas and TextInput components"
```

---

## Task 5: Testing y Ajustes Finales

**Files:**
- Test: verificar en dev server
- Modify: ajustes según feedback

- [ ] **Step 1: Verificar en dev server**

Ejecutar:
```bash
npm run dev
```
Verificar:
- [ ] El canvas renderiza correctamente
- [ ] Las partículas aparecen al escribir
- [ ] El efecto de glow es visible
- [ ] La animación es fluida (sin lag)
- [ ] Los estilos Celestial/Ethereal se aplican

- [ ] **Step 2: Ajustes de rendimiento si es necesario**

Si hay lag, reducir particleCount en `useTextToParticles`:
```typescript
particleCount: 400  // antes de 800
```

- [ ] **Step 3: Ajustes de visual si es necesario**

Ajustar colores, sizes o velocidad según sea necesario.

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "feat: complete text-visualizer with particle effects"
```

---

## Self-Review Against Spec

**Spec Coverage Checklist:**

- [x] Usuario puede escribir texto en input → TextInput component
- [x] El texto se convierte en partículas luminosas instantáneamente → useTextToParticles hook + ParticleCanvas
- [x] Las partículas tienen efecto de glow/smoke → Radial gradient en animate()
- [x] Las partículas se mueven orgánicamente (ruido Perlin) → PerlinNoise class + useParticleAnimation
- [x] Al borrar texto, las partículas desaparecen → setParticles([]) cuando text está vacío
- [x] El rendimiento se mantiene en 60fps → Canvas API nativa, sampling de partículas
- [x] La UI es minimalista y enfocada en el efecto visual → Celestial/Ethereal styling

**No Placeholder Violations Check:**

- [x] Sin "TBD", "TODO"
- [x] Todo el código está implementado
- [x] Las funciones tienen nombres consistentes

---

## Execution Handoff

**Plan completo y guardado en:** `docs/superpowers/plans/2026-05-07-text-visualizer-implementation.md`

**Dos opciones de ejecución:**

**1. Subagent-Driven (recommended)** - Dispacho un subagent fresco por task, reviso entre tasks, iteración rápida

**2. Inline Execution** - Ejecuto tasks en esta sesión usando executing-plans, batch execution con checkpoints

**¿Cuál enfoque prefieres?**