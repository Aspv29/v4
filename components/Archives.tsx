import React, { useState, useEffect } from 'react';
import { ArchivedBooking, BookingData } from '../types';
import { archiveService } from '../services/archiveService';
import { generateConfirmationPDF } from '../services/pdfGenerator';
import { FileText, Trash2, RefreshCcw, Download, Search, FolderOpen } from 'lucide-react';

interface ArchivesProps {
  onLoadBooking: (data: BookingData) => void;
  onClose: () => void;
}

const Archives: React.FC<ArchivesProps> = ({ onLoadBooking, onClose }) => {
  const [archives, setArchives] = useState<ArchivedBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = () => {
    setArchives(archiveService.getAll());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta reserva del historial?')) {
      const updated = archiveService.delete(id);
      setArchives(updated);
    }
  };

  const handleDownloadPDF = async (archive: ArchivedBooking, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await generateConfirmationPDF(archive.data, archive.summary);
    } catch (error) {
      alert("Error generando PDF");
    }
  };

  const filtered = archives.filter(a => 
    a.summary.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.data.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.data.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="bg-[#1a237e] dark:bg-blue-900 text-white p-6 flex items-center justify-between shrink-0 transition-colors">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg">
                <FolderOpen className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-bold font-serif">Archivos de Reservas</h2>
               <p className="text-xs text-blue-200">Historial local de confirmaciones generadas</p>
             </div>
           </div>
           <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
             ✕
           </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex gap-4 bg-gray-50 dark:bg-slate-900/50 transition-colors">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por folio o nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-slate-950 transition-colors">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
              <p>No hay archivos encontrados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.data.firstName} {item.data.lastName}</h3>
                       <p className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 inline-block px-1 rounded mt-1">Folio: {item.summary.folio}</p>
                       <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                         Creado: {new Date(item.timestamp).toLocaleString()}
                       </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => onLoadBooking(item.data)}
                      title="Cargar datos en formulario"
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Cargar</span>
                    </button>
                    
                    <button 
                      onClick={(e) => handleDownloadPDF(item, e)}
                      title="Descargar PDF nuevamente"
                      className="p-2 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-1 text-xs font-medium border border-blue-100 dark:border-blue-900/50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-1"></div>

                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Eliminar del historial"
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800 text-xs text-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-slate-900/50 transition-colors">
           Los archivos se guardan localmente en este dispositivo.
        </div>
      </div>
    </div>
  );
};

export default Archives;