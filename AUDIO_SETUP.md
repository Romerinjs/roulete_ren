# 🎵 Configuración de Audio para la Ruleta

## 📁 Cómo agregar tu archivo de audio descargado:

### Paso 1: Coloca tu archivo en la carpeta `public`
1. Ve a la carpeta `public` de tu proyecto
2. Copia tu archivo de audio descargado (puede ser `.mp3`, `.wav`, `.m4a`, etc.)
3. Renómbralo a: `slot-machine-audio.mp3`

### Paso 2: Si tu archivo tiene otro nombre
Si quieres usar un nombre diferente, edita el archivo `lib/hooks/useSlotMachineAudio.ts`:

```typescript
// Línea 8: Cambia el nombre del archivo
const AUDIO_FILE_PATH = '/tu-archivo-de-audio.mp3';
```

## 🎯 Estructura de archivos esperada:
```
tu-proyecto/
├── public/
│   └── slot-machine-audio.mp3  ← Tu archivo aquí
├── lib/
│   └── hooks/
│       └── useSlotMachineAudio.ts
└── ...
```

## 🔧 Formatos de audio soportados:
- ✅ `.mp3` (Recomendado)
- ✅ `.wav`
- ✅ `.m4a`
- ✅ `.ogg`

## 🎰 Comportamiento del audio:
- **Botón GIRAR**: Inicia el audio desde el principio
- **Botón RELOAD**: Reinicia el audio
- **Fin del juego**: El audio se detiene automáticamente
- **Loop**: El audio se reproduce en bucle mientras giran las ruedas

## 🐛 Solución de problemas:

### Si no suena el audio:
1. **Verifica la consola del navegador** (F12 → Console)
2. **Revisa que el archivo existe** en `public/slot-machine-audio.mp3`
3. **Verifica el formato** del archivo (debe ser compatible con navegadores)
4. **Prueba con otro archivo** de audio

### Mensajes de error comunes:
- `❌ Error al cargar archivo de audio` → El archivo no existe o tiene formato incorrecto
- `🔍 Verifica que el archivo existe` → Revisa la ruta del archivo
- `⚠️ No se puede reproducir audio` → Problema de permisos del navegador

## 🎵 Recomendaciones:
- **Duración**: 10-30 segundos (se reproduce en loop)
- **Volumen**: El código ajusta automáticamente a 30%
- **Calidad**: 128kbps es suficiente para efectos de sonido
- **Tamaño**: Mantén el archivo bajo 5MB para carga rápida

## 🚀 Ejemplo rápido:
1. Descarga tu audio de YouTube como MP3
2. Renómbralo a `slot-machine-audio.mp3`
3. Cópialo a la carpeta `public/`
4. ¡Listo! El audio funcionará automáticamente 