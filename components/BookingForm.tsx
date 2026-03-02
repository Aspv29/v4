import React, { useState } from 'react';
import { BookingData, RoomType, getRoomPrice, getMaxRooms, MAX_EXTRA_PERSONS, EXTRA_PERSON_COST } from '../types';
import { Calendar as CalendarIcon, User, CreditCard, FileText, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2, AlertCircle, Hash, Minus, Plus, Share2, Users } from 'lucide-react';

interface BookingFormProps {
  data: BookingData;
  onChange: (data: BookingData) => void;
  onGenerate: () => void;
  onGenerateImage: () => void;
  onSharePDF: () => void;
  onShareImage: () => void;
  isValid: boolean;
  isGenerating: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  data, 
  onChange, 
  onGenerate, 
  onGenerateImage, 
  onSharePDF,
  onShareImage,
  isValid, 
  isGenerating 
}) => {
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const maxRooms = getMaxRooms(data.roomType);
  
  const handleChange = (field: keyof BookingData, value: any) => {
    let finalValue = value;

    // FORZAR MAYÚSCULAS EN NOMBRE Y APELLIDO AUTOMÁTICAMENTE
    if (field === 'firstName' || field === 'lastName') {
        finalValue = String(value).toUpperCase();
    }

    const newData = { ...data, [field]: finalValue };
    
    // Auto-adjust Check-out if it becomes invalid (before check-in)
    if (field === 'checkIn' && newData.checkOut && newData.checkOut <= finalValue) {
        const d = new Date(finalValue + 'T00:00:00'); // Safe parsing
        d.setDate(d.getDate() + 1);
        newData.checkOut = d.toISOString().split('T')[0];
    }

    // Auto-adjust numberOfRooms if roomType changes and exceeds the new max
    if (field === 'roomType') {
      const newMax = getMaxRooms(finalValue as RoomType);
      if (newData.numberOfRooms > newMax) {
        newData.numberOfRooms = newMax;
      }
      // Reset extra persons if not Suite
      if (finalValue !== RoomType.SUITE) {
        newData.extraPersons = 0;
      }
    }
    
    onChange(newData);
  };

  // --- Calendar Logic ---

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Parse YYYY-MM-DD to local Date object (ignoring time)
  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };
  
  // Format YYYY-MM-DD to DD/MM/YYYY for display inputs
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const checkInDate = parseDate(data.checkIn);
  const checkOutDate = parseDate(data.checkOut);

  // Get "Today" at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Validation: Prevent clicking past dates
    if (clickedDate < today) return;

    // Format to YYYY-MM-DD manually to avoid timezone issues
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(clickedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;

    if (!data.checkIn || (data.checkIn && data.checkOut)) {
      // Start new selection
      onChange({ ...data, checkIn: dateString, checkOut: '' });
    } else if (data.checkIn && !data.checkOut) {
      // Logic for second click
      if (clickedDate < (checkInDate as Date)) {
        // User clicked before checkin, make this the new checkin
        onChange({ ...data, checkIn: dateString });
      } else if (dateString === data.checkIn) {
        // User clicked same date, ignore
      } else {
        // Valid checkout
        onChange({ ...data, checkOut: dateString });
      }
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isPast = dateObj < today;
      let isSelected = false;
      let isRange = false;
      let isStart = false;
      let isEnd = false;

      if (data.checkIn === dateStr) {
        isSelected = true;
        isStart = true;
      }
      if (data.checkOut === dateStr) {
        isSelected = true;
        isEnd = true;
      }
      
      if (checkInDate && checkOutDate && dateObj > checkInDate && dateObj < checkOutDate) {
        isRange = true;
      }

      let btnClass = "h-9 w-full flex items-center justify-center text-sm rounded-full transition-all relative z-10 ";
      
      // Colores del calendario ajustados al azul institucional si está seleccionado
      if (isPast) {
        btnClass += "text-gray-300 dark:text-gray-600 cursor-not-allowed ";
      } else if (isSelected) {
        btnClass += "bg-[#1a237e] dark:bg-blue-600 text-white font-bold hover:bg-blue-900 dark:hover:bg-blue-500 shadow-md scale-105 ";
      } else if (isRange) {
        btnClass += "bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 rounded-none "; // Square for range
      } else {
        btnClass += "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:font-semibold ";
      }

      // Rounded corners for range edges
      if (isStart && checkOutDate) btnClass += "rounded-r-none rounded-l-full ";
      if (isEnd && checkInDate) btnClass += "rounded-l-none rounded-r-full ";

      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(day)}
          className={btnClass}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Helper for Room Count Stepper
  const incrementRooms = () => {
    if (data.numberOfRooms < maxRooms) {
      handleChange('numberOfRooms', data.numberOfRooms + 1);
    }
  };

  const decrementRooms = () => {
    if (data.numberOfRooms > 1) {
      handleChange('numberOfRooms', data.numberOfRooms - 1);
    }
  };

  // Helper for Extra Persons Stepper
  const incrementExtra = () => {
    if (data.extraPersons < MAX_EXTRA_PERSONS) {
      handleChange('extraPersons', (data.extraPersons || 0) + 1);
    }
  };

  const decrementExtra = () => {
    if (data.extraPersons > 0) {
      handleChange('extraPersons', (data.extraPersons || 0) - 1);
    }
  };

  // Color azul institucional
  const brandColor = "text-[#1a237e]";
  const brandBg = "bg-[#1a237e]";

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 h-full overflow-y-auto transition-colors">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
        <div className={`p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30`}>
           <FileText className={`w-6 h-6 ${brandColor} dark:text-blue-400`} />
        </div>
        <h2 className={`text-xl font-serif font-bold ${brandColor} dark:text-blue-400`}>Datos de Reserva</h2>
      </div>

      <div className="space-y-6">
        
        {/* Guest Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${brandColor} dark:text-blue-400`}>
              <User size={16} /> NOMBRE(S)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-400 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 uppercase font-medium"
              placeholder=""
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-1 ${brandColor} dark:text-blue-400`}>APELLIDO(S)</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-400 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 uppercase font-medium"
              placeholder=""
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>
        </div>

        {/* Stay Dates & Interactive Calendar */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50 dark:bg-slate-900/50 transition-colors">
          <div className="flex items-center gap-2 mb-3">
             <CalendarIcon className={`${brandColor} dark:text-blue-400`} size={18} />
             <span className={`font-bold ${brandColor} dark:text-blue-400`}>SELECCIONAR ESTANCIA</span>
          </div>

          {/* Inputs for precise control - READ ONLY to prevent native picker conflict */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${brandColor} dark:text-blue-400`}>Llegada</label>
              <input
                type="text"
                readOnly
                placeholder=""
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none cursor-default font-bold"
                value={formatDisplayDate(data.checkIn)}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${brandColor} dark:text-blue-400`}>Salida</label>
              <input
                type="text"
                readOnly
                placeholder=""
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 outline-none cursor-default font-bold"
                value={formatDisplayDate(data.checkOut)}
              />
            </div>
          </div>

          {/* Visual Calendar */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-400">
                <ChevronLeft size={20} />
              </button>
              <span className={`font-serif font-bold text-lg ${brandColor} dark:text-blue-400`}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-400">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {renderCalendar()}
            </div>
          </div>
          
          <div className="text-xs text-gray-400 mt-2 text-center">
             Seleccione primero la fecha de llegada, luego la fecha de salida.
          </div>
        </div>

        {/* Room Selection Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-sm font-bold mb-1 flex items-center gap-2 ${brandColor} dark:text-blue-400`}>
                <CreditCard size={16} /> TIPO DE HABITACIÓN
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg border border-gray-400 dark:border-slate-600 focus:ring-2 focus:ring-[#1a237e] dark:focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none font-medium"
                  value={data.roomType}
                  onChange={(e) => handleChange('roomType', e.target.value as RoomType)}
                >
                  {Object.values(RoomType).map((type) => {
                    // Calculate price for this option based on currently selected CheckIn date
                    const price = getRoomPrice(type, data.checkIn);
                    return (
                        <option key={type} value={type} className="dark:bg-slate-900">
                          {type} - ${price.toFixed(2)}
                        </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Stepper Control for Rooms */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`text-sm font-bold flex items-center gap-2 ${brandColor} dark:text-blue-400`}>
                  <Hash size={16} /> CANTIDAD
                </label>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  Max: {maxRooms}
                </span>
              </div>
              
              <div className="flex items-center border border-[#1a237e] dark:border-blue-500 rounded-lg overflow-hidden h-[42px] shadow-sm">
                <button 
                  type="button"
                  onClick={decrementRooms}
                  disabled={data.numberOfRooms <= 1}
                  className="w-10 h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border-r border-[#1a237e] dark:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#1a237e] dark:text-blue-400"
                >
                  <Minus size={16} />
                </button>
                
                <div className="flex-1 h-full flex items-center justify-center font-bold text-[#1a237e] dark:text-blue-400 bg-white dark:bg-slate-900 text-lg">
                  {data.numberOfRooms}
                </div>
                
                <button 
                  type="button"
                  onClick={incrementRooms}
                  disabled={data.numberOfRooms >= maxRooms}
                  className="w-10 h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border-l border-[#1a237e] dark:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#1a237e] dark:text-blue-400"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* EXTRA PERSONS CONTROL - ONLY FOR SUITES */}
          {data.roomType === RoomType.SUITE && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-[#1a237e] dark:text-blue-400 flex items-center gap-2">
                  <Users size={16} /> Personas Extras (Suite)
                </label>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-[#1a237e] dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  ${EXTRA_PERSON_COST} MXN c/u
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#1a237e] dark:border-blue-500 rounded-lg overflow-hidden h-[42px] bg-white dark:bg-slate-900 w-full max-w-[140px]">
                  <button 
                    type="button"
                    onClick={decrementExtra}
                    disabled={(data.extraPersons || 0) <= 0}
                    className="w-10 h-full flex items-center justify-center bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 active:bg-blue-200 dark:active:bg-slate-600 border-r border-[#1a237e] dark:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#1a237e] dark:text-blue-400"
                  >
                    <Minus size={16} />
                  </button>
                  
                  <div className="flex-1 h-full flex items-center justify-center font-bold text-[#1a237e] dark:text-blue-400">
                    {data.extraPersons || 0}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={incrementExtra}
                    disabled={(data.extraPersons || 0) >= MAX_EXTRA_PERSONS}
                    className="w-10 h-full flex items-center justify-center bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 active:bg-blue-200 dark:active:bg-slate-600 border-l border-[#1a237e] dark:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#1a237e] dark:text-blue-400"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-xs text-[#1a237e] dark:text-blue-300 leading-tight">
                   Máximo {MAX_EXTRA_PERSONS} personas adicionales.<br/>
                   Se sumará al costo total.
                </div>
              </div>
            </div>
          )}
        </div>
        
        <p className={`text-right text-sm ${brandColor} dark:text-blue-400 font-bold mt-1`}>
          Precio Unitario: ${getRoomPrice(data.roomType, data.checkIn).toFixed(2)} MXN
        </p>

        {/* Validation Warning - UPDATED STYLE: Yellow Background, Bold Black Text */}
        {!isValid && (
          <div className="flex items-center gap-3 text-black font-bold text-sm bg-yellow-400 p-4 rounded-xl border-2 border-yellow-500 shadow-md animate-pulse">
            <AlertCircle size={24} className="shrink-0 text-black" strokeWidth={2.5} />
            <span className="leading-tight">Por favor complete todos los campos (Nombre, Apellido, Fechas) para habilitar las descargas.</span>
          </div>
        )}

        {/* Action Buttons - Visually Distinct */}
        <div className="pt-2 grid grid-cols-2 gap-4">
          
          {/* PDF Buttons Group */}
          <div className="col-span-1 flex gap-2">
            <button
              type="button"
              onClick={onGenerate}
              disabled={!isValid || isGenerating}
              className={`flex-grow py-3 px-2 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden relative
                ${!isValid
                  ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                  : isGenerating 
                      ? 'bg-red-700 cursor-wait ring-4 ring-red-200 scale-95' 
                      : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 hover:shadow-red-200 hover:-translate-y-0.5'
                }`}
            >
              {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span className="text-xs sm:text-sm">PDF</span>
            </button>
            <button
              type="button"
              onClick={onSharePDF}
              disabled={!isValid || isGenerating}
              className={`w-12 py-3 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 flex items-center justify-center
                ${!isValid
                  ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                  : 'bg-red-800 hover:bg-red-900 hover:shadow-red-200 hover:-translate-y-0.5'
                }`}
            >
               <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Image Buttons Group */}
          <div className="col-span-1 flex gap-2">
            <button
              type="button"
              onClick={onGenerateImage}
              disabled={!isValid || isGenerating}
              className={`flex-grow py-3 px-2 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden relative
                ${!isValid
                  ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                  : isGenerating 
                      ? 'bg-blue-950 cursor-wait ring-4 ring-blue-200 scale-95' 
                      : 'bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-950 hover:to-blue-900 hover:shadow-blue-200 hover:-translate-y-0.5'
                }`}
            >
              {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
              <span className="text-xs sm:text-sm">IMG</span>
            </button>
            <button
              type="button"
              onClick={onShareImage}
              disabled={!isValid || isGenerating}
              className={`w-12 py-3 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 flex items-center justify-center
                ${!isValid
                  ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                  : 'bg-blue-950 hover:bg-black hover:shadow-blue-200 hover:-translate-y-0.5'
                }`}
            >
               <Share2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingForm;