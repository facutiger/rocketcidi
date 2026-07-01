/**
 * Rocket CIDI v3.0
 * Carga masiva de calificaciones en CIDI desde XLSX (IEM)
 */

// SHA-256 de la contraseña de modo técnico. Para cambiarla:
// PowerShell: [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes('TU_CLAVE'))).Replace('-','').ToLower()
const DEBUG_PASS_HASH = '7db300f328b82cace57981f7c27b81d50445fc5deb96af9d5dd54412d6bd13e9';
const DEBUG_STORAGE_KEY = 'rocket_cidi_debug';
const DEBUG_CLICKS_TO_UNLOCK = 5;

class CIDIAutoNotas {
  constructor() {
    this.workbook = null;
    this.estudiantes = [];
    this.pestanaDetectada = null;
    this.formatoXlsx = null;
    this.logs = [];
    this.maxLogEntries = 200;
    this.debugMode = sessionStorage.getItem(DEBUG_STORAGE_KEY) === '1';
    this._unlockClicks = 0;
    this._unlockTimer = null;

    this.initializeElements();
    this.bindEvents();
    this.applyDebugModeUI(false);
    if (this.debugMode) {
      this.log('Modo técnico restaurado (sesión)', 'success');
    }
    this.log('Extensión iniciada', 'info');
    this.detectarPestanaCIDI();
  }

  initializeElements() {
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

    this.logPanel = document.getElementById('logPanel');
    this.logBadge = document.getElementById('logBadge');
    this.exportLogsBtn = document.getElementById('exportLogsBtn');
    this.clearLogsBtn = document.getElementById('clearLogsBtn');
    this.versionLabel = document.getElementById('versionLabel');
    this.debugSection = document.getElementById('debugSection');
    this.lockDebugBtn = document.getElementById('lockDebugBtn');
  }

  bindEvents() {
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.selectMateria.addEventListener('change', () => this.handleMateriaChange());
    this.processButton.addEventListener('click', () => this.processGrades());
    this.exportLogsBtn.addEventListener('click', () => this.exportLogs());
    this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
    this.versionLabel?.addEventListener('click', () => this.handleVersionClick());
    this.lockDebugBtn?.addEventListener('click', () => this.lockDebugMode());
  }

  // ─── Modo técnico (admin) ──────────────────────────────────────────

  debug(mensaje) {
    this.log(mensaje, 'debug');
  }

  async sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  handleVersionClick() {
    if (this.debugMode) return;

    this._unlockClicks += 1;
    clearTimeout(this._unlockTimer);
    this._unlockTimer = setTimeout(() => { this._unlockClicks = 0; }, 2500);

    if (this._unlockClicks < DEBUG_CLICKS_TO_UNLOCK) return;

    this._unlockClicks = 0;
    const clave = prompt('Contraseña de modo técnico:');
    if (!clave) return;

    this.sha256(clave).then(hash => {
      if (hash === DEBUG_PASS_HASH) {
        this.enableDebugMode();
      } else {
        alert('Contraseña incorrecta');
      }
    });
  }

  enableDebugMode() {
    this.debugMode = true;
    sessionStorage.setItem(DEBUG_STORAGE_KEY, '1');
    this.applyDebugModeUI(true);
    this.log('Modo técnico activado', 'success');
  }

  lockDebugMode() {
    this.debugMode = false;
    sessionStorage.removeItem(DEBUG_STORAGE_KEY);
    this.applyDebugModeUI(true);
    this.log('Modo técnico bloqueado', 'info');
  }

  applyDebugModeUI(announce) {
    this.maxLogEntries = this.debugMode ? 500 : 200;
    if (this.debugSection) {
      this.debugSection.classList.toggle('active', this.debugMode);
    }
    if (announce && this.debugMode) {
      this.debug('Logs detallados habilitados');
    }
  }

  // ─── Registro de eventos ───────────────────────────────────────────

  log(mensaje, tipo = 'info') {
    if (tipo === 'debug' && !this.debugMode) return;
    const entry = {
      time: new Date().toLocaleTimeString('es-AR', { hour12: false }),
      tipo,
      mensaje
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift();
    }

    this.renderLogEntry(entry);
    this.updateLogBadge();

    const prefix = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', debug: '🔍' }[tipo] || '•';
    console.log(`${prefix} [${entry.time}] ${mensaje}`);
  }

