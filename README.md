# 🚀 CIDI Auto-Notas v2.0 (rocketcidi)

Extensión de Chrome para automatizar la carga masiva de calificaciones en el sistema CIDI del Gobierno de Córdoba, Argentina.

---

## ✨ NOVEDADES v2.0

- ✅ **Soporte XLSX nativo**: Lee directamente archivos Excel sin conversión
- ✅ **Múltiples materias**: Un solo archivo con todas las materias del curso
- ✅ **Detección automática**: Identifica la pestaña CIDI abierta
- ✅ **Selector de materia**: Elige qué materia procesar de las 13 disponibles
- ✅ **Conversión AUS→1**: Convierte automáticamente ausentes a nota 1
- ✅ **Interfaz mejorada**: Diseño moderno y fácil de usar
- ✅ **Identificación por DNI**: Más confiable que buscar por apellido

---

## 📦 ESTRUCTURA DEL PROYECTO

```
Robot Cidi/                    ← Carpeta a cargar en Chrome
├── manifest.json
├── popup.html
├── popup.js                   ← Lógica principal (v2.1)
├── instalar.bat               ← Descarga XLSX + genera íconos
├── libs/
│   └── xlsx.full.min.js
├── icons/                     ← Se crean al ejecutar instalar.bat
├── Con Debug/                 ← Herramientas de diagnóstico
│   ├── popup-debug.html/js    ← Reemplazar popup.* para modo debug
│   └── validador-xlsx.html    ← Validar XLSX sin instalar extensión
└── VERSION CLAUDE/            ← Archivo de referencia (ya integrado en raíz)
```

---

## 📦 ARCHIVOS DE LA EXTENSIÓN

```
Robot Cidi/
├── manifest.json              # Configuración de la extensión
├── popup.html                 # Interfaz de usuario
├── popup.js                   # Lógica principal
├── icons/
│   ├── icon16.png            # Ícono 16x16
│   ├── icon48.png            # Ícono 48x48
│   └── icon128.png           # Ícono 128x128
└── libs/
    └── xlsx.full.min.js      # Librería SheetJS
```

---

## 🔧 INSTALACIÓN

### Paso 1: Ejecutar el instalador (recomendado)

Doble click en `instalar.bat`. Descarga la librería XLSX (si falta) y genera íconos temporales.

### Paso 2: Descargar Librería XLSX (manual, si hace falta)

La extensión requiere la librería SheetJS para leer archivos Excel.

**Opción A: Descarga directa**
```bash
cd extension-chrome/libs
wget https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
```

**Opción B: Descarga manual**
1. Ir a: https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
2. Guardar como `xlsx.full.min.js` en la carpeta `libs/`

### Paso 2: Crear Íconos

Coloca tus íconos PNG en la carpeta `icons/`:
- `icon16.png` (16x16 px)
- `icon48.png` (48x48 px)
- `icon128.png` (128x128 px)

**Opción rápida:** Usar un generador online como:
- https://favicon.io/
- https://www.favicon-generator.org/

### Paso 3: Cargar en Chrome

1. Abre Chrome
2. Ve a `chrome://extensions/`
3. Activa "Modo de desarrollador" (esquina superior derecha)
4. Click en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta `Robot Cidi/` (la raíz de este proyecto)
6. ✅ La extensión aparecerá en tu barra de herramientas

---

## 📚 USO

### Flujo Completo

#### 1. Exportar desde tu Sistema

```
Sistema PHP → Exportar para CIDI → Descargar XLSX
```

El archivo tendrá esta estructura:
```
Calificaciones_CIDI_6°_2025.xlsx
├─ Hoja 1: Matematica
├─ Hoja 2: Lengua y Literatura
├─ Hoja 3: Quimica
├─ ...
└─ Hoja 13: Problematicas Éticas
```

#### 2. Navegar a CIDI

1. Abre Chrome
2. Ve a: https://gestionestudiantes.cba.gov.ar/
3. Inicia sesión
4. Navega a: **Registrar Notas**
5. Selecciona la pestaña que vas a completar:
   - Evaluaciones 1-4
   - Evaluaciones 5-8
   - JIS

