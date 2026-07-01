/**
 * CIDI AUTO-NOTAS v2.0 - MODO DEBUG
 * Sistema de debug completo para troubleshooting
 */

class CIDIAutoNotasDebug {
  constructor() {
    this.workbook = null;
    this.estudiantes = [];
    this.pestanaDetectada = null;
    this.debugLogs = [];
    
    this.log('🚀 Inicializando extensión en modo DEBUG', 'info');
    this.initializeElements();
    this.bindEvents();
    this.detectarPestanaCIDI();
  }

  // ============================================
  // SISTEMA DE LOGGING
  // ============================================
  
  log(mensaje, tipo = 'info') {
    const timestamp = new Date().toLocaleTimeString('es-AR');
    const logEntry = {
      timestamp,
      tipo,
      mensaje
    };
    
    this.debugLogs.push(logEntry);
    
    // Mostrar en consola del navegador
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'debug': '🔍'
    }[tipo] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${mensaje}`);
    
    // Actualizar panel de debug si existe
    this.updateDebugPanel();
  }

  updateDebugPanel() {
    const debugPanel = document.getElementById('debugPanel');
    if (!debugPanel) return;
    
    const lastLogs = this.debugLogs.slice(-10).reverse(); // Últimos 10 logs
    const html = lastLogs.map(log => {
      const emoji = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'debug': '🔍'
      }[log.tipo] || 'ℹ️';
      
      return `<div class="debug-log ${log.tipo}">
        <span class="debug-time">[${log.timestamp}]</span>
        <span class="debug-emoji">${emoji}</span>
        <span class="debug-msg">${log.mensaje}</span>
      </div>`;
    }).join('');
    
    debugPanel.innerHTML = html;
  }

  exportLogs() {
    const texto = this.debugLogs.map(log => 
      `[${log.timestamp}] ${log.tipo.toUpperCase()}: ${log.mensaje}`
    ).join('\n');
    
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cidi-debug-${Date.now()}.txt`;
    a.click();
    
