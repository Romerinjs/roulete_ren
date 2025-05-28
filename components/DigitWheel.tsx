'use client'

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useDigitWheel } from '@/lib/hooks/useDigitWheel';

type DigitWheelProps = {
  min: number;
  max: number;
  initialSpeed?: number;
  index: number;
  shouldRestart?: boolean;
  onStop?: (index: number, value: number) => void;
  onRestartComplete?: () => void;
  showFullRange?: boolean;
  shouldStop?: boolean;
};

export const DigitWheel = ({ 
  min, 
  max, 
  initialSpeed = 100, 
  index, 
  shouldRestart = false,
  onStop,
  onRestartComplete,
  showFullRange = false,
  shouldStop = false
}: DigitWheelProps) => {
  const { digit, isSpinning, currentSpeed, startSpinning, stopSpinning } = useDigitWheel({ 
    min, 
    max, 
    initialSpeed,
    shouldRestart,
    onRestartComplete,
    showFullRange
  });
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const wasSpinningRef = useRef<boolean>(false);

  // Detectar cuando la rueda se detiene y ejecutar callback
  useEffect(() => {
    if (wasSpinningRef.current && !isSpinning) {
      // La rueda acaba de detenerse
      if (onStop) {
        onStop(index, digit);
      }
    }
    wasSpinningRef.current = isSpinning;
  }, [isSpinning, digit, index, onStop]);

  // Crear array de números para efecto vertical (mostrar números arriba y abajo)
  const getDisplayNumbers = () => {
    const range = showFullRange ? Array.from({length: 10}, (_, i) => i) : 
                 Array.from({length: max - min + 1}, (_, i) => i + min);
    
    const currentIndex = range.indexOf(digit);
    const result = [];
    
    // Mostrar 3 números arriba, el actual, y 3 abajo
    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + range.length) % range.length;
      result.push(range[index]);
    }
    
    return result;
  };

  // Efecto de desplazamiento vertical
  useEffect(() => {
    if (wheelRef.current) {
      const speed = Math.max(50, 400 - currentSpeed);
      if (isSpinning) {
        wheelRef.current.style.animation = `verticalSpin ${speed}ms linear infinite`;
        wheelRef.current.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
      } else {
        wheelRef.current.style.animation = 'none';
        wheelRef.current.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
      }
    }
  }, [isSpinning, currentSpeed]);

  // Auto-reinicio cuando shouldRestart cambia
  useEffect(() => {
    if (shouldRestart) {
      startSpinning();
    }
  }, [shouldRestart, startSpinning]);

  // Detener cuando shouldStop es true
  useEffect(() => {
    if (shouldStop && isSpinning) {
      stopSpinning();
    }
  }, [shouldStop, isSpinning, stopSpinning, index]);

  const displayNumbers = getDisplayNumbers();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-28 h-40 md:w-36 md:h-52 bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 overflow-hidden transition-all duration-300 border-cyan-400/60 shadow-lg shadow-cyan-500/30">
        
        {/* Contenedor de números con scroll vertical */}
        <div 
          ref={wheelRef}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          {displayNumbers.map((num, idx) => (
            <div
              key={`${num}-${idx}`}
              className={cn(
                "flex items-center justify-center w-full h-full text-4xl md:text-7xl font-black transition-all duration-200",
                idx === 3 
                  ? "text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 scale-110 z-10 drop-shadow-lg" 
                  : "text-gray-500 scale-75",
                Math.abs(idx - 3) === 1 ? "text-gray-400" : "",
                Math.abs(idx - 3) >= 2 ? "text-gray-600" : ""
              )}
              style={{
                transform: `translateY(${(idx - 3) * 35}px)`,
                opacity: Math.abs(idx - 3) === 0 ? 1 : Math.max(0.2, 1 - Math.abs(idx - 3) * 0.25)
              }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Líneas guía para mostrar el área activa */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform -translate-y-1/2 z-20"></div>
        <div className="absolute inset-x-0 top-1/2 h-10 border-t border-b border-yellow-400/40 transform -translate-y-5 z-20 bg-yellow-400/5"></div>
        
        {/* Overlay gradient para profundidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-30"></div>
        
        {/* Reflejo superior */}
        <div className="absolute inset-x-0 top-3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-30"></div>
        
        {/* Glow effect cuando está girando */}
        {isSpinning && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse z-10"></div>
        )}
      </div>
      
      {/* Indicador de estado mejorado */}
      <div className={cn(
        "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border-2",
        isSpinning 
          ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/50 shadow-lg shadow-cyan-500/30 animate-pulse" 
          : "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-400/50 shadow-lg shadow-emerald-500/30"
      )}>
        {isSpinning ? "🎲 GIRANDO" : "✅ LISTA"}
      </div>
    </div>
  );
};

DigitWheel.displayName = 'DigitWheel';