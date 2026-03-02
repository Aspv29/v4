import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface WhatsAppShareOptions {
  phoneNumber: string;
  countryCode: string;
  message: string;
  fileUrl?: string;
  fileName?: string;
}

/**
 * Servicio premium para compartir documentos directamente a WhatsApp
 * sin necesidad de agregar contactos
 */
export class WhatsAppService {
  /**
   * Formatea el número de teléfono para WhatsApp
   * Elimina caracteres especiales y espacios
   */
  static formatPhoneNumber(phoneNumber: string, countryCode: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const cleanCode = countryCode.replace(/\D/g, '');
    return cleanCode + cleanNumber;
  }

  /**
   * Abre WhatsApp con un número específico sin agregarlo a contactos
   */
  static async openWhatsAppChat(phoneNumber: string, countryCode: string, message: string = ''): Promise<void> {
    const formattedNumber = this.formatPhoneNumber(phoneNumber, countryCode);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

    try {
      window.open(whatsappUrl, '_system');
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      throw new Error('No se pudo abrir WhatsApp. Asegúrate de tener la aplicación instalada.');
    }
  }

  /**
   * Comparte un documento directamente a WhatsApp con número personalizado
   */
  static async shareDocumentToWhatsApp(options: WhatsAppShareOptions): Promise<void> {
    const { phoneNumber, countryCode, message, fileUrl, fileName } = options;

    try {
      // Si hay un archivo para compartir
      if (fileUrl && fileName) {
        // Intenta usar la API de Share de Capacitor primero
        const canShare = await Share.canShare();

        if (canShare.value) {
          // Compartir usando la API nativa
          await Share.share({
            title: fileName,
            text: message,
            url: fileUrl,
            dialogTitle: 'Compartir documento',
          });
        } else {
          // Fallback: abrir WhatsApp con el mensaje
          const fullMessage = `${message}\n\n📄 Documento: ${fileName}`;
          await this.openWhatsAppChat(phoneNumber, countryCode, fullMessage);
        }
      } else {
        // Solo mensaje de texto
        await this.openWhatsAppChat(phoneNumber, countryCode, message);
      }
    } catch (error) {
      console.error('Error al compartir en WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Descarga y comparte un documento generado (PDF o imagen)
   */
  static async downloadAndShareToWhatsApp(
    dataUrl: string,
    fileName: string,
    phoneNumber: string,
    countryCode: string,
    message: string
  ): Promise<void> {
    try {
      // Guardar el archivo temporalmente
      const base64Data = dataUrl.split(',')[1];
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Obtener la URI del archivo guardado
      const fileUri = savedFile.uri;

      // Compartir a WhatsApp
      await this.shareDocumentToWhatsApp({
        phoneNumber,
        countryCode,
        message: `${message}\n\n📄 Documento generado desde Talavera v3`,
        fileUrl: fileUri,
        fileName,
      });
    } catch (error) {
      console.error('Error al descargar y compartir:', error);

      // Fallback: abrir WhatsApp solo con el mensaje
      const fallbackMessage = `${message}\n\n📄 Documento: ${fileName}\n(El archivo se generó correctamente, puedes descargarlo desde la aplicación)`;
      await this.openWhatsAppChat(phoneNumber, countryCode, fallbackMessage);
    }
  }

  /**
   * Valida si un número de WhatsApp es válido
   */
  static validatePhoneNumber(phoneNumber: string, countryCode: string): {
    valid: boolean;
    error?: string;
  } {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const cleanCode = countryCode.replace(/\D/g, '');

    if (!cleanNumber) {
      return { valid: false, error: 'El número de teléfono es requerido' };
    }

    if (cleanNumber.length < 8) {
      return { valid: false, error: 'El número es demasiado corto' };
    }

    if (cleanNumber.length > 15) {
      return { valid: false, error: 'El número es demasiado largo' };
    }

    if (!cleanCode) {
      return { valid: false, error: 'El código de país es requerido' };
    }

    return { valid: true };
  }

  /**
   * Comparte múltiples documentos a WhatsApp
   */
  static async shareMultipleDocuments(
    files: Array<{ url: string; name: string }>,
    phoneNumber: string,
    countryCode: string,
    message: string
  ): Promise<void> {
    try {
      const fileList = files.map(f => f.name).join('\n• ');
      const fullMessage = `${message}\n\n📄 Documentos:\n• ${fileList}`;

      // Por ahora, WhatsApp tiene limitaciones con múltiples archivos
      // Enviamos el mensaje con la lista
      await this.openWhatsAppChat(phoneNumber, countryCode, fullMessage);
    } catch (error) {
      console.error('Error al compartir múltiples documentos:', error);
      throw error;
    }
  }
}

export default WhatsAppService;
