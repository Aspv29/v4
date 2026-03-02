import React, { useEffect, useState } from 'react';
import { TerraceEventData } from '../types';
import { User, FileText, CalendarClock, Wallet, Stamp, CheckCircle2, XCircle, AlertCircle, Loader2, Utensils, Download, Share2, DollarSign } from 'lucide-react';
import { generateMenuPDF } from '../services/pdfGenerator';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface TerraceEventFormProps {
  data: TerraceEventData;
  onChange: (data: TerraceEventData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

// --- UTILIDAD: NUMERO A LETRAS (Simplificado para MXN) ---
const numberToLetters = (num: number): string => {
    const units = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
    const tens = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
    const teens = ['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISEIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
    
    if (!num || num === 0) return "CERO PESOS";
    
    let text = "";
    let n = Math.floor(num);
    
    // Miles
    if (n >= 1000) {
        let thousands = Math.floor(n / 1000);
        if (thousands === 1) text += "MIL ";
        else {
            if(thousands > 1 && thousands < 10) text += units[thousands] + " MIL ";
            else if (thousands >= 10 && thousands < 20) text += teens[thousands - 10] + " MIL ";
            else if (thousands >= 20) {
                text += tens[Math.floor(thousands/10)];
                if(thousands % 10 > 0) text += " Y " + units[thousands % 10];
                text += " MIL ";
            }
        }
        n = n % 1000;
    }

    // Centenas
    if (n >= 100) {
        if (n === 100) text += "CIEN ";
        else if (n > 100 && n < 200) text += "CIENTO ";
        else if (n >= 200 && n < 300) text += "DOSCIENTOS ";
        else if (n >= 300 && n < 400) text += "TRESCIENTOS ";
        else if (n >= 400 && n < 500) text += "CUATROCIENTOS ";
        else if (n >= 500 && n < 600) text += "QUINIENTOS ";
        else if (n >= 600 && n < 700) text += "SEISCIENTOS ";
        else if (n >= 700 && n < 800) text += "SETECIENTOS ";
        else if (n >= 800 && n < 900) text += "OCHOCIENTOS ";
        else if (n >= 900 && n < 1000) text += "NOVECIENTOS ";
        n = n % 100;
    }

    // Decenas y Unidades
    if (n > 0) {
        if (n < 10) text += units[n];
        else if (n >= 10 && n < 20) text += teens[n - 10];
        else {
            text += tens[Math.floor(n / 10)];
            if (n % 10 > 0) text += " Y " + units[n % 10];
        }
    }

    return (text.trim() + " PESOS 00/100 M.N.");
};

const TerraceEventForm: React.FC<TerraceEventFormProps> = ({ data, onChange, onGenerate, isGenerating }) => {
  const [isMenuGenerating, setIsMenuGenerating] = useState(false);

  // Auto-update letters when totalCost changes
  useEffect(() => {
      const text = numberToLetters(data.totalCost || 0);
      if (text !== data.totalCostText) {
          onChange({ ...data, totalCostText: text });
      }
  }, [data.totalCost]);

  // Auto-update letters when menuCost changes
  useEffect(() => {
      const text = numberToLetters(data.menuCost || 0);
      if (text !== data.menuCostText) {
          onChange({ ...data, menuCostText: text });
      }
  }, [data.menuCost]);

  const handleChange = (field: keyof TerraceEventData, value: any) => {
    let finalValue = value;
    if (field === 'clientName' || field === 'eventType' || field === 'details') {
        finalValue = String(value).toUpperCase();
    }
    onChange({ ...data, [field]: finalValue });
  };

  const cyclePaymentStatus = () => {
      if (data.paymentStatus === 'unpaid') onChange({...data, paymentStatus: 'paid'});
      else if (data.paymentStatus === 'paid') onChange({...data, paymentStatus: 'pending_arrival'});
      else onChange({...data, paymentStatus: 'unpaid'});
  };
  
  const toggleWatermark = () => {
      onChange({ ...data, showWatermark: !data.showWatermark });
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      if (rawVal === '') {
          handleChange('totalCost', 0);
      } else {
          handleChange('totalCost', parseInt(rawVal));
      }
  };

  const handleMenuCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      if (rawVal === '') {
          handleChange('menuCost', 0);
      } else {
          handleChange('menuCost', parseInt(rawVal));
      }
  };

  const handleMenuAction = async (action: 'download' | 'share') => {
      setIsMenuGenerating(true);
      setTimeout(async () => {
          try {
              if (Capacitor.isNativePlatform() && action === 'download') {
                  const blob = await generateMenuPDF(true) as Blob;
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = async () => {
                     const base64data = (reader.result as string).split(',')[1];
                     await Filesystem.writeFile({
                        path: 'Menu_Talavera.pdf',
                        data: base64data,
                        directory: Directory.Documents
                     });
                     alert("Menú guardado en Documentos");
                  };
              } else if (action === 'share') {
                   const blob = await generateMenuPDF(true) as Blob;
                   const file = new File([blob], "Menu_Talavera.pdf", { type: "application/pdf" });
                   if (navigator.canShare && navigator.canShare({ files: [file] })) {
                       await navigator.share({
                           files: [file],
                           title: 'Menú Hotel Talavera',
                           text: 'Adjunto el menú del restaurante.'
                       });
                   } else {
                       const link = document.createElement('a');
                       link.href = URL.createObjectURL(blob);
                       link.download = 'Menu_Talavera.pdf';
                       link.click();
                   }
              } else {
                  await generateMenuPDF(false);
              }
          } catch(e) {
              console.error(e);
          } finally {
              setIsMenuGenerating(false);
          }
      }, 100);
  };

  const quickTimes = ["12:00 PM - 06:00 PM", "04:00 PM - 10:00 PM", "06:00 PM - 12:00 AM", "08:00 PM - 02:00 AM"];
  const brandColor = "text-[#1a237e]";

  // Calculate Grand Total
  const grandTotal = (data.totalCost || 0) + (data.menuCost || 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 h-full overflow-y-auto w-full transition-colors">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30`}>
                <FileText className={`w-6 h-6 ${brandColor} dark:text-blue-400`} />
            </div>
            <div>
                <h2 className={`text-xl font-serif font-bold ${brandColor} dark:text-blue-400`}>Evento Terraza</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Complete los datos para generar la orden</p>
            </div>
        </div>
        
        {/* Watermark Toggle */}
        <button 
            onClick={toggleWatermark}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${data.showWatermark ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-600'}`}
        >
            <Stamp size={14} />
            {data.showWatermark ? "ON" : "OFF"}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: DATOS DEL CLIENTE */}
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 relative group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#c68652] rounded-l-xl"></div>
            <h3 className={`text-sm font-bold mb-3 ${brandColor} dark:text-blue-400 flex items-center gap-2 uppercase tracking-wide ml-2`}>
                <User size={16} /> Información del Cliente
            </h3>
            <div className="grid grid-cols-1 gap-4 pl-2">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">NOMBRE COMPLETO</label>
                    <input
                        type="text"
                        placeholder="Escriba el nombre..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none uppercase font-bold text-sm"
                        value={data.clientName}
                        onChange={(e) => handleChange('clientName', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">TELÉFONO DE CONTACTO</label>
                    <input
                        type="tel"
                        placeholder="000-000-0000"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none font-medium text-sm"
                        value={data.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* SECTION 2: DATOS DEL EVENTO */}
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 relative group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1a237e] dark:bg-blue-600 rounded-l-xl"></div>
            <h3 className={`text-sm font-bold mb-3 ${brandColor} dark:text-blue-400 flex items-center gap-2 uppercase tracking-wide ml-2`}>
                <CalendarClock size={16} /> Detalles del Evento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">FECHA</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none font-bold text-sm"
                        value={data.eventDate}
                        onChange={(e) => handleChange('eventDate', e.target.value)}
                    />
                </div>
                <div>
                     <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">TIPO DE EVENTO</label>
                    <input
                        type="text"
                        placeholder="EJ: CENA ROMÁNTICA"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none uppercase font-bold text-sm"
                        value={data.eventType}
                        onChange={(e) => handleChange('eventType', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">HORARIO</label>
                    <input
                        type="text"
                        placeholder="Ej. 6:00 PM - 10:00 PM"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none uppercase font-bold text-sm"
                        value={data.eventTime}
                        onChange={(e) => handleChange('eventTime', e.target.value)}
                    />
                    <div className="flex gap-1 mt-2 overflow-x-auto pb-1 no-scrollbar">
                        {quickTimes.map(time => (
                            <button 
                                key={time}
                                onClick={() => handleChange('eventTime', time)}
                                className="text-[9px] whitespace-nowrap px-2 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 rounded border border-gray-200 dark:border-slate-600 transition-colors"
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 3: COSTOS Y EXTRAS */}
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 relative group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-600 rounded-l-xl"></div>
            <h3 className={`text-sm font-bold mb-3 ${brandColor} dark:text-blue-400 flex items-center gap-2 uppercase tracking-wide ml-2`}>
                <Wallet size={16} /> Finanzas y Extras
            </h3>
            
            <div className="pl-2 space-y-4">
                
                {/* Free Text Details */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">DETALLES INCLUIDOS (Escriba libremente)</label>
                    <textarea
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none text-sm uppercase font-medium h-24 resize-none"
                        placeholder="Ej: Decoración romántica, Cena de 3 tiempos, Botella de vino..."
                        value={data.details}
                        onChange={(e) => handleChange('details', e.target.value)}
                    />
                </div>

                {/* Event Cost Control */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                    <label className="block text-xs font-bold text-[#1a237e] dark:text-blue-400 mb-2">COSTO DEL EVENTO / RENTA</label>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                min="0"
                                step="50"
                                value={data.totalCost || ''}
                                onChange={handleCostChange}
                                className="w-full pl-6 pr-3 py-2 text-right font-black text-xl text-[#1a237e] dark:text-blue-400 bg-white dark:bg-slate-900 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    
                    <input
                        type="range"
                        min="0"
                        max="25000"
                        step="50"
                        value={data.totalCost || 0}
                        onChange={handleCostChange}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1a237e] dark:accent-blue-500 mb-3"
                    />
                    
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded text-[10px] font-mono text-blue-900 dark:text-blue-300 text-center border border-blue-100 dark:border-blue-800">
                        {data.totalCostText || "CERO PESOS"}
                    </div>
                </div>

                {/* Menu Cost Control */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                    <label className="block text-xs font-bold text-[#c68652] dark:text-orange-400 mb-2">TOTAL A PAGAR DEL MENU DE RESTAURANTE</label>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative w-full">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                min="0"
                                step="50"
                                value={data.menuCost || ''}
                                onChange={handleMenuCostChange}
                                className="w-full pl-6 pr-3 py-2 text-right font-black text-xl text-[#c68652] dark:text-orange-400 bg-white dark:bg-slate-900 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#c68652] dark:focus:ring-orange-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    
                    <input
                        type="range"
                        min="0"
                        max="25000"
                        step="50"
                        value={data.menuCost || 0}
                        onChange={handleMenuCostChange}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#c68652] dark:accent-orange-500 mb-3"
                    />
                    
                    <div className="bg-orange-50/50 dark:bg-orange-900/20 p-2 rounded text-[10px] font-mono text-[#c68652] dark:text-orange-300 text-center border border-orange-100 dark:border-orange-800">
                        {data.menuCostText || "CERO PESOS"}
                    </div>
                </div>

                {/* TOTALS SEPARATION & DISPLAY */}
                <div className="mt-6 space-y-2">
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Resumen de Costos</div>
                    
                    {/* EVENT COST (HIGHLIGHTED AS PRIMARY) */}
                    <div className="bg-[#1a237e] dark:bg-blue-700 text-white p-4 rounded-xl shadow-lg shadow-blue-900/20 flex justify-between items-center transform transition-transform hover:scale-[1.01]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Wallet className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Costo Evento</div>
                                <div className="text-xs text-blue-300">Renta de Terraza</div>
                            </div>
                        </div>
                        <div className="text-2xl font-black tracking-tight">
                            ${(data.totalCost || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* MENU COST */}
                    <div className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900/50 p-3 rounded-xl shadow-sm flex justify-between items-center transition-colors">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <Utensils className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Consumo</div>
                                <div className="text-xs text-orange-600 dark:text-orange-400 font-bold">Menú Restaurante</div>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300 tracking-tight">
                            + ${(data.menuCost || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* GRAND TOTAL LINE */}
                    <div className="flex justify-between items-end px-3 pt-2">
                         <div className="text-right w-full">
                             <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mr-2 inline-block">Gran Total:</div>
                             <div className="text-xl font-black text-gray-900 dark:text-white inline-block transition-colors">
                                ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                             </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>

        {/* MENU ACTIONS */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/50 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-bold text-sm">
                <Utensils size={18} />
                <span>Menú Restaurante</span>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => handleMenuAction('download')} 
                    disabled={isMenuGenerating}
                    className="p-2 bg-white dark:bg-slate-800 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-200 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-slate-700 transition-colors"
                >
                    {isMenuGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Download className="w-4 h-4"/>}
                </button>
                <button 
                    onClick={() => handleMenuAction('share')} 
                    disabled={isMenuGenerating}
                    className="p-2 bg-orange-700 dark:bg-orange-600 text-white rounded-lg hover:bg-orange-800 dark:hover:bg-orange-500 shadow-md transition-colors"
                >
                    {isMenuGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Share2 className="w-4 h-4"/>}
                </button>
            </div>
        </div>

        {/* Payment Status Toggle (Enlarged) */}
        <div className="pt-4">
            <button
                onClick={cyclePaymentStatus}
                className={`w-full py-6 rounded-2xl font-black shadow-xl flex items-center justify-center gap-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    data.paymentStatus === 'paid' ? 'bg-gradient-to-r from-green-600 to-green-500 dark:from-green-700 dark:to-green-600 shadow-green-200 dark:shadow-green-900/20 text-white border-4 border-green-400 dark:border-green-500' :
                    data.paymentStatus === 'pending_arrival' ? 'bg-yellow-400 dark:bg-yellow-500 text-black shadow-yellow-200 dark:shadow-yellow-900/20 border-4 border-yellow-300 dark:border-yellow-400' :
                    'bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 shadow-red-200 dark:shadow-red-900/20 text-white border-4 border-red-400 dark:border-red-500'
                }`}
            >
                {data.paymentStatus === 'paid' && <><CheckCircle2 size={32} strokeWidth={3} /> <span className="text-2xl tracking-widest">PAGADO</span></>}
                {data.paymentStatus === 'pending_arrival' && <><AlertCircle size={32} strokeWidth={3} /> <span className="text-2xl tracking-widest">PAGO AL LLEGAR</span></>}
                {data.paymentStatus === 'unpaid' && <><XCircle size={32} strokeWidth={3} /> <span className="text-2xl tracking-widest">NO PAGADO</span></>}
            </button>
        </div>

        {/* Generate Button */}
        <button
            onClick={onGenerate}
            disabled={!data.clientName || !data.eventDate || isGenerating}
            className={`w-full py-4 mt-2 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2
            ${(!data.clientName || !data.eventDate)
                ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed text-gray-500' 
                : isGenerating 
                    ? 'bg-blue-900 dark:bg-blue-800 cursor-wait' 
                    : 'bg-[#1a237e] dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-500 hover:shadow-xl hover:-translate-y-1'
            }`}
        >
            {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
            <span className="text-lg">GENERAR ORDEN (PDF)</span>
        </button>
      </div>
    </div>
  );
};

export default TerraceEventForm;