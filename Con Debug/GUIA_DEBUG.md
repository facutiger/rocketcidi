# 🐛 GUÍA DE TROUBLESHOOTING - CIDI AUTO-NOTAS

## 🎯 VERSIÓN DEBUG ACTIVADA

Has activado la **versión DEBUG** de CIDI Auto-Notas que incluye:

- ✅ **Panel de logs en tiempo real** dentro de la extensión
- ✅ **Logs detallados en consola** de Chrome
- ✅ **Exportación de logs** para compartir
- ✅ **Validación de estructura** de archivos XLSX
- ✅ **Información detallada** de cada paso

---

## 📋 LISTA DE VERIFICACIÓN RÁPIDA

Antes de empezar, verifica:

### ✅ Instalación Correcta

```bash
extension-chrome/
├── manifest.json          ✅ Debe existir
├── popup-debug.html       ✅ Debe existir  
├── popup-debug.js         ✅ Debe existir
├── libs/
│   └── xlsx.full.min.js   ✅ CRÍTICO - Debe existir
└── icons/
    ├── icon16.png         ✅ Debe existir
    ├── icon48.png         ✅ Debe existir
    └── icon128.png        ✅ Debe existir
```

### ✅ Extensión Cargada en Chrome

1. Abre Chrome → `chrome://extensions`
2. Activa **"Modo de desarrollador"** (esquina superior derecha)
3. Click en **"Cargar extensión sin empaquetar"**
4. Selecciona la carpeta `extension-chrome/`
5. Verifica que aparezca **"CIDI Auto-Notas v2.0 DEBUG MODE"**

### ✅ Página CIDI Abierta

1. Navega a: `https://gestionestudiantes.cba.gov.ar`
2. Inicia sesión
3. Ve a la sección de **calificaciones**
4. Abre la extensión (click en el ícono)

---

## 🔍 CÓMO USAR EL MODO DEBUG

### Paso 1: Abrir Consola de Chrome

**Opción A: Consola del Navegador**
1. Presiona `F12` (o `Ctrl+Shift+I` en Windows/Linux, `Cmd+Option+I` en Mac)
2. Ve a la pestaña **"Console"**
3. Aquí verás logs detallados de CIDI y de la página

**Opción B: Consola de la Extensión**
1. Ve a `chrome://extensions`
2. Busca **"CIDI Auto-Notas"**
3. Click en **"background page"** o **"service worker"**
4. Se abre una consola específica de la extensión

### Paso 2: Observar el Panel de Debug

Dentro de la extensión verás:

```
🔍 Panel de Debug
┌─────────────────────────────────────┐
│ [14:23:45] ℹ️ Archivo seleccionado  │
│ [14:23:46] ✅ XLSX parseado: 13 hojas│
│ [14:23:47] 🔍 Validando estructura   │
│ [14:23:48] ✅ DNI en columna 1       │
└─────────────────────────────────────┘
```

Tipos de mensajes:
- ℹ️ **INFO**: Información general
- ✅ **SUCCESS**: Operación exitosa
- ⚠️ **WARNING**: Advertencia (no crítico)
- ❌ **ERROR**: Error que impide continuar
- 🔍 **DEBUG**: Información técnica detallada

### Paso 3: Exportar Logs

Si encuentras un problema:
1. Click en **"📥 Exportar Logs"**
2. Se descarga un archivo `cidi-debug-[timestamp].txt`
3. Compártelo para análisis

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### 1. ❌ "Librería XLSX no disponible"

**Causa:** Falta el archivo `xlsx.full.min.js`

**Solución:**
```bash
cd extension-chrome/libs/

# Descargar librería
wget https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js

# O manualmente desde:
# https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
```

**Verificar:**
```bash
ls -lh libs/xlsx.full.min.js
# Debe mostrar ~700KB
```

---

### 2. ⚠️ "No estás en CIDI"

**Causa:** La extensión solo funciona en `gestionestudiantes.cba.gov.ar`

