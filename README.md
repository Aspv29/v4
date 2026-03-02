<div align="center">

# HOTEL TALAVERA v4

### Sistema de Concierge Premium

**Android APK + Windows Desktop**

---

[![Android](https://img.shields.io/badge/Android-APK_Debug-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Aspv29/v4/releases/download/v4.0.0/TalaveraV3-debug.apk)
[![Windows](https://img.shields.io/badge/Windows-Portable_ZIP-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Aspv29/v4/releases/download/v4.0.0/TalaveraV3-Windows-Portable.zip)

</div>

---

## Descargas Directas

| Plataforma | Archivo | Tamano | Enlace |
|------------|---------|--------|--------|
| Android | `TalaveraV3-debug.apk` | 4.5 MB | [**Descargar APK**](https://github.com/Aspv29/v4/releases/download/v4.0.0/TalaveraV3-debug.apk) |
| Windows | `TalaveraV3-Windows-Portable.zip` | 132 MB | [**Descargar Windows**](https://github.com/Aspv29/v4/releases/download/v4.0.0/TalaveraV3-Windows-Portable.zip) |

---

## Funcionalidades Premium

### Sistema de Reservaciones de Hospedaje
- Formulario completo: nombre, fechas check-in/check-out, tipo de habitacion, numero de habitaciones, personas extra
- Calculo automatico de costos por noche, noches totales, cargos extra (suites)
- Generacion de folio unico basado en apellido + fecha
- Vista previa en tiempo real (Live Preview) con datos del huesped
- Generacion de PDF profesional de confirmacion con:
  - Logo SVG de alta resolucion (8 petalos Talavera)
  - Politicas de reservacion y cancelacion
  - Datos bancarios (BANORTE) para deposito
  - Tabla de costos por ingreso anticipado / salida tardia
  - Aviso de privacidad

### Sistema de Eventos en Terraza
- Formulario para eventos: cliente, telefono, fecha, horario, tipo de evento
- Campos de costo de evento + costo de menu separados
- Detalles de texto libre para especificaciones del evento
- Estado de pago: Pendiente / Pagado / Pendiente al llegar (con colores)
- Marca de agua opcional del logo Hotel Talavera
- PDF de formato compacto (15cm x 21.5cm) con todos los datos

### Menu del Restaurante (PDF)
- Menu completo generado en PDF con categorias:
  - Desayunos (Americano, Europeo, Mexicano, Motulenos, Rancheros)
  - Huevos al gusto (12 variedades)
  - Omelettes (5 opciones)
  - Lo Mexicano (13 platillos)
  - Snacks y Entradas (13 opciones)
  - Bebidas (9 opciones)
- Precios actualizados en pesos MXN

### Compartir por WhatsApp
- Envio directo a WhatsApp sin necesidad de agregar contacto
- Soporte para PDF e imagenes
- Selector de codigo de pais
- Validacion de numero telefonico
- Compartir multiples documentos

### Sistema de Archivos (Archives)
- Guardado automatico de reservaciones en localStorage
- Historial de hasta 50 reservaciones
- Cargar reservacion guardada para edicion/reenvio
- Eliminar registros individuales

### Captura de Imagen Ultra HD
- Captura de pantalla a 4K (escala 4x) usando html2canvas
- Descarga como PNG de alta resolucion
- Guardado en Documents en Android via Capacitor Filesystem

### Seguridad Kiosk Mode
- Bloqueo de click derecho
- Bloqueo de F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S
- Modo pantalla completa automatico
- Prevencion de arrastrar imagenes/texto
- Pantalla de bloqueo con autenticacion

### Modo Desarrollador Secreto
- 5 clicks rapidos en el logo del header
- Descarga automatica del codigo fuente como ZIP

### Modo Oscuro / Claro
- Toggle de tema dark/light con persistencia en localStorage
- Deteccion automatica de preferencia del sistema operativo
- Transiciones suaves de 500ms

---

## Stack Tecnologico

| Tecnologia | Version | Uso |
|-----------|---------|-----|
| React | 19.2.3 | UI Framework |
| TypeScript | 5.8.2 | Type Safety |
| Vite | 7.3.1 | Build Tool |
| Capacitor | 8.1.0 | Android Native Bridge |
| Electron | 35.2.0 | Windows Desktop |
| electron-builder | 26.0.0 | Windows Packaging |
| jsPDF | 4.0.0 | Generacion de PDFs |
| html2canvas | 1.4.1 | Capturas de pantalla |
| JSZip | 3.10.1 | Empaquetado de codigo |
| Lucide React | 0.562.0 | Iconografia |
| Tailwind CSS | CDN | Estilos utility-first |
| Google Generative AI | 1.37.0 | Integracion IA |

---

## Estructura del Proyecto

```
v4/
├── App.tsx                          # Componente principal de la aplicacion
├── index.html                       # HTML entry point con Tailwind CDN
├── index.tsx                        # React DOM render entry
├── types.ts                         # Tipos, interfaces, precios, logos SVG
├── vite.config.ts                   # Configuracion de Vite
├── tsconfig.json                    # Configuracion de TypeScript
├── capacitor.config.json            # Configuracion de Capacitor (Android)
├── package.json                     # Dependencias y scripts de build
├── manifest.json                    # PWA manifest
├── sw.js                            # Service Worker
│
├── components/
│   ├── BookingForm.tsx              # Formulario de reservacion
│   ├── LivePreview.tsx              # Vista previa en tiempo real
│   ├── LockScreen.tsx               # Pantalla de bloqueo/autenticacion
│   ├── Archives.tsx                 # Historial de reservaciones
│   ├── TerraceEventForm.tsx         # Formulario de eventos en terraza
│   ├── Logo.tsx                     # Componente SVG del logo Talavera
│   ├── WhatsAppShareDialog.tsx      # Dialogo para compartir por WhatsApp
│   └── WhatsAppShareDialog.css      # Estilos del dialogo WhatsApp
│
├── services/
│   ├── pdfGenerator.ts              # Generacion de PDFs (confirmacion, evento, menu)
│   ├── archiveService.ts            # Servicio de almacenamiento local
│   ├── whatsappService.ts           # Servicio de compartir por WhatsApp
│   └── projectZipper.ts             # Descarga del codigo fuente como ZIP
│
├── electron/
│   ├── main.js                      # Proceso principal de Electron (Windows)
│   └── preload.js                   # Script de preload seguro
│
├── android/                         # Proyecto nativo Android (Capacitor)
│   ├── app/
│   │   ├── build.gradle             # Config de compilacion Android
│   │   └── src/main/
│   │       ├── AndroidManifest.xml  # Permisos y configuracion
│   │       ├── java/.../MainActivity.java
│   │       └── res/                 # Recursos (iconos, strings, styles)
│   ├── build.gradle                 # Config raiz de Gradle
│   ├── variables.gradle             # Variables de SDK versions
│   └── settings.gradle              # Modules de Gradle
│
└── pages/
    └── index.tsx                    # Pagina principal
```

---

## Permisos Android (Premium)

El APK incluye los siguientes permisos:

- `INTERNET` / `ACCESS_NETWORK_STATE` / `ACCESS_WIFI_STATE` - Conectividad
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` - Almacenamiento (SDK < 33)
- `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` / `READ_MEDIA_AUDIO` - Media (SDK 33+)
- `MANAGE_EXTERNAL_STORAGE` - Acceso completo a archivos
- `POST_NOTIFICATIONS` / `VIBRATE` - Notificaciones
- `CAMERA` / `RECORD_AUDIO` - Camara y audio
- `QUERY_ALL_PACKAGES` - Compartir con apps externas
- `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_DATA_SYNC` - Servicios en segundo plano
- `WAKE_LOCK` - Mantener la app activa
- `ACCESS_MEDIA_LOCATION` - Ubicacion de medios

---

## Configuracion de Windows Desktop (Electron)

- Ventana: 1400x900 (minimo 1024x768)
- Menu personalizado: Archivo, Ver (Zoom, Pantalla Completa), Ayuda
- Seguridad: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`
- Bloqueo de DevTools en produccion
- Prevencion de navegacion externa no autorizada
- Icono y branding de Hotel Talavera

---

## Instalacion para Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/Aspv29/v4.git
cd v4

# Instalar dependencias
npm install

# Desarrollo web
npm run dev

# Compilar para produccion
npm run build

# Sincronizar con Android
npm run cap:sync

# Compilar APK
npm run build:android
cd android && ./gradlew assembleDebug

# Desarrollo Electron (Windows/Linux/Mac)
npm run electron:dev

# Compilar Electron
npm run electron:build
```

---

## Datos del Hotel

**Hotel Talavera S.A. de C.V.**
Av. Miguel Hidalgo No. 1302, Col. Centro
Teziutlan, Puebla, Mexico

- WhatsApp: [231-145-6385](https://wa.me/522311456385)
- Email: hoteltalaveratez@gmail.com
- Banco: BANORTE
- Cuenta: 11 70 36 32 43
- CLABE: 07 26 72 01 17 03 63 24 34

---

<div align="center">

**Talavera v4 - Sistema Concierge Premium**

Version 3.0.0 | 2026

</div>
