# 🐛 MODO DEBUG - CIDI AUTO-NOTAS

> **v2.1** — Sincronizado con el parseo de la extensión principal (formato PHP 2026 sin DNI + legacy con DNI).

## 📦 ARCHIVOS INCLUIDOS

```
Con Debug/
├── popup-debug.html / popup-debug.js   ← Reemplazar popup.* en la raíz para activar
├── validador-xlsx.html                 ← Validar XLSX sin instalar extensión
├── GUIA_DEBUG.md
└── README_DEBUG.md
```

La extensión se carga desde la **raíz** `Robot Cidi/` (comparte `manifest.json` y `libs/`).

---

## 🚀 INICIO RÁPIDO (2 minutos)

### 1. Reemplazar Archivos

Si ya tienes la extensión instalada:

```bash
cd extension-chrome/

# Hacer backup de originales
mv popup.html popup.html.bak
mv popup.js popup.js.bak

# Copiar versiones debug
cp popup-debug.html popup.html
cp popup-debug.js popup.js
```

### 2. Recargar Extensión

1. Abre Chrome → `chrome://extensions`
2. Busca **"CIDI Auto-Notas"**
3. Click en el ícono de **recarga** (🔄)
4. ¡Listo! Ahora está en modo DEBUG

### 3. Usar la Extensión

1. Ve a `https://gestionestudiantes.cba.gov.ar`
2. Abre la extensión
3. Observa el **Panel de Debug** en la parte inferior
4. Todos los logs aparecerán ahí en tiempo real

---

## 🔍 DIFERENCIAS CON LA VERSIÓN NORMAL

| Característica | Normal | DEBUG |
|----------------|--------|-------|
| Panel de logs en UI | ❌ | ✅ |
| Logs en consola | Básicos | Detallados |
| Exportar logs | ❌ | ✅ |
| Validación XLSX | Básica | Exhaustiva |
| Mensajes de error | Simples | Descriptivos |
| Información técnica | Oculta | Visible |

---

## 🛠️ HERRAMIENTAS INCLUIDAS

### 1. Panel de Debug en la Extensión

**Ubicación:** Dentro de la extensión Chrome, sección inferior

**Muestra:**
- ℹ️ Información general
- ✅ Operaciones exitosas
- ⚠️ Advertencias
- ❌ Errores
- 🔍 Datos técnicos

**Ejemplo:**
```
[14:23:45] ℹ️ Archivo seleccionado: Calificaciones_6to.xlsx
[14:23:46] ✅ XLSX parseado: 13 hojas
[14:23:47] 🔍 Validando estructura...
[14:23:47]   📄 Matemática: 35 filas × 22 columnas
[14:23:48] ✅ DNI en columna 1
```

### 2. Botón "Exportar Logs"

**Función:** Descarga todos los logs en un archivo `.txt`

**Uso:**
1. Click en **"📥 Exportar Logs"**
2. Se descarga `cidi-debug-[timestamp].txt`
3. Compártelo para análisis

**Cuándo usarlo:**
- Cuando encuentres un error
- Para soporte técnico
- Para documentar problemas

### 3. Validador de XLSX

**Archivo:** `validador-xlsx.html`

**Uso:**
1. Abre el archivo en Chrome (doble click)
2. Arrastra tu archivo XLSX
3. Ve un análisis completo de la estructura

**Valida:**
- ✅ Número de hojas (materias)
- ✅ Número de columnas por hoja
- ✅ DNI en primera columna
- ✅ Encabezados correctos
- ✅ Formato de DNIs
- ✅ Cantidad de estudiantes
- ✅ Datos de muestra

**Resultado:**
- **✅ VÁLIDO**: Listo para usar
- **❌ ERRORES**: Lista de problemas a corregir

---

## 📋 GUÍA DE USO

### Escenario 1: "La extensión no detecta el archivo"

**Pasos:**

1. **Cargar archivo en la extensión**
   - Click en "📁 Seleccionar archivo..."
   - Observa el panel de debug

2. **Revisar logs:**
   ```
   [14:23:45] ℹ️ Evento: Archivo seleccionado
   [14:23:45] 📂 Archivo: Calificaciones.xlsx (45.23 KB)
   [14:23:45] ✅ Librería XLSX disponible
   ```

3. **Si ves error de librería:**
   ```
   [14:23:45] ❌ ERROR CRÍTICO: Librería XLSX no cargada
   ```
   
   **Solución:** Descarga `xlsx.full.min.js`
   ```bash
   cd extension-chrome/libs/
   wget https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
   ```

### Escenario 2: "El archivo se carga pero no aparecen materias"

**Pasos:**

1. **Usar el validador XLSX:**
   - Abre `validador-xlsx.html`
   - Arrastra tu archivo
   - Revisa los errores

2. **Errores comunes:**
   - **"Primera columna no es DNI"**
     → Verifica tu PHP: `$sheet->setCellValue('A' . $row, 'DNI');`
   
   - **"Hoja vacía"**
     → Verifica que estás escribiendo datos: `foreach ($alumnos as $alumno)`
   
   - **"Solo tiene encabezados"**
     → Verifica el contador: `$row++; // en cada iteración`

### Escenario 3: "Se procesa pero no se llenan las notas"

**Pasos:**

1. **Abrir consola de Chrome:**
   - En la página CIDI: `F12` → "Console"

2. **Buscar en logs:**
   ```
   🔍 Buscando DNI 12345678 en 35 filas
   ❌ DNI 12345678 NO encontrado
   ```

