#!/bin/bash

# Script de compilación de APK para Hotel Talavera v4
# Este script automatiza el proceso de compilación completo

set -e  # Salir si hay errores

echo "======================================"
echo "Hotel Talavera v4 - APK Builder"
echo "======================================"
echo ""

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mensajes de error
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Función para mensajes de éxito
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Función para mensajes de información
info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Verificar Java
info "Verificando Java..."
if ! command -v java &> /dev/null; then
    error "Java no está instalado. Por favor instala Java 17 o superior."
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d. -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    error "Se requiere Java 17 o superior. Versión actual: $JAVA_VERSION"
fi
success "Java $JAVA_VERSION detectado"

# Verificar ANDROID_HOME
info "Verificando Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    info "ANDROID_HOME no está configurado. Intentando detectar..."

    # Intentar detectar automáticamente
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
        success "Android SDK detectado en: $ANDROID_HOME"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        success "Android SDK detectado en: $ANDROID_HOME"
    else
        error "No se pudo detectar Android SDK. Por favor configura ANDROID_HOME"
    fi
else
    success "ANDROID_HOME: $ANDROID_HOME"
fi

# Verificar si existe el directorio android
if [ ! -d "android" ]; then
    error "Directorio 'android' no encontrado. ¿Estás en la raíz del proyecto?"
fi

# Instalar dependencias de Node
info "Instalando dependencias de Node..."
npm install || error "Error al instalar dependencias"
success "Dependencias instaladas"

# Compilar aplicación web
info "Compilando aplicación web..."
npm run build || error "Error al compilar aplicación web"
success "Aplicación web compilada"

# Sincronizar con Capacitor
info "Sincronizando con Capacitor..."
npx cap sync android || error "Error al sincronizar con Capacitor"
success "Sincronización completa"

# Hacer gradlew ejecutable
chmod +x android/gradlew

# Compilar APK
info "Compilando APK debug..."
cd android
./gradlew clean assembleDebug || error "Error al compilar APK"
cd ..
success "APK compilado exitosamente"

# Copiar APK a la raíz
info "Copiando APK a la raíz del proyecto..."
cp android/app/build/outputs/apk/debug/app-debug.apk TalaveraV4-debug.apk || error "Error al copiar APK"
success "APK copiado como: TalaveraV4-debug.apk"

# Obtener información del APK
APK_SIZE=$(du -h TalaveraV4-debug.apk | cut -f1)

echo ""
echo "======================================"
echo -e "${GREEN}✓ Compilación exitosa${NC}"
echo "======================================"
echo ""
echo "APK generado: TalaveraV4-debug.apk"
echo "Tamaño: $APK_SIZE"
echo ""
echo "Para instalar en tu dispositivo:"
echo "  adb install TalaveraV4-debug.apk"
echo ""
echo "O transfiere el archivo al dispositivo e instálalo manualmente."
echo ""