#### 3. Usar la Extensión

1. **Click en el ícono** de la extensión en la barra de herramientas
2. **Cargar archivo**: Click en "Seleccionar archivo XLSX"
   - Elige tu archivo exportado
   - ✓ Se mostrarán las 13 materias disponibles
3. **Seleccionar materia**: Elige del dropdown
   - Ejemplo: "Matematica"
   - ✓ Se cargarán los estudiantes
4. **Verificar detección**: La extensión detecta automáticamente la pestaña CIDI
   - ✓ "Detectado: Evaluaciones 1-4"
   - Si no detecta: Selecciona manualmente
5. **Procesar**: Click en "Procesar Calificaciones"
   - La extensión completará los formularios automáticamente
   - Verás una barra de progreso
   - Al finalizar: Resumen de resultados

#### 4. Repetir para Otras Materias

- Cambia el dropdown a otra materia (ej: "Lengua y Literatura")
- Click "Procesar" nuevamente
- Listo ✅

---

## 🎯 CARACTERÍSTICAS TÉCNICAS

### Detección Automática de Pestaña

La extensión detecta automáticamente qué pestaña CIDI estás viendo mediante:

1. **Análisis de URL**: Busca palabras clave en la dirección
2. **Análisis de contenido**: Lee encabezados de la tabla
3. **Elementos visibles**: Identifica formularios específicos

Si no detecta correctamente, puedes seleccionar manualmente.

### Conversión AUS → 1

La extensión convierte automáticamente:
```
Valor en XLSX    →    En CIDI
────────────────────────────
"AUS"           →    "1"
"7"             →    "7"
"-"             →    (skip)
vacío           →    (skip)
```

Esto es necesario porque CIDI no interpreta el texto "AUS".

### Identificación de Estudiantes

**Prioridad de búsqueda:**
1. **Por DNI** (si el XLSX incluye columna DNI)
2. **Por nombre completo** normalizado (formato `APELLIDO, Nombre`)
3. **Por apellido** solo si hay un único candidato (evita errores)

---

## 📊 FORMATO DEL XLSX REQUERIDO

### Estructura de Cada Hoja

```
Fila 1-6: Encabezados (institución, materia, curso, fecha)
Fila 7:   Encabezados de columnas (ver abajo)
Fila 8+:  Datos de estudiantes
Fila N:   Bloque "INSTRUCCIONES:" (se ignora automáticamente)
```

### Formatos soportados (detección automática en fila 7)

**Formato actual del sistema PHP (2026)** — 1 archivo por materia:

```
Alumno | Eval 1 | Rec 1 | Eval 2 | Rec 2 | ... | JIS II | RecJIS II | Promedio | Condición
```

**Formato legacy** — múltiples materias en un solo archivo:

```
DNI | Alumno | Eval 1 | Rec 1 | ... | JIS II | RecJIS II
```

Las columnas **Promedio** y **Condición** se ignoran (las calcula CIDI).

### Columnas de calificaciones (20 en total)

```
Eval 1, Rec 1, Eval 2, Rec 2, ... Eval 8, Rec 8, JIS I, RecJIS I, JIS II, RecJIS II
```

**Importante:**
- Formato nombre: `APELLIDO, Nombre`
- Si hay DNI: sin puntos, ej. `48753027`
- Valores AUS como texto: `"AUS"` (se convierten a `1` en CIDI)
- Valores vacíos con guión: `"-"`

---

## ❓ TROUBLESHOOTING

### Problema: "No se pudo detectar la pestaña"

**Solución:**
- Asegúrate de estar en la página correcta de CIDI
- Selecciona manualmente la pestaña en la extensión
- Verifica que estés en "Registrar Notas"

### Problema: "Estudiante no encontrado"

**Causas posibles:**
- El DNI no coincide con el de CIDI
- El apellido está mal escrito
- El estudiante no está en esa materia en CIDI

