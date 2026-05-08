# text-2077

React + TypeScript + Vite project with React Compiler enabled.

## Dev commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Run `tsc -b` then `vite build` |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build |

## Build pipeline order

`npm run build` runs typecheck before build: `tsc -b && vite build`

## Tech quirks

- **React Compiler**: Enabled via `babel-plugin-react-compiler`. Affects dev/build performance.
- **TypeScript version**: ~6.0.2 (not latest)
- **Vite plugins**: `@vitejs/plugin-react` + `@rolldown/plugin-babel` for compiler

## Project structure

```
src/
├── components/    # React components
├── hooks/         # Custom hooks
├── utils/        # Utilities (rasterizer, noise)
├── types/        # TypeScript types
├── App.tsx       # Main app
└── main.tsx      # Entry point
```

## No test framework

No test dependencies in package.json. Do not assume tests exist.