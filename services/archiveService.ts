import { BookingData, BookingSummary, ArchivedBooking } from '../types';

const STORAGE_KEY = 'talavera_archives_v1';

export const archiveService = {
  save: (data: BookingData, summary: BookingSummary) => {
    try {
      const archives = archiveService.getAll();
      const newArchive: ArchivedBooking = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        data,
        summary
      };
      
      // Add to beginning
      const updated = [newArchive, ...archives];
      // Limit to last 50
      if (updated.length > 50) updated.length = 50;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newArchive;
    } catch (e) {
      console.error("Error saving archive", e);
      return null;
    }
  },

  getAll: (): ArchivedBooking[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  delete: (id: string) => {
    try {
      const archives = archiveService.getAll();
      const updated = archives.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Error deleting archive", e);
      return [];
    }
  }
};