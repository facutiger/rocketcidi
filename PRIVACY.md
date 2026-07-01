# Política de Privacidad — Rocket CIDI

**Última actualización:** julio de 2026

**Responsable:** Facundo — [repositorio en GitHub](https://github.com/facutiger/rocketcidi)  
**Contacto:** [Issues del proyecto](https://github.com/facutiger/rocketcidi/issues)

---

## 1. Alcance

Rocket CIDI (también conocida como CIDI Auto-Notas) es una extensión de Chrome que permite cargar calificaciones en el sistema CIDI del Gobierno de la Provincia de Córdoba, Argentina ([gestionestudiantes.cba.gov.ar](https://gestionestudiantes.cba.gov.ar/)), a partir de archivos Excel (XLSX) seleccionados por el usuario.

Esta extensión **no está afiliada ni respaldada oficialmente** por el Ministerio de Educación de Córdoba.

---

## 2. Datos que se procesan

Cuando el usuario utiliza la extensión, los siguientes datos pueden procesarse **localmente en su navegador**:

### Datos del archivo XLSX (seleccionado por el usuario)
- Nombres de alumnos
- Números de documento (DNI), si el archivo los incluye
- Calificaciones y recuperatorios
- Nombres de materias y metadatos del curso

### Contenido de la página CIDI
- Estructura de formularios y tablas de la página activa
- Nombres de alumnos visibles en la interfaz de CIDI
- Campos de calificaciones, únicamente para detectar la sección activa (Evaluaciones 1-4, 5-8 o JIS) y completar los formularios solicitados por el usuario

---

## 3. Datos que NO se recopilan ni transmiten

La extensión **no**:

- Envía datos a servidores del desarrollador ni de terceros
- Vende, alquila ni comparte datos de usuario
- Usa datos para publicidad, análisis de mercado ni elaboración de perfiles
- Almacena archivos XLSX ni calificaciones en servidores externos
- Accede a sitios web distintos de `gestionestudiantes.cba.gov.ar`
- Recopila historial de navegación, ubicación, credenciales ni comunicaciones personales

Todo el procesamiento ocurre en el dispositivo del usuario. Los registros de actividad de la extensión se mantienen en memoria durante el uso del popup y pueden exportarse manualmente a un archivo `.txt` en el equipo del usuario, si así lo decide.

---

## 4. Almacenamiento local

La extensión utiliza `sessionStorage` del navegador únicamente para recordar si el modo técnico de diagnóstico (destinado a administradores) está activo en la sesión actual. **No guarda datos de alumnos ni calificaciones** en almacenamiento persistente.

---

## 5. Permisos utilizados

| Permiso | Motivo |
|---------|--------|
| `activeTab` | Acceder a la pestaña activa cuando el usuario abre la extensión y ejecuta una acción |
| `scripting` | Inyectar funciones en la página CIDI para detectar la sección visible y completar formularios de notas |
| `https://gestionestudiantes.cba.gov.ar/*` | Interactuar exclusivamente con el sitio oficial de CIDI |

---

## 6. Código remoto

La extensión **no utiliza código JavaScript remoto**. Todas las bibliotecas (incluida la de lectura de archivos Excel) están incluidas en el paquete de la extensión distribuido por Chrome Web Store.

---

## 7. Menores y datos educativos

La extensión está dirigida a docentes y personal escolar. Los datos de alumnos provienen de archivos generados por el establecimiento educativo y se procesan bajo la responsabilidad del usuario que opera la herramienta, quien debe verificar los datos antes de confirmarlos en CIDI.

---

## 8. Cambios a esta política

Cualquier modificación se publicará en esta misma URL con la fecha de actualización correspondiente.

---

## 9. Contacto

Para consultas sobre privacidad o soporte técnico, abrí un issue en:  
https://github.com/facutiger/rocketcidi/issues