**Solución:**
- Verifica que el DNI en el XLSX sea correcto
- Usa el fallback por apellido
- Verifica que el estudiante esté matriculado

### Problema: "Error leyendo archivo XLSX"

**Causas:**
- Archivo corrupto
- Formato incorrecto
- Librería xlsx.js no cargada

**Solución:**
- Vuelve a exportar el archivo desde tu sistema
- Verifica que `libs/xlsx.full.min.js` exista
- Recarga la extensión en `chrome://extensions/`

### Problema: No carga las notas

**Causas:**
- CIDI cambió su estructura HTML
- Delays muy cortos entre operaciones
- Problemas de permisos

**Solución:**
- Verifica que los selects tengan las opciones correctas
- Aumenta los delays en `popup.js` (línea con `delay(50)`)
- Verifica permisos en CIDI

---

## 🔒 SEGURIDAD Y PRIVACIDAD

### Permisos Requeridos

```json
"permissions": [
  "activeTab",      // Acceder a la pestaña activa
  "scripting"       // Inyectar scripts en CIDI
],
"host_permissions": [
  "https://gestionestudiantes.cba.gov.ar/*"  // Solo CIDI
]
```

### Datos Procesados

- ✅ Todo se procesa localmente en tu navegador
- ✅ No se envían datos a servidores externos
- ✅ Solo accede a la página de CIDI
- ✅ No guarda historial de calificaciones

---

## 🔄 ACTUALIZAR LA EXTENSIÓN

1. Reemplaza los archivos en la carpeta `extension-chrome/`
2. Ve a `chrome://extensions/`
3. Click en el botón de "Recargar" en tu extensión
4. Listo ✅

---

## 📝 CHANGELOG

### v2.1.0 (Julio 2026)
- ✨ Soporte formato PHP 2026 (sin columna DNI, 1 materia por archivo)
- ✨ Detección automática de formato (DNI+Alumno vs solo Alumno)
- ✨ Auto-selección de materia cuando el XLSX tiene una sola hoja
- ✨ Búsqueda por nombre normalizado (sin tildes) con fallback seguro por apellido
- ✨ Filtrado automático del bloque INSTRUCCIONES al final del template

### v2.0.0 (Diciembre 2024)
- ✨ Soporte nativo para XLSX
- ✨ Selector de múltiples materias
- ✨ Detección automática de pestaña CIDI
- ✨ Conversión automática AUS → 1
- ✨ Identificación por DNI
- ✨ Interfaz completamente rediseñada
- ✨ Mejor manejo de errores

### v1.0.0 (Original)
- Soporte básico para CSV
- Carga manual de datos
- Búsqueda por apellido

---

## 🆘 SOPORTE

### Recursos

- **Documentación completa**: Ver archivos en `/outputs/`
- **Sistema PHP**: `exportar_calificaciones_cidi.php`
- **Archivo de prueba**: `Calificaciones_CIDI_6°_2025.xlsx`

### Reporte de Bugs

Si encuentras problemas:

1. Abre la consola de Chrome (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Copia el mensaje de error
5. Incluye:
   - Versión de Chrome
   - Pasos para reproducir
   - Mensaje de error completo

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Descargada librería `xlsx.full.min.js`
- [ ] Creados los 3 íconos (16, 48, 128 px)
- [ ] Extensión cargada en Chrome
- [ ] Probada en página de CIDI
- [ ] Exportado archivo XLSX desde sistema PHP
- [ ] Probada carga de una materia
- [ ] Verificado que datos se cargan en CIDI

---

## 🎉 ¡TODO LISTO!

Tu extensión está lista para automatizar la carga de calificaciones en CIDI.

**Recuerda:**
- Un archivo XLSX con todas las materias
- Selecciona la materia en la extensión
- La extensión detecta automáticamente la pestaña
- Procesa materia por materia

---

**Desarrollado para IEM "SAN ANDRÉS"**  
**Versión:** 2.0.0  
**Fecha:** Diciembre 2024