**Solución:**
1. Navega a: `https://gestionestudiantes.cba.gov.ar`
2. Inicia sesión
3. Ve a la sección de calificaciones
4. Recarga la extensión

**Debug en Consola:**
```javascript
// Verificar URL actual
console.log(window.location.href);
// Debe contener: gestionestudiantes.cba.gov.ar
```

---

### 3. ❌ "Formato no válido"

**Causa:** El archivo no es XLSX válido

**Verificar estructura esperada:**
```
Hoja 1: Matemática
├── Columna A: DNI
├── Columna B: Alumno
├── Columnas C-F: Eval 1, Eval 2, Eval 3, Eval 4
├── Columnas G-J: Eval 5, Eval 6, Eval 7, Eval 8
└── Columnas K-L: JIS I, JIS II

Hoja 2: Lengua
├── (misma estructura)
...
```

**Solución PHP:** Verifica tu script `exportar_calificaciones_cidi.php`
```php
// Primera columna DEBE ser DNI
$col = 'A';
$sheet->setCellValue($col . $row, 'DNI');
```

**Debug:** Observa el panel de debug al cargar el archivo:
```
🔍 Validando estructura del archivo...
  📄 Matemática: 35 filas × 22 columnas
  📋 Primeras columnas: DNI, Alumno, Eval 1, Eval 2
  ✅ DNI en columna 1
```

---

### 4. ⚠️ "DNI no encontrado"

**Causa:** El DNI del XLSX no coincide con el DNI en CIDI

**Debug en Consola:**
```javascript
// En la página CIDI, ejecuta:
const filas = document.querySelectorAll('tbody tr');
filas.forEach((fila, i) => {
  console.log(`Fila ${i}: ${fila.textContent.substring(0, 100)}`);
});
```

**Soluciones:**

**A) Formato DNI diferente**
- XLSX: `12345678`
- CIDI: `12.345.678`

El script limpia automáticamente, pero verifica en el log:
```
🔍 Buscando DNI 12345678 en 35 filas
```

**B) DNI faltante en CIDI**
- Algunos estudiantes pueden no estar en la lista
- El sistema los saltará y mostrará en el resumen

---

### 5. ❌ "No hay estudiantes para procesar"

**Causa:** El archivo se parseó pero no se extrajeron datos

**Debug:** Observa estos logs:
```
📖 Iniciando lectura de XLSX...
✅ Workbook parseado: 13 hojas
🔍 Validando estructura...
  📄 Matemática: 1 filas × 22 columnas  ← ⚠️ Solo 1 fila = solo encabezados
```

**Solución:** Verifica que tu PHP esté escribiendo las filas de datos:
```php
foreach ($alumnos as $alumno) {
    $row++;  // ← Asegúrate de incrementar $row
    $col = 'A';
    $sheet->setCellValue($col . $row, $alumno['dni']);
    // ...
}
```

---

### 6. 🔍 "Pestañas no detectadas"

**Causa:** El HTML de CIDI cambió o los selectores no coinciden

**Debug en Consola CIDI:**
```javascript
// Buscar elementos de pestañas
console.log('Eval 1-4:', document.querySelector('[id*="Evaluacion1"]'));
console.log('Eval 5-8:', document.querySelector('[id*="Evaluacion5"]'));
console.log('JIS:', document.querySelector('[id*="JIS"]'));
```

**Solución temporal:** Marca manualmente las pestañas en la extensión

**Solución permanente:** Actualiza el selector en `popup-debug.js`:
```javascript
const tabs = {
  eval14: !!document.querySelector('[id*="TU_SELECTOR_AQUI"]'),
  // ...
};
```

---

### 7. ⚠️ "Valores AUS no se convierten"

**Causa:** El valor "AUS" no se está convirtiendo a 1

