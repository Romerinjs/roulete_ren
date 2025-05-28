import { useState, useEffect, useRef, useCallback } from 'react';

type UseDigitWheelProps = {
  min: number;
  max: number;
  initialSpeed?: number;
  shouldRestart?: boolean;
  onRestartComplete?: () => void;
  showFullRange?: boolean;
};

export const useDigitWheel = ({ 
  min, 
  max, 
  initialSpeed = 100, 
  shouldRestart = false,
  onRestartComplete,
  showFullRange = false
}: UseDigitWheelProps) => {
  const [digit, setDigit] = useState<number>(min);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(initialSpeed);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalDigitRef = useRef<number | null>(null);

  const generateRandomDigitForDisplay = useCallback(() => {
    if (showFullRange) {
      return Math.floor(Math.random() * 10);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [min, max, showFullRange]);

  const generateFinalDigit = useCallback(() => {
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
  }, [min, max]);

  const startSpinning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Generar el número final al inicio
    finalDigitRef.current = generateFinalDigit();
    
    setIsSpinning(true);
    setCurrentSpeed(initialSpeed);

    intervalRef.current = setInterval(() => {
      setDigit(generateRandomDigitForDisplay());
    }, initialSpeed);
  }, [generateRandomDigitForDisplay, generateFinalDigit, initialSpeed]);

  const stopSpinning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const finalDigit = finalDigitRef.current || generateFinalDigit();
    
    // CRÍTICO: Establecer el dígito ANTES de cambiar isSpinning
    setDigit(finalDigit);
    setIsSpinning(false);
  }, [generateFinalDigit]);

  const restart = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    finalDigitRef.current = null;
    setIsSpinning(false);
    setDigit(min);
    setCurrentSpeed(initialSpeed);
  }, [min, initialSpeed]);

  useEffect(() => {
    if (shouldRestart) {
      restart();
      if (onRestartComplete) {
        onRestartComplete();
      }
    }
  }, [shouldRestart, restart, onRestartComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    digit,
    isSpinning,
    currentSpeed,
    startSpinning,
    stopSpinning,
    restart,
    getFinalDigit: () => {
      // CRÍTICO: Siempre devolver el valor actual mostrado
      return digit;
    }
  };
};