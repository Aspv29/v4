import React, { forwardRef, memo } from 'react';
import { BookingData, BookingSummary, HOTEL_LOGO, RoomType, EXTRA_PERSON_COST, TerraceEventData } from '../types';
import Logo from './Logo';

interface LivePreviewProps {
  data?: BookingData;
  summary?: BookingSummary;
  eventData?: TerraceEventData;
  mode?: 'booking' | 'event';
  isDarkMode?: boolean;
}

const LivePreview = forwardRef<HTMLDivElement, LivePreviewProps>(({ data, summary, eventData, mode = 'booking', isDarkMode = false }, ref) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "---";
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatMoney = (amount: number) => `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- RENDER BOOKING PREVIEW ---
  if (mode === 'booking' && data && summary) {
      const displayRoomType = data.roomType.toUpperCase();
      const hasExtraPersons = data.roomType === RoomType.SUITE && (data.extraPersons || 0) > 0;
      const extraPersonTotal = hasExtraPersons ? (data.extraPersons! * EXTRA_PERSON_COST * summary.nights) : 0;

      return (
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-2xl shadow-xl border overflow-hidden h-full flex flex-col transition-colors`}>
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-800'} text-white p-4 text-center shrink-0 transition-colors`}>
            <h3 className="text-sm font-medium tracking-widest uppercase">Vista Previa - Hospedaje</h3>
          </div>
          <div className={`flex-1 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-200'} p-4 md:p-8 overflow-y-auto flex justify-center transition-colors`}>
            <div 
              ref={ref} 
              id="capture-target"
              className="bg-white shadow-lg shrink-0 text-black font-sans relative flex flex-col"
              style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }} 
            >
              <div className="flex flex-col items-center mb-10">
                <Logo className="w-48 h-auto" color="#1a237e" />
              </div>

              <div className="text-center mb-6 text-xs uppercase tracking-wide">
                <p className="font-bold">¡Todo listo para tu estancia en Hotel Talavera!</p>
              </div>

              <div className="mb-6 text-xs text-justify leading-relaxed">
                Estimad{data.firstName.toLowerCase().includes('a') || data.firstName.toLowerCase().includes('e') ? 'a' : 'o'} {data.firstName} {data.lastName}, Es un placer confirmar tu próxima visita. Hemos preparado cada detalle para que disfrutes de una experiencia inolvidable con nosotros. A continuación, los detalles de tu reservación:
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wide">Detalles de la Reserva:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex gap-1"><span>❖</span><span className="font-bold">Número de Confirmación:</span><span className="uppercase">{summary.folio}</span></div>
                  <div className="flex gap-1"><span>❖</span><span className="font-bold">Check-in:</span><span>{formatDate(data.checkIn)} | 15:00 hrs</span></div>
                  <div className="flex gap-1"><span>❖</span><span className="font-bold">Check-out:</span><span>{formatDate(data.checkOut)} | 13:00 hrs</span></div>
                  <div className="flex gap-1"><span>❖</span><span className="font-bold">Habitación:</span><span className="uppercase">{displayRoomType} ({data.numberOfRooms} habitación{data.numberOfRooms > 1 ? 'es' : ''}, {summary.nights} noche{summary.nights !== 1 ? 's' : ''})</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wide">Información de Pago:</h4>
                <div className="space-y-1 text-xs">
                  {summary.roomBreakdown && summary.roomBreakdown.length > 0 ? (
                    <>
                      {summary.roomBreakdown.map((room, idx) => (
                        <div key={idx} className="flex gap-1">
                          <span>❖</span>
                          <span className="font-bold">{room.roomType.toUpperCase()}:</span>
                          <span>{room.quantity} habitación{room.quantity > 1 ? 'es' : ''} x {summary.nights} noche{summary.nights !== 1 ? 's' : ''} = {formatMoney(room.subtotal)}</span>
                          <span className="text-gray-500">({formatMoney(room.pricePerNight)}/noche)</span>
                        </div>
                      ))}
                      {hasExtraPersons && (
                        <div className="flex gap-1 text-blue-900">
                          <span>❖</span>
                          <span className="font-bold">Personas extras ({data.extraPersons}):</span>
                          <span>{formatMoney(extraPersonTotal)} (${EXTRA_PERSON_COST} c/u)</span>
                        </div>
                      )}
                      <div className="flex gap-1 pt-2 border-t border-gray-300">
                        <span>❖</span>
                        <span className="font-bold">TOTAL A PAGAR:</span>
                        <span className="font-bold text-[#1a237e]">{formatMoney(summary.totalCost)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-1"><span>❖</span><span className="font-bold">Costo por noche:</span><span>{formatMoney(summary.pricePerNight)}</span></div>
                      <div className="flex gap-1"><span>❖</span><span className="font-bold">Total, de {data.numberOfRooms} habitación{data.numberOfRooms > 1 ? 'es' : ''} por {summary.nights} noche{summary.nights !== 1 ? 's' : ''}:</span><span className="font-bold">{formatMoney(summary.totalCost)}</span></div>
                      {hasExtraPersons && (<div className="flex gap-1 text-blue-900"><span>❖</span><span className="font-bold">Personas extras ({data.extraPersons}):</span><span>{formatMoney(extraPersonTotal)} (${EXTRA_PERSON_COST} c/u)</span></div>)}
                    </>
                  )}
                  <div className="flex gap-1"><span>❖</span><span className="font-bold">Incluye:</span><span className="uppercase">Desayuno Continental (Café, pieza de pan y fruta de temporada).</span> <span className="font-bold">Hasta 10:30 a.m. se puede solicitar.</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-sm mb-3 uppercase tracking-wide">Pasos importantes para garantizar tu reserva:</h4>
                <div className="text-xs text-justify leading-relaxed">
                  <p className="mb-3">Para asegurar tu habitación, requerimos el depósito de su habitación (pago completo, no parcial) a más tardar <span className="font-bold underline">5 días antes de tu llegada.</span></p>
                </div>
              </div>

              <div className="mb-6 border-2 border-[#1a237e] rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-sm mb-3 text-center uppercase tracking-wide text-[#1a237e]">Datos Bancarios (Banorte):</h4>
                <div className="text-xs space-y-1.5">
                  <div className="text-center font-bold">Nombre: <span className="text-[#1a237e]">Hotel Talavera S.A. de C.V.</span></div>
                  <div className="text-center">Cuenta: <span className="font-bold text-[#1a237e]">11 70 36 32 43</span> (Solo Banorte a Banorte)</div>
                  <div className="text-center">CLABE: <span className="font-bold text-[#1a237e]">07 26 72 01 17 03 63 24 34</span> (Otros bancos)</div>
                  <div className="text-center mt-2 pt-2 border-t border-gray-300">Referencia: <span className="font-bold">Tu número de reserva</span></div>
                </div>
              </div>

              <div className="mb-4 text-xs text-justify leading-relaxed">
                <p className="mb-2">Por favor, envía tu comprobante a <span className="font-bold text-blue-700">hoteltalaveratez@gmail.com</span> o por WhatsApp al <span className="font-bold">231-145-6385.</span></p>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">Información Adicional:</h4>
                <div className="text-xs space-y-2">
                  <p className="text-justify"><span className="font-bold">Cancelaciones:</span> Sin costo hasta <span className="font-bold underline">48 horas antes</span> de tu llegada. Después de este plazo, no aplica reembolso.</p>
                  <p className="text-justify"><span className="font-bold">Facturación:</span> Si requieres factura, envíanos tu Constancia de Situación Fiscal vía WhatsApp.</p>
                </div>
              </div>

              <div className="text-xs text-center leading-relaxed">
                <p>En caso de requerir un horario extendido, te solicitará un pago extra (sujeto a disponibilidad de la habitación). <span className="font-bold">Salida Tardía (Después de las 1:15 PM):</span> Se aplicará un cargo adicional de $200.00 por hora o fracción según el tipo de habitación. Esto montos son independientes a la tarifa de la temporada. Estos montos son independientes de temporada.</p>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-[#c68652] text-center">
                <p className="text-sm font-bold text-[#1a237e] uppercase tracking-wide">¡Todo listo para tu estancia en Hotel Talavera!</p>
              </div>

              <div className="mt-auto">
                <div className="pt-2 border-t border-gray-200 text-[7px] text-gray-500 text-justify leading-tight font-normal">
                  Aviso de Privacidad: De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, en los artículos 3, Fracciones II y VII, y 33, así como la denominación del capítulo II, del Título Segundo, de la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental, le informamos que toda su información personal en nuestras bases de datos no está a la venta ni disponible para su comercialización con terceros.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }

  // --- RENDER EVENT PREVIEW (NEW PROFESSIONAL DESIGN) ---
  if (mode === 'event' && eventData) {
      let statusColorClass = 'bg-red-600 text-white';
      let statusText = 'PENDIENTE DE PAGO';
      
      if (eventData.paymentStatus === 'paid') {
          statusColorClass = 'bg-green-600 text-white';
          statusText = 'PAGADO';
      } else if (eventData.paymentStatus === 'pending_arrival') {
          statusColorClass = 'bg-yellow-400 text-black';
          statusText = 'PENDIENTE PAGO AL LLEGAR';
      }

      const grandTotal = (eventData.totalCost || 0) + (eventData.menuCost || 0);

      return (
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-2xl shadow-xl border overflow-hidden h-full flex flex-col transition-colors`}>
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-800'} text-white p-4 text-center shrink-0 transition-colors`}>
            <h3 className="text-sm font-medium tracking-widest uppercase">Vista Previa - Evento Terraza</h3>
          </div>
          <div className={`flex-1 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-200'} p-4 md:p-8 overflow-y-auto flex justify-center transition-colors`}>
            
            <div 
              ref={ref} 
              className="bg-white shadow-lg shrink-0 text-black font-sans relative flex flex-col"
              style={{ width: '150mm', minHeight: '215mm', padding: '12mm' }} 
            >
              {/* Watermark Overlay */}
              {eventData.showWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
                      <Logo className="w-1/2" color="#1a237e" showText={false} />
                  </div>
              )}

              {/* Header */}
              <div className="flex flex-col items-center mb-4 relative z-10">
                 <Logo className="w-32 h-auto" color="#1a237e" />
              </div>

              {/* Title Banner */}
              <div className="bg-[#1a237e] rounded-t-lg py-2 mb-4 text-center relative z-10">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-white">EVENTOS TERRAZA</h2>
              </div>

              {/* Data Cards Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                 {/* Card 1 */}
                 <div className="bg-gray-50 border border-gray-200 rounded p-2">
                     <div className="text-[6px] font-bold text-[#c68652] uppercase mb-1">Cliente</div>
                     <div className="text-[9px] font-bold text-gray-800 uppercase truncate">{eventData.clientName || '---'}</div>
                 </div>
                 {/* Card 2 */}
                 <div className="bg-gray-50 border border-gray-200 rounded p-2">
                     <div className="text-[6px] font-bold text-[#c68652] uppercase mb-1">Fecha</div>
                     <div className="text-[9px] font-bold text-gray-800 uppercase">{formatDate(eventData.eventDate)}</div>
                 </div>
                 {/* Card 3 */}
                 <div className="bg-gray-50 border border-gray-200 rounded p-2">
                     <div className="text-[6px] font-bold text-[#c68652] uppercase mb-1">Teléfono</div>
                     <div className="text-[9px] font-bold text-gray-800 uppercase">{eventData.phone || '---'}</div>
                 </div>
                 {/* Card 4 */}
                 <div className="bg-gray-50 border border-gray-200 rounded p-2">
                     <div className="text-[6px] font-bold text-[#c68652] uppercase mb-1">Horario</div>
                     <div className="text-[9px] font-bold text-gray-800 uppercase truncate">{eventData.eventTime || '---'}</div>
                 </div>
                 {/* Card 5 (Full Width) */}
                 <div className="col-span-2 bg-gray-50 border border-gray-200 rounded p-2">
                     <div className="text-[6px] font-bold text-[#c68652] uppercase mb-1">Tipo de Evento</div>
                     <div className="text-[9px] font-bold text-gray-800 uppercase">{eventData.eventType || '---'}</div>
                 </div>
              </div>

              {/* Details Section */}
              <div className="mb-4 relative z-10">
                 <h4 className="text-[#1a237e] text-[9px] font-bold uppercase mb-1">Detalles Incluidos</h4>
                 <div className="h-px bg-[#1a237e] w-1/4 mb-2"></div>
                 
                 <div className="bg-white border border-gray-200 rounded-lg p-2 h-24 overflow-hidden">
                    <p className="text-[8px] text-gray-700 uppercase whitespace-pre-line">
                        {eventData.details || "(NINGÚN DETALLE ADICIONAL ESPECIFICADO)"}
                    </p>
                 </div>
              </div>

              {/* Financial Summary Breakdown */}
              <div className="mb-6 relative z-10 space-y-1">
                  
                  {/* Event Cost Highlighted */}
                  <div className="bg-[#1a237e] text-white rounded p-2 flex justify-between items-center shadow-sm">
                      <div className="text-[8px] font-bold uppercase tracking-wider">Costo Evento</div>
                      <div className="text-xs font-bold">{formatMoney(eventData.totalCost || 0)}</div>
                  </div>

                  {/* Menu Cost */}
                  <div className="bg-white border border-gray-200 rounded p-2 flex justify-between items-center">
                      <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Costo Menú</div>
                      <div className="text-xs font-bold text-gray-700">{formatMoney(eventData.menuCost || 0)}</div>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-end items-baseline gap-2 pt-1 pr-1">
                       <div className="text-[8px] font-bold text-gray-400 uppercase">Total:</div>
                       <div className="text-sm font-black text-[#1a237e]">{formatMoney(grandTotal)}</div>
                  </div>
              </div>

              {/* Payment Status Bar */}
              <div className={`mx-auto w-40 py-1 rounded-full text-center font-bold text-[8px] relative z-10 mb-auto ${statusColorClass}`}>
                  {statusText}
              </div>

              {/* Footer */}
              <div className="mt-8 text-center relative z-10 border-t border-gray-200 pt-2">
                  <div className="italic font-serif text-gray-600 text-[10px] mb-1">Gracias por su preferencia</div>
                  <div className="text-[8px] text-gray-400">Hotel Talavera</div>
              </div>

            </div>
          </div>
        </div>
      );
  }

  return <div className="bg-gray-100 rounded-2xl flex items-center justify-center p-10 text-gray-400">Sin datos para visualizar</div>;
});

// React.memo optimizations
export default memo(LivePreview, (prev, next) => {
  if (prev.mode !== next.mode) return false;

  if (prev.mode === 'booking') {
      const isDataEqual = 
        prev.data?.firstName === next.data?.firstName &&
        prev.data?.lastName === next.data?.lastName &&
        prev.data?.checkIn === next.data?.checkIn &&
        prev.data?.checkOut === next.data?.checkOut &&
        prev.data?.roomType === next.data?.roomType &&
        prev.data?.numberOfRooms === next.data?.numberOfRooms &&
        prev.data?.extraPersons === next.data?.extraPersons;

      const isSummaryEqual = 
        prev.summary?.folio === next.summary?.folio &&
        prev.summary?.totalCost === next.summary?.totalCost &&
        prev.summary?.nights === next.summary?.nights;
        
      return isDataEqual && isSummaryEqual;
  }
  
  if (prev.mode === 'event') {
      return JSON.stringify(prev.eventData) === JSON.stringify(next.eventData);
  }

  return true;
});