**Debug:** Observa el log al parsear:
```javascript
extractEvaluaciones(fila, indices) {
  return indices.map(idx => {
    const valor = fila[idx];
    console.log(`Celda ${idx}: "${valor}" (tipo: ${typeof valor})`);
    
    if (valor && valor.toString().toUpperCase() === 'AUS') {
      console.log('  → Convertido a 1');
      return 1;
    }
    // ...
  });
}
```

**Verificar en tu PHP:**
```php
// Asegúrate de escribir "AUS" como texto
$sheet->setCellValue($col . $row, 'AUS');
// NO como número o fórmula
```

---

## 🔬 DEBUG AVANZADO

### Script de Inspección Completa

Copia y pega esto en la consola de Chrome (en la página CIDI):

```javascript
console.log('🔍 ===== INSPECCIÓN CIDI =====');

// 1. Verificar pestañas
console.log('\n📑 PESTAÑAS:');
const tabs = {
  'Eval 1-4': document.querySelector('[id*="Evaluacion1"], [id*="evaluacion1"]'),
  'Eval 5-8': document.querySelector('[id*="Evaluacion5"], [id*="evaluacion5"]'),
  'JIS': document.querySelector('[id*="JIS"], [id*="jis"]')
};
Object.entries(tabs).forEach(([name, elem]) => {
  console.log(`  ${name}: ${elem ? '✅ Encontrado' : '❌ No encontrado'}`);
});

// 2. Verificar tabla de estudiantes
console.log('\n👥 ESTUDIANTES:');
const filas = document.querySelectorAll('tbody tr');
console.log(`  Total filas: ${filas.length}`);

if (filas.length > 0) {
  console.log('  Primeras 3 filas:');
  Array.from(filas).slice(0, 3).forEach((fila, i) => {
    const texto = fila.textContent.replace(/\s+/g, ' ').substring(0, 100);
    console.log(`    ${i + 1}. ${texto}...`);
  });
}

// 3. Verificar inputs
console.log('\n📝 INPUTS:');
const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
console.log(`  Total inputs: ${inputs.length}`);

if (inputs.length > 0) {
  console.log('  Primeros 3 inputs:');
  Array.from(inputs).slice(0, 3).forEach((input, i) => {
    console.log(`    ${i + 1}. id="${input.id}" name="${input.name}" value="${input.value}"`);
  });
}

console.log('\n✅ Inspección completada');
```

---

## 📊 INTERPRETACIÓN DE LOGS

### Ejemplo de Log Exitoso

```
[14:23:42] ℹ️ Inicializando extensión en modo DEBUG
[14:23:42] 🔧 Inicializando elementos del DOM
[14:23:42] ✅ Elemento "fileInput" encontrado
[14:23:42] ✅ Elemento "selectMateria" encontrado
[14:23:42] ✅ Elemento "processButton" encontrado
[14:23:42] 🔗 Vinculando eventos
[14:23:42] ✅ Todos los eventos vinculados
[14:23:42] 🔍 Iniciando detección de pestaña CIDI...
[14:23:43] ✅ URL de CIDI detectada
[14:23:43] 🔍 Pestañas detectadas: {"eval14":true,"eval58":true,"jis":false}
[14:23:43] ✅ UI actualizada: ✅ 2 pestaña(s) detectada(s)

[14:24:10] ℹ️ Evento: Archivo seleccionado
[14:24:10] 📂 Archivo: Calificaciones_6to_2025.xlsx (45.23 KB)
[14:24:10] ✅ Librería XLSX disponible
[14:24:10] 📖 Iniciando lectura de XLSX...
[14:24:11] ✅ Workbook parseado: 13 hojas
[14:24:11] 📋 Hojas: Matemática, Lengua, Inglés, ...
[14:24:11] 🔍 Validando estructura del archivo...
[14:24:11]   📄 Matemática: 35 filas × 22 columnas
[14:24:11]   📋 Primeras columnas: DNI, Alumno, Eval 1, Eval 2
[14:24:11]   ✅ DNI en columna 1
[14:24:12] ✅ 13 materias agregadas al selector

[14:24:20] ℹ️ Materia seleccionada: Matemática
[14:24:20] 📚 Procesando materia: Matemática
[14:24:20]   📊 Total filas: 35
[14:24:20] 🔄 Parseando estudiantes de Matemática...
[14:24:20]   👤 Estudiante 1: DNI=12345678, Nombre="GARCÍA, Juan"
[14:24:20]      Eval1-4: 7,8,9,6
[14:24:21] ✅ 34 estudiantes parseados

[14:24:30] ℹ️ Evento: Click en botón Procesar
[14:24:30] 🚀 ============ INICIANDO PROCESAMIENTO ============
[14:24:30] 📚 Materia: Matemática
[14:24:30] 👥 Estudiantes a procesar: 34
[14:24:30] 📑 Pestañas a procesar: eval14, eval58
[14:24:30] 🔄 Procesando en CIDI...
[14:24:30] ✅ Tab ID: 123456789

[14:24:35] 📊 ============ RESULTADO ============
[14:24:35] ✅ Procesados: 32
[14:24:35] ❌ Errores: 0
[14:24:35] ⏭️ Saltados: 2
[14:24:35] ✅ Procesamiento completado
```

