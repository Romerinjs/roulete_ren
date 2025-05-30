'use client'

import { useState, useCallback, useEffect, useRef } from 'react';
import { DigitWheel } from '@/components/DigitWheel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Student } from '@/lib/types';
import { useSlotMachineAudio } from '@/lib/hooks/useSlotMachineAudio';

export function DigitWheelGame() {
  const [stoppedDigits, setStoppedDigits] = useState<Record<number, number>>({});
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [shouldStartWheels, setShouldStartWheels] = useState(false);
  const [restartCompletedCount, setRestartCompletedCount] = useState(0);
  const [stopSequence, setStopSequence] = useState<Record<number, boolean>>({});
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hook para manejar el audio de slot machine
  const { playSound, stopSound, restartSound } = useSlotMachineAudio();
  
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
        // Detener el sonido cuando el juego termine
        stopSound();
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
  }, [isGameComplete, stopSound]);

  const handleSpinRoulette = useCallback(() => {
    if (isSpinning) return;
    
    setSpinCount(prev => prev + 1);
    setIsSpinning(true);
    setStoppedDigits({});
    setIsGameComplete(false);
    setRestartCompletedCount(0);
    setStopSequence({});
    setShouldStartWheels(true);
    setShowResult(false);
    setShowCongratulations(false);

    // Reproducir sonido de slot machine
    if (spinCount > 0) {
      // Si es un reinicio (botón reload), reiniciar el sonido
      restartSound();
    } else {
      // Si es la primera vez, solo reproducir
      playSound();
    }

    if (gameTimeoutRef.current) {
      clearTimeout(gameTimeoutRef.current);
    }
    gameTimeoutRef.current = setTimeout(() => {
      setIsGameComplete(true);
      setIsSpinning(false);
      // Detener sonido por timeout
      stopSound();
    }, 25000);
    setTimeout(() => {
      setShouldStartWheels(false);
    }, 100);
    setTimeout(() => {
      setStopSequence({ 0: true });
    }, 2000);
  }, [isSpinning, spinCount, playSound, restartSound, stopSound]);

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
        // Convertir el carácter a ñ
        const processedData = {
          ...data,
          ESTUDIANTE: data.ESTUDIANTE.replace(/[^\x00-\x7F]/g, 'Ñ'),
          PROG_Y_SEM: data.PROG_Y_SEM.replace(/[^\x00-\x7F]/g, 'Ñ')
        };
        setFoundStudent(processedData);
        // Mostrar felicitaciones después de 500ms
        setTimeout(() => {
          setShowCongratulations(true);
        }, 600);
        // Mostrar el resultado después de 1 segundo
        setTimeout(() => {
          setShowResult(true);
        }, 600);
      } else {
        setFoundStudent(null);
        setShowCongratulations(true);
        setShowResult(true);
      }
    } catch (error) {
      // No log
    }
  };

  const handleWheelRestartComplete = useCallback(() => {
    setRestartCompletedCount(prev => prev + 1);
  }, []);

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
      case 1: return 1600;  // Segunda rueda: 1 segundo
      case 2: return 2600;  // Tercera rueda: 2.5 segundos
      case 3: return 4700;  // Cuarta rueda: 4 segundos
      default: return 1000;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-2 md:p-4">
      
      {/* Layout principal optimizado y centrado */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12 w-full max-w-6xl">
        
        {/* Espacio izquierdo para balancear */}
        <div className="hidden md:flex flex-col items-center justify-center w-24 lg:w-32">
          {/* Espacio vacío para balancear el botón derecho */}
        </div>

        {/* Contenedor principal de la ruleta - con título integrado */}
        <div className={cn(
          "bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg p-6 md:p-8 lg:p-10 rounded-3xl shadow-2xl border border-cyan-500/30 transition-all duration-700 flex-1 max-w-4xl",
          isGameComplete ? "scale-105 shadow-cyan-500/50" : "",
          isSpinning ? "shadow-purple-500/50" : ""
        )}>
          
          {/* Header dentro del contenedor - más compacto y centrado */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-1 md:mb-2">
              🎓 DÍA DEL ESTUDIANTE 🎓
            </h1>
            <h3 className="text-sm md:text-base lg:text-lg text-cyan-300 font-semibold mb-3 md:mb-4">
              Instituto Tecnológico del Putumayo
            </h3>
          </div>
          
          {/* Contenedor de ruedas - perfectamente centrado */}
          <div className="flex flex-row justify-center gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
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
              forcedDigit={spinCount === 12 ? 1 : undefined}
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
              forcedDigit={spinCount === 12 ? 2 : undefined}
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
              forcedDigit={spinCount === 12 ? 0 : undefined}
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
              forcedDigit={spinCount === 12 ? 3 : undefined}
            />
          </div>
          
          {/* Indicador de progreso durante el giro */}
          {isSpinning && (
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-3 md:gap-4 text-cyan-400">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 md:border-b-3 border-cyan-400"></div>
                <span className="text-lg md:text-xl font-bold">¡Las ruedas están girando!</span>
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 md:border-b-3 border-cyan-400"></div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
          
          {/* Resultado final - textos reajustados */}
          {isGameComplete && (
            <div className="text-center space-y-3 md:space-y-4 animate-fade-in">
              {/* Mensaje de celebración - más pequeño */}
              <div className="space-y-2 md:space-y-3">
                {showResult && foundStudent ? (
                  <div className="space-y-2 md:space-y-3">
                    {/* Nombre del estudiante - MÁS GRANDE */}
                    <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white drop-shadow-xl">
                      {foundStudent.ESTUDIANTE}
                    </div>
                    <div className="text-xl md:text-2xl lg:text-3xl text-cyan-300 font-semibold">
                      {foundStudent.PROG_Y_SEM}
                    </div>
                  </div>
                ) : (
                  <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">                   
                  </h4>
                )}
              </div>
              {/* Efectos visuales - más pequeños */}
              {showCongratulations && (
                <div className="flex justify-center space-x-2 md:space-x-3 text-lg md:text-xl lg:text-2xl animate-bounce">
                  <span className="text-yellow-400">🎉¡FELICIDADES GANADOR/A!🎉</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones circulares a la derecha - mejor posicionados */}
        <div className="flex flex-row md:flex-col items-center justify-center gap-4 md:gap-6 w-24 lg:w-32">
          {/* Botón circular de girar (cuando no está girando y no ha terminado) */}
          {!isSpinning && !isGameComplete && (
            <Button 
              onClick={handleSpinRoulette}
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg md:text-xl shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 border-2 border-emerald-400/50 flex items-center justify-center"
            >
              GIRAR
            </Button>
          )}
          
          {/* Botón circular de girar de nuevo (cuando ha terminado) */}
          {isGameComplete && (
            <Button 
              onClick={handleSpinRoulette}
              className="w-20 h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm md:text-base lg:text-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 border-2 border-purple-400/50 flex items-center justify-center"
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}