  renderLogEntry(entry) {
    if (!this.logPanel) return;

    const div = document.createElement('div');
    div.className = `log-entry ${entry.tipo}`;
    div.innerHTML = `<span class="log-time">${entry.time}</span><span class="log-msg">${this.escapeHtml(entry.mensaje)}</span>`;
    this.logPanel.appendChild(div);
    this.logPanel.scrollTop = this.logPanel.scrollHeight;
  }

  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  updateLogBadge() {
    if (!this.logBadge) return;
    const errores = this.logs.filter(l => l.tipo === 'error' || l.tipo === 'warning').length;
    const total = this.logs.length;
    this.logBadge.textContent = errores > 0 ? `${errores} alertas · ${total} eventos` : `${total} eventos`;
    this.logBadge.classList.toggle('has-errors', errores > 0);
  }

  clearLogs() {
    this.logs = [];
    if (this.logPanel) this.logPanel.innerHTML = '';
    this.updateLogBadge();
    this.log('Registro limpiado', 'info');
  }

  exportLogs() {
    const header = `Rocket CIDI — Registro de sesión\nExportado: ${new Date().toLocaleString('es-AR')}\n${'─'.repeat(50)}\n\n`;
    const body = this.logs.map(e => `[${e.time}] [${e.tipo.toUpperCase()}] ${e.mensaje}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rocket-cidi_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.log('Registro exportado a .txt', 'success');
  }

  ingestRemoteLogs(remoteLogs) {
    if (!Array.isArray(remoteLogs)) return;
    remoteLogs.forEach(entry => {
      this.log(entry.mensaje || entry.msg || String(entry), entry.tipo || entry.type || 'info');
    });
  }

  // ─── Detección CIDI ────────────────────────────────────────────────

  async detectarPestanaCIDI() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

      if (!tab.url || !tab.url.includes('gestionestudiantes.cba.gov.ar')) {
        this.mostrarDeteccion('Navegue a la página CIDI primero', 'warning');
        this.log('No estás en gestionestudiantes.cba.gov.ar', 'warning');
        return;
      }

      this.log(`Pestaña CIDI detectada: ${tab.url}`, 'info');
      this.debug(`Tab ID: ${tab.id}`);

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: detectarPestanaCIDIEnPagina
      });

      const pestana = result[0]?.result;

      if (pestana) {
        this.pestanaDetectada = pestana;
        this.aplicarDeteccion(pestana);
        this.log(`Pestaña CIDI identificada: ${pestana}`, 'success');
      } else {
        this.mostrarDeteccion('No se pudo detectar la pestaña. Seleccione manualmente.', 'warning');
        this.habilitarSeleccionManual();
        this.log('No se pudo auto-detectar pestaña CIDI', 'warning');
      }

    } catch (error) {
      console.error('Error detectando pestaña:', error);
      this.mostrarDeteccion('Error de detección. Seleccione manualmente.', 'warning');
      this.habilitarSeleccionManual();
      this.log(`Error detectando pestaña: ${error.message}`, 'error');
    }
  }

  aplicarDeteccion(pestana) {
    this.checkEval14.checked = false;
    this.checkEval58.checked = false;
    this.checkJIS.checked = false;

    const nombres = {
      'eval14': 'Evaluaciones 1-4',
      'eval58': 'Evaluaciones 5-8',
      'jis': 'JIS'
    };

    if (pestana === 'eval14') {
      this.checkEval14.checked = true;
    } else if (pestana === 'eval58') {
      this.checkEval58.checked = true;
    } else if (pestana === 'jis') {
      this.checkJIS.checked = true;
    }

    this.mostrarDeteccion(`✓ Detectado: ${nombres[pestana]}`, 'success');
  }

  habilitarSeleccionManual() {
    this.checkEval14.disabled = false;
    this.checkEval58.disabled = false;
    this.checkJIS.disabled = false;
  }

  mostrarDeteccion(mensaje, tipo) {
    this.detectionInfo.style.display = 'flex';
    this.detectionText.textContent = mensaje;
    this.detectionInfo.className = `detection-info ${tipo}`;
  }

  // ─── XLSX ────────────────────────────────────────────────────────

  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xlsm')) {
      this.showStatus('⚠️ Por favor seleccione un archivo XLSX o XLSM', 'error');
      this.log('Archivo rechazado: formato no válido', 'error');
      return;
    }

    try {
      this.log(`Cargando: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info');
      this.debug(`Archivo: type=${file.type || 'n/a'}`);
      this.showStatus('📖 Leyendo archivo XLSX...', 'info');
      await this.readXLSX(file);

      this.fileLabel.classList.add('has-file');
      this.fileLabel.innerHTML = `<span>✓</span><span>${file.name}</span>`;
      this.fileInfo.style.display = 'block';
      const n = this.workbook.SheetNames.length;
      this.fileInfo.textContent = n === 1
        ? `✓ Archivo cargado: materia "${this.workbook.SheetNames[0]}"`
        : `✓ Archivo cargado: ${n} materias encontradas`;

      this.log(`XLSX OK — ${n} hoja(s): ${this.workbook.SheetNames.join(', ')}`, 'success');
      this.debug(`Hojas: ${JSON.stringify(this.workbook.SheetNames)}`);
      this.showStatus('✓ Archivo cargado exitosamente', 'success');

    } catch (error) {
      this.showStatus(`❌ Error al leer archivo: ${error.message}`, 'error');
      this.log(`Error leyendo XLSX: ${error.message}`, 'error');
    }
  }

