import { useState, useMemo, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

interface GlitchBlock {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  xOffset: number;
  duration: number;
  delay: number;
  repeatDelay: number;
}

interface GlitchLine {
  id: number;
  top: number;
  duration: number;
  delay: number;
  repeatDelay: number;
}

// Generate deterministic random values (seeded for consistency)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

interface GlitchLayerProps {
  chars: string[];
  layerClass: string;
  transform: string;
  opacity: number;
}

const GlitchLayer = memo(function GlitchLayer({ chars, layerClass, transform, opacity }: GlitchLayerProps) {
  return (
    <div className={layerClass} style={{ transform, opacity }}>
      {chars.map((char, i) => (
        <span key={`${layerClass}-${i}`} className="glitch-char">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
});

function App() {
  const [text, setText] = useState('');
  const glitchIntervalRef = useRef<number | null>(null);

  const displayText = useMemo(() => {
    return text.split('').filter(c => c.trim() || c === ' ');
  }, [text]);

  // Glitch effect using ref instead of state to avoid re-renders
  const glitchActiveRef = useRef(false);

  // Generate glitch blocks with deterministic values
  const glitchBlocks = useMemo((): GlitchBlock[] => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: seededRandom(i * 1.1) * 100,
      top: seededRandom(i * 2.2) * 100,
      width: 40 + seededRandom(i * 3.3) * 120,
      height: 8 + seededRandom(i * 4.4) * 24,
      xOffset: seededRandom(i * 5.5) * 100 - 50,
      duration: 0.15,
      delay: seededRandom(i * 6.6) * 0.3,
      repeatDelay: 1 + seededRandom(i * 7.7) * 2
    }));
  }, []);

  // Generate glitch lines with deterministic values
  const glitchLines = useMemo((): GlitchLine[] => {
    return [...Array(8)].map((_, i) => ({
      id: i,
      top: 15 + seededRandom(i * 8.8) * 70,
      duration: 0.2 + seededRandom(i * 9.9) * 0.1,
      delay: seededRandom(i * 10.1) * 0.5,
      repeatDelay: 0.5 + seededRandom(i * 11.2) * 2
    }));
  }, []);

  // Glitch state derived from text presence
  const glitchActive = text.length > 0;

  // Toggle glitch using requestAnimationFrame for smooth animation
  useEffect(() => {
    if (text) {
      const toggle = () => {
        glitchActiveRef.current = !glitchActiveRef.current;
      };
      const randomDelay = 100 + seededRandom(Date.now()) * 200;
      glitchIntervalRef.current = window.setInterval(toggle, randomDelay);
      return () => {
        if (glitchIntervalRef.current) {
          clearInterval(glitchIntervalRef.current);
        }
      };
    }
  }, [text]);

  return (
    <div className="app-container">
      {/* Screen effects */}
      <div className="screen-effects">
        <div className="scanlines" />
        <div className="noise" />
        <div className="vignette" />
        <div className="chromatic-aberration" />
      </div>
      
      <div className="canvas-wrapper">
        <AnimatePresence mode="wait">
          {text ? (
            <motion.div
              key={text}
              className="text-display"
              initial={{ opacity: 0, filter: 'blur(20px)' }}
              animate={{ 
                opacity: 1, 
                filter: 'blur(0px)',
                x: glitchActive ? [0, -3, 3, -2, 0] : 0
              }}
              exit={{ 
                opacity: 0,
                filter: 'blur(20px)',
                transition: { duration: 0.1 } 
              }}
            >
              {/* RGB Split Layers */}
              <div className="glitch-container">
                <GlitchLayer
                  chars={displayText}
                  layerClass="glitch-layer magenta"
                  transform={`translate(${glitchActive ? -4 : 0}px, 0)`}
                  opacity={glitchActive ? 0.9 : 0}
                />
                <GlitchLayer
                  chars={displayText}
                  layerClass="glitch-layer cyan"
                  transform={`translate(${glitchActive ? 4 : 0}px, 0)`}
                  opacity={glitchActive ? 0.7 : 0}
                />
                <GlitchLayer
                  chars={displayText}
                  layerClass="glitch-layer yellow"
                  transform={`translate(0, ${glitchActive ? 2 : 0}px)`}
                  opacity={glitchActive ? 0.5 : 0}
                />
              </div>
              
              {/* Texto principal */}
              <div className="text-main">
                {displayText.map((char, i) => (
                  <motion.span
                    key={`main-${i}`}
                    className="glitch-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </div>
              
              {/* Bloques de corrupción grandes */}
              {glitchBlocks.map((block) => (
                <motion.div
                  key={`corrupt-${block.id}`}
                  className="corrupt-block"
                  style={{
                    left: `${block.left}%`,
                    top: `${block.top}%`,
                    width: `${block.width}px`,
                    height: `${block.height}px`,
                  }}
                  animate={{
                    x: [0, block.xOffset],
                    opacity: [0, 0.9, 0],
                    scaleX: [0, 1, 0]
                  }}
                  transition={{
                    duration: block.duration,
                    delay: block.delay,
                    repeat: Infinity,
                    repeatDelay: block.repeatDelay
                  }}
                />
              ))}

              {/* Líneas de glitch horizontales */}
              {glitchLines.map((line) => (
                <motion.div
                  key={`line-${line.id}`}
                  className="glitch-h-line"
                  style={{
                    top: `${line.top}%`,
                  }}
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: line.duration,
                    delay: line.delay,
                    repeat: Infinity,
                    repeatDelay: line.repeatDelay
                  }}
                />
              ))}
              
              {/* Distorsión de áreas */}
              <motion.div
                className="area-distort"
                style={{
                  left: '10%',
                  top: '20%',
                }}
                animate={{
                  clipPath: [
                    'inset(0% 0% 0% 0%)',
                    'inset(10% 0% 20% 0%)',
                    'inset(0% 10% 0% 10%)',
                    'inset(0% 0% 0% 0%)'
                  ]
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.3
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <span key={`area-${i}`} className="area-text">
                    {text.slice(0, 5)}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Terminal frame */}
              <div className="terminal-frame">
                <div className="terminal-titlebar">
                  <div className="terminal-buttons">
                    <span className="btn close" />
                    <span className="btn minimize" />
                    <span className="btn maximize" />
                  </div>
                  <span className="terminal-title">root@cyberpunk:~</span>
                </div>
                
                <div className="terminal-body">
                  {/* Boot sequence */}
                  <div className="boot-text">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="system-msg">INITIALIZING NEURAL LINK...</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="system-msg ok">CONNECTION ESTABLISHED</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span className="system-msg">AWAITING INPUT...</span>
                    </motion.div>
                  </div>
                  
                  {/* ASCII logo */}
                  <pre className="ascii-logo">{`
 ███╗   ███╗ █████╗  ██████╗ ██╗  ██╗
 ████╗ ████║██╔══██╗██╔═══██╗██║ ██╔╝
 ██╔████╔██║███████║██║   ██║█████╔╝ 
 ██║╚██╔██║██╔══██║██║   ██║██╔═██╗ 
 ██║ ╚═╗ ██║██║  ██║╚██████╔╝██║  ██╗
 ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
                  `}</pre>
                  
                  {/* Prompt parpadeante */}
                  <motion.div
                    className="cmd-prompt"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <span className="prompt符号">$</span>
                    <span className="prompt-msg">escribe para ejecutar</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="input-wrapper">
        <motion.div
          className="input-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Prompt decorativo */}
          <span className="input-prompt">
            <span className="prompt-bracket">[</span>
            <span className="prompt-user">root</span>
            <span className="prompt-bracket">@</span>
            <span className="prompt-host">cyberpunk</span>
            <span className="prompt-bracket">]</span>
            <span className="prompt-path">~</span>
          </span>
          
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ingresa_comando"
            spellCheck={false}
            autoComplete="off"
            className="text-input"
          />
          
          {/* Cursor de bloque */}
          <motion.span
            className="block-cursor"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </motion.div>
        
        {/*Decoración de terminal */}
        <div className="input-status">
          <span className="status-dot" />
          <span>SISTEMA ACTIVO</span>
        </div>
      </div>
    </div>
  );
}

export default App;