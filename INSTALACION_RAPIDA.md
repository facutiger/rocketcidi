# ⚡ GUÍA RÁPIDA - INSTALACIÓN EN 5 MINUTOS

## 📦 LO QUE TIENES

```
Robot Cidi/              ← carpeta a cargar en Chrome
├── manifest.json ✅
├── popup.html / popup.js ✅ (v2.1)
├── instalar.bat ✅
├── libs/xlsx.full.min.js ✅
└── icons/               ← ejecutar instalar.bat si faltan
```

---

## 🚀 PASOS RÁPIDOS

### 1️⃣ Ejecutar instalador (1 minuto)

Doble click en **`instalar.bat`** en la raíz del proyecto.

### 1️⃣-bis Descargar Librería XLSX manualmente (si hace falta)

**Opción A - Comando (Linux/Mac):**
```bash
cd extension-chrome
mkdir -p libs
cd libs
wget https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
```

**Opción B - Manual (Windows/cualquier SO):**
1. Abrir: https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
2. Ctrl+S → Guardar como `xlsx.full.min.js`
3. Mover a carpeta `extension-chrome/libs/`

---

### 2️⃣ Crear Íconos (2 minutos)

**Opción A - Online (Recomendado):**
1. Ir a: https://favicon.io/favicon-generator/
2. Escribir: "CIDI"
3. Elegir color: Azul (#667eea)
4. Descargar
5. Renombrar a: `icon16.png`, `icon48.png`, `icon128.png`
6. Copiar a carpeta `extension-chrome/icons/`

**Opción B - Usar Imagen:**
1. Tener una imagen cuadrada (ej: logo de la escuela)
2. Redimensionar a 16x16, 48x48, 128x128
3. Guardar en `extension-chrome/icons/`

**Opción C - Temporales (para testing):**
```bash
cd extension-chrome
mkdir icons
# Crear iconos temporales (cuadrados de color)
# En Windows: Usa Paint
# En Mac: Usa Preview
# En Linux: Usa GIMP
```

---

### 3️⃣ Instalar en Chrome (1 minuto)

1. Abrir Chrome
2. Ir a: `chrome://extensions/`
3. Activar switch: **"Modo de desarrollador"** (arriba a la derecha)
4. Click: **"Cargar extensión sin empaquetar"**
5. Seleccionar carpeta: `extension-chrome/`
6. ✅ ¡Listo!

**Verás:**
```
CIDI Auto-Notas
v2.0.0
🔵 Habilitada
```

---

## ✅ VERIFICACIÓN RÁPIDA

### Paso 1: Verificar Archivos

```bash
cd extension-chrome
ls -la

# Deberías ver:
# manifest.json
# popup.html
# popup.js
# README.md
# icons/icon16.png
# icons/icon48.png
# icons/icon128.png
# libs/xlsx.full.min.js
```

### Paso 2: Probar Extensión

1. Click en el ícono de la extensión
2. Deberías ver:
   ```
   🚀 CIDI Auto-Notas
   Carga masiva de calificaciones v2.0
   ```
3. Interfaz completa visible ✅

### Paso 3: Probar con Archivo

1. Cargar tu XLSX exportado
2. Ver selector de materias poblado
3. Seleccionar una materia
4. Ver cantidad de estudiantes

---

## 🔧 SI ALGO FALLA

### Error: "Failed to load extension"

**Causa:** Falta archivo o sintaxis incorrecta

**Solución:**
```bash
# Verificar que todos los archivos existen
ls manifest.json  # Debe existir
ls popup.html     # Debe existir
ls popup.js       # Debe existir
ls libs/xlsx.full.min.js  # Debe existir
```

### Error: "XLSX is not defined"

**Causa:** Falta librería xlsx.full.min.js

**Solución:**
- Descargar de nuevo la librería
- Verificar que está en `libs/xlsx.full.min.js`
- Recargar extensión

### Error: No aparece ícono

**Causa:** Faltan archivos de íconos

**Solución:**
- Crear íconos con cualquier herramienta
- O usar íconos temporales
- Recargar extensión

---

## 🎯 PRÓXIMO PASO

Una vez instalada:

1. **Exportar desde tu sistema PHP:**
   - Ir a "Exportar para CIDI"
   - Descargar XLSX

2. **Ir a CIDI:**
   - Abrir https://gestionestudiantes.cba.gov.ar/
   - Login
   - Ir a "Registrar Notas"
   - Seleccionar pestaña (Eval 1-4, 5-8, o JIS)

3. **Usar extensión:**
   - Click en ícono
   - Cargar XLSX
   - Seleccionar materia
   - Procesar

---

## 📞 AYUDA RÁPIDA

### Problema Común #1: No detecta pestaña

**Solución:** Selecciona manualmente el checkbox correspondiente

### Problema Común #2: No encuentra estudiantes

**Solución:** Verifica que:
- Estás en la página correcta de CIDI
- El curso coincide
- Los DNI están correctos

### Problema Común #3: No carga las notas

**Solución:**
- Asegúrate de hacer click en "Procesar"
- Espera a que termine (barra de progreso 100%)
- Verifica que CIDI no tenga errores

---

## ✅ CHECKLIST FINAL

Antes de usar en producción:

- [ ] Librería XLSX descargada
- [ ] Íconos creados (3 archivos)
- [ ] Extensión cargada en Chrome
- [ ] Probada en página de CIDI de prueba
- [ ] Exportado XLSX desde tu sistema
- [ ] Probada con 1 materia
- [ ] Probada con 1 estudiante
- [ ] Verificado que datos se cargan
- [ ] Docentes capacitados en uso

---

## 🎉 ¡YA PUEDES USAR LA EXTENSIÓN!

**Tiempo total de instalación:** ~5 minutos

**Siguiente:** Leer `README.md` para detalles completos

---

**¿Problemas?** Revisa la consola de Chrome (F12 → Console)