  async readXLSX(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: false,
            cellText: false
          });

          if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('El archivo no contiene hojas válidas');
          }

          this.workbook = workbook;
          this.poblarSelectorMaterias(workbook);
          resolve();

        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  poblarSelectorMaterias(workbook) {
    this.selectMateria.innerHTML = '<option value="">Seleccione una materia...</option>';

    workbook.SheetNames.forEach(sheetName => {
      const option = document.createElement('option');
      option.value = sheetName;
      option.textContent = sheetName;
      this.selectMateria.appendChild(option);
    });

    this.selectMateria.disabled = false;

    if (workbook.SheetNames.length === 1) {
      this.selectMateria.value = workbook.SheetNames[0];
      this.log(`Auto-seleccionada materia: ${workbook.SheetNames[0]}`, 'info');
      this.handleMateriaChange();
    }
  }

  handleMateriaChange() {
    const materiaSeleccionada = this.selectMateria.value;

    if (!materiaSeleccionada) {
      this.materiaInfo.style.display = 'none';
      this.processButton.disabled = true;
      return;
    }

    try {
      this.procesarHojaXLSX(materiaSeleccionada);

      this.materiaInfo.style.display = 'block';
      const formatoLabel = this.formatoXlsx === 'dni' ? 'DNI + Alumno' : 'Alumno (sin DNI)';
      this.materiaInfo.textContent = `✓ ${this.estudiantes.length} estudiantes cargados · formato ${formatoLabel}`;

      this.processButton.disabled = false;
      this.log(`Materia "${materiaSeleccionada}": ${this.estudiantes.length} alumnos · formato ${formatoLabel}`, 'success');
      if (this.estudiantes[0]) {
        const e = this.estudiantes[0];
        this.debug(`Muestra parseo: dni=${e.dni || '—'} notas eval1=${e.evaluaciones.eval1.valor}`);
      }
      this.showStatus(`✓ Materia "${materiaSeleccionada}" lista para procesar`, 'success');

    } catch (error) {
      this.showStatus(`❌ Error procesando materia: ${error.message}`, 'error');
      this.log(`Error parseando hoja: ${error.message}`, 'error');
    }
  }

  detectarFormato(headers) {
    const col0 = String(headers[0] || '').trim().toLowerCase();
    const col1 = String(headers[1] || '').trim().toLowerCase();

    if (col0.includes('dni') || col0.includes('documento')) return 'dni';
    if (col0.includes('alumno') || col0.includes('nombre')) return 'nombre';
    if (col1.includes('alumno') || col1.includes('nombre')) return 'dni';

    throw new Error(
      `Encabezados no reconocidos en fila 7: "${headers[0]}" | "${headers[1]}". ` +
      'Se espera "Alumno | Eval 1..." o "DNI | Alumno | Eval 1..."'
    );
  }

  procesarHojaXLSX(nombreHoja) {
    const worksheet = this.workbook.Sheets[nombreHoja];

    if (!worksheet) {
      throw new Error(`Hoja "${nombreHoja}" no encontrada`);
    }

    const data = XLSX.utils.sheet_to_json(worksheet, {
      range: 6,
      header: 1,
      defval: '',
      raw: false,
      blankrows: false
    });

    if (data.length < 2) {
      throw new Error('La hoja no contiene datos de estudiantes');
    }

    const headers = data[0];
    this.formatoXlsx = this.detectarFormato(headers);
    const tieneDni = this.formatoXlsx === 'dni';
    const colNombre = tieneDni ? 1 : 0;
    const colBaseNotas = tieneDni ? 2 : 1;

    const rows = [];
    for (const row of data.slice(1)) {
      const primerCampo = String(row[0] || '').trim();
      if (!primerCampo) continue;
      if (/^instrucciones/i.test(primerCampo) || /^\d+\./.test(primerCampo)) break;
      rows.push(row);
    }

    const claves = ['eval1', 'eval2', 'eval3', 'eval4', 'eval5', 'eval6', 'eval7', 'eval8', 'jis1', 'jis2'];

    this.estudiantes = rows.map(row => {
      const evaluaciones = {};
      claves.forEach((clave, i) => {
        const colValor = colBaseNotas + i * 2;
        const colRec = colBaseNotas + i * 2 + 1;
        evaluaciones[clave] = {
          valor: this.cleanValue(row[colValor]),
          recuperatorio: this.cleanValue(row[colRec])
        };
      });

      const dniRaw = tieneDni
        ? String(row[0] || '').trim().replace(/^'/, '').replace(/\D/g, '')
        : null;

      return {
        dni: dniRaw || null,
        nombreCompleto: String(row[colNombre] || '').trim(),
        evaluaciones
      };
    });

    this.log(`Encabezados fila 7: ${headers.slice(0, 5).join(' | ')}...`, 'info');

    if (this.estudiantes[0]) {
      const e = this.estudiantes[0];
      const notas = ['eval1', 'eval2', 'eval3', 'eval4']
        .map(k => `${k}=${e.evaluaciones[k].valor ?? '-'}`)
        .join(', ');
      this.log(`Muestra [1]: ${e.dni ? `DNI ${e.dni} · ` : ''}${e.nombreCompleto} → ${notas}`, 'info');
    }
  }

  cleanValue(value) {
    if (!value || value === '-' || String(value).trim() === '') {
      return null;
    }

    const strValue = String(value).trim().toUpperCase();

    if (strValue === 'AUS' || strValue === 'AUSENTE') {
      return '1';
    }

    return String(value).trim();
  }

  // ─── Procesamiento CIDI ────────────────────────────────────────────

  async processGrades() {
    if (this.estudiantes.length === 0) {
      this.showStatus('⚠️ No hay estudiantes para procesar', 'warning');
      this.log('Proceso cancelado: sin estudiantes cargados', 'warning');
      return;
    }

    const pestanasSeleccionadas = {
      eval14: this.checkEval14.checked,
      eval58: this.checkEval58.checked,
      jis: this.checkJIS.checked
    };

    const activas = Object.entries(pestanasSeleccionadas).filter(([, v]) => v).map(([k]) => k);
    if (activas.length === 0) {
      this.showStatus('⚠️ Debe seleccionar al menos una pestaña', 'warning');
      this.log('Proceso cancelado: ninguna pestaña seleccionada', 'warning');
      return;
    }

    try {
      this.processButton.disabled = true;
      this.showStatus('⚡ Procesando calificaciones...', 'info');
      this.showProgress(0);
      this.log(`─── Inicio procesamiento: ${this.estudiantes.length} alumnos · pestañas: ${activas.join(', ')} ───`, 'info');

      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

      if (!tab.url || !tab.url.includes('gestionestudiantes.cba.gov.ar')) {
        throw new Error('Debe estar en la página de CIDI');
      }

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [this.estudiantes, pestanasSeleccionadas],
        func: cidiInjectProcessingScript
      });

      this.debug(`executeScript frames: ${result?.length ?? 0}`);

      const frame = result?.[0];
      const response = frame?.result;
      this.debug(`Respuesta inyectada: ${response ? 'ok' : 'vacía'}`);

      if (frame?.error) {
        throw new Error(`Chrome scripting: ${frame.error}`);
      }

      if (response?.logs) {
        this.ingestRemoteLogs(response.logs);
      }

      if (!response) {
        this.log(`Inyección sin respuesta (frameId=${frame?.frameId ?? '?'}). Abrí F12 en CIDI.`, 'error');
        throw new Error('El script en CIDI no devolvió datos — revisá la consola F12 de la página CIDI');
      }

      if (response.success) {
        this.showProgress(100);
        const p = response.processed;
        const resumen = `Exitosos: ${p.success} | No encontrados: ${p.notFound} | Errores: ${p.errors}`;
        this.showStatus(`✓ Procesamiento completado\n${resumen}`, p.notFound + p.errors > 0 ? 'warning' : 'success');
        this.log(`─── Fin: ${resumen} ───`, p.notFound + p.errors > 0 ? 'warning' : 'success');

        if (response.diagnostics) {
          const d = response.diagnostics;
          this.log(`DOM CIDI: ${d.filasAlumnos ?? d.filasTabla} filas alumnos, ${d.selectsPorFila} selects/fila, ${d.totalSelects ?? '?'} selects total`, 'info');
        }
      } else {
        throw new Error(response?.message || 'Error desconocido en CIDI');
      }

    } catch (error) {
      this.showStatus(`❌ Error: ${error.message}`, 'error');
      this.log(`Error de procesamiento: ${error.message}`, 'error');
    } finally {
      this.processButton.disabled = false;
    }
  }

  showStatus(message, type) {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status ${type} show`;
  }

  showProgress(percentage) {
    this.progressContainer.classList.add('show');
    this.progressFill.style.width = `${percentage}%`;
    this.progressText.textContent = `${Math.round(percentage)}%`;

    if (percentage >= 100) {
      setTimeout(() => {
        this.progressContainer.classList.remove('show');
      }, 3000);
    }
  }
}

// ─── Funciones inyectadas en CIDI (deben ser top-level para chrome.scripting) ───

function detectarPestanaCIDIEnPagina() {
  const url = window.location.href;
  const pageText = document.body.innerText || '';

  if (/evaluaciones?\s*1\s*[-–]\s*4/i.test(pageText) ||
      /evaluaci[oó]n\s*1\b/i.test(pageText) ||
      url.includes('Evaluacion1')) {
    return 'eval14';
  }
  if (/evaluaciones?\s*5\s*[-–]\s*8/i.test(pageText) ||
      /evaluaci[oó]n\s*5\b/i.test(pageText) ||
      url.includes('Evaluacion5')) {
    return 'eval58';
  }
  if (/\bj\.?\s*i\.?\s*s\.?\b/i.test(pageText) ||
      /jornada\s+intensiva/i.test(pageText) ||
      url.includes('JIS')) {
    return 'jis';
  }

  const tabs = Array.from(document.querySelectorAll('a, li, span, button'));
  for (const el of tabs) {
    const t = (el.textContent || '').trim();
    if (/evaluaciones?\s*1\s*[-–]\s*4/i.test(t) && el.className && /active|selected|current/i.test(el.className)) {
      return 'eval14';
    }
    if (/evaluaciones?\s*5\s*[-–]\s*8/i.test(t) && el.className && /active|selected|current/i.test(t)) {
      return 'eval58';
    }
    if (/\bj\.?\s*i\.?\s*s\.?\b/i.test(t) && el.className && /active|selected|current/i.test(t)) {
      return 'jis';
    }
  }

  return null;
}

function cidiInjectProcessingScript(estudiantes, pestanas) {
  const processed = { success: 0, errors: 0, notFound: 0 };
  const logs = [];

  function addLog(tipo, mensaje) {
    logs.push({ tipo, mensaje });
  }

  function normalizar(str) {
    return String(str || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[,;]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseNombreXlsx(nombreCompleto) {
    const raw = String(nombreCompleto || '').trim();
    const idx = raw.indexOf(',');
    if (idx === -1) {
      return { apellido: raw, nombre: '' };
    }
    return {
      apellido: raw.slice(0, idx).trim(),
      nombre: raw.slice(idx + 1).trim()
    };
  }

  function nombresCompatibles(nomXlsx, nomCidi) {
    if (!nomXlsx) return true;
    if (!nomCidi) return false;
    if (nomCidi === nomXlsx) return true;
    if (nomCidi.includes(nomXlsx) || nomXlsx.includes(nomCidi)) return true;
    const tokens = nomXlsx.split(' ').filter(t => t.length > 2);
    if (tokens.length === 0) return true;
    return tokens.every(t => nomCidi.includes(t));
  }

  function normalizarDni(dni) {
    return String(dni || '').replace(/\D/g, '').replace(/^0+/, '') || '';
  }

  function esDniAlumno(dni) {
    const d = normalizarDni(dni);
    return d.length >= 6 && d.length <= 8;
  }

  function dnisCoinciden(a, b) {
    const na = normalizarDni(a);
    const nb = normalizarDni(b);
    if (!na || !nb) return false;
    if (na === nb) return true;
    const maxLen = Math.max(na.length, nb.length);
    return na.padStart(maxLen, '0') === nb.padStart(maxLen, '0');
  }

  /** Las 4 celdas de identidad están siempre antes del primer <select> de notas */
  function celdasIdentidadAlumno(fila) {
    const celdas = Array.from(fila.querySelectorAll('td'));
    if (celdas.length < 4) return null;

    const idxSelect = celdas.findIndex(td => td.querySelector('select'));
    if (idxSelect >= 4) {
      return celdas.slice(idxSelect - 4, idxSelect);
    }
    if (idxSelect === -1) {
      return celdas.slice(0, 4);
    }
    return null;
  }

  function parseAlumnoPosicional(fila) {
    const identidad = celdasIdentidadAlumno(fila);
    if (!identidad) return null;

    const textos = identidad.map(td => (td.textContent || '').trim());
    const dni = textos[0].replace(/\D/g, '');
    const sexo = textos[1];
    if (!esDniAlumno(dni)) return null;
    if (!/^[FM]$/i.test(sexo)) return null;

    const apellido = textos[2];
    const nombre = textos[3];
    if (!apellido || apellido.length < 2) return null;

    return { dni, apellido, nombre };
  }

  function extraerDatosFila(fila) {
    const pos = parseAlumnoPosicional(fila);
    const vacio = {
      dni: '',
      apellido: '',
      nombre: '',
      apellidoNorm: '',
      nombreNorm: '',
      clave: ''
    };

    if (!pos) return vacio;

    const apNorm = normalizar(pos.apellido);
    const nomNorm = normalizar(pos.nombre);
    return {
      dni: normalizarDni(pos.dni),
      apellido: pos.apellido,
      nombre: pos.nombre,
      apellidoNorm: apNorm,
      nombreNorm: nomNorm,
      clave: normalizar(`${pos.apellido} ${pos.nombre}`)
    };
  }

  /** Solo filas de la grilla de notas (con <select>), no planes de estudio ni cabeceras */
  function buscarFilasEnDocumento(doc) {
    const esFilaAlumno = tr =>
      tr.querySelectorAll('td').length > 0 &&
      !tr.closest('thead') &&
      tr.querySelectorAll('select').length > 0 &&
      parseAlumnoPosicional(tr) !== null;

    let mejor = [];

    for (const tabla of doc.querySelectorAll('table')) {
      const filas = Array.from(tabla.querySelectorAll('tr')).filter(esFilaAlumno);
      if (filas.length > mejor.length) {
        mejor = filas;
      }
    }

    const todas = Array.from(doc.querySelectorAll('table tr')).filter(
      tr => tr.querySelectorAll('td').length > 0
    );

    if (mejor.length > 0) {
      return { filas: mejor, origen: 'tabla resultados (4 cols antes de selects)' };
    }

    return { filas: [], origen: 'ninguna', filasTotales: todas.length };
  }

  function encontrarFilasAlumnos() {
    const docs = [{ doc: document, etiqueta: 'página' }];

    for (const iframe of document.querySelectorAll('iframe')) {
      try {
        if (iframe.contentDocument) {
          docs.push({ doc: iframe.contentDocument, etiqueta: 'iframe' });
        }
      } catch (_) { /* cross-origin */ }
    }

    let mejor = { filas: [], origen: 'ninguna', filasTotales: 0 };
    let totalSelects = 0;

    for (const { doc, etiqueta } of docs) {
      totalSelects += doc.querySelectorAll('select').length;
      const resultado = buscarFilasEnDocumento(doc);
      if (resultado.filas.length > mejor.filas.length) {
        mejor = {
          ...resultado,
          origen: resultado.origen + (etiqueta === 'iframe' ? ' (iframe)' : ''),
          filasTotales: resultado.filasTotales ?? 0
        };
      }
    }

    return { ...mejor, totalSelects, iframes: docs.length - 1 };
  }

  function construirIndice(filas) {
    const vistos = new Map();
    for (const fila of filas) {
      const datos = extraerDatosFila(fila);
      if (!esDniAlumno(datos.dni)) continue;
      const key = normalizarDni(datos.dni);
      if (!vistos.has(key)) {
        vistos.set(key, { fila, ...datos });
      }
    }
    return Array.from(vistos.values());
  }

  function conciliarAlumno(estudiante, indice) {
    const { dni, nombreCompleto } = estudiante;

    if (dni) {
      const porDni = indice.filter(r => dnisCoinciden(r.dni, dni));
      if (porDni.length >= 1) {
        if (porDni.length > 1) {
          addLog('info', `DNI ${dni}: ${porDni.length} filas duplicadas, usando la primera`);
        }
        return { fila: porDni[0].fila, metodo: 'DNI', cidi: porDni[0] };
      }
    }

    const { apellido, nombre } = parseNombreXlsx(nombreCompleto);
    const apNorm = normalizar(apellido);
    const nomNorm = normalizar(nombre);
    const claveXlsx = normalizar(`${apellido} ${nombre}`);

    if (!apNorm && !claveXlsx) return null;

    const porClave = indice.filter(r => r.clave === claveXlsx);
    if (porClave.length === 1) {
      return { fila: porClave[0].fila, metodo: 'clave exacta', cidi: porClave[0] };
    }

    const porColumnas = indice.filter(r =>
      r.apellidoNorm === apNorm && r.nombreNorm === nomNorm
    );
    if (porColumnas.length === 1) {
      return { fila: porColumnas[0].fila, metodo: 'apellido+nombre', cidi: porColumnas[0] };
    }

    const porApellido = indice.filter(r => r.apellidoNorm === apNorm);

    if (porApellido.length === 1 && nombresCompatibles(nomNorm, porApellido[0].nombreNorm)) {
      return { fila: porApellido[0].fila, metodo: 'apellido único', cidi: porApellido[0] };
    }

    if (porApellido.length > 1 && nomNorm) {
      const acotados = porApellido.filter(r => nombresCompatibles(nomNorm, r.nombreNorm));
      if (acotados.length === 1) {
        return { fila: acotados[0].fila, metodo: 'apellido + nombre parcial', cidi: acotados[0] };
      }
      if (acotados.length > 1) {
        addLog('warning', `Ambiguo "${nombreCompleto}": ${acotados.length} candidatos con mismo apellido/nombre parcial`);
        return null;
      }
      addLog('warning', `Ambiguo "${nombreCompleto}": ${porApellido.length} filas con apellido "${apellido}"`);
      return null;
    }

    return null;
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async function fillSelect(row, columnIndex, value, contexto) {
    if (!value || value === '-') return { ok: true, skipped: true };

    const selects = row.querySelectorAll('select');
    if (columnIndex >= selects.length) {
      return { ok: false, reason: `select[${columnIndex}] no existe (hay ${selects.length})` };
    }

    const select = selects[columnIndex];
    const option = Array.from(select.options).find(opt =>
      opt.value === value || opt.text === value || opt.value === String(value)
    );

    if (option) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
      await delay(50);
      return { ok: true };
    }

    const opciones = Array.from(select.options).slice(0, 6).map(o => o.value || o.text).join(', ');
    return { ok: false, reason: `${contexto}: "${value}" no está en select[${columnIndex}] (ej: ${opciones}...)` };
  }

  async function procesar() {
    const todasFilas = Array.from(document.querySelectorAll('table tr')).filter(
      tr => tr.querySelectorAll('td').length > 0
    );
    const { filas, origen, totalSelects, iframes } = encontrarFilasAlumnos();
    const selectsMuestra = filas[0] ? filas[0].querySelectorAll('select').length : 0;
    const diagnostics = {
      filasTotales: todasFilas.length,
      filasAlumnos: filas.length,
      selectsPorFila: selectsMuestra,
      totalSelects,
      iframes
    };

    addLog('info', `CIDI: ${todasFilas.length} filas <tr> → ${filas.length} alumnos (${origen})`);
    addLog('info', `Selects en página: ${totalSelects}${iframes ? ` · ${iframes} iframe(s)` : ''}`);

    if (filas.length === 0) {
      addLog('error', 'No se encontró la grilla de alumnos — ¿buscaste curso/materia y estás en Evaluaciones 1-4?');
      return { success: false, message: 'Grilla de notas no encontrada', processed, logs, diagnostics };
    }

    if (selectsMuestra === 0) {
      addLog('warning', 'Filas sin <select> — se intentará match pero no se pueden cargar notas');
    } else {
      addLog('info', `${selectsMuestra} <select> por fila de alumno`);
    }

    const indice = construirIndice(filas);
    const conDni = indice.filter(r => esDniAlumno(r.dni)).length;
    addLog('info', `Índice CIDI: ${indice.length} alumnos (${conDni} con DNI)`);

    if (indice[0]) {
      const m = indice[0];
      const etiqueta = m.apellido && m.nombre
        ? `${m.apellido}, ${m.nombre} (DNI ${m.dni})`
        : (m.dni ? `DNI ${m.dni}` : '(sin datos)');
      addLog('info', `Muestra CIDI[1]: ${etiqueta}`);
    } else {
      addLog('warning', 'Índice vacío — ¿RESULTADOS DE BÚSQUEDA visible con alumnos?');
    }

    for (const estudiante of estudiantes) {
      const match = conciliarAlumno(estudiante, indice);

      if (!match) {
        processed.notFound++;
        const detalle = estudiante.dni
          ? `DNI ${estudiante.dni} — ${estudiante.nombreCompleto}`
          : estudiante.nombreCompleto;
        addLog('warning', `Sin match: ${detalle}`);
        continue;
      }

      const ref = match.cidi;
      addLog('info', `✓ [${match.metodo}] ${estudiante.nombreCompleto} ↔ ${ref.apellido}, ${ref.nombre}`);

      try {
        const fallos = [];

        if (pestanas.eval14) {
          for (let i = 0; i < 4; i++) {
            const key = `eval${i + 1}`;
            const ev = estudiante.evaluaciones[key];
            if (ev.valor !== null) {
              const r = await fillSelect(match.fila, i * 3, ev.valor, key);
              if (r.reason) fallos.push(r.reason);
            }
            if (ev.recuperatorio !== null) {
              const r = await fillSelect(match.fila, i * 3 + 1, ev.recuperatorio, `rec${i + 1}`);
              if (r.reason) fallos.push(r.reason);
            }
          }
        }

        if (pestanas.eval58) {
          for (let i = 0; i < 4; i++) {
            const key = `eval${i + 5}`;
            const ev = estudiante.evaluaciones[key];
            if (ev.valor !== null) {
              const r = await fillSelect(match.fila, i * 3, ev.valor, key);
              if (r.reason) fallos.push(r.reason);
            }
            if (ev.recuperatorio !== null) {
              const r = await fillSelect(match.fila, i * 3 + 1, ev.recuperatorio, `rec${i + 5}`);
              if (r.reason) fallos.push(r.reason);
            }
          }
        }

        if (pestanas.jis) {
          for (let i = 0; i < 2; i++) {
            const key = `jis${i + 1}`;
            const ev = estudiante.evaluaciones[key];
            if (ev.valor !== null) {
              const r = await fillSelect(match.fila, i * 2, ev.valor, key);
              if (r.reason) fallos.push(r.reason);
            }
            if (ev.recuperatorio !== null) {
              const r = await fillSelect(match.fila, i * 2 + 1, ev.recuperatorio, `rec${key}`);
              if (r.reason) fallos.push(r.reason);
            }
          }
        }

        if (fallos.length > 0) {
          processed.errors++;
          addLog('error', `${estudiante.nombreCompleto}: ${fallos[0]}`);
        } else {
          processed.success++;
        }

      } catch (error) {
        processed.errors++;
        addLog('error', `${estudiante.nombreCompleto}: ${error.message}`);
      }
    }

    return {
      success: true,
      message: 'Procesamiento completado',
      processed,
      logs,
      diagnostics
    };
  }

  return procesar().catch(error => {
    addLog('error', `Error fatal: ${error.message}`);
    return {
      success: false,
      message: error.message,
      processed,
      logs,
      diagnostics: { filasTabla: 0, selectsPorFila: 0 }
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  new CIDIAutoNotas();
});
