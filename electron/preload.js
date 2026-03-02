// Preload script para Electron
// Este archivo se ejecuta antes de cargar la página web
// Proporciona un puente seguro entre el proceso renderer y el proceso principal

const { contextBridge } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  version: process.versions.electron,
  isElectron: true
});

// Prevenir contaminación del scope global
window.addEventListener('DOMContentLoaded', () => {
  console.log('Hotel Talavera v3 - Electron Ready');
});
