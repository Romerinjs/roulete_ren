'use client'

import { useState, useCallback, useEffect, useRef } from 'react';
import { DigitWheel } from '@/components/DigitWheel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Student } from '@/lib/types';

export function DigitWheelGame() {
  const [stoppedDigits, setStoppedDigits] = useState<Record<number, number>>({});
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [shouldStartWheels, setShouldStartWheels] = useState(false);
  const [restartCompletedCount, setRestartCompletedCount] = useState(0);
  const [stopSequence, setStopSequence] = useState<Record<number, boolean>>({});
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const FORCED_NUMBERS = [1795, 1203, 1093];
  const [forcedLeft, setForcedLeft] = useState([...FORCED_NUMBERS]);
  const FORCE_START_ATTEMPT = 5;
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Eliminar lógica de forzado, restaurar generación aleatoria estándar
  const handleStopWheel = useCallback((index: number, value: number) => {
    if (isGameComplete) {
      return;
    }
    setStoppedDigits(prev => {
      const updated = { ...prev, [index]: value };
      if (Object.keys(updated).length === 4) {
        const digits = [updated[0], updated[1], updated[2], updated[3]];
        const finalNumber = parseInt(digits.join(''), 10);
        setIsGameComplete(true);
        setIsSpinning(false);
        searchStudent(finalNumber);
        if (gameTimeoutRef.current) {
          clearTimeout(gameTimeoutRef.current);
          gameTimeoutRef.current = null;
        }
      }
      return updated;
    });
    setTimeout(() => {
      const nextWheelIndex = index + 1;
      if (nextWheelIndex < 4 && !isGameComplete) {
        setStopSequence(prev => ({
          ...prev,
          [nextWheelIndex]: true
        }));
      }
    }, getDelayForWheel(index + 1));
  }, [isGameComplete]);

  const forceCompleteGame = useCallback(() => {
    // Generar números aleatorios para ruedas faltantes
    const finalDigits = { ...stoppedDigits };
    for (let i = 0; i < 4; i++) {
      if (finalDigits[i] === undefined) {
        if (i === 0) {
          finalDigits[i] = Math.random() > 0.5 ? 1 : 2;
        } else {
          finalDigits[i] = Math.floor(Math.random() * 10);
        }
      }
    }
    setStoppedDigits(finalDigits);
    setIsGameComplete(true);
    setIsSpinning(false);
  }, [stoppedDigits]);

  const searchStudent = async (number: number) => {
    try {
      const { data, error } = await supabase
        .from('ESTUDIANTES')
        .select('*')
        .eq('NUMERO', number)
        .maybeSingle();

      if (error) {
        return;
      }

      if (data) {
        setFoundStudent(data);
      } else {
        setFoundStudent(null);
      }
    } catch (error) {
      // No log
    }
  };

  const handleWheelRestartComplete = useCallback(() => {
    setRestartCompletedCount(prev => prev + 1);
  }, []);

  const handleSpinRoulette = useCallback(() => {
    if (isSpinning) return;
    setSpinCount(prev => prev + 1);
    setIsSpinning(true);
    setStoppedDigits({});
    setIsGameComplete(false);
    setRestartCompletedCount(0);
    setStopSequence({});
    setShouldStartWheels(true);
    if (gameTimeoutRef.current) {
      clearTimeout(gameTimeoutRef.current);
    }
    gameTimeoutRef.current = setTimeout(() => {
      forceCompleteGame();
    }, 25000);
    setTimeout(() => {
      setShouldStartWheels(false);
    }, 100);
    setTimeout(() => {
      setStopSequence({ 0: true });
    }, 2000);
  }, [isSpinning, forceCompleteGame]);

  // Reiniciar los forzados si quieres repetir el ciclo después de que salgan los 3 (opcional)
  useEffect(() => {
    if (forcedLeft.length === 0 && spinCount < FORCE_START_ATTEMPT) {
      setForcedLeft([...FORCED_NUMBERS]);
    }
  }, [forcedLeft, spinCount]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (gameTimeoutRef.current) {
        clearTimeout(gameTimeoutRef.current);
      }
    };
  }, []);

  const getResultText = () => {
    if (!isGameComplete) return null;
    
    const digits = [
      stoppedDigits[0] ?? 0,
      stoppedDigits[1] ?? 0,
      stoppedDigits[2] ?? 0,
      stoppedDigits[3] ?? 0
    ];
    
    const number = parseInt(digits.join(''), 10);
    
    return number;
  };

  // Función para obtener el delay según la rueda
  const getDelayForWheel = (wheelIndex: number): number => {
    switch (wheelIndex) {
      case 1: return 1000;  // Segunda rueda: 1 segundo
      case 2: return 2500;  // Tercera rueda: 2.5 segundos (más suspense)
      case 3: return 4000;  // Cuarta rueda: 4 segundos (máximo suspense)
      default: return 1000;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Header principal */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
          🎓 DÍA DEL ESTUDIANTE 🎓
        </h1>
        <h2 className="text-xl md:text-2xl text-cyan-300 font-semibold mb-2">
          Instituto Tecnológico del Putumayo
        </h2>
        <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
      </div>

      {/* Contenedor principal de la ruleta */}
      <div className={cn(
        "bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl border border-cyan-500/30 transition-all duration-700",
        isGameComplete ? "scale-105 shadow-cyan-500/50" : "",
        isSpinning ? "shadow-purple-500/50" : ""
      )}>
        
        {/* Título dinámico del juego */}
        <h3 className="text-2xl md:text-3xl text-center mb-8 font-bold">
          {isSpinning ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse">
              🎲 ¡Girando la Ruleta de la Suerte! 🎲
            </span>
          ) : isGameComplete ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              🏆 ¡Tu Número de la Suerte! 🏆
            </span>
          ) : (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              🎯 Ruleta de la Suerte Estudiantil 🎯
            </span>
          )}
        </h3>
        
        {/* Layout principal con ruedas y botón */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-12">
          {/* Contenedor de ruedas */}
          <div className="flex flex-row justify-center gap-6 md:gap-8">
            {/* Primera rueda */}
            <DigitWheel 
              min={1} 
              max={2} 
              index={0} 
              initialSpeed={50}
              shouldRestart={shouldStartWheels}
              onStop={handleStopWheel}
              onRestartComplete={handleWheelRestartComplete}
              showFullRange={true}
              shouldStop={stopSequence[0] || false}
            />
            
            {/* Segunda rueda */}
            <DigitWheel 
              min={0} 
              max={9} 
              index={1} 
              initialSpeed={80}
              shouldRestart={shouldStartWheels}
              onStop={handleStopWheel}
              onRestartComplete={handleWheelRestartComplete}
              shouldStop={stopSequence[1] || false}
            />
            
            {/* Tercera rueda */}
            <DigitWheel 
              min={0} 
              max={9} 
              index={2} 
              initialSpeed={100}
              shouldRestart={shouldStartWheels}
              onStop={handleStopWheel}
              onRestartComplete={handleWheelRestartComplete}
              shouldStop={stopSequence[2] || false}
            />
            
            {/* Cuarta rueda */}
            <DigitWheel 
              min={0} 
              max={9} 
              index={3} 
              initialSpeed={120}
              shouldRestart={shouldStartWheels}
              onStop={handleStopWheel}
              onRestartComplete={handleWheelRestartComplete}
              shouldStop={stopSequence[3] || false}
            />
          </div>
          
          {/* Botón de girar en el lado derecho */}
          {!isSpinning && !isGameComplete && (
            <div className="flex flex-col items-center justify-center lg:ml-8">
              <Button 
                onClick={handleSpinRoulette}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg lg:text-xl px-8 lg:px-12 py-3 lg:py-4 rounded-2xl shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 border-2 border-emerald-400/50 whitespace-nowrap"
              >
                🎲 ¡Girar Ruleta! 🎲
              </Button>
            </div>
          )}
        </div>
        
        {/* Indicador de progreso durante el giro */}
        {isSpinning && !isGameComplete && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-4 text-cyan-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-cyan-400"></div>
              <span className="text-xl font-bold">¡Las ruedas están girando!</span>
              <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-cyan-400"></div>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
        
        {/* Resultado final espectacular */}
        {isGameComplete && (
          <div className="text-center space-y-8 animate-fade-in">
            {/* Número ganador gigante */}
            <div className="relative">
              <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse drop-shadow-2xl">
                {getResultText()}
              </div>
              <div className="absolute inset-0 text-8xl md:text-9xl font-black text-yellow-400/20 blur-lg">
                {getResultText()}
              </div>
            </div>
            {/* Mensaje de celebración */}
            <div className="space-y-4">
              {foundStudent ? (
                <div className="space-y-2">
                  <h4 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    🎉 ¡Felicidades! 🎉
                  </h4>
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {foundStudent.ESTUDIANTE}
                  </div>
                  <div className="text-xl md:text-2xl text-cyan-300">
                    {foundStudent.PROG_Y_SEM}
                  </div>
                </div>
              ) : (
                <h4 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  🎉 ¡Tu Número de la Suerte! 🎉
                </h4>
              )}
            </div>
            {/* Efectos visuales */}
            <div className="flex justify-center space-x-4 text-4xl animate-bounce">
              <span>🎓</span>
              <span>✨</span>
              <span>🎊</span>
              <span>🌟</span>
              <span>🎉</span>
            </div>
            <Button 
              onClick={handleSpinRoulette}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 border-2 border-purple-400/50 mt-8"
            >
              🔄 ¡Girar de Nuevo! 🔄
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}