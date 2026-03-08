import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface WhatsAppDirectChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppDirectChat: React.FC<WhatsAppDirectChatProps> = ({ isOpen, onClose }) => {
  const [countryCode, setCountryCode] = useState('+52');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const countryCodes = [
    { code: '+1', country: 'USA/Canadá' },
    { code: '+52', country: 'México' },
    { code: '+34', country: 'España' },
    { code: '+54', country: 'Argentina' },
    { code: '+56', country: 'Chile' },
    { code: '+57', country: 'Colombia' },
    { code: '+58', country: 'Venezuela' },
    { code: '+51', country: 'Perú' },
    { code: '+593', country: 'Ecuador' },
    { code: '+591', country: 'Bolivia' },
    { code: '+598', country: 'Uruguay' },
    { code: '+595', country: 'Paraguay' },
    { code: '+507', country: 'Panamá' },
    { code: '+506', country: 'Costa Rica' },
    { code: '+503', country: 'El Salvador' },
    { code: '+504', country: 'Honduras' },
    { code: '+505', country: 'Nicaragua' },
    { code: '+502', country: 'Guatemala' },
    { code: '+53', country: 'Cuba' },
    { code: '+1-809', country: 'Rep. Dominicana' },
  ];

  const handleSend = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!cleanPhone) {
      setError('Por favor ingresa un número válido');
      return;
    }

    if (cleanPhone.length < 8) {
      setError('El número es demasiado corto');
      return;
    }

    setError('');

    // Open WhatsApp with the phone number
    const fullNumber = `${countryCode}${cleanPhone}`.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${fullNumber}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setPhoneNumber('');
    onClose();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#25D366] p-6 flex items-center gap-4 relative">
          <div className="bg-white/20 p-3 rounded-full">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-xl">Abrir WhatsApp</h3>
            <p className="text-white/90 text-sm">Chat directo sin guardar contacto</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Ingresa el número de WhatsApp para abrir el chat directamente
          </p>

          {/* Country Code Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Código de País
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all"
            >
              {countryCodes.map((item) => (
                <option key={item.code} value={item.code} className="dark:bg-slate-900">
                  {item.code} - {item.country}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Número de WhatsApp
            </label>
            <div className="flex gap-2">
              <div className="bg-gray-100 dark:bg-slate-700 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 font-mono font-bold text-gray-700 dark:text-gray-300 flex items-center">
                {countryCode}
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="1234567890"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all font-mono"
                maxLength={15}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
            <div className="text-blue-600 dark:text-blue-400 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
              Se abrirá WhatsApp directamente con este número. No es necesario agregarlo a tus contactos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-slate-900 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            className="flex-1 px-6 py-3 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Send size={18} />
            Abrir Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDirectChat;
