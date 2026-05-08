# TEXT_2077

Cyberpunk 2077 inspired text visualizer - Transform your text into glitchy particle art with retro-futuristic aesthetics.

![Cyberpunk](https://img.shields.io/badge/Cyberpunk-2077-ff0080?style=flat&logo=)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat&logo=vite)

## Features

- **Text-to-Particles**: Convert text input into animated particle systems
- **Glitch Effects**: RGB split, corruption blocks, horizontal glitch lines
- **CRT Screen Effects**: Scanlines, noise, vignette, chromatic aberration
- **Terminal UI**: Retro-futuristic input with blinking cursor
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Reduced motion support, high contrast mode

## Tech Stack

- React 19 with React Compiler
- TypeScript ~6.0
- Vite 8
- Framer Motion for animations
- Canvas API for particle rendering

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:5173`

### Build

```bash
npm run build
```

Builds for production. Output in `dist/`

### Lint

```bash
npm run lint
```

Runs ESLint with React Hooks and TypeScript rules

### Preview

```bash
npm run preview
```

Preview production build locally

## Project Structure

```
src/
├── components/
│   ├── ParticleCanvas.tsx   # Canvas-based particle renderer
│   └── TextInput.tsx       # Terminal-style input component
├── hooks/
│   ├── useParticleAnimation.ts  # Animation loop hook
│   └── useTextToParticles.ts    # Text-to-particles conversion
├── utils/
│   ├── textRasterizer.ts   # Canvas text to points
│   └── noise.ts           # Perlin noise for organic movement
├── types/
│   └── particle.ts        # TypeScript types
├── App.tsx               # Main application component
├── main.tsx              # Entry point
├── App.css               # Component styles
└── index.css             # Global styles & CSS variables
```

## Design System

### Colors (CSS Variables)

```css
--cp-bg-deep: #030303;      /* Deep black background */
--cp-magenta: #ff0080;      /* Primary accent */
--cp-cyan: #00ffff;         /* Secondary accent */
--cp-yellow: #ffff00;      /* Tertiary accent */
--cp-green: #00ff88;        /* Status/positive */
```

### Typography

- **Display**: Orbitron (futuristic headings)
- **Terminal**: JetBrains Mono (code/UI)
- **Serif**: Cormorant Garamond (elegant accents)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES2023+ and WebGL support for canvas particles.

## Performance Notes

- React Compiler enabled for optimized rendering
- Particle count capped at 1200 for smooth animation
- Deterministic randomness via seeded values
- Reduced effects on mobile for better performance

## License

MIT