# Text Visualizer - Partículas Luminosas

> **Spec Document** - Text Visualizer Project
> Fecha: 2026-05-07

## 1. Overview

Una aplicación de playground creativo donde el usuario escribe texto y este se convierte instantáneamente en partículas luminosas tipo humo/luz que flotan y shimmerán en el canvas. La experiencia es mágica e inmediata - escribes y las partículas aparecen bailando.

## 2. User Experience

### Flujo de Usuario

1. Usuario abre la app → ve un canvas oscuro con un cursor parpadeante
2. Comienza a escribir → instantáneamente las letras se convierten en partículas luminosas
3. Cada carácter genera ~20-30 partículas que forman la "huella" de la letra
4. Las partículas flotan/shakean suavemente (efecto humo/luz)
5. Borrar texto → las partículas se dispersan y desvanecen

### Interacción

- Input de texto en la parte inferior
- Escritura en tiempo real → transformación instantánea a partículas
- Controles mínimos (sin panel de settings)

## 3. Visual Design - Celestial/Ethereal

### Dirección Estética

Un espacio contemplativo, como observar estrellas en una noche despejada. La app es un portal silencioso donde el texto se convierte en luces que flotan - como luciérnagas o estrellas lejanas.

### Paleta de Colores

- Fondo: `#030712` (casi negro azulado profundo - espacio nocturno)
- Partículas shine: `#e0e7ff` (lavanda suave), `#c7d2fe` (perla)
- Glow: `#818cf8` (violeta suave)
- Input text: `#f8fafc` (blanco frío)
- Placeholder: `#475569` (gris silencioso)
- Gradiente mesh fondo: `#0f172a` → `#1e1b4b` (muy sutil)

### Tipografía

- Display/Headings: *Cormorant Garamond* (elegante, con carácter celestial)
- Input: *JetBrains Mono* (contraste técnico, monospace)
- Placeholder: Opacidad reducida al 40%

## 4. Arquitectura de Componentes y Diseño UI

### Diseño UI Celestial/Ethereal

- **Canvas**: Ocupa ~85% de la pantalla, área visual principal
- **Input**: Minimal en la parte inferior, flotando
- **Sin borders visibles** - todo fluye orgánicamente
- **Mucho espacio negativo** - aire y contemplación
- **Fondo**: Gradiente mesh muy sutil (casi invisible)

### Micro-interacciones

- Partículas flotan hacia arriba lentamente (como burbujas de luz)
- Oscilación orgánica con ruido Perlin
- Glow pulsante sutil en algunas partículas
- Input: cursor parpadeante suave
- Transiciones fluidas al escribir/borrar

### Efecto de Partículas (Smoke/Light)

- **Glow**: Cada partícula tiene un blur radial que simula luz
- **Color**: Tono base lavanda/perla con variaciones sutiles
- **Movimiento**: Ondulación + ruido Perlin para efecto orgánico
- **Desvanecimiento**: Alpha decay cuando se borra el texto

```
src/
├── components/
│   ├── Canvas.tsx           # Canvas principal con WebGL/Canvas API
│   ├── ParticleSystem.ts    # Motor de partículas
│   └── TextInput.tsx       # Campo de entrada minimalista
├── hooks/
│   ├── useParticleAnimation.ts  # Hook para lógica de animación
│   └── useTextToParticles.ts   # Hook para conversión texto→partículas
├── utils/
│   ├── particlePhysics.ts     # Física de movimiento
│   ├── textRasterizer.ts       # Convierte texto a puntos
│   └── noise.ts               # Funciones de ruido Perlin
├── types/
│   └── particle.ts             # Tipos TypeScript
├── App.tsx                    # Componente principal
└── index.css                 # Estilos globales
```

### Componentes Principales

1. **CanvasContainer** - El área visual donde-renderizan las partículas
2. **ParticleSystem** - Motor de partículas que forma el texto y maneja la física
3. **TextInput** - Campo de entrada minimalista
4. **useParticleAnimation** - Hook customizado para la lógica de animación

## 5. Funcionalidad Core

### Rendering de Texto a Partículas

- Usar Canvas 2D API para renderizar texto invisible
- Extraer puntos de píxeles del texto renderizado
- Cada punto se convierte en una partícula
- Aproximadamente 20-30 partículas por carácter

### Sistema de Partículas

- Position (x, y)
- Velocity (vx, vy) - velocidad base + oscilación
- Alpha (opacity) - para desvanecimiento
- Size (radio) - variación para profundidad
- Color - selección de paleta
- Life - tiempo de vida para cleanup

### Animación (60fps)

- Movimiento base: deriva lenta hacia arriba (como humo)
- Oscilación: ruido Perlin para movimiento orgánico
- Glow: radial gradient en cada partícula
- Fade out: alpha decay progresivo

### Sincronización con Input

- onChange del input → regenerar partículas instantly
- Si el texto cambia, limpiar partículas anteriores y crear nuevas
- Transición suave (no instant) para mejor UX

## 6.约束 (Constraints)

- Sin external libraries para partículas (usa Canvas API nativa)
- Rendimiento: mantener 60fps
- Compatible con browsers modernos
- Responsive: funciona en desktop y tablet

## 7.验收 Criteria

- [ ] Usuario puede escribir texto en input
- [ ] El texto se convierte en partículas luminosas instantáneamente
- [ ] Las partículas tienen efecto de glow/smoke
- [ ] Las partículas se mueven orgánicamente (ruido Perlin)
- [ ] Al borrar texto, las partículas desaparecen suavemente
- [ ] El rendimiento se mantiene en 60fps
- [ ] La UI es minimalista y enfocada en el efecto visual

## 8. Tech Stack

- React 19 (ya instalado)
- Canvas API nativa (sin libraries extra para partículas)
- TypeScript strict mode
- Vite (ya configurado)