### Ejemplo de Log con Errores

```
[14:25:10] ❌ ERROR: Elemento "fileInput" no encontrado
  → Problema: popup-debug.html no se cargó correctamente
  → Solución: Recarga la extensión en chrome://extensions

[14:26:30] ❌ ERROR CRÍTICO: Librería XLSX no cargada
  → Problema: Falta libs/xlsx.full.min.js
  → Solución: Descarga la librería

[14:27:45] ⚠️ ADVERTENCIA: Primera columna no es DNI: "Alumno"
  → Problema: Estructura del XLSX incorrecta
  → Solución: Verifica exportar_calificaciones_cidi.php

[14:28:20] ❌ ERROR leyendo archivo: Cannot read property 'SheetNames'
  → Problema: Archivo XLSX corrupto
  → Solución: Regenera el archivo desde PHP
```

---

## 📞 SOPORTE

Si después de seguir esta guía sigues teniendo problemas:

1. **Exporta los logs** (botón "📥 Exportar Logs")
2. **Toma capturas** de:
   - Panel de debug de la extensión
   - Consola de Chrome (F12)
   - Página CIDI donde estás trabajando
3. **Comparte**:
   - Archivo de logs
   - Capturas de pantalla
   - Descripción del problema
   - Pasos para reproducir

---

## ✅ CHECKLIST FINAL

Antes de usar en producción, verifica:

- [ ] Extensión instalada en Chrome
- [ ] Librería XLSX descargada (700KB)
- [ ] Íconos generados (16px, 48px, 128px)
- [ ] Archivo XLSX exportado desde PHP
- [ ] Primera columna es DNI
- [ ] 13 hojas (materias) en el XLSX
- [ ] Página CIDI abierta e iniciada sesión
- [ ] Pestañas detectadas correctamente
- [ ] Panel de debug muestra logs
- [ ] Prueba con 2-3 estudiantes primero
- [ ] Exporta logs antes de procesar todo

---

## 🎓 TIPS DE USO

### Procesamiento Gradual

1. **Primera vez**: Procesa solo 1 materia con 2-3 estudiantes
2. **Segunda vez**: Procesa 1 materia completa
3. **Tercera vez**: Procesa todas las materias de a una

### Backup de Seguridad

Antes de procesar masivamente:
1. Descarga el estado actual de CIDI (si es posible)
2. Guarda capturas de pantalla
3. Anota qué materias/estudiantes ya procesaste

### Validación Manual

Después de usar la extensión:
1. Revisa 5-10 estudiantes al azar
2. Verifica que los valores sean correctos
3. Compara con el XLSX original

---

**Versión:** 2.0 DEBUG  
**Fecha:** Diciembre 2025  
**Autor:** IEM "SAN ANDRÉS" - Córdoba, Argentina
