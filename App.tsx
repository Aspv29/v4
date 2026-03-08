import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookingData, BookingSummary, RoomType, getRoomPrice, getMaxRooms, EXTRA_PERSON_COST, TerraceEventData, RoomCostBreakdown } from './types';
import BookingForm from './components/BookingForm';
import LivePreview from './components/LivePreview';
import LockScreen from './components/LockScreen';
import Archives from './components/Archives';
import TerraceEventForm from './components/TerraceEventForm';
import Logo from './components/Logo';
import WhatsAppShareDialog from './components/WhatsAppShareDialog';
import { generateConfirmationPDF, generateTerraceEventPDF } from './services/pdfGenerator';
import { archiveService } from './services/archiveService';
import { downloadSourceCode } from './services/projectZipper';
import { WhatsAppService } from './services/whatsappService';
import { Building2, Download, Lock, CheckCircle2, ImagePlus, RefreshCw, FolderOpen, ShieldAlert, CalendarRange, Hotel, PartyPopper } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // UI State
  const [showArchives, setShowArchives] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'booking' | 'event'>('booking');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- DARK MODE EFFECT ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Initialize booking state
  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: '',
    lastName: '',
    checkIn: '',
    checkOut: '',
    roomType: RoomType.STANDARD,
    numberOfRooms: 1,
    extraPersons: 0,
    rooms: []
  });

  // Initialize event state
  const [eventData, setEventData] = useState<TerraceEventData>({
      eventDate: '',
      eventType: '', // Manual Input
      clientName: '',
      phone: '',
      eventTime: '',
      totalCost: 0,
      totalCostText: 'CERO PESOS 00/100 M.N.',
      menuCost: 0,
      menuCostText: 'CERO PESOS 00/100 M.N.',
      details: '', // Manual Input
      paymentStatus: 'unpaid',
      showWatermark: true 
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ref for the LivePreview component
  const previewRef = useRef<HTMLDivElement>(null);

  // Secret Developer Trigger State
  const [headerClicks, setHeaderClicks] = useState(0);

  // WhatsApp Share State
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [pendingShareData, setPendingShareData] = useState<{
    type: 'pdf' | 'image';
    dataUrl?: string;
    blob?: Blob;
    fileName: string;
  } | null>(null);

  // --- SEGURIDAD KIOSK Y BLOQUEO DE CÓDIGO ---
  useEffect(() => {
    // 1. Bloqueo estricto de Click Derecho (Context Menu)
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Bloqueo de Herramientas de Desarrollador (Code Assistant)
    const blockDevTools = (e: KeyboardEvent) => {
      // Bloquear F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Bloquear combinaciones Ctrl+Shift+...
      if (e.ctrlKey && e.shiftKey) {
        // I = Inspect, J = Console, C = Elements
        if (['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Bloquear Ctrl+U (View Source)
      if (e.ctrlKey && ['u', 'U', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockDevTools);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Prevent dragging images/text
    document.ondragstart = function() { return false; };

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockDevTools);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // --- SECRET DEVELOPER MODE ---
  useEffect(() => {
    if (headerClicks === 5) {
      downloadSourceCode();
      setToastMessage("Modo Desarrollador: Descargando Código Fuente...");
      setHeaderClicks(0);
    }
    
    const timer = setTimeout(() => {
      if (headerClicks > 0) setHeaderClicks(0);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [headerClicks]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement && isAuthenticated) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      // Ignore errors if fullscreen is blocked by browser policy
    }
  };

  const handleUnlock = () => {
    setIsAuthenticated(true);
    // Attempt fullscreen on interaction
    setTimeout(() => {
      requestFullscreen();
    }, 100);
  };
  
  const handleLock = () => {
    setIsAuthenticated(false);
    if(document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const handleToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- CALCULATION LOGIC ---
  const summary = useMemo<BookingSummary>(() => {
    let folio = "---";
    if (bookingData.lastName && bookingData.checkIn) {
      // Use first word of last name + D M Y
      const cleanLastName = bookingData.lastName.trim().toUpperCase().split(/\s+/)[0];
      const [y, m, d] = bookingData.checkIn.split('-');
      folio = `${cleanLastName}${d}${m}${y}`;
    }

    let nights = 0;
    if (bookingData.checkIn && bookingData.checkOut) {
      const start = new Date(bookingData.checkIn);
      const end = new Date(bookingData.checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    let totalCost = 0;
    let roomBreakdown: RoomCostBreakdown[] = [];

    // Check if using multi-room system
    if (bookingData.rooms && bookingData.rooms.length > 0) {
      // Calculate based on room selections
      bookingData.rooms.forEach(room => {
        if (room.quantity > 0) {
          const price = getRoomPrice(room.roomType, bookingData.checkIn);
          const subtotal = nights * price * room.quantity;
          totalCost += subtotal;
          roomBreakdown.push({
            roomType: room.roomType,
            quantity: room.quantity,
            pricePerNight: price,
            subtotal: subtotal
          });
        }
      });
    } else {
      // Fallback to single room type
      const pricePerNight = getRoomPrice(bookingData.roomType, bookingData.checkIn);
      const roomsCost = nights * pricePerNight * (bookingData.numberOfRooms || 1);
      totalCost = roomsCost;
      roomBreakdown = [{
        roomType: bookingData.roomType,
        quantity: bookingData.numberOfRooms,
        pricePerNight: pricePerNight,
        subtotal: roomsCost
      }];
    }

    // Extra persons calculation (Only for Suites)
    const extraPersons = bookingData.roomType === RoomType.SUITE ? (bookingData.extraPersons || 0) : 0;
    const extraCost = extraPersons * EXTRA_PERSON_COST * nights;
    totalCost += extraCost;

    return {
      folio,
      nights: nights > 0 ? nights : 0,
      pricePerNight: roomBreakdown.length > 0 ? roomBreakdown[0].pricePerNight : 0,
      totalCost,
      roomBreakdown
    };
  }, [bookingData]);

  const isBookingValid = useMemo(() => {
    return !!(bookingData.firstName && bookingData.lastName && bookingData.checkIn && bookingData.checkOut && summary.nights > 0);
  }, [bookingData, summary]);

  // --- HANDLERS ---

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    // Slight delay to allow UI to update
    setTimeout(async () => {
        try {
            await generateConfirmationPDF(bookingData, summary, false);
            // Auto archive
            archiveService.save(bookingData, summary);
            handleToast("Confirmación PDF descargada correctamente");
        } catch (e) {
            handleToast("Error al generar PDF");
            console.error(e);
        }
        setIsGenerating(false);
    }, 100);
  };

  const handleSharePDF = async () => {
     setIsGenerating(true);
     setTimeout(async () => {
        try {
           const blob = await generateConfirmationPDF(bookingData, summary, true);
           if (blob) {
              const fileName = `Reservacion_${summary.folio}.pdf`;

              // Set pending share data and open WhatsApp dialog
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                  setPendingShareData({
                      type: 'pdf',
                      dataUrl: reader.result as string,
                      blob: blob,
                      fileName: fileName
                  });
                  setShowWhatsAppDialog(true);
                  setIsGenerating(false);
              };
           }
        } catch (e) {
            handleToast("Error al generar PDF");
            setIsGenerating(false);
        }
     }, 100);
  };

  const handleGenerateTerracePDF = async () => {
      setIsGenerating(true);
      setTimeout(async () => {
          try {
              await generateTerraceEventPDF(eventData, false);
              handleToast("Orden de Evento descargada");
          } catch (e) {
              handleToast("Error generando PDF de evento");
          }
          setIsGenerating(false);
      }, 100);
  };

  const handleGenerateImage = async () => {
     if(!previewRef.current) return;

     setIsGenerating(true);
     previewRef.current.scrollTop = 0;

     setTimeout(async () => {
        try {
            const elementToCapture = activeTab === 'booking'
                ? document.getElementById('capture-target')
                : previewRef.current?.firstChild as HTMLElement;

            if (elementToCapture) {
                const canvas = await html2canvas(elementToCapture, {
                    scale: 4, // Ultra HD quality - 4K resolution
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    logging: false,
                    imageTimeout: 0,
                    allowTaint: false
                });

                const base64Data = canvas.toDataURL("image/png", 1.0); // Maximum quality
                const name = activeTab === 'booking' ? `Reservacion_${summary.folio}.png` : `Evento_${eventData.clientName || 'Terraza'}.png`;

                if (Capacitor.isNativePlatform()) {
                    try {
                        await Filesystem.writeFile({
                            path: name,
                            data: base64Data.split(',')[1],
                            directory: Directory.Documents,
                        });
                        handleToast(`✓ Imagen HD guardada: ${name}`);
                    } catch (err) {
                        console.error('Error al guardar imagen:', err);
                        handleToast("Error al guardar imagen. Verifica permisos.");
                    }
                } else {
                    const link = document.createElement('a');
                    link.href = base64Data;
                    link.download = name;
                    link.click();
                    handleToast("✓ Imagen descargada en Ultra HD");
                }
            }
        } catch (e) {
            console.error(e);
            handleToast("Error al generar imagen");
        }
        setIsGenerating(false);
     }, 200);
  };
  
  const handleShareImage = async () => {
     if(!previewRef.current) return;

     setIsGenerating(true);
     previewRef.current.scrollTop = 0;

     setTimeout(async () => {
        try {
            const elementToCapture = activeTab === 'booking'
                ? document.getElementById('capture-target')
                : previewRef.current?.firstChild as HTMLElement;

            if (elementToCapture) {
                const canvas = await html2canvas(elementToCapture, {
                    scale: 4,
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    logging: false
                });

                const base64Data = canvas.toDataURL("image/png");
                const name = activeTab === 'booking' ? `Reservacion_${summary.folio}.png` : `Evento_${eventData.clientName || 'Terraza'}.png`;

                // Set pending share data and open WhatsApp dialog
                setPendingShareData({
                    type: 'image',
                    dataUrl: base64Data,
                    fileName: name
                });
                setShowWhatsAppDialog(true);
                setIsGenerating(false);
            }
        } catch (e) {
            console.error(e);
            handleToast("Error al generar imagen");
            setIsGenerating(false);
        }
     }, 200);
  };

  const handleLoadBooking = (data: BookingData) => {
      setBookingData(data);
      setShowArchives(false);
      setActiveTab('booking');
      handleToast("Datos cargados del archivo");
  };

  // Handle WhatsApp share with custom number
  const handleWhatsAppSend = async (phoneNumber: string, countryCode: string) => {
      if (!pendingShareData) return;

      try {
          const message = activeTab === 'booking'
              ? `Reservación ${summary.folio}: ${bookingData.firstName} ${bookingData.lastName}`
              : `Evento Terraza: ${eventData.clientName}`;

          if (pendingShareData.dataUrl) {
              await WhatsAppService.downloadAndShareToWhatsApp(
                  pendingShareData.dataUrl,
                  pendingShareData.fileName,
                  phoneNumber,
                  countryCode,
                  message
              );
              handleToast("✓ Documento compartido a WhatsApp");
          }

          setShowWhatsAppDialog(false);
          setPendingShareData(null);
      } catch (error) {
          console.error('Error al enviar por WhatsApp:', error);
          handleToast("Error al enviar. Verifica el número.");
      }
  };

  if (!isAuthenticated) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'} flex flex-col font-sans transition-colors duration-500`} onClick={requestFullscreen}>
      
      {/* Kiosk Warning */}
      {!isFullscreen && (
        <div className="bg-red-600 text-white text-center text-[10px] py-1 font-bold tracking-widest flex justify-center items-center gap-2">
            <ShieldAlert size={12} />
            MODO KIOSK DESACTIVADO - PANTALLA NO COMPLETA
        </div>
      )}

      {/* HEADER */}
      <header className={`${isDarkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white shadow-sm'} px-6 py-4 flex justify-between items-center z-20 relative transition-colors`}>
         <div className="flex items-center gap-3">
            <div 
                onClick={() => setHeaderClicks(c => c + 1)} 
                className="cursor-pointer select-none flex items-center gap-3"
            >
                <Logo className="w-10 h-10" color={isDarkMode ? "#60a5fa" : "#1a237e"} showText={false} />
                <div>
                    <h1 className={`font-serif font-bold text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-900'} leading-none transition-colors`}>HOTEL TALAVERA</h1>
                    <p className="text-[10px] text-[#c68652] font-bold tracking-[0.2em] uppercase">Concierge System</p>
                </div>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
             >
                {isDarkMode ? <RefreshCw size={20} className="animate-spin-slow" /> : <RefreshCw size={20} />}
             </button>
             <div className={`h-8 w-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} mx-2`}></div>
             <button 
                onClick={() => setShowArchives(true)} 
                className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-400 hover:bg-slate-700' : 'text-blue-900 hover:bg-blue-50'} px-4 py-2 rounded-lg font-bold text-sm transition-all`}
             >
                <FolderOpen size={18} />
                <span className="hidden sm:inline">Archivos</span>
             </button>
             <div className={`h-8 w-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} mx-2`}></div>
             <button 
                onClick={handleLock} 
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm transition-all"
             >
                <Lock size={18} />
                <span className="hidden sm:inline">Salir</span>
             </button>
         </div>
      </header>

      {/* TAB SWITCHER */}
      <div className={`${isDarkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'} px-6 py-2 flex justify-center sticky top-0 z-10 shadow-sm transition-colors`}>
          <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} p-1 rounded-xl flex gap-1 w-full max-w-md transition-colors`}>
              <button 
                onClick={() => setActiveTab('booking')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'booking' ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-lg' : 'bg-white text-blue-900 shadow-md') : 'text-gray-500 hover:text-gray-700'}`}
              >
                  <Hotel size={16} /> Hospedaje
              </button>
              <button 
                onClick={() => setActiveTab('event')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'event' ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-lg' : 'bg-white text-blue-900 shadow-md') : 'text-gray-500 hover:text-gray-700'}`}
              >
                  <PartyPopper size={16} /> Eventos
              </button>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full">
          
          {/* LEFT COLUMN: FORM */}
          <div className="h-full overflow-hidden flex flex-col animate-in slide-in-from-left-4 duration-500">
             {activeTab === 'booking' ? (
                 <BookingForm 
                    data={bookingData} 
                    onChange={setBookingData} 
                    onGenerate={handleGeneratePDF}
                    onSharePDF={handleSharePDF}
                    onGenerateImage={handleGenerateImage}
                    onShareImage={handleShareImage}
                    isValid={isBookingValid}
                    isGenerating={isGenerating}
                 />
             ) : (
                 <TerraceEventForm 
                    data={eventData}
                    onChange={setEventData}
                    onGenerate={handleGenerateTerracePDF}
                    isGenerating={isGenerating}
                 />
             )}
          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className={`h-full overflow-hidden rounded-2xl shadow-inner ${isDarkMode ? 'bg-slate-950' : 'bg-gray-200'} animate-in slide-in-from-right-4 duration-500 delay-75 transition-colors`}>
             <LivePreview 
                ref={previewRef} 
                data={bookingData} 
                summary={summary}
                eventData={eventData}
                mode={activeTab}
                isDarkMode={isDarkMode}
             />
          </div>

      </main>

      {/* MODALS & OVERLAYS */}
      {showArchives && (
        <Archives 
            onLoadBooking={handleLoadBooking} 
            onClose={() => setShowArchives(false)} 
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1a237e] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 z-50">
            <CheckCircle2 size={20} className="text-green-400" />
            <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;