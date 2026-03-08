# Guía de Compilación para Android - Hotel Talavera v4

## Requisitos Previos

1. **Node.js 22+** instalado
2. **Java JDK 17** instalado
3. **Android SDK** instalado (Android Studio o Command Line Tools)
4. **Git** instalado

## Configuración del Entorno

### 1. Instalar Java 17

#### Windows:
- Descargar e instalar [Amazon Corretto 17](https://docs.aws.amazon.com/corretto/latest/corretto-17-ug/downloads-list.html)
- Configurar JAVA_HOME en las variables de entorno

#### macOS:
```bash
brew install openjdk@17
```

#### Linux:
```bash
sudo apt install openjdk-17-jdk  # Ubuntu/Debian
# o
sudo dnf install java-17-openjdk-devel  # Fedora/RHEL
```

### 2. Instalar Android SDK

#### Opción A: Android Studio (Recomendado)
1. Descargar e instalar [Android Studio](https://developer.android.com/studio)
2. Abrir Android Studio > Settings > Appearance & Behavior > System Settings > Android SDK
3. Instalar:
   - Android SDK Platform 34 (Android 14.0)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools

#### Opción B: Command Line Tools
```bash
# Descargar desde: https://developer.android.com/studio#command-tools
# Extraer en: ~/Android/Sdk/cmdline-tools/latest/
```

### 3. Configurar Variables de Entorno

#### Windows:
```cmd
set ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

#### macOS/Linux:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

Agregar al archivo `~/.bashrc` o `~/.zshrc` para que sea permanente.

## Compilación del APK

### Método 1: Usando npm scripts (Recomendado)

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar y crear APK debug
npm run create-debug-apk

# El APK estará en: TalaveraV4-debug.apk
```

### Método 2: Paso a paso

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar la aplicación web
npm run build

# 3. Sincronizar con Capacitor
npm run cap:sync

# 4. Compilar APK
cd android
./gradlew assembleDebug

# El APK estará en: android/app/build/outputs/apk/debug/app-debug.apk
```

### Método 3: APK de Release (Firmado)

```bash
# 1. Generar keystore (primera vez)
keytool -genkey -v -keystore talavera-release.keystore -alias talavera -keyalg RSA -keysize 2048 -validity 10000

# 2. Compilar release
cd android
./gradlew assembleRelease

# El APK estará en: android/app/build/outputs/apk/release/app-release.apk
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar aplicación web
- `npm run cap:sync` - Sincronizar con Android
- `npm run build:android` - Compilar web y sincronizar
- `npm run create-debug-apk` - Crear APK debug completo

## Solución de Problemas

### Error: "SDK location not found"
```bash
# Crear archivo: android/local.properties
sdk.dir=/ruta/a/tu/Android/Sdk
```

### Error: "JAVA_HOME is not set"
```bash
# Windows
set JAVA_HOME=C:\Program Files\Amazon Corretto\jdk17.x.x

# macOS/Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

### Error: "Gradle sync failed"
```bash
# Limpiar y reconstruir
cd android
./gradlew clean
./gradlew assembleDebug --refresh-dependencies
```

### Error: Permisos en gradlew
```bash
chmod +x android/gradlew
```

## Instalación del APK

### En dispositivo físico:
1. Habilitar "Orígenes desconocidos" en Configuración > Seguridad
2. Transferir el APK al dispositivo
3. Abrir el APK e instalar

### En emulador:
```bash
adb install TalaveraV4-debug.apk
```

## Características de la Aplicación

- ✅ Sistema de reservaciones multi-habitación
- ✅ Generación de confirmaciones en PDF
- ✅ Compartir por WhatsApp directamente
- ✅ Chat directo de WhatsApp integrado
- ✅ Tema claro/oscuro
- ✅ Logo SVG personalizado de Hotel Talavera
- ✅ Cálculo automático de precios por temporada
- ✅ Soporte para personas extras en suites
- ✅ Permisos completos de Android configurados

## Permisos de Android

La aplicación solicita los siguientes permisos:
- `INTERNET` - Para compartir contenido
- `READ_EXTERNAL_STORAGE` - Para leer archivos
- `WRITE_EXTERNAL_STORAGE` - Para guardar PDFs
- `CAMERA` - Para escaneo futuro (opcional)
- `VIBRATE` - Para notificaciones

## Contacto y Soporte

Para reportar problemas o sugerencias:
- Email: soporte@hoteltalavera.com
- WhatsApp: [Agregar número]

---

**Hotel Talavera v4** - Sistema de Concierge Premium
© 2026 Hotel Talavera. Todos los derechos reservados.