    this.log('📥 Logs exportados', 'success');
  }

  // ============================================
  // INICIALIZACIÓN DE ELEMENTOS
  // ============================================
  
  initializeElements() {
    this.log('🔧 Inicializando elementos del DOM', 'debug');
    
    // Elementos principales
    this.fileInput = document.getElementById('fileInput');
    this.fileLabel = document.getElementById('fileLabel');
    this.fileInfo = document.getElementById('fileInfo');
    
    this.selectMateria = document.getElementById('selectMateria');
    this.materiaInfo = document.getElementById('materiaInfo');
    
    this.checkEval14 = document.getElementById('checkEval14');
    this.checkEval58 = document.getElementById('checkEval58');
    this.checkJIS = document.getElementById('checkJIS');
    this.detectionInfo = document.getElementById('detectionInfo');
    this.detectionText = document.getElementById('detectionText');
    
    this.processButton = document.getElementById('processButton');
    this.progressContainer = document.getElementById('progressContainer');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.statusDiv = document.getElementById('status');
    
    // Verificar que todos los elementos existen
    const elementos = {
      'fileInput': this.fileInput,
      'selectMateria': this.selectMateria,
      'processButton': this.processButton,
      'statusDiv': this.statusDiv
    };
    
    for (const [nombre, elemento] of Object.entries(elementos)) {
      if (!elemento) {
        this.log(`❌ ERROR: Elemento "${nombre}" no encontrado`, 'error');
      } else {
        this.log(`✅ Elemento "${nombre}" encontrado`, 'debug');
      }
    }
  }

  // ============================================
  // EVENTOS
  // ============================================
  
  bindEvents() {
    this.log('🔗 Vinculando eventos', 'debug');
    
    // Botón de archivo
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        this.log('📂 Evento: Archivo seleccionado', 'info');
        this.handleFileSelect(e);
      });
    }
    
    // Selector de materia
    if (this.selectMateria) {
      this.selectMateria.addEventListener('change', () => {
        this.log(`📚 Materia seleccionada: ${this.selectMateria.value}`, 'info');
        this.handleMateriaSelect();
      });
    }
    
    // Botón procesar
    if (this.processButton) {
      this.processButton.addEventListener('click', () => {
        this.log('🚀 Evento: Click en botón Procesar', 'info');
        this.iniciarProcesamiento();
      });
    }
    
    // Botón exportar logs
    const exportButton = document.getElementById('exportLogs');
    if (exportButton) {
      exportButton.addEventListener('click', () => this.exportLogs());
    }
    
    this.log('✅ Todos los eventos vinculados', 'success');
  }

  // ============================================
  // DETECCIÓN DE PESTAÑA CIDI
  // ============================================
  
  async detectarPestanaCIDI() {
    this.log('🔍 Iniciando detección de pestaña CIDI...', 'info');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      this.log(`📍 URL actual: ${tab.url}`, 'debug');
      
      if (!tab.url.includes('gestionestudiantes.cba.gov.ar')) {
        this.log('⚠️ No estás en CIDI - extensión funcionará en modo limitado', 'warning');
        this.showStatus('⚠️ No estás en CIDI. Ve a gestionestudiantes.cba.gov.ar para usar la extensión.', 'warning');
        if (this.detectionInfo) this.detectionInfo.style.display = 'none';
        return;
      }
      
      this.log('✅ URL de CIDI detectada', 'success');
      
      // Inyectar script para detectar pestañas
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const tabs = {
            eval14: !!document.querySelector('[id*="Evaluacion1"], [id*="evaluacion1"]'),
            eval58: !!document.querySelector('[id*="Evaluacion5"], [id*="evaluacion5"]'),
            jis: !!document.querySelector('[id*="JIS"], [id*="jis"]')
          };
          
          return {
            tabs,
            html: document.body.innerHTML.substring(0, 1000) // Primeros 1000 caracteres
          };
        }
      });
      
      const data = results[0].result;
      this.log(`🔍 Pestañas detectadas: ${JSON.stringify(data.tabs)}`, 'debug');
      this.log(`📄 HTML parcial: ${data.html.substring(0, 200)}...`, 'debug');
      
      this.pestanaDetectada = data.tabs;
      this.actualizarDeteccionUI(data.tabs);
      
    } catch (error) {
      this.log(`❌ ERROR detectando pestaña: ${error.message}`, 'error');
      console.error('Error completo:', error);
      this.showStatus('❌ Error al detectar pestaña CIDI: ' + error.message, 'error');
    }
  }

  actualizarDeteccionUI(tabs) {
    this.log('🎨 Actualizando UI de detección', 'debug');
    
    if (this.checkEval14) this.checkEval14.checked = tabs.eval14;
    if (this.checkEval58) this.checkEval58.checked = tabs.eval58;
    if (this.checkJIS) this.checkJIS.checked = tabs.jis;
    
    const pestañasActivas = Object.values(tabs).filter(Boolean).length;
    const texto = pestañasActivas > 0 
      ? `✅ ${pestañasActivas} pestaña(s) detectada(s)`
      : '⚠️ No se detectaron pestañas';
    
    if (this.detectionText) {
      this.detectionText.textContent = texto;
    }
    
    if (this.detectionInfo) {
      this.detectionInfo.style.display = 'block';
    }
    
    this.log(`✅ UI actualizada: ${texto}`, 'success');
  }

  // ============================================
  // MANEJO DE ARCHIVO XLSX
  // ============================================
  
  async handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
      this.log('⚠️ No se seleccionó archivo', 'warning');
      return;
    }
    
    this.log(`📂 Archivo seleccionado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, 'info');
    
    if (!file.name.match(/\.(xlsx|xlsm)$/i)) {
      this.log('❌ ERROR: Formato no válido', 'error');
      this.showStatus('❌ Solo se permiten archivos .xlsx o .xlsm', 'error');
      return;
    }
    
    // Verificar que SheetJS está cargado
    if (typeof XLSX === 'undefined') {
      this.log('❌ ERROR CRÍTICO: Librería XLSX no cargada', 'error');
      this.showStatus('❌ Error: Librería XLSX no disponible. Verifica la instalación.', 'error');
      return;
    }
    
    this.log('✅ Librería XLSX disponible', 'debug');
    this.showStatus('📖 Leyendo archivo...', 'info');
    
    try {
      await this.readXLSX(file);
    } catch (error) {
      this.log(`❌ ERROR leyendo archivo: ${error.message}`, 'error');
      console.error('Error completo:', error);
      this.showStatus(`❌ Error leyendo archivo: ${error.message}`, 'error');
    }
  }

  async readXLSX(file) {
    this.log('📖 Iniciando lectura de XLSX...', 'info');
    
    const data = await file.arrayBuffer();
    this.log(`✅ ArrayBuffer obtenido: ${data.byteLength} bytes`, 'debug');
    
    this.workbook = XLSX.read(data, { type: 'array' });
    this.log(`✅ Workbook parseado: ${this.workbook.SheetNames.length} hojas`, 'success');
    
    // Log de todas las hojas
    this.log(`📋 Hojas encontradas: ${this.workbook.SheetNames.join(', ')}`, 'info');
    
    // Validar estructura básica
    this.validateWorkbookStructure();
    
    // Actualizar UI
    this.populateMateriaSelect();
    
    if (this.fileLabel) {
      this.fileLabel.textContent = `✅ ${file.name}`;
      this.fileLabel.classList.add('success');
    }
    
    if (this.fileInfo) {
      this.fileInfo.style.display = 'block';
      const n = this.workbook.SheetNames.length;
      this.fileInfo.textContent = n === 1
        ? `1 materia: ${this.workbook.SheetNames[0]}`
        : `${n} materias encontradas`;
    }

    this.showStatus(`✅ Archivo cargado: ${this.workbook.SheetNames.length} materia(s)`, 'success');
  }

  validateWorkbookStructure() {
    this.log('🔍 Validando estructura del archivo...', 'info');

    for (const sheetName of this.workbook.SheetNames) {
      const sheet = this.workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { range: 6, header: 1, defval: '', blankrows: false });

      if (data.length < 2) {
        this.log(`  ⚠️ ${sheetName}: sin datos en fila 7+`, 'warning');
        continue;
      }

      const headers = data[0];
      const col0 = String(headers[0] || '').toLowerCase();
      const formato = col0.includes('dni') ? 'DNI+Alumno' : col0.includes('alumno') ? 'Alumno (2026)' : 'desconocido';

      this.log(`  📄 ${sheetName}: formato ${formato}`, 'debug');
      this.log(`  📋 Fila 7: ${headers.slice(0, 6).join(' | ')}...`, 'debug');

      if (formato === 'desconocido') {
        this.log(`  ⚠️ ${sheetName}: encabezados no reconocidos`, 'warning');
      }
    }

    this.log('✅ Validación completada', 'success');
  }

  populateMateriaSelect() {
    this.log('🎨 Poblando selector de materias...', 'info');

    if (!this.selectMateria) {
      this.log('❌ ERROR: selectMateria no existe', 'error');
      return;
    }

    while (this.selectMateria.options.length > 1) {
      this.selectMateria.remove(1);
    }

    this.workbook.SheetNames.forEach((sheetName) => {
      const option = document.createElement('option');
      option.value = sheetName;
      option.textContent = sheetName;
      this.selectMateria.appendChild(option);
      this.log(`  ➕ Agregada opción: ${sheetName}`, 'debug');
    });

    this.selectMateria.disabled = false;
    this.log(`✅ ${this.workbook.SheetNames.length} materias agregadas al selector`, 'success');

    if (this.workbook.SheetNames.length === 1) {
      this.selectMateria.value = this.workbook.SheetNames[0];
      this.handleMateriaSelect();
    }
  }

  handleMateriaSelect() {
    const materiaSeleccionada = this.selectMateria.value;
    
    if (!materiaSeleccionada) {
      this.log('⚠️ No hay materia seleccionada', 'warning');
      if (this.materiaInfo) this.materiaInfo.style.display = 'none';
      if (this.processButton) this.processButton.disabled = true;
      return;
    }
    
    this.log(`📚 Procesando materia: ${materiaSeleccionada}`, 'info');
    
    // Leer datos desde fila 7 (igual que la extensión principal)
    const sheet = this.workbook.Sheets[materiaSeleccionada];
    const data = XLSX.utils.sheet_to_json(sheet, {
      range: 6,
      header: 1,
      defval: '',
      raw: false,
      blankrows: false
    });

    this.log(`  📊 Filas parseadas (desde fila 7): ${data.length}`, 'debug');
    this.log(`  📋 Encabezados fila 7: ${JSON.stringify(data[0])}`, 'debug');

    this.estudiantes = this.parseEstudiantes(data, materiaSeleccionada);
    
    // Mostrar información
    if (this.materiaInfo) {
      this.materiaInfo.style.display = 'block';
      this.materiaInfo.textContent = `${this.estudiantes.length} estudiantes encontrados`;
    }
    
    // Habilitar botón
    if (this.processButton) {
      this.processButton.disabled = false;
    }
    
    this.log(`✅ ${this.estudiantes.length} estudiantes parseados`, 'success');
    
    // Log de primeros 3 estudiantes
    this.estudiantes.slice(0, 3).forEach((est, i) => {
      this.log(`  👤 Estudiante ${i + 1}: ${est.nombreCompleto}${est.dni ? ` (DNI ${est.dni})` : ''}`, 'debug');
      this.log(`     Eval1=${est.evaluaciones.eval1.valor}, Rec1=${est.evaluaciones.eval1.recuperatorio}`, 'debug');
    });
  }

  parseEstudiantes(data, materiaName) {
    this.log(`🔄 Parseando estudiantes de ${materiaName}...`, 'info');

    const encabezados = data[0];
    const col0 = String(encabezados[0] || '').toLowerCase();
    const tieneDni = col0.includes('dni');
    const colNombre = tieneDni ? 1 : 0;
    const colBaseNotas = tieneDni ? 2 : 1;
    const claves = ['eval1', 'eval2', 'eval3', 'eval4', 'eval5', 'eval6', 'eval7', 'eval8', 'jis1', 'jis2'];

    this.log(`  📋 Formato: ${tieneDni ? 'DNI+Alumno' : 'Alumno (2026)'}`, 'info');
    this.log(`  📋 Encabezados: ${encabezados.join(' | ')}`, 'debug');

    const estudiantes = [];

    for (const fila of data.slice(1)) {
      const primerCampo = String(fila[0] || '').trim();
      if (!primerCampo) continue;
      if (/^instrucciones/i.test(primerCampo) || /^\d+\./.test(primerCampo)) break;

      const evaluaciones = {};
      claves.forEach((clave, i) => {
        const colValor = colBaseNotas + i * 2;
        const colRec = colBaseNotas + i * 2 + 1;
        evaluaciones[clave] = {
          valor: this.cleanGradeValue(fila[colValor]),
          recuperatorio: this.cleanGradeValue(fila[colRec])
        };
      });

      const dniRaw = tieneDni ? String(fila[0] || '').trim().replace(/^'/, '') : null;

      estudiantes.push({
        dni: dniRaw || null,
        nombreCompleto: String(fila[colNombre] || '').trim(),
        evaluaciones
      });
    }

    this.log(`✅ ${estudiantes.length} estudiantes válidos`, 'success');
    return estudiantes;
  }

  cleanGradeValue(value) {
    if (!value || value === '-' || String(value).trim() === '') return null;
    const str = String(value).trim().toUpperCase();
    if (str === 'AUS' || str === 'AUSENTE') return '1';
    return String(value).trim();
  }

  // ============================================
  // PROCESAMIENTO
  // ============================================
  
  async iniciarProcesamiento() {
    this.log('🚀 ============ INICIANDO PROCESAMIENTO ============', 'info');
    
    // Validaciones
    if (!this.workbook) {
      this.log('❌ No hay archivo cargado', 'error');
      this.showStatus('❌ Primero carga un archivo XLSX', 'error');
      return;
    }
    
    if (this.estudiantes.length === 0) {
      this.log('❌ No hay estudiantes para procesar', 'error');
      this.showStatus('❌ No hay estudiantes para procesar', 'error');
      return;
    }
    
    const materia = this.selectMateria.value;
    if (!materia) {
      this.log('❌ No hay materia seleccionada', 'error');
      this.showStatus('❌ Selecciona una materia', 'error');
      return;
    }
    
    this.log(`📚 Materia: ${materia}`, 'info');
    this.log(`👥 Estudiantes a procesar: ${this.estudiantes.length}`, 'info');
    
    // Determinar qué pestañas procesar
    const pestanasAProcesar = [];
    if (this.checkEval14 && this.checkEval14.checked) pestanasAProcesar.push('eval14');
    if (this.checkEval58 && this.checkEval58.checked) pestanasAProcesar.push('eval58');
    if (this.checkJIS && this.checkJIS.checked) pestanasAProcesar.push('jis');
    
    if (pestanasAProcesar.length === 0) {
      this.log('❌ No hay pestañas seleccionadas', 'error');
      this.showStatus('❌ Selecciona al menos una pestaña para procesar', 'error');
      return;
    }
    
    this.log(`📑 Pestañas a procesar: ${pestanasAProcesar.join(', ')}`, 'info');
    
    // Deshabilitar botón
    this.processButton.disabled = true;
    this.showProgress(0, 'Iniciando...');
    
    try {
      await this.procesarEnCIDI(pestanasAProcesar);
    } catch (error) {
      this.log(`❌ ERROR CRÍTICO: ${error.message}`, 'error');
      console.error('Error completo:', error);
      this.showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.processButton.disabled = false;
      this.hideProgress();
    }
  }

  async procesarEnCIDI(pestanas) {
    this.log('🔄 Procesando en CIDI...', 'info');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('gestionestudiantes.cba.gov.ar')) {
      this.log('❌ ERROR: No estás en CIDI', 'error');
      throw new Error('Debes estar en la página de CIDI');
    }
    
    this.log(`✅ Tab ID: ${tab.id}`, 'debug');
    
    // Inyectar script de procesamiento
    const pestanasObj = {
      eval14: pestanas.includes('eval14'),
      eval58: pestanas.includes('eval58'),
      jis: pestanas.includes('jis')
    };

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [this.estudiantes, pestanasObj],
      func: this.scriptProcesarCIDI
    });

    const resultado = results[0].result;

    this.log('📊 ============ RESULTADO ============', 'info');
    this.log(`✅ Procesados: ${resultado.procesados}`, 'success');
    this.log(`❌ Errores: ${resultado.errores}`, 'error');
    this.log(`⏭️ No encontrados: ${resultado.saltados}`, 'warning');
    
    if (resultado.detalles && resultado.detalles.length > 0) {
      this.log('📋 Detalle de errores:', 'info');
      resultado.detalles.forEach(detalle => {
        this.log(`  - ${detalle}`, 'error');
      });
    }
    
    const mensaje = `✅ Procesados: ${resultado.procesados} | ❌ Errores: ${resultado.errores}`;
    this.showStatus(mensaje, resultado.errores === 0 ? 'success' : 'warning');
  }

  // ============================================
  // SCRIPT INYECTADO EN PÁGINA CIDI
  // ============================================
  
  scriptProcesarCIDI(estudiantes, pestanas) {
    let procesados = 0;
    let errores = 0;
    let saltados = 0;
    const detalles = [];

    function normalizar(str) {
      return String(str || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
    }

    function findStudentRow(estudiante) {
      const { dni, nombreCompleto } = estudiante;
      const filas = Array.from(document.querySelectorAll('tbody tr'));
      if (filas.length === 0) return null;

      if (dni) {
        for (const fila of filas) {
          for (const cell of fila.querySelectorAll('td')) {
            if (cell.textContent?.trim() === dni) return fila;
          }
        }
      }

      if (!nombreCompleto) return null;

      const nombreNorm = normalizar(nombreCompleto);
      const apellido = normalizar(nombreCompleto.split(',')[0] || '');

      for (const fila of filas) {
        if (normalizar(fila.textContent).includes(nombreNorm)) return fila;
      }

      if (apellido) {
        const candidatas = filas.filter(fila => normalizar(fila.textContent).includes(apellido));
        if (candidatas.length === 1) return candidatas[0];
      }

      return null;
    }

    function fillSelect(row, columnIndex, value) {
      if (!value || value === '-') return false;

      const selects = row.querySelectorAll('select');
      if (columnIndex >= selects.length) return false;

      const select = selects[columnIndex];
      const option = Array.from(select.options).find(opt =>
        opt.value === value || opt.text === value || opt.value === String(value)
      );

      if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }

    estudiantes.forEach(estudiante => {
      const fila = findStudentRow(estudiante);

      if (!fila) {
        saltados++;
        detalles.push(`${estudiante.nombreCompleto} - No encontrado en CIDI`);
        return;
      }

      try {
        let llenados = 0;

        if (pestanas.eval14) {
          ['eval1', 'eval2', 'eval3', 'eval4'].forEach((key, i) => {
            const ev = estudiante.evaluaciones[key];
            if (ev.valor !== null && fillSelect(fila, i * 3, ev.valor)) llenados++;
            if (ev.recuperatorio !== null && fillSelect(fila, i * 3 + 1, ev.recuperatorio)) llenados++;
          });
        }

        if (pestanas.eval58) {
          ['eval5', 'eval6', 'eval7', 'eval8'].forEach((key, i) => {
            const ev = estudiante.evaluaciones[key];
            if (ev.valor !== null && fillSelect(fila, i * 3, ev.valor)) llenados++;
            if (ev.recuperatorio !== null && fillSelect(fila, i * 3 + 1, ev.recuperatorio)) llenados++;
          });
        }

        if (pestanas.jis) {
          ['jis1', 'jis2'].forEach((key, i) => {
            const ev = estudiante.evaluaciones[key];
            if (ev.valor !== null && fillSelect(fila, i * 2, ev.valor)) llenados++;
            if (ev.recuperatorio !== null && fillSelect(fila, i * 2 + 1, ev.recuperatorio)) llenados++;
          });
        }

        if (llenados > 0) {
          procesados++;
        } else {
          saltados++;
          detalles.push(`${estudiante.nombreCompleto} - Sin valores para llenar`);
        }

      } catch (error) {
        errores++;
        detalles.push(`${estudiante.nombreCompleto} - Error: ${error.message}`);
      }
    });

    return { procesados, errores, saltados, detalles };
  }

  // ============================================
  // UI HELPERS
  // ============================================
  
  showStatus(mensaje, tipo = 'info') {
    if (!this.statusDiv) return;
    
    this.statusDiv.textContent = mensaje;
    this.statusDiv.className = `status ${tipo}`;
    this.statusDiv.style.display = 'block';
  }

  showProgress(percent, texto = '') {
    if (this.progressContainer) {
      this.progressContainer.style.display = 'block';
    }
    
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }
    
    if (this.progressText && texto) {
      this.progressText.textContent = texto;
    }
  }

  hideProgress() {
    if (this.progressContainer) {
      this.progressContainer.style.display = 'none';
    }
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM cargado - Iniciando aplicación');
  
  // Verificar que XLSX está disponible
  if (typeof XLSX === 'undefined') {
    console.error('❌ CRÍTICO: Librería XLSX no cargada');
    alert('ERROR: Librería XLSX no disponible. Verifica la instalación.');
    return;
  }
  
  console.log('✅ Librería XLSX disponible');
  console.log('📚 Versión XLSX:', XLSX.version);
  
  // Inicializar aplicación
  window.app = new CIDIAutoNotasDebug();
  
  console.log('✅ Aplicación inicializada');
});
