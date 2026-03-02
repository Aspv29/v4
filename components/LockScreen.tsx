import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { ArrowRight, CalendarCheck, Moon, Sun } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const handleEnter = () => {
    onUnlock();
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} flex items-center justify-center p-4 font-sans transition-colors duration-500`}>
      {/* Theme Toggle in Lock Screen */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-6 right-6 p-3 rounded-full shadow-lg transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600'}`}
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border transition-colors`}>
        
        {/* Decorative Header with Brand Blue Background */}
        <div className={`${isDarkMode ? 'bg-blue-950' : 'bg-[#1a237e]'} h-48 relative flex items-center justify-center overflow-hidden transition-colors`}>
           <div className="absolute inset-0 bg-black/10"></div>
           {/* Abstract decorative circles in background */}
           <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full border-4 border-white/10"></div>
           <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full border-4 border-white/10"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Logo Container - Centered and overlapping */}
        <div className="relative -mt-24 flex justify-center mb-8">
            <div className={`${isDarkMode ? 'bg-slate-900 ring-slate-900' : 'bg-white ring-white'} p-6 rounded-full shadow-2xl ring-4 transition-colors`}>
                <Logo className="w-48 h-auto" color={isDarkMode ? "#60a5fa" : "#1a237e"} />
            </div>
        </div>
        
        <div className="px-8 pb-16 sm:px-16 text-center">
            <div className="mb-10">
                <h1 className={`font-serif text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 tracking-wide transition-colors`}>HOTEL TALAVERA</h1>
                <p className={`${isDarkMode ? 'text-blue-400' : 'text-[#1a237e]'} text-sm tracking-[0.25em] uppercase font-bold transition-colors`}>Sistema de Reservas</p>
                <div className="w-16 h-1 bg-[#c68652] mx-auto mt-6 rounded-full"></div>
            </div>

            <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-10 max-w-md mx-auto leading-relaxed transition-colors`}>
              Bienvenido al sistema de generación de confirmaciones. Presione el botón a continuación para comenzar a gestionar una nueva reserva.
            </p>

            <button
                onClick={handleEnter}
                className={`w-full max-w-md mx-auto ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#1a237e] hover:bg-blue-900'} text-white py-5 rounded-xl font-bold hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl shadow-blue-900/20 text-lg group`}
            >
                <CalendarCheck size={24} className="group-hover:text-[#c68652] transition-colors" />
                <span>Crear confirmación de reserva</span>
                <ArrowRight size={20} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
            
            <div className={`mt-12 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'} text-center transition-colors`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">ASPV Enterprise Security • v2.0.0</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;