import { useRef, useCallback, useEffect, useState } from 'react';

export const useSlotMachineAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🎵 Ruta del archivo de audio en la carpeta public
  const AUDIO_FILE_PATH = '/slot-machine.MP3'; // Cambia este nombre por tu archivo

  // Inicializar el audio
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        console.log('🎰 Inicializando audio de slot machine...');
        
        // Crear elemento de audio
        audioRef.current = new Audio();
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        audioRef.current.preload = 'auto';
        
        // Usar archivo de audio local
        console.log('🔊 Cargando archivo de audio:', AUDIO_FILE_PATH);
        audioRef.current.src = AUDIO_FILE_PATH;
        
        audioRef.current.onloadeddata = () => {
          console.log('✅ Archivo de audio cargado correctamente');
          setAudioLoaded(true);
        };

        audioRef.current.onerror = (error) => {
          console.error('❌ Error al cargar archivo de audio:', error);
          console.error('🔍 Verifica que el archivo existe en public/' + AUDIO_FILE_PATH.substring(1));
          setAudioLoaded(false);
        };

        audioRef.current.oncanplaythrough = () => {
          console.log('🎵 Audio listo para reproducir');
        };

      } catch (error) {
        console.error('Error al inicializar audio:', error);
        setAudioLoaded(false);
      }
    };

    initializeAudio();

    // Limpiar al desmontar
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Reproducir sonido
  const playSound = useCallback(() => {
    console.log('🎰 playSound llamado - Estado actual:', {
      audioRef: !!audioRef.current,
      isPlaying: isPlayingRef.current,
      audioLoaded,
      audioSrc: audioRef.current?.src || 'sin source'
    });
    
    if (audioRef.current && !isPlayingRef.current && audioLoaded) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('✅ Audio iniciado correctamente');
          isPlayingRef.current = true;
        }).catch((error) => {
          console.error('❌ Error al reproducir audio:', error);
          console.log('🔄 Intentando reproducir de nuevo...');
          
          // Intentar reproducir de nuevo después de un breve delay
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().then(() => {
                console.log('✅ Audio iniciado en segundo intento');
                isPlayingRef.current = true;
              }).catch((err) => {
                console.error('❌ Segundo intento falló:', err);
              });
            }
          }, 100);
        });
      }
      
      console.log('🎰 Comando de reproducción enviado');
    } else {
      console.warn('⚠️ No se puede reproducir audio:', {
        noAudioRef: !audioRef.current,
        isAlreadyPlaying: isPlayingRef.current,
        audioNotLoaded: !audioLoaded
      });
    }
  }, [audioLoaded]);

  // Detener sonido con fade out suave
  const stopSound = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      console.log('🔄 Iniciando fade out del audio...');
      
      // Limpiar cualquier fade anterior
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      const initialVolume = audioRef.current.volume;
      const fadeDuration = 2000; // 2 segundos de fade
      const fadeSteps = 50;
      const volumeStep = initialVolume / fadeSteps;
      const timeStep = fadeDuration / fadeSteps;
      
      let currentStep = 0;
      
      fadeIntervalRef.current = setInterval(() => {
        if (audioRef.current && currentStep < fadeSteps) {
          currentStep++;
          const newVolume = initialVolume - (volumeStep * currentStep);
          audioRef.current.volume = Math.max(0, newVolume);
          
          // Si llegamos al final del fade
          if (currentStep >= fadeSteps || audioRef.current.volume <= 0) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 0.3; // Restaurar volumen original
            isPlayingRef.current = false;
            
            if (fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }
            
            console.log('⏹️ Sonido de slot machine detenido con fade out');
          }
        }
      }, timeStep);
    }
  }, []);

  // Detener sonido inmediatamente (para casos especiales)
  const stopSoundImmediately = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    
    if (audioRef.current && isPlayingRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      isPlayingRef.current = false;
      console.log('⏹️ Sonido de slot machine detenido inmediatamente');
    }
  }, []);

  // Reiniciar sonido
  const restartSound = useCallback(() => {
    console.log('🔄 Reiniciando sonido...');
    stopSoundImmediately(); // Usar stop inmediato para reinicio rápido
    setTimeout(() => {
      playSound();
    }, 100);
  }, [playSound, stopSoundImmediately]);

  // Verificar si está reproduciendo
  const isPlaying = useCallback(() => {
    return isPlayingRef.current;
  }, []);

  return {
    playSound,
    stopSound,
    stopSoundImmediately,
    restartSound,
    isPlaying,
    audioLoaded,
  };
}; 