3. **Verificar DNIs en CIDI:**
   ```javascript
   // Ejecutar en consola CIDI:
   document.querySelectorAll('tbody tr').forEach((fila, i) => {
     console.log(`Fila ${i}: ${fila.textContent.substring(0, 100)}`);
   });
   ```

4. **Comparar con XLSX:**
   - Abre el validador
   - Mira los "Datos de muestra"
   - Compara DNIs

### Escenario 4: "Funciona a medias"

**Pasos:**

1. **Exportar logs completos:**
   - Click en "📥 Exportar Logs"
   
2. **Analizar resultado:**
   ```
   [14:24:35] 📊 ============ RESULTADO ============
   [14:24:35] ✅ Procesados: 28
   [14:24:35] ❌ Errores: 0
   [14:24:35] ⏭️ Saltados: 6
   ```

3. **Revisar detalles de saltados:**
   ```
   [14:24:35] 📋 Detalle de errores:
   [14:24:35]   - GARCÍA, María (DNI: 98765432) - No encontrado
   ```

4. **Verificar esos DNIs específicos** manualmente en CIDI

---

## 🎓 MEJORES PRÁCTICAS

### Antes de Procesar

1. **Validar el XLSX:**
   - Usar `validador-xlsx.html`
   - Asegurarse que pase todas las validaciones

2. **Probar con 2-3 estudiantes:**
   - Crear un XLSX de prueba pequeño
   - Verificar que funciona
   - Luego procesar el archivo completo

3. **Revisar el panel de debug:**
   - Leer todos los mensajes
   - Resolver advertencias si hay

### Durante el Procesamiento

1. **Observar el panel de debug:**
   - Ver que los estudiantes se procesan
   - Detectar errores inmediatamente

2. **No cerrar la extensión:**
   - Mantenerla abierta hasta que termine
   - Los logs se pierden al cerrar

3. **Si hay error:**
   - Exportar logs inmediatamente
   - Tomar captura de pantalla
   - Anotar qué estabas haciendo

### Después del Procesamiento

1. **Verificar el resumen:**
   ```
   ✅ Procesados: 32 | ❌ Errores: 0
   ```

2. **Validar manualmente:**
   - Revisar 5-10 estudiantes al azar en CIDI
   - Comparar con el XLSX original

3. **Guardar logs de éxito:**
   - Exportar logs exitosos
   - Documentar para futuras referencias

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot read property 'SheetNames'"

**Causa:** Archivo XLSX corrupto o librería no cargada

**Solución:**
1. Verificar librería: `ls -lh libs/xlsx.full.min.js` (debe ser ~700KB)
2. Regenerar XLSX desde PHP
3. Probar con validador primero

### Error: "No estás en CIDI"

**Causa:** URL incorrecta

**Solución:**
1. Navegar a `https://gestionestudiantes.cba.gov.ar`
2. Iniciar sesión
3. Ir a sección calificaciones
4. Recargar extensión

### Error: "Primera columna no es DNI"

**Causa:** Estructura XLSX incorrecta

**Solución PHP:**
```php
// Asegurarse que DNI es la primera columna
$col = 'A';
$sheet->setCellValue($col . $row, 'DNI');
$col++;
$sheet->setCellValue($col . $row, 'Alumno');
// ... resto de columnas
```

### Warning: "Solo X estudiantes"

**Causa:** Archivo con pocos datos

**Verificar:**
1. ¿Es un archivo de prueba? → Normal
2. ¿Debería tener más? → Revisar PHP:
   ```php
   $alumnos = obtenerAlumnos($curso_id);
   // Verificar que trae todos los alumnos
   ```

---

## 📞 SOPORTE

### Información a Proveer

Cuando reportes un problema, incluye:

1. **Logs exportados:**
   - Archivo `cidi-debug-[timestamp].txt`

2. **Capturas de pantalla:**
   - Panel de debug de la extensión
   - Consola de Chrome (F12)
   - Página CIDI

3. **Contexto:**
   - ¿Qué estabas haciendo?
   - ¿Qué esperabas que pasara?
   - ¿Qué pasó en realidad?

4. **Archivos:**
   - XLSX problemático (puedes anonimizar datos)
   - Resultado del validador

### Contacto

- **Proyecto:** CIDI Auto-Notas
- **Institución:** IEM "SAN ANDRÉS" - Córdoba, Argentina
- **Documentación completa:** Ver `GUIA_DEBUG.md`

---

## 🔄 VOLVER A VERSIÓN NORMAL

Cuando termines el debug:

```bash
cd extension-chrome/

# Restaurar originales
mv popup.html.bak popup.html
mv popup.js.bak popup.js

# Recargar en chrome://extensions
```

O simplemente:
```bash
# Reinstalar desde cero
./instalar.sh  # o instalar.bat en Windows
```

---

## ✅ CHECKLIST DE DEBUG

Antes de pedir ayuda, verifica:

- [ ] Librería XLSX instalada (700KB)
- [ ] Extensión recargada en Chrome
- [ ] Archivo XLSX validado con validador-xlsx.html
- [ ] Página CIDI correcta y con sesión activa
- [ ] Panel de debug visible en la extensión
- [ ] Consola Chrome abierta (F12)
- [ ] Logs exportados
- [ ] Capturas tomadas
- [ ] Probado con archivo pequeño primero

---

**Versión:** 2.0 DEBUG  
**Última actualización:** Diciembre 2025  
**Mantenido por:** IEM "SAN ANDRÉS"

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `GUIA_DEBUG.md` - Guía completa de troubleshooting (30+ páginas)
- `validador-xlsx.html` - Herramienta de validación
- `popup-debug.js` - Código fuente comentado
- `manifest.json` - Configuración de la extensión

---

¡Buena suerte con el debug! 🚀
