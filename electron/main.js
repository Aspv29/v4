const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

// Configuración de seguridad para prevenir falsos positivos de antivirus
app.commandLine.appendSwitch('disable-features', 'CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Talavera v3 - Sistema Concierge Premium',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    backgroundColor: '#1a237e',
    autoHideMenuBar: false,
    frame: true,
    show: false
  });

  // Menú personalizado profesional
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'F5',
          click: () => { mainWindow.reload(); }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'Alt+F4',
          click: () => { app.quit(); }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Pantalla Completa',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: 'Zoom +',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            const webContents = mainWindow.webContents;
            webContents.setZoomLevel(webContents.getZoomLevel() + 0.5);
          }
        },
        {
          label: 'Zoom -',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const webContents = mainWindow.webContents;
            webContents.setZoomLevel(webContents.getZoomLevel() - 0.5);
          }
        },
        {
          label: 'Zoom Reset',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de Hotel Talavera v3',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Hotel Talavera v3',
              message: 'Sistema de Concierge Premium',
              detail: `Versión: 3.0.0\n\nDesarrollado para Hotel Talavera\nTeziutlán, Puebla, México\n\n© 2026 Hotel Talavera S.A. de C.V.`,
              buttons: ['Aceptar']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Contacto',
          click: () => {
            require('electron').shell.openExternal('https://wa.me/522311456385');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Cargar la aplicación
  const startUrl = process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevenir navegación externa no autorizada
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
      event.preventDefault();
      require('electron').shell.openExternal(url);
    }
  });

  // Bloquear ventanas popup no autorizadas
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Evento de inicio de aplicación
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cerrar aplicación en todas las plataformas excepto macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejo seguro de certificados para desarrollo
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('http://localhost')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Configuración adicional de seguridad
app.on('web-contents-created', (event, contents) => {
  // Bloquear DevTools en producción
  if (!process.env.ELECTRON_START_URL) {
    contents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' ||
          (input.control && input.shift && input.key === 'I') ||
          (input.control && input.shift && input.key === 'J') ||
          (input.control && input.shift && input.key === 'C')) {
        event.preventDefault();
      }
    });
  }
});
